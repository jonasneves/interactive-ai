import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, Layers, ArrowRight, RefreshCw } from 'lucide-react';

const DynamicProgramming = () => {
  const GRID_SIZE = 4;
  const GOAL = { x: 3, y: 0 };
  const TRAP = { x: 1, y: 1 };

  // Algorithm mode
  const [algorithm, setAlgorithm] = useState('value'); // 'value' or 'policy'

  // State for both algorithms
  const [values, setValues] = useState(() => initValues());
  const [policy, setPolicy] = useState(() => initPolicy());
  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [gamma, setGamma] = useState(0.9);
  const [phase, setPhase] = useState('evaluation'); // For policy iteration: 'evaluation' or 'improvement'
  const [evalSteps, setEvalSteps] = useState(0);
  const [converged, setConverged] = useState(false);
  const [history, setHistory] = useState([]);

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
        p[`${x},${y}`] = 'right'; // Initial policy: always go right
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

  // Value Iteration step
  const valueIterationStep = useCallback(() => {
    const newValues = { ...values };
    const newPolicy = { ...policy };
    let maxDelta = 0;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (isTerminal(x, y)) {
          newValues[`${x},${y}`] = getReward(x, y);
          continue;
        }

        let bestValue = -Infinity;
        let bestAction = 'up';

        actions.forEach(action => {
          const next = getNextState(x, y, action);
          const r = getReward(next.x, next.y);
          const v = r + gamma * values[`${next.x},${next.y}`];
          if (v > bestValue) {
            bestValue = v;
            bestAction = action;
          }
        });

        maxDelta = Math.max(maxDelta, Math.abs(bestValue - values[`${x},${y}`]));
        newValues[`${x},${y}`] = bestValue;
        newPolicy[`${x},${y}`] = bestAction;
      }
    }

    setValues(newValues);
    setPolicy(newPolicy);
    setIteration(prev => prev + 1);
    setHistory(prev => [...prev, { iteration: iteration + 1, maxDelta, algorithm: 'VI' }]);

    if (maxDelta < 0.001) {
      setConverged(true);
      setIsRunning(false);
    }
  }, [values, policy, gamma, iteration]);

  // Policy Evaluation step
  const policyEvaluationStep = useCallback(() => {
    const newValues = { ...values };
    let maxDelta = 0;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (isTerminal(x, y)) {
          newValues[`${x},${y}`] = getReward(x, y);
          continue;
        }

        const action = policy[`${x},${y}`];
        const next = getNextState(x, y, action);
        const r = getReward(next.x, next.y);
        const v = r + gamma * values[`${next.x},${next.y}`];

        maxDelta = Math.max(maxDelta, Math.abs(v - values[`${x},${y}`]));
        newValues[`${x},${y}`] = v;
      }
    }

    setValues(newValues);
    setEvalSteps(prev => prev + 1);

    // Switch to improvement after convergence or max steps
    if (maxDelta < 0.001 || evalSteps >= 20) {
      setPhase('improvement');
    }
  }, [values, policy, gamma, evalSteps]);

  // Policy Improvement step
  const policyImprovementStep = useCallback(() => {
    const newPolicy = { ...policy };
    let policyStable = true;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (isTerminal(x, y)) continue;

        const oldAction = policy[`${x},${y}`];
        let bestValue = -Infinity;
        let bestAction = oldAction;

        actions.forEach(action => {
          const next = getNextState(x, y, action);
          const r = getReward(next.x, next.y);
          const v = r + gamma * values[`${next.x},${next.y}`];
          if (v > bestValue) {
            bestValue = v;
            bestAction = action;
          }
        });

        newPolicy[`${x},${y}`] = bestAction;
        if (bestAction !== oldAction) policyStable = false;
      }
    }

    setPolicy(newPolicy);
    setIteration(prev => prev + 1);
    setHistory(prev => [...prev, { iteration: iteration + 1, policyStable, algorithm: 'PI' }]);

    if (policyStable) {
      setConverged(true);
      setIsRunning(false);
    } else {
      setPhase('evaluation');
      setEvalSteps(0);
    }
  }, [values, policy, gamma, iteration]);

  // Main iteration
  const iterate = useCallback(() => {
    if (converged) return;

    if (algorithm === 'value') {
      valueIterationStep();
    } else {
      if (phase === 'evaluation') {
        policyEvaluationStep();
      } else {
        policyImprovementStep();
      }
    }
  }, [algorithm, phase, converged, valueIterationStep, policyEvaluationStep, policyImprovementStep]);

  // Auto-run
  useEffect(() => {
    if (isRunning && !converged) {
      const timer = setTimeout(iterate, algorithm === 'value' ? 300 : (phase === 'evaluation' ? 100 : 500));
      return () => clearTimeout(timer);
    }
  }, [isRunning, converged, iterate, algorithm, phase]);

  const reset = () => {
    setValues(initValues());
    setPolicy(initPolicy());
    setIteration(0);
    setEvalSteps(0);
    setPhase('evaluation');
    setConverged(false);
    setIsRunning(false);
    setHistory([]);
  };

  const getValueColor = (v) => {
    const maxAbs = 12;
    const normalized = Math.max(-1, Math.min(1, v / maxAbs));
    if (normalized > 0) return `rgba(34, 197, 94, ${normalized})`;
    return `rgba(239, 68, 68, ${-normalized})`;
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dynamic Programming Lab</h1>
        <p className="text-slate-400 mb-6">Compare Policy Iteration and Value Iteration algorithms</p>

        {/* Algorithm Selection */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400">Algorithm:</span>
            <button
              onClick={() => { setAlgorithm('value'); reset(); }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                algorithm === 'value' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              Value Iteration
            </button>
            <button
              onClick={() => { setAlgorithm('policy'); reset(); }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                algorithm === 'policy' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              Policy Iteration
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-slate-400">γ:</span>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={gamma}
                onChange={(e) => { setGamma(parseFloat(e.target.value)); reset(); }}
                className="w-24"
              />
              <span className="font-mono w-12">{gamma.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Grid */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  disabled={converged}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50
                             ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isRunning ? 'Pause' : 'Run'}
                </button>
                <button
                  onClick={iterate}
                  disabled={isRunning || converged}
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
                {converged && (
                  <span className="text-green-400 font-medium ml-auto">✓ Converged!</span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4 justify-between">
                <div>
                  <span className="text-slate-400">Iteration:</span>
                  <span className="font-mono font-bold text-blue-400 ml-2">{iteration}</span>
                </div>
                {algorithm === 'policy' && (
                  <div className={`px-3 py-1 rounded-lg ${
                    phase === 'evaluation' ? 'bg-orange-600' : 'bg-green-600'
                  }`}>
                    {phase === 'evaluation' ? `Evaluating (${evalSteps})` : 'Improving'}
                  </div>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Layers size={18} className="text-blue-400" />
                Value Function & Policy
              </h3>
              <div className="flex justify-center">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                  {Array.from({ length: GRID_SIZE }, (_, y) =>
                    Array.from({ length: GRID_SIZE }, (_, x) => {
                      const isGoal = x === GOAL.x && y === GOAL.y;
                      const isTrap = x === TRAP.x && y === TRAP.y;
                      const v = values[`${x},${y}`];
                      const action = policy[`${x},${y}`];

                      return (
                        <div
                          key={`${x},${y}`}
                          className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center relative
                                      ${isGoal ? 'bg-green-600' : isTrap ? 'bg-red-600' : ''}`}
                          style={{ backgroundColor: isGoal || isTrap ? undefined : getValueColor(v) }}
                        >
                          {isGoal && <span className="text-xl">🎯</span>}
                          {isTrap && <span className="text-xl">💀</span>}
                          <span className="font-mono text-sm font-bold">{v.toFixed(1)}</span>
                          {!isGoal && !isTrap && (
                            <span className="text-2xl opacity-80">{actionArrows[action]}</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Algorithm Explanation */}
          <div className="space-y-6">
            {/* Algorithm Description */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                {algorithm === 'value' ? (
                  <><ArrowRight className="text-blue-400" /> Value Iteration</>
                ) : (
                  <><RefreshCw className="text-purple-400" /> Policy Iteration</>
                )}
              </h3>

              {algorithm === 'value' ? (
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-900 p-3 rounded font-mono text-center">
                    V(s) ← max<sub>a</sub> [R(s,a) + γ V(s')]
                  </div>
                  <p className="text-slate-300">
                    Value Iteration combines evaluation and improvement into a single step.
                    For each state, we compute the value of the <strong>best</strong> action.
                  </p>
                  <ul className="text-slate-400 space-y-1">
                    <li>1. Initialize V(s) = 0 for all states</li>
                    <li>2. For each state, update V with max over actions</li>
                    <li>3. Repeat until values converge (Δ &lt; ε)</li>
                    <li>4. Extract policy from final values</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="bg-slate-900 p-3 rounded font-mono text-center text-xs">
                    <div className="text-orange-400">Eval: V(s) ← R + γ V(s') under π</div>
                    <div className="text-green-400 mt-1">Improve: π(s) ← argmax<sub>a</sub> Q(s,a)</div>
                  </div>
                  <p className="text-slate-300">
                    Policy Iteration alternates between two phases:
                  </p>
                  <ul className="text-slate-400 space-y-1">
                    <li><span className="text-orange-400">Evaluation:</span> Compute V for current policy</li>
                    <li><span className="text-green-400">Improvement:</span> Make policy greedy w.r.t. V</li>
                    <li>Repeat until policy stops changing</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Comparison */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Comparison</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={`p-4 rounded-lg border ${algorithm === 'value' ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-blue-400 mb-2">Value Iteration</h4>
                  <ul className="text-slate-400 space-y-1">
                    <li>• Simpler to implement</li>
                    <li>• More iterations needed</li>
                    <li>• Each iteration is fast</li>
                    <li>• Good for smaller spaces</li>
                  </ul>
                </div>
                <div className={`p-4 rounded-lg border ${algorithm === 'policy' ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-purple-400 mb-2">Policy Iteration</h4>
                  <ul className="text-slate-400 space-y-1">
                    <li>• Fewer policy updates</li>
                    <li>• Evaluation can be costly</li>
                    <li>• Guaranteed improvement</li>
                    <li>• Often faster overall</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Iteration History</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {history.length === 0 ? (
                  <p className="text-slate-500 text-sm">Click Run or Step to begin</p>
                ) : (
                  history.slice(-10).map((h, i) => (
                    <div key={i} className="text-xs p-2 bg-slate-700/50 rounded flex justify-between">
                      <span>Iter {h.iteration}</span>
                      {h.maxDelta !== undefined && (
                        <span className="text-blue-400">Δ={h.maxDelta.toFixed(4)}</span>
                      )}
                      {h.policyStable !== undefined && (
                        <span className={h.policyStable ? 'text-green-400' : 'text-yellow-400'}>
                          {h.policyStable ? 'Stable' : 'Changed'}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Key Insight */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/30">
              <h3 className="font-semibold mb-2 text-blue-300">💡 Key Insight</h3>
              <p className="text-sm text-slate-300">
                Both algorithms are guaranteed to find the <strong>optimal policy</strong> for finite MDPs.
                They exploit the <strong>Bellman optimality equation</strong> which states that
                the optimal value equals the best immediate reward plus discounted optimal future value.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicProgramming;
