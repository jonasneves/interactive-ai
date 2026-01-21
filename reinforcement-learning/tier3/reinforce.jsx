import React, { useState, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, Layers, BookOpen } from 'lucide-react';

const REINFORCE = () => {
  const GRID_SIZE = 4;
  const GOAL = { x: 3, y: 0 };
  const START = { x: 0, y: 3 };

  // Policy network (simplified: just a lookup table with softmax)
  const [policy, setPolicy] = useState(() => initPolicy());
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('collect'); // 'collect', 'compute', 'update'
  const [currentEpisode, setCurrentEpisode] = useState([]);
  const [returns, setReturns] = useState([]);
  const [gradients, setGradients] = useState([]);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [totalReturns, setTotalReturns] = useState([]);
  const [alpha, setAlpha] = useState(0.1);
  const [gamma, setGamma] = useState(0.99);
  const [stepInPhase, setStepInPhase] = useState(0);
  const [highlightedStep, setHighlightedStep] = useState(null);

  const actions = ['up', 'down', 'left', 'right'];
  const actionArrows = { up: '↑', down: '↓', left: '←', right: '→' };

  function initPolicy() {
    const p = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Initialize with slight bias toward goal (up-right)
        p[`${x},${y}`] = [0.25, 0.25, 0.25, 0.25]; // [up, down, left, right]
      }
    }
    return p;
  }

  const softmax = (logits) => {
    const max = Math.max(...logits);
    const exp = logits.map(l => Math.exp(l - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(e => e / sum);
  };

  const isValid = (x, y) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
  const isGoal = (x, y) => x === GOAL.x && y === GOAL.y;

  const getNextState = (x, y, action) => {
    const moves = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = moves[action];
    const nx = x + dx, ny = y + dy;
    return isValid(nx, ny) ? { x: nx, y: ny } : { x, y };
  };

  const getReward = (x, y) => {
    if (isGoal(x, y)) return 10;
    return -0.1;
  };

  // Sample action from policy
  const sampleAction = useCallback((x, y) => {
    const probs = policy[`${x},${y}`];
    const r = Math.random();
    let cumsum = 0;
    for (let i = 0; i < 4; i++) {
      cumsum += probs[i];
      if (r < cumsum) return { action: actions[i], idx: i, prob: probs[i] };
    }
    return { action: actions[3], idx: 3, prob: probs[3] };
  }, [policy]);

  // Collect episode
  const collectEpisode = useCallback(() => {
    const episode = [];
    let x = START.x, y = START.y;
    let steps = 0;
    const maxSteps = 50;

    while (!isGoal(x, y) && steps < maxSteps) {
      const { action, idx, prob } = sampleAction(x, y);
      const next = getNextState(x, y, action);
      const reward = getReward(next.x, next.y);

      episode.push({
        state: { x, y },
        actionIdx: idx,
        action,
        prob,
        reward,
        nextState: next
      });

      x = next.x;
      y = next.y;
      steps++;
    }

    return episode;
  }, [sampleAction]);

  // Compute returns for each step
  const computeReturns = useCallback((episode) => {
    const G = new Array(episode.length).fill(0);
    let runningReturn = 0;

    for (let t = episode.length - 1; t >= 0; t--) {
      runningReturn = episode[t].reward + gamma * runningReturn;
      G[t] = runningReturn;
    }

    return G;
  }, [gamma]);

  // Compute gradients
  const computeGradients = useCallback((episode, G) => {
    return episode.map((step, t) => {
      const probs = policy[`${step.state.x},${step.state.y}`];
      // ∇log π = (1 if action taken, else 0) - π(a|s)
      const grad = probs.map((p, i) => {
        const indicator = i === step.actionIdx ? 1 : 0;
        return (indicator - p) * G[t];
      });
      return {
        state: step.state,
        action: step.action,
        G: G[t],
        grad,
        probs: [...probs]
      };
    });
  }, [policy]);

  // Apply gradients to update policy
  const applyGradients = useCallback((grads) => {
    const newPolicy = { ...policy };

    grads.forEach(({ state, grad }) => {
      const key = `${state.x},${state.y}`;
      // Update logits (we store probs, so convert back)
      const oldProbs = newPolicy[key];
      const logits = oldProbs.map(p => Math.log(Math.max(0.01, p)));
      const newLogits = logits.map((l, i) => l + alpha * grad[i]);
      newPolicy[key] = softmax(newLogits);
    });

    setPolicy(newPolicy);
  }, [policy, alpha]);

  // Step through REINFORCE algorithm
  const algorithmStep = useCallback(() => {
    if (phase === 'collect') {
      const episode = collectEpisode();
      setCurrentEpisode(episode);
      setPhase('compute');
      setStepInPhase(0);
    } else if (phase === 'compute') {
      const G = computeReturns(currentEpisode);
      setReturns(G);
      const grads = computeGradients(currentEpisode, G);
      setGradients(grads);
      setPhase('update');
      setStepInPhase(0);
    } else if (phase === 'update') {
      applyGradients(gradients);
      const episodeReturn = returns[0] || 0;
      setTotalReturns(prev => [...prev, episodeReturn]);
      setEpisodeCount(prev => prev + 1);
      setPhase('collect');
      setCurrentEpisode([]);
      setReturns([]);
      setGradients([]);
    }
  }, [phase, currentEpisode, returns, gradients, collectEpisode, computeReturns, computeGradients, applyGradients]);

  // Auto-run
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(algorithmStep, 500);
      return () => clearTimeout(timer);
    }
  }, [isRunning, algorithmStep]);

  const reset = () => {
    setPolicy(initPolicy());
    setPhase('collect');
    setCurrentEpisode([]);
    setReturns([]);
    setGradients([]);
    setEpisodeCount(0);
    setTotalReturns([]);
    setIsRunning(false);
    setHighlightedStep(null);
  };

  const getGreedyAction = (x, y) => {
    const probs = policy[`${x},${y}`];
    let maxIdx = 0;
    for (let i = 1; i < 4; i++) {
      if (probs[i] > probs[maxIdx]) maxIdx = i;
    }
    return actions[maxIdx];
  };

  const avgReturn = totalReturns.slice(-10).reduce((a, b) => a + b, 0) /
    Math.max(1, totalReturns.slice(-10).length);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">REINFORCE Step-by-Step</h1>
        <p className="text-slate-400 mb-6">Walk through the complete REINFORCE algorithm one phase at a time</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Grid and Trajectory */}
          <div className="space-y-6">
            {/* Algorithm Phase Indicator */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Algorithm Phase</h3>
                <span className="text-sm text-slate-400">Episode {episodeCount}</span>
              </div>
              <div className="flex items-center gap-2">
                {['collect', 'compute', 'update'].map((p, i) => (
                  <React.Fragment key={p}>
                    <div className={`flex-1 p-3 rounded-lg text-center text-sm transition-all ${
                      phase === p ? 'bg-blue-600 scale-105' : 'bg-slate-700'
                    }`}>
                      <div className="font-medium capitalize">{p}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {p === 'collect' && 'Run episode'}
                        {p === 'compute' && 'Calculate G, ∇'}
                        {p === 'update' && 'θ ← θ + α∇'}
                      </div>
                    </div>
                    {i < 2 && <ChevronRight size={16} className="text-slate-500" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

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
                  {isRunning ? 'Pause' : 'Auto Run'}
                </button>
                <button
                  onClick={algorithmStep}
                  disabled={isRunning}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  Next Phase
                </button>
                <button onClick={reset} className="px-4 py-2 bg-slate-700 rounded-lg">
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">α:</span>
                  <input type="range" min="0.01" max="0.3" step="0.01" value={alpha}
                    onChange={(e) => setAlpha(parseFloat(e.target.value))} className="flex-1" />
                  <span className="font-mono w-10">{alpha.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">γ:</span>
                  <input type="range" min="0.9" max="0.999" step="0.001" value={gamma}
                    onChange={(e) => setGamma(parseFloat(e.target.value))} className="flex-1" />
                  <span className="font-mono w-12">{gamma.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Layers size={18} className="text-blue-400" />
                Current Policy π(a|s)
              </h3>
              <div className="flex justify-center">
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                  {Array.from({ length: GRID_SIZE }, (_, y) =>
                    Array.from({ length: GRID_SIZE }, (_, x) => {
                      const goal = isGoal(x, y);
                      const start = x === START.x && y === START.y;
                      const inEpisode = currentEpisode.some(s => s.state.x === x && s.state.y === y);
                      const highlighted = highlightedStep?.state.x === x && highlightedStep?.state.y === y;
                      const probs = policy[`${x},${y}`];
                      const greedyAction = getGreedyAction(x, y);

                      return (
                        <div
                          key={`${x},${y}`}
                          className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center
                                      ${goal ? 'bg-green-600' : start ? 'bg-blue-900' : 'bg-slate-700'}
                                      ${inEpisode ? 'ring-2 ring-yellow-400' : ''}
                                      ${highlighted ? 'ring-2 ring-purple-400 scale-105' : ''}`}
                        >
                          {goal && <span className="text-xl">🎯</span>}
                          {start && !goal && <span className="text-xs text-slate-400">START</span>}
                          {!goal && (
                            <>
                              <span className="text-2xl">{actionArrows[greedyAction]}</span>
                              <span className="text-xs text-slate-400">
                                {(Math.max(...probs) * 100).toFixed(0)}%
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Returns History */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Episode Returns</h3>
                <span className="text-sm text-slate-400">Avg: {avgReturn.toFixed(1)}</span>
              </div>
              <div className="h-16 flex items-end gap-px">
                {totalReturns.slice(-40).map((r, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${r >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ height: `${Math.max(5, (r + 5) / 15 * 100)}%`, opacity: 0.7 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Step-by-step breakdown */}
          <div className="space-y-6">
            {/* Current Episode / Gradients */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-yellow-400" />
                {phase === 'collect' && 'Episode Trajectory'}
                {phase === 'compute' && 'Returns & Gradients'}
                {phase === 'update' && 'Policy Update'}
              </h3>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {phase === 'collect' && currentEpisode.length === 0 && (
                  <p className="text-slate-500 text-sm">Click "Next Phase" to collect an episode</p>
                )}

                {currentEpisode.map((step, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg cursor-pointer transition-all text-sm
                               ${highlightedStep === gradients[i] ? 'bg-purple-900/50 border border-purple-500' : 'bg-slate-700/50'}`}
                    onClick={() => setHighlightedStep(gradients[i] || null)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 w-8">t={i}</span>
                      <span className="font-mono">s=({step.state.x},{step.state.y})</span>
                      <span className="text-blue-400">{actionArrows[step.action]}</span>
                      <span className="text-slate-400">π={step.prob.toFixed(2)}</span>
                      <span className={`ml-auto ${step.reward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        R={step.reward.toFixed(1)}
                      </span>
                    </div>

                    {phase !== 'collect' && returns[i] !== undefined && (
                      <div className="mt-2 pt-2 border-t border-slate-600 flex gap-4">
                        <span className="text-yellow-400">G={returns[i].toFixed(2)}</span>
                        {gradients[i] && (
                          <span className="text-purple-400 text-xs">
                            ∇=[{gradients[i].grad.map(g => g.toFixed(2)).join(', ')}]
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* REINFORCE Algorithm */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">REINFORCE Algorithm</h3>
              <div className="space-y-3 text-sm font-mono">
                <div className={`p-2 rounded ${phase === 'collect' ? 'bg-blue-900/50 border-l-4 border-blue-500' : 'text-slate-500'}`}>
                  1. Collect episode τ = (s₀,a₀,r₁,...) using π
                </div>
                <div className={`p-2 rounded ${phase === 'compute' ? 'bg-blue-900/50 border-l-4 border-blue-500' : 'text-slate-500'}`}>
                  2. For each t: G_t ← Σγᵏr_{t+k+1}
                </div>
                <div className={`p-2 rounded ${phase === 'compute' ? 'bg-blue-900/50 border-l-4 border-blue-500' : 'text-slate-500'}`}>
                  3. For each t: ∇ ← ∇log π(aₜ|sₜ) · Gₜ
                </div>
                <div className={`p-2 rounded ${phase === 'update' ? 'bg-blue-900/50 border-l-4 border-blue-500' : 'text-slate-500'}`}>
                  4. θ ← θ + α · ∇
                </div>
              </div>
            </div>

            {/* Key Points */}
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-500/30">
              <h3 className="font-semibold mb-3 text-yellow-300">💡 REINFORCE Properties</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Monte Carlo:</strong> Uses complete episode returns</li>
                <li>• <strong>High variance:</strong> G can vary wildly between episodes</li>
                <li>• <strong>Unbiased:</strong> Gradient estimate is correct on average</li>
                <li>• <strong>On-policy:</strong> Must use samples from current π</li>
                <li>• <strong>Simple:</strong> No value function needed (but can add baseline)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default REINFORCE;
