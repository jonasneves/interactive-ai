import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, TrendingUp, Zap, ArrowRight } from 'lucide-react';

const TDLearning = () => {
  const GRID_SIZE = 4;
  const GOAL = { x: 3, y: 0 };
  const TRAP = { x: 1, y: 1 };

  // State
  const [values, setValues] = useState(() => initValues());
  const [alpha, setAlpha] = useState(0.1);
  const [gamma, setGamma] = useState(0.9);
  const [epsilon, setEpsilon] = useState(0.2);
  const [agentPos, setAgentPos] = useState({ x: 0, y: 3 });
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [lastTDError, setLastTDError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [speed, setSpeed] = useState(300);
  const [tdHistory, setTdHistory] = useState([]);
  const [learnedPolicy, setLearnedPolicy] = useState(() => initPolicy());

  function initValues() {
    const v = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        v[`${x},${y}`] = 0;
      }
    }
    return v;
  }

  function initPolicy() {
    const p = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        p[`${x},${y}`] = 'right';
      }
    }
    return p;
  }

  const getReward = (x, y) => {
    if (x === GOAL.x && y === GOAL.y) return 10;
    if (x === TRAP.x && y === TRAP.y) return -10;
    return -0.1;
  };

  const isValid = (x, y) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
  const isTerminal = (x, y) => (x === GOAL.x && y === GOAL.y) || (x === TRAP.x && y === TRAP.y);

  const getNextState = (x, y, action) => {
    const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = moves[action];
    const nx = x + dx, ny = y + dy;
    return isValid(nx, ny) ? { x: nx, y: ny } : { x, y };
  };

  const actions = ['up', 'down', 'left', 'right'];
  const actionArrows = { up: '↑', down: '↓', left: '←', right: '→' };

  // ε-greedy action selection
  const selectAction = useCallback((x, y) => {
    if (Math.random() < epsilon) {
      return actions[Math.floor(Math.random() * 4)];
    }
    // Greedy w.r.t. values
    let bestValue = -Infinity;
    let bestAction = 'right';
    actions.forEach(action => {
      const next = getNextState(x, y, action);
      const v = values[`${next.x},${next.y}`];
      if (v > bestValue) {
        bestValue = v;
        bestAction = action;
      }
    });
    return bestAction;
  }, [epsilon, values]);

  // TD(0) update
  const tdStep = useCallback(() => {
    const { x, y } = agentPos;

    // Check if terminal (start new episode)
    if (isTerminal(x, y)) {
      setAgentPos({ x: 0, y: 3 });
      setEpisodeCount(prev => prev + 1);
      return;
    }

    // Select action
    const action = selectAction(x, y);
    const next = getNextState(x, y, action);
    const reward = getReward(next.x, next.y);

    // Compute TD error
    const currentV = values[`${x},${y}`];
    const nextV = isTerminal(next.x, next.y) ? 0 : values[`${next.x},${next.y}`];
    const tdTarget = reward + gamma * nextV;
    const tdError = tdTarget - currentV;

    // Update value
    const newValue = currentV + alpha * tdError;
    const newValues = { ...values, [`${x},${y}`]: newValue };
    setValues(newValues);

    // Update learned policy
    const newPolicy = { ...learnedPolicy };
    let bestVal = -Infinity;
    let bestAct = 'right';
    actions.forEach(a => {
      const ns = getNextState(x, y, a);
      const v = newValues[`${ns.x},${ns.y}`];
      if (v > bestVal) { bestVal = v; bestAct = a; }
    });
    newPolicy[`${x},${y}`] = bestAct;
    setLearnedPolicy(newPolicy);

    // Record update
    setLastTDError(tdError);
    setLastUpdate({
      state: { x, y },
      action,
      reward,
      nextState: next,
      oldV: currentV,
      newV: newValue,
      tdTarget,
      tdError
    });

    // Add to history
    setTdHistory(prev => [...prev.slice(-50), {
      step: stepCount,
      tdError: Math.abs(tdError)
    }]);

    // Move agent
    setAgentPos(next);
    setStepCount(prev => prev + 1);
  }, [agentPos, values, alpha, gamma, selectAction, stepCount, learnedPolicy]);

  // Auto-run
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(tdStep, speed);
      return () => clearTimeout(timer);
    }
  }, [isRunning, tdStep, speed]);

  const reset = () => {
    setValues(initValues());
    setLearnedPolicy(initPolicy());
    setAgentPos({ x: 0, y: 3 });
    setStepCount(0);
    setEpisodeCount(0);
    setLastTDError(null);
    setLastUpdate(null);
    setTdHistory([]);
    setIsRunning(false);
  };

  const getValueColor = (v) => {
    const maxAbs = 12;
    const normalized = Math.max(-1, Math.min(1, v / maxAbs));
    if (normalized > 0) return `rgba(34, 197, 94, ${Math.max(0.1, normalized)})`;
    if (normalized < 0) return `rgba(239, 68, 68, ${Math.max(0.1, -normalized)})`;
    return 'rgba(71, 85, 105, 0.5)';
  };

  // TD Error visualization
  const maxTDError = Math.max(...tdHistory.map(h => h.tdError), 0.1);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">TD Learning Playground</h1>
        <p className="text-slate-400 mb-6">Understand bootstrapping and temporal difference learning</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Grid and Controls */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap mb-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                             ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isRunning ? 'Pause' : 'Run'}
                </button>
                <button
                  onClick={tdStep}
                  disabled={isRunning}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <ArrowRight size={16} /> Step
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-slate-400 mb-1">α (learning rate)</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min="0.01" max="0.5" step="0.01"
                      value={alpha}
                      onChange={(e) => setAlpha(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-mono w-10">{alpha.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">γ (discount)</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min="0.5" max="0.99" step="0.01"
                      value={gamma}
                      onChange={(e) => setGamma(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-mono w-10">{gamma.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">ε (exploration)</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min="0.05" max="0.5" step="0.05"
                      value={epsilon}
                      onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-mono w-10">{epsilon.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400">Steps:</span>
                  <span className="font-mono font-bold text-blue-400 ml-2">{stepCount}</span>
                </div>
                <div>
                  <span className="text-slate-400">Episodes:</span>
                  <span className="font-mono font-bold text-green-400 ml-2">{episodeCount}</span>
                </div>
                <div>
                  <span className="text-slate-400">TD Error:</span>
                  <span className={`font-mono font-bold ml-2 ${
                    lastTDError === null ? 'text-slate-500' :
                    Math.abs(lastTDError) < 0.1 ? 'text-green-400' :
                    Math.abs(lastTDError) < 1 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {lastTDError !== null ? lastTDError.toFixed(3) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-400" />
                Value Function V(s)
              </h3>
              <div className="flex justify-center">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                  {Array.from({ length: GRID_SIZE }, (_, y) =>
                    Array.from({ length: GRID_SIZE }, (_, x) => {
                      const isGoal = x === GOAL.x && y === GOAL.y;
                      const isTrap = x === TRAP.x && y === TRAP.y;
                      const isAgent = x === agentPos.x && y === agentPos.y;
                      const v = values[`${x},${y}`];
                      const action = learnedPolicy[`${x},${y}`];
                      const wasUpdated = lastUpdate?.state.x === x && lastUpdate?.state.y === y;

                      return (
                        <div
                          key={`${x},${y}`}
                          className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center relative
                                      border-2 transition-all duration-300
                                      ${isAgent ? 'border-yellow-400 scale-105' :
                                        wasUpdated ? 'border-blue-400' : 'border-transparent'}
                                      ${isGoal ? 'bg-green-600' : isTrap ? 'bg-red-600' : ''}`}
                          style={{ backgroundColor: isGoal || isTrap ? undefined : getValueColor(v) }}
                        >
                          {isAgent && <span className="absolute text-2xl">🤖</span>}
                          {isGoal && !isAgent && <span className="text-xl">🎯</span>}
                          {isTrap && !isAgent && <span className="text-xl">💀</span>}
                          <span className={`font-mono text-sm font-bold ${isAgent ? 'mt-6' : ''}`}>
                            {v.toFixed(2)}
                          </span>
                          {!isGoal && !isTrap && !isAgent && (
                            <span className="text-lg opacity-70">{actionArrows[action]}</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* TD Error Chart */}
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-2 text-sm">|TD Error| Over Time</h3>
              <div className="h-20 flex items-end gap-px">
                {tdHistory.slice(-60).map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-500 rounded-t opacity-70"
                    style={{ height: `${(h.tdError / maxTDError) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: TD Explanation */}
          <div className="space-y-6">
            {/* TD Update Breakdown */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                TD(0) Update
              </h3>

              <div className="bg-slate-900 p-4 rounded-lg font-mono text-center mb-4">
                <div className="text-lg">
                  V(S<sub>t</sub>) ← V(S<sub>t</sub>) + <span className="text-blue-400">α</span>[
                  <span className="text-green-400">R<sub>t+1</sub></span> +
                  <span className="text-purple-400">γ</span>V(S<sub>t+1</sub>) - V(S<sub>t</sub>)]
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  <span className="text-yellow-400">TD Error = Target - Current Estimate</span>
                </div>
              </div>

              {lastUpdate ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-slate-400">State S<sub>t</sub></div>
                      <div className="font-mono text-lg">({lastUpdate.state.x}, {lastUpdate.state.y})</div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-slate-400">Action</div>
                      <div className="font-mono text-lg">{actionArrows[lastUpdate.action]} {lastUpdate.action}</div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-slate-400">Reward R<sub>t+1</sub></div>
                      <div className={`font-mono text-lg ${lastUpdate.reward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {lastUpdate.reward.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-slate-400">Next State S<sub>t+1</sub></div>
                      <div className="font-mono text-lg">({lastUpdate.nextState.x}, {lastUpdate.nextState.y})</div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                    <div className="text-sm space-y-1 font-mono">
                      <div>TD Target = <span className="text-green-400">{lastUpdate.reward.toFixed(2)}</span> + <span className="text-purple-400">{gamma}</span> × V(S') = <span className="text-yellow-400">{lastUpdate.tdTarget.toFixed(3)}</span></div>
                      <div>TD Error = <span className="text-yellow-400">{lastUpdate.tdTarget.toFixed(3)}</span> - <span className="text-slate-400">{lastUpdate.oldV.toFixed(3)}</span> = <span className="text-orange-400">{lastUpdate.tdError.toFixed(3)}</span></div>
                      <div>New V(S) = <span className="text-slate-400">{lastUpdate.oldV.toFixed(3)}</span> + <span className="text-blue-400">{alpha}</span> × <span className="text-orange-400">{lastUpdate.tdError.toFixed(3)}</span> = <span className="text-green-400 font-bold">{lastUpdate.newV.toFixed(3)}</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center">Click Step or Run to see TD updates</p>
              )}
            </div>

            {/* TD vs MC Comparison */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">TD vs Monte Carlo</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-blue-900/30 border border-blue-500/50">
                  <h4 className="font-medium text-blue-400 mb-2">TD Learning</h4>
                  <ul className="text-slate-300 space-y-1">
                    <li>• Updates every step</li>
                    <li>• Bootstraps from V(S')</li>
                    <li>• Lower variance</li>
                    <li>• Some bias</li>
                    <li>• Can learn online</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-purple-900/30 border border-purple-500/50">
                  <h4 className="font-medium text-purple-400 mb-2">Monte Carlo</h4>
                  <ul className="text-slate-300 space-y-1">
                    <li>• Updates after episode</li>
                    <li>• Uses actual returns</li>
                    <li>• Higher variance</li>
                    <li>• No bias</li>
                    <li>• Needs episodes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Insight */}
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-500/30">
              <h3 className="font-semibold mb-3 text-yellow-300">💡 Bootstrapping</h3>
              <p className="text-sm text-slate-300">
                TD methods <strong>bootstrap</strong> — they update estimates using other estimates.
                The TD target <code className="bg-slate-800 px-1 rounded">R + γV(S')</code> uses the
                current estimate of V(S') rather than waiting for the actual return.
                This allows learning from incomplete episodes and is more efficient,
                but introduces some bias.
              </p>
            </div>

            {/* Speed control */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Speed:</span>
                <input
                  type="range" min="50" max="500" step="50"
                  value={550 - speed}
                  onChange={(e) => setSpeed(550 - parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-slate-400">{speed}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TDLearning;
