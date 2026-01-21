import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Info, ChevronRight, Zap } from 'lucide-react';

const BellmanExplorer = () => {
  // 4x4 Grid World
  const GRID_SIZE = 4;
  const GOAL = { x: 3, y: 0 };
  const TRAP = { x: 1, y: 1 };

  // State
  const [gamma, setGamma] = useState(0.9);
  const [selectedCell, setSelectedCell] = useState({ x: 0, y: 3 });
  const [values, setValues] = useState(() => initValues());
  const [isIterating, setIsIterating] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [showEquation, setShowEquation] = useState(true);
  const [highlightedTransitions, setHighlightedTransitions] = useState([]);

  // Initialize values
  function initValues() {
    const v = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        v[`${x},${y}`] = 0;
      }
    }
    return v;
  }

  // Get reward for a cell
  const getReward = (x, y) => {
    if (x === GOAL.x && y === GOAL.y) return 10;
    if (x === TRAP.x && y === TRAP.y) return -10;
    return -0.1;
  };

  // Check if position is valid
  const isValid = (x, y) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

  // Get next state for action (deterministic)
  const getNextState = (x, y, action) => {
    const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = moves[action];
    const nx = x + dx, ny = y + dy;
    return isValid(nx, ny) ? { x: nx, y: ny } : { x, y };
  };

  // Compute Bellman update for a cell (random policy)
  const computeBellmanUpdate = (x, y, currentValues) => {
    if ((x === GOAL.x && y === GOAL.y) || (x === TRAP.x && y === TRAP.y)) {
      return getReward(x, y); // Terminal states
    }

    const actions = ['up', 'down', 'left', 'right'];
    let sum = 0;
    const transitions = [];

    actions.forEach(action => {
      const next = getNextState(x, y, action);
      const r = getReward(next.x, next.y);
      const v_next = currentValues[`${next.x},${next.y}`];
      const prob = 0.25; // Random policy
      sum += prob * (r + gamma * v_next);
      transitions.push({ action, next, r, v_next, prob });
    });

    return { value: sum, transitions };
  };

  // Single iteration of value iteration
  const iterate = () => {
    const newValues = { ...values };

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const result = computeBellmanUpdate(x, y, values);
        newValues[`${x},${y}`] = typeof result === 'number' ? result : result.value;
      }
    }

    setValues(newValues);
    setIteration(prev => prev + 1);
  };

  // Auto-iteration
  useEffect(() => {
    if (isIterating) {
      const timer = setTimeout(iterate, 500);
      return () => clearTimeout(timer);
    }
  }, [isIterating, values]);

  // Reset
  const reset = () => {
    setValues(initValues());
    setIteration(0);
    setIsIterating(false);
  };

  // Compute breakdown for selected cell
  const selectedBreakdown = useMemo(() => {
    const { x, y } = selectedCell;
    if ((x === GOAL.x && y === GOAL.y) || (x === TRAP.x && y === TRAP.y)) {
      return { isTerminal: true, reward: getReward(x, y) };
    }
    return computeBellmanUpdate(x, y, values);
  }, [selectedCell, values, gamma]);

  // Highlight transitions when cell selected
  useEffect(() => {
    if (selectedBreakdown && selectedBreakdown.transitions) {
      setHighlightedTransitions(selectedBreakdown.transitions.map(t => t.next));
    } else {
      setHighlightedTransitions([]);
    }
  }, [selectedBreakdown]);

  // Color scale for values
  const getValueColor = (v) => {
    const maxAbs = 15;
    const normalized = Math.max(-1, Math.min(1, v / maxAbs));
    if (normalized > 0) {
      return `rgba(34, 197, 94, ${normalized})`;
    } else {
      return `rgba(239, 68, 68, ${-normalized})`;
    }
  };

  // Check if cell is highlighted
  const isHighlighted = (x, y) =>
    highlightedTransitions.some(t => t.x === x && t.y === y);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Bellman Equation Explorer</h1>
        <p className="text-slate-400 mb-6">Visualize the recursive structure of value functions</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Grid and Controls */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <button
                  onClick={() => setIsIterating(!isIterating)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                             ${isIterating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isIterating ? <Pause size={16} /> : <Play size={16} />}
                  {isIterating ? 'Stop' : 'Auto Iterate'}
                </button>
                <button
                  onClick={iterate}
                  disabled={isIterating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <ChevronRight size={16} /> Step
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Reset
                </button>
                <div className="ml-auto px-4 py-2 bg-slate-700 rounded-lg">
                  Iteration: <span className="font-mono font-bold text-blue-400">{iteration}</span>
                </div>
              </div>

              {/* Gamma slider */}
              <div className="flex items-center gap-4">
                <span className="text-slate-400">γ (discount):</span>
                <input
                  type="range"
                  min="0"
                  max="0.99"
                  step="0.01"
                  value={gamma}
                  onChange={(e) => setGamma(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="font-mono w-16 text-right">{gamma.toFixed(2)}</span>
              </div>
            </div>

            {/* Grid */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Value Function V(s)</h3>
              <div className="flex justify-center">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                  {Array.from({ length: GRID_SIZE }, (_, y) =>
                    Array.from({ length: GRID_SIZE }, (_, x) => {
                      const isGoal = x === GOAL.x && y === GOAL.y;
                      const isTrap = x === TRAP.x && y === TRAP.y;
                      const isSelected = x === selectedCell.x && y === selectedCell.y;
                      const highlighted = isHighlighted(x, y);
                      const v = values[`${x},${y}`];

                      return (
                        <div
                          key={`${x},${y}`}
                          onClick={() => setSelectedCell({ x, y })}
                          className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer
                                      transition-all duration-200 border-2
                                      ${isSelected ? 'border-yellow-400 scale-105' :
                                        highlighted ? 'border-blue-400' : 'border-transparent'}
                                      ${isGoal ? 'bg-green-600' : isTrap ? 'bg-red-600' : ''}`}
                          style={{ backgroundColor: isGoal || isTrap ? undefined : getValueColor(v) }}
                        >
                          {isGoal && <span className="text-xl">🎯</span>}
                          {isTrap && <span className="text-xl">💀</span>}
                          <span className={`font-mono text-sm font-bold ${Math.abs(v) < 0.5 ? 'text-slate-300' : 'text-white'}`}>
                            {v.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-400">({x},{y})</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <p className="text-center text-slate-400 text-sm mt-4">Click a cell to see its Bellman breakdown</p>
            </div>

            {/* Legend */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-600 rounded" />
                  <span>Goal (+10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded" />
                  <span>Trap (-10)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: getValueColor(5) }} />
                  <span>Positive V</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: getValueColor(-5) }} />
                  <span>Negative V</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bellman Equation Breakdown */}
          <div className="space-y-6">
            {/* The Bellman Equation */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                The Bellman Equation
              </h3>
              <div className="bg-slate-900 p-4 rounded-lg font-mono text-center">
                <div className="text-lg">
                  V(s) = <span className="text-blue-400">Σ</span><sub>a</sub> π(a|s)
                  <span className="text-green-400">[</span>
                  R(s,a) + <span className="text-purple-400">γ</span>
                  <span className="text-blue-400">Σ</span><sub>s'</sub> P(s'|s,a) V(s')
                  <span className="text-green-400">]</span>
                </div>
                <div className="text-sm text-slate-400 mt-2">
                  Value = Expected immediate reward + discounted future value
                </div>
              </div>
            </div>

            {/* Selected Cell Breakdown */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">
                Breakdown for Cell ({selectedCell.x}, {selectedCell.y})
              </h3>

              {selectedBreakdown.isTerminal ? (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-slate-300">
                    <span className="text-yellow-400">Terminal State</span>
                  </p>
                  <p className="font-mono mt-2">
                    V({selectedCell.x},{selectedCell.y}) = R = {selectedBreakdown.reward}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-slate-400 mb-2">
                    Random policy: π(a|s) = 0.25 for all actions
                  </div>

                  {/* Action breakdown */}
                  <div className="space-y-2">
                    {selectedBreakdown.transitions?.map((t, i) => (
                      <div key={i} className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-blue-400">
                            Action: {t.action} → ({t.next.x}, {t.next.y})
                          </span>
                          <span className="text-sm text-slate-400">π = {t.prob}</span>
                        </div>
                        <div className="font-mono text-sm">
                          <span className="text-green-400">{t.prob}</span> × (
                          <span className="text-yellow-400">{t.r.toFixed(1)}</span> +
                          <span className="text-purple-400">{gamma}</span> ×
                          <span className="text-blue-400">{t.v_next.toFixed(2)}</span>)
                          = <span className="text-white font-bold">
                            {(t.prob * (t.r + gamma * t.v_next)).toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sum */}
                  <div className="p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
                    <div className="text-center">
                      <span className="text-slate-300">Sum of all actions:</span>
                      <div className="text-2xl font-mono font-bold text-purple-400 mt-2">
                        V({selectedCell.x},{selectedCell.y}) = {selectedBreakdown.value?.toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Key Concepts */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3 text-purple-400">Key Insights</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Recursive:</strong> V(s) depends on V(s') of successor states</li>
                <li>• <strong>Expectation:</strong> We average over all possible actions and transitions</li>
                <li>• <strong>Bootstrapping:</strong> We use current V estimates to update V</li>
                <li>• <strong>Convergence:</strong> Repeated updates converge to true values</li>
                <li>• <strong>γ effect:</strong> Lower γ makes agent more "short-sighted"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BellmanExplorer;
