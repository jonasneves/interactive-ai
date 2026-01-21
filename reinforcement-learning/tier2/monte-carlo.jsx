import React, { useState, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Dice5, TrendingUp, Eye, EyeOff } from 'lucide-react';

const MonteCarlo = () => {
  const GRID_SIZE = 4;
  const GOAL = { x: 3, y: 0 };
  const TRAP = { x: 1, y: 1 };

  // State
  const [values, setValues] = useState(() => initValues());
  const [visitCounts, setVisitCounts] = useState(() => initValues());
  const [policy, setPolicy] = useState('random'); // 'random' or 'epsilon'
  const [epsilon, setEpsilon] = useState(0.3);
  const [gamma, setGamma] = useState(0.9);
  const [isRunning, setIsRunning] = useState(false);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState([]);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [speed, setSpeed] = useState(200);
  const [mcType, setMcType] = useState('first'); // 'first' or 'every'
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
    const actions = ['up', 'down', 'left', 'right'];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        p[`${x},${y}`] = actions[Math.floor(Math.random() * 4)];
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

  // Select action based on policy
  const selectAction = useCallback((x, y) => {
    if (policy === 'random') {
      return actions[Math.floor(Math.random() * 4)];
    }
    // ε-greedy with learned policy
    if (Math.random() < epsilon) {
      return actions[Math.floor(Math.random() * 4)];
    }
    return learnedPolicy[`${x},${y}`] || 'right';
  }, [policy, epsilon, learnedPolicy]);

  // Generate complete episode
  const generateEpisode = useCallback(() => {
    const episode = [];
    let x = Math.floor(Math.random() * GRID_SIZE);
    let y = GRID_SIZE - 1; // Start from bottom row

    // Ensure we don't start in terminal state
    while (isTerminal(x, y)) {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
    }

    let steps = 0;
    const maxSteps = 100;

    while (!isTerminal(x, y) && steps < maxSteps) {
      const action = selectAction(x, y);
      const next = getNextState(x, y, action);
      const reward = getReward(next.x, next.y);

      episode.push({ x, y, action, reward, nextX: next.x, nextY: next.y });
      x = next.x;
      y = next.y;
      steps++;
    }

    return episode;
  }, [selectAction]);

  // Update values from episode
  const updateFromEpisode = useCallback((episode) => {
    const newValues = { ...values };
    const newCounts = { ...visitCounts };
    const returns = {};
    const visited = new Set();

    // Calculate returns (going backwards)
    let G = 0;
    for (let t = episode.length - 1; t >= 0; t--) {
      const { x, y, reward } = episode[t];
      G = reward + gamma * G;
      const key = `${x},${y}`;

      if (mcType === 'first' && visited.has(key)) continue;
      visited.add(key);

      if (!returns[key]) returns[key] = [];
      returns[key].push(G);
    }

    // Update values with running average
    Object.keys(returns).forEach(key => {
      returns[key].forEach(g => {
        newCounts[key] = (newCounts[key] || 0) + 1;
        const alpha = 1 / newCounts[key];
        newValues[key] = newValues[key] + alpha * (g - newValues[key]);
      });
    });

    setValues(newValues);
    setVisitCounts(newCounts);

    // Update learned policy (greedy w.r.t. values)
    const newPolicy = { ...learnedPolicy };
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (isTerminal(x, y)) continue;
        let bestValue = -Infinity;
        let bestAction = 'right';
        actions.forEach(action => {
          const next = getNextState(x, y, action);
          const v = newValues[`${next.x},${next.y}`];
          if (v > bestValue) {
            bestValue = v;
            bestAction = action;
          }
        });
        newPolicy[`${x},${y}`] = bestAction;
      }
    }
    setLearnedPolicy(newPolicy);
  }, [values, visitCounts, gamma, mcType, learnedPolicy]);

  // Run one episode
  const runEpisode = useCallback(() => {
    const episode = generateEpisode();
    setCurrentEpisode(episode);
    updateFromEpisode(episode);
    setEpisodeCount(prev => prev + 1);
  }, [generateEpisode, updateFromEpisode]);

  // Auto-run
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(runEpisode, speed);
      return () => clearTimeout(timer);
    }
  }, [isRunning, runEpisode, speed]);

  const reset = () => {
    setValues(initValues());
    setVisitCounts(initValues());
    setLearnedPolicy(initPolicy());
    setEpisodeCount(0);
    setCurrentEpisode([]);
    setIsRunning(false);
  };

  const getValueColor = (v) => {
    const maxAbs = 12;
    const normalized = Math.max(-1, Math.min(1, v / maxAbs));
    if (normalized > 0) return `rgba(34, 197, 94, ${Math.max(0.1, normalized)})`;
    if (normalized < 0) return `rgba(239, 68, 68, ${Math.max(0.1, -normalized)})`;
    return 'rgba(71, 85, 105, 0.5)';
  };

  const isInTrajectory = (x, y) => currentEpisode.some(s => s.x === x && s.y === y);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Monte Carlo Methods</h1>
        <p className="text-slate-400 mb-6">Learn state values from complete episode samples</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Grid and Controls */}
          <div className="space-y-6">
            {/* MC Type Selection */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-slate-400">MC Type:</span>
                <button
                  onClick={() => setMcType('first')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    mcType === 'first' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  First-Visit
                </button>
                <button
                  onClick={() => setMcType('every')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    mcType === 'every' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  Every-Visit
                </button>
                <button
                  onClick={() => setShowTrajectory(!showTrajectory)}
                  className="ml-auto px-3 py-2 bg-slate-700 rounded-lg flex items-center gap-2"
                >
                  {showTrajectory ? <Eye size={16} /> : <EyeOff size={16} />}
                  Trail
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap mb-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                             ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isRunning ? 'Pause' : 'Auto Run'}
                </button>
                <button
                  onClick={runEpisode}
                  disabled={isRunning}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Dice5 size={16} /> Sample Episode
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Speed:</span>
                  <input
                    type="range" min="50" max="500" step="50"
                    value={550 - speed}
                    onChange={(e) => setSpeed(550 - parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">γ:</span>
                  <input
                    type="range" min="0.5" max="0.99" step="0.01"
                    value={gamma}
                    onChange={(e) => setGamma(parseFloat(e.target.value))}
                    className="w-20"
                  />
                  <span className="font-mono text-sm">{gamma.toFixed(2)}</span>
                </div>
                <div className="ml-auto">
                  <span className="text-slate-400">Episodes:</span>
                  <span className="font-mono font-bold text-green-400 ml-2">{episodeCount}</span>
                </div>
              </div>
            </div>

            {/* Policy Selection */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-slate-400">Behavior Policy:</span>
                <button
                  onClick={() => setPolicy('random')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    policy === 'random' ? 'bg-orange-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  Random
                </button>
                <button
                  onClick={() => setPolicy('epsilon')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    policy === 'epsilon' ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  ε-greedy
                </button>
                {policy === 'epsilon' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">ε:</span>
                    <input
                      type="range" min="0.05" max="0.5" step="0.05"
                      value={epsilon}
                      onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                      className="w-20"
                    />
                    <span className="font-mono text-sm">{epsilon.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-400" />
                Estimated Values V(s)
              </h3>
              <div className="flex justify-center">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                  {Array.from({ length: GRID_SIZE }, (_, y) =>
                    Array.from({ length: GRID_SIZE }, (_, x) => {
                      const isGoal = x === GOAL.x && y === GOAL.y;
                      const isTrap = x === TRAP.x && y === TRAP.y;
                      const v = values[`${x},${y}`];
                      const count = visitCounts[`${x},${y}`];
                      const inTrajectory = showTrajectory && isInTrajectory(x, y);
                      const action = learnedPolicy[`${x},${y}`];

                      return (
                        <div
                          key={`${x},${y}`}
                          className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center relative
                                      border-2 transition-all
                                      ${inTrajectory ? 'border-yellow-400' : 'border-transparent'}
                                      ${isGoal ? 'bg-green-600' : isTrap ? 'bg-red-600' : ''}`}
                          style={{ backgroundColor: isGoal || isTrap ? undefined : getValueColor(v) }}
                        >
                          {isGoal && <span className="text-xl">🎯</span>}
                          {isTrap && <span className="text-xl">💀</span>}
                          <span className="font-mono text-sm font-bold">{v.toFixed(1)}</span>
                          {!isGoal && !isTrap && (
                            <span className="text-lg opacity-70">{actionArrows[action]}</span>
                          )}
                          <span className="text-xs text-slate-400">n={count}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Episode Details */}
          <div className="space-y-6">
            {/* Current Episode */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Dice5 size={18} className="text-purple-400" />
                Current Episode ({currentEpisode.length} steps)
              </h3>
              {currentEpisode.length === 0 ? (
                <p className="text-slate-500 text-sm">Click "Sample Episode" to generate</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {currentEpisode.map((step, i) => (
                    <div key={i} className="text-xs p-2 bg-slate-700/50 rounded flex items-center gap-3">
                      <span className="text-slate-400 w-8">t={i}</span>
                      <span className="font-mono">({step.x},{step.y})</span>
                      <span className="text-blue-400">{actionArrows[step.action]}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-mono">({step.nextX},{step.nextY})</span>
                      <span className={`ml-auto ${step.reward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        R={step.reward.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">How Monte Carlo Works</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="font-medium text-blue-400 mb-1">1. Generate Episode</div>
                  <p className="text-slate-400">Follow policy until terminal state</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="font-medium text-purple-400 mb-1">2. Calculate Returns</div>
                  <p className="text-slate-400">G<sub>t</sub> = R<sub>t+1</sub> + γR<sub>t+2</sub> + γ²R<sub>t+3</sub> + ...</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="font-medium text-green-400 mb-1">3. Update Values</div>
                  <p className="text-slate-400">V(s) ← average of all returns from s</p>
                </div>
              </div>
            </div>

            {/* First vs Every Visit */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">First-Visit vs Every-Visit</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={`p-3 rounded-lg border ${mcType === 'first' ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-blue-400 mb-1">First-Visit MC</h4>
                  <p className="text-slate-400">Only count the first time state s appears in episode</p>
                </div>
                <div className={`p-3 rounded-lg border ${mcType === 'every' ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-purple-400 mb-1">Every-Visit MC</h4>
                  <p className="text-slate-400">Count every time state s appears in episode</p>
                </div>
              </div>
            </div>

            {/* Key Properties */}
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-500/30">
              <h3 className="font-semibold mb-3 text-green-300">💡 Key Properties</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Model-free:</strong> No need to know transition probabilities</li>
                <li>• <strong>Unbiased:</strong> Uses actual returns, not estimates</li>
                <li>• <strong>High variance:</strong> Returns vary between episodes</li>
                <li>• <strong>Episodes only:</strong> Requires complete episodes to learn</li>
                <li>• <strong>Exploration:</strong> Need stochastic policy for coverage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonteCarlo;
