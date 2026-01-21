import React, { useState, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, Sparkles } from 'lucide-react';

const RewardShaping = () => {
  const GRID_SIZE = 5;
  const GOAL = { x: 4, y: 0 };
  const START = { x: 0, y: 4 };

  // State
  const [shapingMode, setShapingMode] = useState('none'); // 'none', 'distance', 'potential', 'dense'
  const [agentPos, setAgentPos] = useState({ ...START });
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const [qValues, setQValues] = useState(() => initQ());
  const [trajectory, setTrajectory] = useState([]);
  const [episodeReturns, setEpisodeReturns] = useState({ none: [], distance: [], potential: [], dense: [] });
  const [speed, setSpeed] = useState(200);
  const [epsilon, setEpsilon] = useState(0.2);
  const [alpha, setAlpha] = useState(0.1);
  const [gamma, setGamma] = useState(0.99);

  const actions = ['up', 'down', 'left', 'right'];
  const actionArrows = { up: '↑', down: '↓', left: '←', right: '→' };

  function initQ() {
    const q = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        q[`${x},${y}`] = [0, 0, 0, 0];
      }
    }
    return q;
  }

  const isValid = (x, y) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
  const isGoal = (x, y) => x === GOAL.x && y === GOAL.y;

  const getNextState = (x, y, action) => {
    const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = moves[action];
    const nx = x + dx, ny = y + dy;
    return isValid(nx, ny) ? { x: nx, y: ny } : { x, y };
  };

  // Distance to goal
  const distanceToGoal = (x, y) => Math.abs(x - GOAL.x) + Math.abs(y - GOAL.y);

  // Potential function for PBRS
  const potential = (x, y) => -distanceToGoal(x, y);

  // Get reward based on shaping mode
  const getReward = useCallback((x, y, prevX, prevY) => {
    const baseReward = isGoal(x, y) ? 10 : -0.01;

    switch (shapingMode) {
      case 'none':
        return baseReward;

      case 'distance':
        // Naive: reward for getting closer (can change optimal policy!)
        return baseReward + (distanceToGoal(prevX, prevY) - distanceToGoal(x, y)) * 0.5;

      case 'potential':
        // PBRS: F(s,s') = γΦ(s') - Φ(s) - preserves optimal policy
        const F = gamma * potential(x, y) - potential(prevX, prevY);
        return baseReward + F;

      case 'dense':
        // Very dense: constant small reward for each step toward goal
        const improvement = distanceToGoal(prevX, prevY) - distanceToGoal(x, y);
        return baseReward + improvement * 2 + (isGoal(x, y) ? 5 : 0);

      default:
        return baseReward;
    }
  }, [shapingMode, gamma]);

  // Select action (ε-greedy)
  const selectAction = useCallback((x, y) => {
    if (Math.random() < epsilon) {
      return Math.floor(Math.random() * 4);
    }
    const qs = qValues[`${x},${y}`];
    let maxQ = Math.max(...qs);
    let maxActions = qs.map((q, i) => q === maxQ ? i : -1).filter(i => i >= 0);
    return maxActions[Math.floor(Math.random() * maxActions.length)];
  }, [qValues, epsilon]);

  // Take a step
  const step = useCallback(() => {
    const { x, y } = agentPos;

    // Check if at goal
    if (isGoal(x, y)) {
      setEpisodeReturns(prev => ({
        ...prev,
        [shapingMode]: [...prev[shapingMode], totalReward]
      }));
      setAgentPos({ ...START });
      setTrajectory([]);
      setTotalReward(0);
      setEpisodeCount(prev => prev + 1);
      return;
    }

    const actionIdx = selectAction(x, y);
    const action = actions[actionIdx];
    const next = getNextState(x, y, action);
    const reward = getReward(next.x, next.y, x, y);

    // Q-learning update
    const maxNextQ = Math.max(...qValues[`${next.x},${next.y}`]);
    const newQ = [...qValues[`${x},${y}`]];
    newQ[actionIdx] = newQ[actionIdx] + alpha * (reward + gamma * maxNextQ - newQ[actionIdx]);
    setQValues(prev => ({ ...prev, [`${x},${y}`]: newQ }));

    // Update state
    setAgentPos(next);
    setTrajectory(prev => [...prev, { x, y, action, reward }]);
    setTotalReward(prev => prev + reward);
    setStepCount(prev => prev + 1);
  }, [agentPos, qValues, totalReward, shapingMode, selectAction, getReward, alpha, gamma]);

  // Auto-run
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(step, speed);
      return () => clearTimeout(timer);
    }
  }, [isRunning, step, speed]);

  const reset = () => {
    setQValues(initQ());
    setAgentPos({ ...START });
    setTrajectory([]);
    setTotalReward(0);
    setStepCount(0);
    setEpisodeCount(0);
    setEpisodeReturns({ none: [], distance: [], potential: [], dense: [] });
    setIsRunning(false);
  };

  const shapingModes = [
    { id: 'none', name: 'Sparse Only', color: '#64748b', bgColor: 'bg-slate-600', desc: 'Only reward at goal', safe: true },
    { id: 'distance', name: 'Distance-based', color: '#eab308', bgColor: 'bg-yellow-600', desc: 'Reward for getting closer', safe: false },
    { id: 'potential', name: 'PBRS', color: '#22c55e', bgColor: 'bg-green-600', desc: 'γΦ(s\')-Φ(s) shaping', safe: true },
    { id: 'dense', name: 'Dense', color: '#a855f7', bgColor: 'bg-purple-600', desc: 'Heavy intermediate rewards', safe: false }
  ];

  const getGreedyAction = (x, y) => {
    const qs = qValues[`${x},${y}`];
    return actions[qs.indexOf(Math.max(...qs))];
  };

  const avgReturn = (mode) => {
    const returns = episodeReturns[mode];
    if (returns.length === 0) return 0;
    return returns.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, returns.length);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Reward Shaping Sandbox</h1>
        <p className="text-slate-400 mb-6">Explore how reward shaping affects learning and policy optimality</p>

        {/* Shaping mode selection */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">Shaping Mode:</span>
            {shapingModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => { setShapingMode(mode.id); reset(); }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  shapingMode === mode.id ? mode.bgColor : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {!mode.safe && <AlertTriangle size={14} className="text-yellow-400" />}
                {mode.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-2">
            {shapingModes.find(m => m.id === shapingMode)?.desc}
            {!shapingModes.find(m => m.id === shapingMode)?.safe && (
              <span className="text-yellow-400 ml-2">⚠️ May change optimal policy!</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Grid */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap mb-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isRunning ? 'bg-red-600' : 'bg-green-600'
                  }`}
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isRunning ? 'Pause' : 'Train'}
                </button>
                <button onClick={reset} className="px-4 py-2 bg-slate-700 rounded-lg">
                  <RotateCcw size={16} />
                </button>
                <div className="ml-auto flex gap-4 text-sm">
                  <span>Steps: <span className="font-mono text-blue-400">{stepCount}</span></span>
                  <span>Episodes: <span className="font-mono text-green-400">{episodeCount}</span></span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">Speed:</span>
                <input type="range" min="50" max="500" value={550 - speed}
                  onChange={(e) => setSpeed(550 - parseInt(e.target.value))} className="w-24" />
              </div>
            </div>

            {/* Grid */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Grid World</h3>
              <div className="flex justify-center">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                  {Array.from({ length: GRID_SIZE }, (_, y) =>
                    Array.from({ length: GRID_SIZE }, (_, x) => {
                      const goal = isGoal(x, y);
                      const start = x === START.x && y === START.y;
                      const isAgent = agentPos.x === x && agentPos.y === y;
                      const inTraj = trajectory.some(t => t.x === x && t.y === y);
                      const maxQ = Math.max(...qValues[`${x},${y}`]);
                      const action = getGreedyAction(x, y);

                      // Show potential/distance
                      const dist = distanceToGoal(x, y);
                      const pot = potential(x, y);

                      return (
                        <div
                          key={`${x},${y}`}
                          className={`w-14 h-14 rounded flex flex-col items-center justify-center text-xs
                                      ${goal ? 'bg-green-600' : start ? 'bg-blue-900' : 'bg-slate-700'}
                                      ${inTraj ? 'ring-1 ring-yellow-400' : ''}
                                      ${isAgent ? 'ring-2 ring-white' : ''}`}
                        >
                          {isAgent && <span className="text-lg">🤖</span>}
                          {goal && !isAgent && <span className="text-lg">🎯</span>}
                          {!goal && !isAgent && (
                            <>
                              <span className="text-lg">{actionArrows[action]}</span>
                              <span className="text-slate-400">d={dist}</span>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Current Episode */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Current Episode</h3>
                <span className={`font-mono ${totalReward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Return: {totalReward.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {trajectory.slice(-20).map((t, i) => (
                  <span key={i} className={`px-1 py-0.5 text-xs rounded ${
                    t.reward > 0 ? 'bg-green-700' : t.reward < -0.5 ? 'bg-red-700' : 'bg-slate-600'
                  }`}>
                    {t.action}:{t.reward.toFixed(1)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Explanation */}
          <div className="space-y-6">
            {/* Reward Function */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-400" />
                Current Reward Function
              </h3>

              <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm">
                {shapingMode === 'none' && (
                  <div>R(s,a,s') = <span className="text-green-400">10 if goal</span> else <span className="text-red-400">-0.01</span></div>
                )}
                {shapingMode === 'distance' && (
                  <div>R = base + 0.5 × (<span className="text-blue-400">d(s)</span> - <span className="text-blue-400">d(s')</span>)</div>
                )}
                {shapingMode === 'potential' && (
                  <div>R = base + <span className="text-green-400">γΦ(s')</span> - <span className="text-purple-400">Φ(s)</span></div>
                )}
                {shapingMode === 'dense' && (
                  <div>R = base + 2×improvement + <span className="text-yellow-400">5 if goal</span></div>
                )}
              </div>
            </div>

            {/* PBRS Explanation */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-green-400" />
                Potential-Based Reward Shaping
              </h3>

              <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm mb-4">
                F(s, s') = γΦ(s') - Φ(s)
              </div>

              <p className="text-sm text-slate-300 mb-4">
                PBRS is the <strong className="text-green-400">only</strong> form of reward shaping
                guaranteed to preserve the optimal policy. The key is using a potential function
                Φ(s) and taking the difference.
              </p>

              <div className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-sm">
                <strong className="text-green-400">Theorem:</strong> Adding F(s,s') = γΦ(s') - Φ(s)
                to any MDP reward preserves the set of optimal policies.
              </div>
            </div>

            {/* Comparison */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Average Returns by Mode</h3>
              <div className="space-y-2">
                {shapingModes.map(mode => (
                  <div key={mode.id} className="flex items-center gap-3">
                    <span
                      className="w-24 text-sm"
                      style={{ color: mode.id === shapingMode ? mode.color : '#94a3b8' }}
                    >
                      {mode.name}
                    </span>
                    <div className="flex-1 h-4 bg-slate-700 rounded overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.max(0, avgReturn(mode.id) / 15 * 100)}%`,
                          backgroundColor: mode.color
                        }}
                      />
                    </div>
                    <span className="font-mono text-sm w-16">{avgReturn(mode.id).toFixed(1)}</span>
                    <span className="text-xs text-slate-500">({episodeReturns[mode.id].length})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-gradient-to-r from-yellow-900/30 to-red-900/30 rounded-xl p-6 border border-yellow-500/30">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-yellow-300">
                <AlertTriangle size={18} />
                Reward Shaping Pitfalls
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Policy change:</strong> Naive shaping can make suboptimal policies look optimal</li>
                <li>• <strong>Reward hacking:</strong> Agent may find ways to exploit shaped rewards</li>
                <li>• <strong>Domain knowledge:</strong> Bad potential functions can hurt learning</li>
                <li>• <strong>Use PBRS:</strong> It's the safe choice that preserves optimality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardShaping;
