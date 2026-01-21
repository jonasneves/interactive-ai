import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Info, RotateCcw, Play, Shuffle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Grid } from 'lucide-react';

const PolicyValueVisualizer = () => {
  const GRID_SIZE = 5;
  const GOAL = { x: 4, y: 0 };
  const OBSTACLES = [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 1 }];

  const [gamma, setGamma] = useState(0.9);
  const [viewMode, setViewMode] = useState('both'); // 'policy', 'value', 'both'
  const [valueType, setValueType] = useState('V'); // 'V' or 'Q'
  const [selectedAction, setSelectedAction] = useState(null); // for Q-value display

  // Initialize policy (deterministic: one action per state)
  const [policy, setPolicy] = useState(() => {
    const p = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const key = `${x},${y}`;
        // Default: move towards goal
        if (x < GOAL.x) p[key] = 'right';
        else if (y > GOAL.y) p[key] = 'up';
        else p[key] = 'right';
      }
    }
    return p;
  });

  // Value function
  const [values, setValues] = useState({});
  const [qValues, setQValues] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalIteration, setEvalIteration] = useState(0);

  const actions = ['up', 'down', 'left', 'right'];
  const actionSymbols = { up: '↑', down: '↓', left: '←', right: '→' };
  const actionDeltas = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
  };

  // Check if position is valid
  const isValidPos = (x, y) => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    if (OBSTACLES.some(o => o.x === x && o.y === y)) return false;
    return true;
  };

  // Check if terminal state
  const isTerminal = (x, y) => x === GOAL.x && y === GOAL.y;

  // Get next state for action
  const getNextState = (x, y, action) => {
    const delta = actionDeltas[action];
    const nx = x + delta.dx;
    const ny = y + delta.dy;
    return isValidPos(nx, ny) ? { x: nx, y: ny } : { x, y };
  };

  // Get reward for transition
  const getReward = (x, y, nx, ny) => {
    if (nx === GOAL.x && ny === GOAL.y) return 10;
    return -0.1; // Small step penalty
  };

  // Policy Evaluation: compute V^π
  const evaluatePolicy = useCallback(() => {
    const newValues = {};
    const newQValues = {};

    // Initialize
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const key = `${x},${y}`;
        if (!OBSTACLES.some(o => o.x === x && o.y === y)) {
          newValues[key] = values[key] || 0;
          actions.forEach(a => {
            newQValues[`${key}-${a}`] = qValues[`${key}-${a}`] || 0;
          });
        }
      }
    }

    // One iteration of policy evaluation
    let maxDelta = 0;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const key = `${x},${y}`;
        if (OBSTACLES.some(o => o.x === x && o.y === y)) continue;
        if (isTerminal(x, y)) {
          newValues[key] = 0; // Terminal state has 0 value
          continue;
        }

        // Compute Q-values for all actions
        actions.forEach(action => {
          const next = getNextState(x, y, action);
          const reward = getReward(x, y, next.x, next.y);
          const nextValue = isTerminal(next.x, next.y) ? 0 : (values[`${next.x},${next.y}`] || 0);
          newQValues[`${key}-${action}`] = reward + gamma * nextValue;
        });

        // V(s) = Q(s, π(s)) for deterministic policy
        const policyAction = policy[key];
        const oldValue = values[key] || 0;
        newValues[key] = newQValues[`${key}-${policyAction}`];
        maxDelta = Math.max(maxDelta, Math.abs(newValues[key] - oldValue));
      }
    }

    setValues(newValues);
    setQValues(newQValues);
    setEvalIteration(prev => prev + 1);

    return maxDelta;
  }, [policy, values, qValues, gamma]);

  // Run full evaluation until convergence
  const runFullEvaluation = async () => {
    setIsEvaluating(true);
    let delta = Infinity;
    let iterations = 0;

    // Reset values
    setValues({});
    setQValues({});
    setEvalIteration(0);

    while (delta > 0.001 && iterations < 100) {
      await new Promise(resolve => setTimeout(resolve, 100));
      delta = evaluatePolicy();
      iterations++;
    }

    setIsEvaluating(false);
  };

  // Change policy for a cell
  const cycleAction = (x, y) => {
    const key = `${x},${y}`;
    if (isTerminal(x, y) || OBSTACLES.some(o => o.x === x && o.y === y)) return;

    const currentAction = policy[key];
    const currentIdx = actions.indexOf(currentAction);
    const nextIdx = (currentIdx + 1) % actions.length;

    setPolicy(prev => ({
      ...prev,
      [key]: actions[nextIdx],
    }));

    // Reset evaluation when policy changes
    setValues({});
    setQValues({});
    setEvalIteration(0);
  };

  // Set random policy
  const randomizePolicy = () => {
    const newPolicy = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const key = `${x},${y}`;
        newPolicy[key] = actions[Math.floor(Math.random() * actions.length)];
      }
    }
    setPolicy(newPolicy);
    setValues({});
    setQValues({});
    setEvalIteration(0);
  };

  // Set greedy policy from current values
  const setGreedyPolicy = () => {
    if (Object.keys(qValues).length === 0) return;

    const newPolicy = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const key = `${x},${y}`;
        if (OBSTACLES.some(o => o.x === x && o.y === y)) continue;

        // Find best action
        let bestAction = 'right';
        let bestValue = -Infinity;
        actions.forEach(action => {
          const qVal = qValues[`${key}-${action}`] || 0;
          if (qVal > bestValue) {
            bestValue = qVal;
            bestAction = action;
          }
        });
        newPolicy[key] = bestAction;
      }
    }
    setPolicy(newPolicy);
    setValues({});
    setQValues({});
    setEvalIteration(0);
  };

  // Get color for value
  const getValueColor = (value) => {
    if (value === undefined) return 'rgba(100, 116, 139, 0.5)';
    const normalized = Math.max(-1, Math.min(1, value / 10));
    if (normalized >= 0) {
      return `rgba(34, 197, 94, ${0.2 + normalized * 0.8})`;
    } else {
      return `rgba(239, 68, 68, ${0.2 + Math.abs(normalized) * 0.8})`;
    }
  };

  // Render grid cell
  const renderCell = (x, y) => {
    const key = `${x},${y}`;
    const isGoal = isTerminal(x, y);
    const isObstacle = OBSTACLES.some(o => o.x === x && o.y === y);
    const value = values[key];
    const action = policy[key];

    return (
      <div
        key={key}
        className={`relative aspect-square rounded-lg flex flex-col items-center justify-center
                    transition-all duration-200 cursor-pointer border-2 border-slate-700
                    ${isObstacle ? 'bg-slate-800' : ''}`}
        style={{
          backgroundColor: isObstacle ? '#1e293b' : (viewMode !== 'policy' ? getValueColor(value) : '#334155'),
        }}
        onClick={() => !isGoal && !isObstacle && cycleAction(x, y)}
      >
        {/* Goal marker */}
        {isGoal && (
          <span className="text-2xl">🎯</span>
        )}

        {/* Obstacle marker */}
        {isObstacle && (
          <span className="text-2xl">🧱</span>
        )}

        {/* Policy arrow */}
        {!isGoal && !isObstacle && (viewMode === 'policy' || viewMode === 'both') && (
          <div className="text-3xl text-blue-400 font-bold">
            {actionSymbols[action]}
          </div>
        )}

        {/* Value display */}
        {!isGoal && !isObstacle && (viewMode === 'value' || viewMode === 'both') && value !== undefined && (
          <div className={`text-xs font-mono ${value >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {value.toFixed(2)}
          </div>
        )}

        {/* Q-values on hover for Q mode */}
        {valueType === 'Q' && !isGoal && !isObstacle && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 bg-slate-900/90 rounded-lg
                         flex flex-col items-center justify-center text-xs transition-opacity">
            {actions.map(a => (
              <div key={a} className={`flex items-center gap-1 ${policy[key] === a ? 'text-yellow-400' : 'text-slate-400'}`}>
                <span>{actionSymbols[a]}</span>
                <span className="font-mono">{(qValues[`${key}-${a}`] || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Policy vs Value Visualizer</h1>
        <p className="text-slate-400 mb-6">Understand the relationship between policies and value functions</p>

        {/* Controls */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('both')}
                className={`px-4 py-2 rounded-lg transition-colors
                           ${viewMode === 'both' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                Both
              </button>
              <button
                onClick={() => setViewMode('policy')}
                className={`px-4 py-2 rounded-lg transition-colors
                           ${viewMode === 'policy' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                Policy Only
              </button>
              <button
                onClick={() => setViewMode('value')}
                className={`px-4 py-2 rounded-lg transition-colors
                           ${viewMode === 'value' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                Value Only
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setValueType(valueType === 'V' ? 'Q' : 'V')}
                className={`px-4 py-2 rounded-lg transition-colors
                           ${valueType === 'Q' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                Show {valueType === 'V' ? 'Q(s,a)' : 'V(s)'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={randomizePolicy}
                className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center gap-2"
              >
                <Shuffle size={16} /> Random Policy
              </button>
              <button
                onClick={setGreedyPolicy}
                disabled={Object.keys(qValues).length === 0}
                className="px-4 py-2 bg-green-700 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Greedy Improve
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grid */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Grid World</h2>
              <div className="text-sm text-slate-400">Click cells to change policy</div>
            </div>

            <div
              className="grid gap-2 mb-4"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
              {Array.from({ length: GRID_SIZE }, (_, y) =>
                Array.from({ length: GRID_SIZE }, (_, x) => renderCell(x, y))
              )}
            </div>

            {/* Policy Evaluation Controls */}
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold">Policy Evaluation</h3>
                  <span className="text-slate-400 text-sm">Iteration: {evalIteration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={evaluatePolicy}
                    disabled={isEvaluating}
                    className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    Step
                  </button>
                  <button
                    onClick={runFullEvaluation}
                    disabled={isEvaluating}
                    className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 text-sm"
                  >
                    <Play size={14} /> Run to Convergence
                  </button>
                </div>
              </div>

              {/* Gamma slider */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-slate-400">γ (discount):</label>
                <input
                  type="range"
                  min="0"
                  max="0.99"
                  step="0.01"
                  value={gamma}
                  onChange={(e) => {
                    setGamma(parseFloat(e.target.value));
                    setValues({});
                    setQValues({});
                    setEvalIteration(0);
                  }}
                  className="w-32"
                />
                <span className="font-mono text-purple-400">{gamma.toFixed(2)}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span> Goal (+10)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🧱</span> Obstacle
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/50" /> High Value
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500/50" /> Low Value
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Concepts */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info size={18} className="text-blue-400" />
                Key Concepts
              </h3>

              <div className="space-y-4 text-sm">
                <div className="p-3 bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                  <strong className="text-blue-400">Policy π(a|s)</strong>
                  <p className="text-slate-300 mt-1">
                    Maps states to actions. The arrows show which action the policy takes in each state.
                  </p>
                </div>

                <div className="p-3 bg-green-900/30 rounded-lg border-l-4 border-green-500">
                  <strong className="text-green-400">State Value V(s)</strong>
                  <p className="text-slate-300 mt-1">
                    Expected return starting from state s and following policy π.
                  </p>
                  <div className="formula text-xs mt-2">
                    V^π(s) = E[G_t | S_t = s, π]
                  </div>
                </div>

                <div className="p-3 bg-purple-900/30 rounded-lg border-l-4 border-purple-500">
                  <strong className="text-purple-400">Action Value Q(s,a)</strong>
                  <p className="text-slate-300 mt-1">
                    Expected return starting from state s, taking action a, then following π.
                  </p>
                  <div className="formula text-xs mt-2">
                    Q^π(s,a) = E[G_t | S_t = s, A_t = a, π]
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Iteration Steps */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Policy Iteration</h3>

              <div className="space-y-3 text-sm">
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">1</span>
                    <strong>Policy Evaluation</strong>
                  </div>
                  <p className="text-slate-400 ml-8">Compute V^π by iterating Bellman expectation equation</p>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs">2</span>
                    <strong>Policy Improvement</strong>
                  </div>
                  <p className="text-slate-400 ml-8">Make π greedy with respect to V^π</p>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs">3</span>
                    <strong>Repeat</strong>
                  </div>
                  <p className="text-slate-400 ml-8">Until policy stops changing (optimal!)</p>
                </div>
              </div>
            </div>

            {/* Current Stats */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Statistics</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                  <span className="text-slate-400">Eval Iterations</span>
                  <span className="font-mono">{evalIteration}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                  <span className="text-slate-400">Max V(s)</span>
                  <span className="font-mono text-green-400">
                    {Object.values(values).length > 0
                      ? Math.max(...Object.values(values)).toFixed(2)
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                  <span className="text-slate-400">Min V(s)</span>
                  <span className="font-mono text-red-400">
                    {Object.values(values).length > 0
                      ? Math.min(...Object.values(values)).toFixed(2)
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                  <span className="text-slate-400">Discount γ</span>
                  <span className="font-mono text-purple-400">{gamma.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3 text-amber-400">💡 Try This</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>1. Click cells to create a bad policy</li>
                <li>2. Run evaluation to see low values</li>
                <li>3. Click "Greedy Improve" to fix it</li>
                <li>4. Run evaluation again - values improve!</li>
                <li>5. Repeat until optimal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyValueVisualizer;
