import React, { useState, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Users, TrendingUp, Zap } from 'lucide-react';

const ActorCritic = () => {
  const GRID_SIZE = 4;
  const GOAL = { x: 3, y: 0 };
  const START = { x: 0, y: 3 };

  // Actor (policy) and Critic (value function)
  const [actor, setActor] = useState(() => initActor());
  const [critic, setCritic] = useState(() => initCritic());
  const [position, setPosition] = useState({ ...START });
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [episodeReturns, setEpisodeReturns] = useState([]);
  const [episodeReturn, setEpisodeReturn] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [alphaActor, setAlphaActor] = useState(0.1);
  const [alphaCritic, setAlphaCritic] = useState(0.2);
  const [gamma, setGamma] = useState(0.99);
  const [speed, setSpeed] = useState(200);

  const actions = ['up', 'down', 'left', 'right'];
  const actionArrows = { up: '↑', down: '↓', left: '←', right: '→' };

  function initActor() {
    const a = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        a[`${x},${y}`] = [0.25, 0.25, 0.25, 0.25];
      }
    }
    return a;
  }

  function initCritic() {
    const c = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        c[`${x},${y}`] = 0;
      }
    }
    return c;
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

  const getReward = (x, y) => isGoal(x, y) ? 10 : -0.1;

  const sampleAction = useCallback((x, y) => {
    const probs = actor[`${x},${y}`];
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < 4; i++) {
      sum += probs[i];
      if (r < sum) return { action: actions[i], idx: i, prob: probs[i] };
    }
    return { action: actions[3], idx: 3, prob: probs[3] };
  }, [actor]);

  // One-step Actor-Critic update
  const step = useCallback(() => {
    const { x, y } = position;

    // Check if at goal - start new episode
    if (isGoal(x, y)) {
      setEpisodeReturns(prev => [...prev, episodeReturn]);
      setPosition({ ...START });
      setEpisodeCount(prev => prev + 1);
      setEpisodeReturn(0);
      return;
    }

    // Sample action from actor
    const { action, idx, prob } = sampleAction(x, y);
    const next = getNextState(x, y, action);
    const reward = getReward(next.x, next.y);

    // Compute TD error (critic's job)
    const V_s = critic[`${x},${y}`];
    const V_s_next = isGoal(next.x, next.y) ? 0 : critic[`${next.x},${next.y}`];
    const tdTarget = reward + gamma * V_s_next;
    const tdError = tdTarget - V_s; // This is the advantage estimate!

    // Update Critic: V(s) ← V(s) + α_c * δ
    const newCritic = { ...critic };
    newCritic[`${x},${y}`] = V_s + alphaCritic * tdError;
    setCritic(newCritic);

    // Update Actor: θ ← θ + α_a * δ * ∇log π(a|s)
    const newActor = { ...actor };
    const oldProbs = actor[`${x},${y}`];
    const logits = oldProbs.map(p => Math.log(Math.max(0.01, p)));
    const grad = oldProbs.map((p, i) => (i === idx ? 1 - p : -p));
    const newLogits = logits.map((l, i) => l + alphaActor * tdError * grad[i]);
    newActor[`${x},${y}`] = softmax(newLogits);
    setActor(newActor);

    // Record update for visualization
    setLastUpdate({
      state: { x, y },
      action,
      actionIdx: idx,
      reward,
      nextState: next,
      V_s,
      V_s_next,
      tdTarget,
      tdError,
      oldProbs: [...oldProbs],
      newProbs: [...newActor[`${x},${y}`]]
    });

    // Move to next state
    setPosition(next);
    setStepCount(prev => prev + 1);
    setEpisodeReturn(prev => prev + reward);
  }, [position, actor, critic, alphaActor, alphaCritic, gamma, sampleAction, episodeReturn]);

  // Auto-run
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(step, speed);
      return () => clearTimeout(timer);
    }
  }, [isRunning, step, speed]);

  const reset = () => {
    setActor(initActor());
    setCritic(initCritic());
    setPosition({ ...START });
    setStepCount(0);
    setEpisodeCount(0);
    setEpisodeReturns([]);
    setEpisodeReturn(0);
    setLastUpdate(null);
    setIsRunning(false);
  };

  const getGreedyAction = (x, y) => {
    const probs = actor[`${x},${y}`];
    let maxIdx = 0;
    for (let i = 1; i < 4; i++) {
      if (probs[i] > probs[maxIdx]) maxIdx = i;
    }
    return actions[maxIdx];
  };

  const getValueColor = (v) => {
    const maxAbs = 10;
    const normalized = Math.max(-1, Math.min(1, v / maxAbs));
    if (normalized > 0) return `rgba(34, 197, 94, ${Math.max(0.1, normalized)})`;
    if (normalized < 0) return `rgba(239, 68, 68, ${Math.max(0.1, -normalized)})`;
    return 'rgba(71, 85, 105, 0.3)';
  };

  const avgReturn = episodeReturns.slice(-10).reduce((a, b) => a + b, 0) /
    Math.max(1, episodeReturns.slice(-10).length);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Actor-Critic Architecture</h1>
        <p className="text-slate-400 mb-6">Combine policy gradients (Actor) with value estimation (Critic)</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Grids */}
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
                  {isRunning ? 'Pause' : 'Run'}
                </button>
                <button
                  onClick={step}
                  disabled={isRunning}
                  className="px-4 py-2 bg-blue-600 rounded-lg disabled:opacity-50"
                >
                  Step
                </button>
                <button onClick={reset} className="px-4 py-2 bg-slate-700 rounded-lg">
                  <RotateCcw size={16} />
                </button>
                <div className="ml-auto flex gap-4 text-sm">
                  <span><span className="text-slate-400">Steps:</span> <span className="font-mono text-blue-400">{stepCount}</span></span>
                  <span><span className="text-slate-400">Episodes:</span> <span className="font-mono text-green-400">{episodeCount}</span></span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">α_a:</span>
                  <input type="range" min="0.01" max="0.3" step="0.01" value={alphaActor}
                    onChange={(e) => setAlphaActor(parseFloat(e.target.value))} className="flex-1" />
                  <span className="font-mono w-10">{alphaActor.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">α_c:</span>
                  <input type="range" min="0.01" max="0.5" step="0.01" value={alphaCritic}
                    onChange={(e) => setAlphaCritic(parseFloat(e.target.value))} className="flex-1" />
                  <span className="font-mono w-10">{alphaCritic.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Speed:</span>
                  <input type="range" min="50" max="500" step="50" value={550 - speed}
                    onChange={(e) => setSpeed(550 - parseInt(e.target.value))} className="flex-1" />
                </div>
              </div>
            </div>

            {/* Side by side: Actor and Critic */}
            <div className="grid grid-cols-2 gap-4">
              {/* Actor */}
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-400">
                  <Users size={16} /> Actor π(a|s)
                </h3>
                <div className="flex justify-center">
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                    {Array.from({ length: GRID_SIZE }, (_, y) =>
                      Array.from({ length: GRID_SIZE }, (_, x) => {
                        const goal = isGoal(x, y);
                        const isAgent = position.x === x && position.y === y;
                        const probs = actor[`${x},${y}`];
                        const greedyAction = getGreedyAction(x, y);

                        return (
                          <div
                            key={`a-${x},${y}`}
                            className={`w-12 h-12 rounded flex flex-col items-center justify-center
                                        ${goal ? 'bg-green-600' : 'bg-slate-700'}
                                        ${isAgent ? 'ring-2 ring-yellow-400' : ''}`}
                          >
                            {isAgent && <span className="text-sm">🤖</span>}
                            {goal && !isAgent && <span className="text-sm">🎯</span>}
                            {!goal && !isAgent && (
                              <>
                                <span className="text-lg">{actionArrows[greedyAction]}</span>
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

              {/* Critic */}
              <div className="bg-slate-800 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-400">
                  <TrendingUp size={16} /> Critic V(s)
                </h3>
                <div className="flex justify-center">
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                    {Array.from({ length: GRID_SIZE }, (_, y) =>
                      Array.from({ length: GRID_SIZE }, (_, x) => {
                        const goal = isGoal(x, y);
                        const isAgent = position.x === x && position.y === y;
                        const v = critic[`${x},${y}`];

                        return (
                          <div
                            key={`c-${x},${y}`}
                            className={`w-12 h-12 rounded flex items-center justify-center
                                        ${isAgent ? 'ring-2 ring-yellow-400' : ''}`}
                            style={{ backgroundColor: goal ? '#22c55e' : getValueColor(v) }}
                          >
                            {goal ? (
                              <span className="text-sm">🎯</span>
                            ) : (
                              <span className="font-mono text-xs">{v.toFixed(1)}</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Returns */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Episode Returns</h3>
                <span className="text-sm text-slate-400">Avg: {avgReturn.toFixed(1)}</span>
              </div>
              <div className="h-16 flex items-end gap-px">
                {episodeReturns.slice(-50).map((r, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${r >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ height: `${Math.max(5, (r + 5) / 15 * 100)}%`, opacity: 0.7 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Update breakdown */}
          <div className="space-y-6">
            {/* Architecture Diagram */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Actor-Critic Architecture</h3>
              <svg viewBox="0 0 400 180" className="w-full">
                {/* Environment */}
                <rect x="150" y="10" width="100" height="40" rx="8" fill="#22c55e" />
                <text x="200" y="35" textAnchor="middle" fill="white" fontSize="12">Environment</text>

                {/* Actor */}
                <rect x="30" y="100" width="100" height="60" rx="8" fill="#3b82f6" />
                <text x="80" y="125" textAnchor="middle" fill="white" fontSize="12">Actor</text>
                <text x="80" y="145" textAnchor="middle" fill="white" fontSize="10">π(a|s; θ)</text>

                {/* Critic */}
                <rect x="270" y="100" width="100" height="60" rx="8" fill="#22c55e" />
                <text x="320" y="125" textAnchor="middle" fill="white" fontSize="12">Critic</text>
                <text x="320" y="145" textAnchor="middle" fill="white" fontSize="10">V(s; w)</text>

                {/* Arrows */}
                <path d="M200 50 L200 70 L80 70 L80 100" stroke="#f59e0b" strokeWidth="2" fill="none" markerEnd="url(#arr)" />
                <text x="120" y="65" fill="#f59e0b" fontSize="10">s, r</text>

                <path d="M200 50 L200 70 L320 70 L320 100" stroke="#f59e0b" strokeWidth="2" fill="none" markerEnd="url(#arr)" />
                <text x="280" y="65" fill="#f59e0b" fontSize="10">s, r</text>

                <path d="M80 100 L80 70 L200 70 L200 50" stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arr)" />
                <text x="160" y="85" fill="#3b82f6" fontSize="10">action</text>

                {/* TD Error arrow */}
                <path d="M270 130 L130 130" stroke="#ef4444" strokeWidth="2" fill="none" markerEnd="url(#arr)" strokeDasharray="4" />
                <text x="200" y="125" textAnchor="middle" fill="#ef4444" fontSize="10">δ (TD error)</text>

                <defs>
                  <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Last Update */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                Last Update
              </h3>

              {!lastUpdate ? (
                <p className="text-slate-500 text-sm">Take a step to see the update breakdown</p>
              ) : (
                <div className="space-y-4 text-sm">
                  {/* State transition */}
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">s=({lastUpdate.state.x},{lastUpdate.state.y})</span>
                      <span className="text-blue-400">{actionArrows[lastUpdate.action]}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-mono">s'=({lastUpdate.nextState.x},{lastUpdate.nextState.y})</span>
                      <span className={`ml-auto ${lastUpdate.reward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        R={lastUpdate.reward.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Critic update */}
                  <div className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                    <div className="font-medium text-green-400 mb-2">Critic Update</div>
                    <div className="font-mono text-xs space-y-1">
                      <div>V(s) = {lastUpdate.V_s.toFixed(3)}</div>
                      <div>V(s') = {lastUpdate.V_s_next.toFixed(3)}</div>
                      <div className="text-yellow-400">δ = r + γV(s') - V(s) = {lastUpdate.tdError.toFixed(3)}</div>
                      <div className="text-green-400">V(s) ← V(s) + α_c·δ</div>
                    </div>
                  </div>

                  {/* Actor update */}
                  <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                    <div className="font-medium text-blue-400 mb-2">Actor Update</div>
                    <div className="font-mono text-xs space-y-1">
                      <div>π(·|s) = [{lastUpdate.oldProbs.map(p => p.toFixed(2)).join(', ')}]</div>
                      <div className="text-purple-400">∇log π = δ · (𝟙 - π)</div>
                      <div className="text-blue-400">θ ← θ + α_a · δ · ∇log π</div>
                      <div>π'(·|s) = [{lastUpdate.newProbs.map(p => p.toFixed(2)).join(', ')}]</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Key Benefits */}
            <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 rounded-xl p-6 border border-blue-500/30">
              <h3 className="font-semibold mb-3 text-blue-300">💡 Why Actor-Critic?</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Lower variance:</strong> Uses V(s) instead of full returns G</li>
                <li>• <strong>Online learning:</strong> Updates every step, not just episode end</li>
                <li>• <strong>Bias-variance tradeoff:</strong> Critic adds bias but reduces variance</li>
                <li>• <strong>TD error as advantage:</strong> δ ≈ A(s,a) estimates how good action was</li>
                <li>• <strong>Continuous actions:</strong> Naturally extends to continuous control</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorCritic;
