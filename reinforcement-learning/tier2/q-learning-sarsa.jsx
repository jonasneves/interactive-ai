import React, { useState, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Swords, Eye, EyeOff, Zap, AlertTriangle } from 'lucide-react';

const QLearningVsSARSA = () => {
  const GRID_SIZE = 5;
  const GOAL = { x: 4, y: 0 };
  // Cliff along bottom row (except start and end)
  const CLIFF = Array.from({ length: 3 }, (_, i) => ({ x: i + 1, y: 4 }));
  const START = { x: 0, y: 4 };

  // State for both algorithms
  const [qValues, setQValues] = useState(() => initQ());
  const [sarsaValues, setSarsaValues] = useState(() => initQ());
  const [qAgent, setQAgent] = useState({ ...START });
  const [sarsaAgent, setSarsaAgent] = useState({ ...START });
  const [alpha, setAlpha] = useState(0.1);
  const [gamma, setGamma] = useState(0.95);
  const [epsilon, setEpsilon] = useState(0.1);
  const [isRunning, setIsRunning] = useState(false);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [speed, setSpeed] = useState(100);
  const [showValues, setShowValues] = useState('q'); // 'q', 'sarsa', 'both'
  const [qReturns, setQReturns] = useState([]);
  const [sarsaReturns, setSarsaReturns] = useState([]);
  const [qEpisodeReturn, setQEpisodeReturn] = useState(0);
  const [sarsaEpisodeReturn, setSarsaEpisodeReturn] = useState(0);
  const [sarsaPendingAction, setSarsaPendingAction] = useState(null);

  const actions = ['up', 'down', 'left', 'right'];
  const actionArrows = { up: '↑', down: '↓', left: '←', right: '→' };
  const actionIndex = { up: 0, down: 1, left: 2, right: 3 };

  function initQ() {
    const q = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        q[`${x},${y}`] = [0, 0, 0, 0]; // Q values for [up, down, left, right]
      }
    }
    return q;
  }

  const isCliff = (x, y) => CLIFF.some(c => c.x === x && c.y === y);
  const isGoal = (x, y) => x === GOAL.x && y === GOAL.y;
  const isValid = (x, y) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

  const getReward = (x, y) => {
    if (isGoal(x, y)) return 10;
    if (isCliff(x, y)) return -100;
    return -1;
  };

  const getNextState = (x, y, action) => {
    const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = moves[action];
    const nx = x + dx, ny = y + dy;
    if (!isValid(nx, ny)) return { x, y };
    // Falling off cliff sends back to start
    if (isCliff(nx, ny)) return { ...START };
    return { x: nx, y: ny };
  };

  // ε-greedy action selection
  const selectAction = useCallback((qVals, x, y) => {
    if (Math.random() < epsilon) {
      return actions[Math.floor(Math.random() * 4)];
    }
    const vals = qVals[`${x},${y}`];
    let maxVal = Math.max(...vals);
    let maxActions = actions.filter((_, i) => vals[i] === maxVal);
    return maxActions[Math.floor(Math.random() * maxActions.length)];
  }, [epsilon]);

  // Get greedy action for display
  const getGreedyAction = (qVals, x, y) => {
    const vals = qVals[`${x},${y}`];
    let maxIdx = 0;
    for (let i = 1; i < 4; i++) {
      if (vals[i] > vals[maxIdx]) maxIdx = i;
    }
    return actions[maxIdx];
  };

  // Single step for both algorithms
  const step = useCallback(() => {
    // Q-Learning step
    if (!isGoal(qAgent.x, qAgent.y)) {
      const action = selectAction(qValues, qAgent.x, qAgent.y);
      const next = getNextState(qAgent.x, qAgent.y, action);
      const reward = getReward(next.x, next.y);

      // Q-Learning update: use max Q(s', a')
      const maxNextQ = Math.max(...qValues[`${next.x},${next.y}`]);
      const newQ = [...qValues[`${qAgent.x},${qAgent.y}`]];
      const aIdx = actionIndex[action];
      newQ[aIdx] = newQ[aIdx] + alpha * (reward + gamma * maxNextQ - newQ[aIdx]);

      setQValues(prev => ({ ...prev, [`${qAgent.x},${qAgent.y}`]: newQ }));
      setQAgent(next);
      setQEpisodeReturn(prev => prev + reward);
    }

    // SARSA step
    if (!isGoal(sarsaAgent.x, sarsaAgent.y)) {
      // Initialize pending action if needed
      let action = sarsaPendingAction;
      if (!action) {
        action = selectAction(sarsaValues, sarsaAgent.x, sarsaAgent.y);
      }

      const next = getNextState(sarsaAgent.x, sarsaAgent.y, action);
      const reward = getReward(next.x, next.y);

      // Select next action for SARSA (this will be used in next step)
      const nextAction = isGoal(next.x, next.y) ? null : selectAction(sarsaValues, next.x, next.y);
      const nextQ = nextAction ? sarsaValues[`${next.x},${next.y}`][actionIndex[nextAction]] : 0;

      // SARSA update: use Q(s', a') where a' is the actual next action
      const newQ = [...sarsaValues[`${sarsaAgent.x},${sarsaAgent.y}`]];
      const aIdx = actionIndex[action];
      newQ[aIdx] = newQ[aIdx] + alpha * (reward + gamma * nextQ - newQ[aIdx]);

      setSarsaValues(prev => ({ ...prev, [`${sarsaAgent.x},${sarsaAgent.y}`]: newQ }));
      setSarsaAgent(next);
      setSarsaEpisodeReturn(prev => prev + reward);
      setSarsaPendingAction(nextAction);
    }

    // Check if both finished episode
    if (isGoal(qAgent.x, qAgent.y) && isGoal(sarsaAgent.x, sarsaAgent.y)) {
      // Record returns
      setQReturns(prev => [...prev, qEpisodeReturn]);
      setSarsaReturns(prev => [...prev, sarsaEpisodeReturn]);

      // Reset for new episode
      setQAgent({ ...START });
      setSarsaAgent({ ...START });
      setQEpisodeReturn(0);
      setSarsaEpisodeReturn(0);
      setSarsaPendingAction(null);
      setEpisodeCount(prev => prev + 1);
    }
  }, [qAgent, sarsaAgent, qValues, sarsaValues, alpha, gamma, selectAction, sarsaPendingAction, qEpisodeReturn, sarsaEpisodeReturn]);

  // Auto-run
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(step, speed);
      return () => clearTimeout(timer);
    }
  }, [isRunning, step, speed]);

  const reset = () => {
    setQValues(initQ());
    setSarsaValues(initQ());
    setQAgent({ ...START });
    setSarsaAgent({ ...START });
    setQReturns([]);
    setSarsaReturns([]);
    setQEpisodeReturn(0);
    setSarsaEpisodeReturn(0);
    setSarsaPendingAction(null);
    setEpisodeCount(0);
    setIsRunning(false);
  };

  const getMaxQ = (qVals, x, y) => Math.max(...qVals[`${x},${y}`]);

  const getValueColor = (v) => {
    const maxAbs = 20;
    const normalized = Math.max(-1, Math.min(1, v / maxAbs));
    if (normalized > 0) return `rgba(34, 197, 94, ${Math.max(0.15, normalized)})`;
    if (normalized < 0) return `rgba(239, 68, 68, ${Math.max(0.15, -normalized)})`;
    return 'rgba(71, 85, 105, 0.3)';
  };

  // Recent average returns
  const recentQAvg = qReturns.slice(-20).reduce((a, b) => a + b, 0) / Math.max(1, qReturns.slice(-20).length);
  const recentSarsaAvg = sarsaReturns.slice(-20).reduce((a, b) => a + b, 0) / Math.max(1, sarsaReturns.slice(-20).length);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Q-Learning vs SARSA Arena</h1>
        <p className="text-slate-400 mb-6">Compare off-policy (Q-Learning) vs on-policy (SARSA) learning on the Cliff Walking problem</p>

        {/* Controls */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                         ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pause' : 'Run Both'}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset
            </button>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-slate-400">Show:</span>
              <button
                onClick={() => setShowValues('q')}
                className={`px-3 py-1 rounded text-sm ${showValues === 'q' ? 'bg-blue-600' : 'bg-slate-700'}`}
              >
                Q-Learning
              </button>
              <button
                onClick={() => setShowValues('sarsa')}
                className={`px-3 py-1 rounded text-sm ${showValues === 'sarsa' ? 'bg-orange-600' : 'bg-slate-700'}`}
              >
                SARSA
              </button>
              <button
                onClick={() => setShowValues('both')}
                className={`px-3 py-1 rounded text-sm ${showValues === 'both' ? 'bg-purple-600' : 'bg-slate-700'}`}
              >
                Both
              </button>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <span className="text-slate-400">Episodes:</span>
              <span className="font-mono font-bold text-green-400">{episodeCount}</span>
            </div>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">α:</span>
              <input type="range" min="0.05" max="0.5" step="0.05" value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))} className="flex-1" />
              <span className="font-mono w-10">{alpha.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">γ:</span>
              <input type="range" min="0.5" max="0.99" step="0.01" value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value))} className="flex-1" />
              <span className="font-mono w-10">{gamma.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">ε:</span>
              <input type="range" min="0.05" max="0.3" step="0.05" value={epsilon}
                onChange={(e) => setEpsilon(parseFloat(e.target.value))} className="flex-1" />
              <span className="font-mono w-10">{epsilon.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Speed:</span>
              <input type="range" min="20" max="300" step="20" value={320 - speed}
                onChange={(e) => setSpeed(320 - parseInt(e.target.value))} className="flex-1" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Q-Learning Grid */}
          <div className={`space-y-4 ${showValues === 'sarsa' ? 'opacity-30' : ''}`}>
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Q-Learning (Off-Policy)
                </h3>
                <div className="text-sm">
                  <span className="text-slate-400">Avg Return:</span>
                  <span className={`font-mono ml-2 ${recentQAvg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {recentQAvg.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                  {Array.from({ length: GRID_SIZE }, (_, y) =>
                    Array.from({ length: GRID_SIZE }, (_, x) => {
                      const cliff = isCliff(x, y);
                      const goal = isGoal(x, y);
                      const start = x === START.x && y === START.y;
                      const agent = x === qAgent.x && y === qAgent.y;
                      const maxQ = getMaxQ(qValues, x, y);
                      const action = getGreedyAction(qValues, x, y);

                      return (
                        <div
                          key={`q-${x},${y}`}
                          className={`w-14 h-14 rounded flex flex-col items-center justify-center relative
                                      ${cliff ? 'bg-red-900' : goal ? 'bg-green-600' : start ? 'bg-blue-900' : ''}
                                      ${agent ? 'ring-2 ring-blue-400' : ''}`}
                          style={{ backgroundColor: cliff || goal || start ? undefined : getValueColor(maxQ) }}
                        >
                          {agent && <span className="absolute text-lg">🔵</span>}
                          {goal && !agent && <span className="text-lg">🎯</span>}
                          {cliff && <span className="text-sm">💀</span>}
                          {start && !agent && <span className="text-xs text-slate-400">START</span>}
                          {!cliff && !goal && (
                            <>
                              <span className="font-mono text-xs">{maxQ.toFixed(1)}</span>
                              <span className="text-sm opacity-60">{actionArrows[action]}</span>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-3 p-3 bg-slate-700/50 rounded text-sm">
                <div className="font-mono text-blue-300">
                  Q(s,a) ← Q(s,a) + α[R + γ <span className="text-yellow-300">max</span><sub>a'</sub> Q(s',a') - Q(s,a)]
                </div>
                <p className="text-slate-400 mt-1">Updates towards best possible action, regardless of policy</p>
              </div>
            </div>
          </div>

          {/* SARSA Grid */}
          <div className={`space-y-4 ${showValues === 'q' ? 'opacity-30' : ''}`}>
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  SARSA (On-Policy)
                </h3>
                <div className="text-sm">
                  <span className="text-slate-400">Avg Return:</span>
                  <span className={`font-mono ml-2 ${recentSarsaAvg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {recentSarsaAvg.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                  {Array.from({ length: GRID_SIZE }, (_, y) =>
                    Array.from({ length: GRID_SIZE }, (_, x) => {
                      const cliff = isCliff(x, y);
                      const goal = isGoal(x, y);
                      const start = x === START.x && y === START.y;
                      const agent = x === sarsaAgent.x && y === sarsaAgent.y;
                      const maxQ = getMaxQ(sarsaValues, x, y);
                      const action = getGreedyAction(sarsaValues, x, y);

                      return (
                        <div
                          key={`sarsa-${x},${y}`}
                          className={`w-14 h-14 rounded flex flex-col items-center justify-center relative
                                      ${cliff ? 'bg-red-900' : goal ? 'bg-green-600' : start ? 'bg-orange-900' : ''}
                                      ${agent ? 'ring-2 ring-orange-400' : ''}`}
                          style={{ backgroundColor: cliff || goal || start ? undefined : getValueColor(maxQ) }}
                        >
                          {agent && <span className="absolute text-lg">🟠</span>}
                          {goal && !agent && <span className="text-lg">🎯</span>}
                          {cliff && <span className="text-sm">💀</span>}
                          {start && !agent && <span className="text-xs text-slate-400">START</span>}
                          {!cliff && !goal && (
                            <>
                              <span className="font-mono text-xs">{maxQ.toFixed(1)}</span>
                              <span className="text-sm opacity-60">{actionArrows[action]}</span>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-3 p-3 bg-slate-700/50 rounded text-sm">
                <div className="font-mono text-orange-300">
                  Q(s,a) ← Q(s,a) + α[R + γ Q(s',<span className="text-yellow-300">a'</span>) - Q(s,a)]
                </div>
                <p className="text-slate-400 mt-1">Updates towards actual next action taken by policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Return History */}
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Episode Returns (last 50)</h3>
            <div className="h-24 flex items-end gap-px">
              {[...Array(Math.max(qReturns.length, sarsaReturns.length))].slice(-50).map((_, i) => {
                const idx = Math.max(0, Math.max(qReturns.length, sarsaReturns.length) - 50) + i;
                const qR = qReturns[idx];
                const sR = sarsaReturns[idx];
                const maxR = 20;
                const minR = -200;
                const normalize = (v) => Math.max(0, ((v - minR) / (maxR - minR)) * 100);

                return (
                  <div key={i} className="flex-1 flex gap-px">
                    <div
                      className="flex-1 bg-blue-500 rounded-t opacity-70"
                      style={{ height: `${qR !== undefined ? normalize(qR) : 0}%` }}
                    />
                    <div
                      className="flex-1 bg-orange-500 rounded-t opacity-70"
                      style={{ height: `${sR !== undefined ? normalize(sR) : 0}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Q-Learning</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded"></span> SARSA</span>
            </div>
          </div>

          {/* Key Differences */}
          <div className="bg-gradient-to-r from-blue-900/30 to-orange-900/30 rounded-xl p-6 border border-blue-500/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Swords size={18} className="text-purple-400" />
              Key Difference: The Cliff
            </h3>
            <div className="text-sm text-slate-300 space-y-2">
              <p>
                <strong className="text-blue-400">Q-Learning</strong> learns the <em>optimal</em> policy
                (walking along the cliff edge) because it always considers the max Q-value,
                ignoring the exploration noise.
              </p>
              <p>
                <strong className="text-orange-400">SARSA</strong> learns a <em>safer</em> policy
                (walking away from the cliff) because it accounts for its own ε-greedy exploration,
                which sometimes falls off the cliff.
              </p>
              <p className="text-slate-400 pt-2 border-t border-slate-700">
                💡 During <strong>training</strong>, SARSA often gets higher returns.
                But Q-Learning's learned policy is better if exploration is turned off.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QLearningVsSARSA;
