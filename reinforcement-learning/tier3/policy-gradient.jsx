import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, TrendingUp, Zap, ArrowUp, ArrowDown } from 'lucide-react';

const PolicyGradient = () => {
  // Simple 1D environment: move left or right to reach goal
  const WORLD_SIZE = 7;
  const GOAL = 6; // Right side
  const START = 3; // Center

  // Policy parameters (logits for softmax)
  const [theta, setTheta] = useState(() => initTheta());
  const [position, setPosition] = useState(START);
  const [isRunning, setIsRunning] = useState(false);
  const [episodeCount, setEpisodeCount] = useState(0);
  const [currentTrajectory, setCurrentTrajectory] = useState([]);
  const [learningRate, setLearningRate] = useState(0.1);
  const [episodeReturns, setEpisodeReturns] = useState([]);
  const [gradientHistory, setGradientHistory] = useState([]);
  const [showMath, setShowMath] = useState(true);

  function initTheta() {
    // Initialize policy parameters for each state
    // theta[state] = [logit_left, logit_right]
    const t = {};
    for (let s = 0; s < WORLD_SIZE; s++) {
      t[s] = [0, 0]; // Start with uniform policy
    }
    return t;
  }

  // Softmax to get probabilities
  const softmax = (logits) => {
    const maxLogit = Math.max(...logits);
    const exp = logits.map(l => Math.exp(l - maxLogit));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(e => e / sum);
  };

  // Get action probabilities for a state
  const getProbs = useCallback((state) => {
    return softmax(theta[state] || [0, 0]);
  }, [theta]);

  // Sample action from policy
  const sampleAction = useCallback((state) => {
    const probs = getProbs(state);
    return Math.random() < probs[0] ? 'left' : 'right';
  }, [getProbs]);

  // Take a step in the environment
  const step = useCallback((state, action) => {
    const newState = action === 'left'
      ? Math.max(0, state - 1)
      : Math.min(WORLD_SIZE - 1, state + 1);
    const reward = newState === GOAL ? 10 : -0.1;
    const done = newState === GOAL || newState === 0;
    return { newState, reward, done };
  }, []);

  // Run one episode and collect trajectory
  const runEpisode = useCallback(() => {
    const trajectory = [];
    let state = START;
    let totalReturn = 0;
    let steps = 0;
    const maxSteps = 50;

    while (steps < maxSteps) {
      const action = sampleAction(state);
      const probs = getProbs(state);
      const { newState, reward, done } = step(state, action);

      trajectory.push({
        state,
        action,
        reward,
        probs: [...probs],
        actionIdx: action === 'left' ? 0 : 1
      });

      totalReturn += reward;
      state = newState;
      steps++;

      if (done) break;
    }

    return { trajectory, totalReturn };
  }, [sampleAction, getProbs, step]);

  // Compute policy gradient and update
  const updatePolicy = useCallback((trajectory, totalReturn) => {
    const newTheta = { ...theta };
    const gradients = [];

    // REINFORCE: ∇log π(a|s) * G
    trajectory.forEach(({ state, actionIdx, probs }, t) => {
      // Compute return from this timestep
      let G = 0;
      for (let i = t; i < trajectory.length; i++) {
        G += trajectory[i].reward;
      }

      // Gradient of log softmax: ∂log π(a|s)/∂θ = 1(a) - π(a|s)
      // For chosen action: 1 - π(a), for others: -π(a)
      const grad = probs.map((p, i) => (i === actionIdx ? 1 - p : -p) * G);

      // Update parameters
      newTheta[state] = newTheta[state].map((t, i) => t + learningRate * grad[i]);

      gradients.push({ state, grad, G });
    });

    setTheta(newTheta);
    setGradientHistory(prev => [...prev.slice(-20), { gradients, totalReturn }]);
  }, [theta, learningRate]);

  // Single training step
  const trainStep = useCallback(() => {
    const { trajectory, totalReturn } = runEpisode();
    setCurrentTrajectory(trajectory);
    updatePolicy(trajectory, totalReturn);
    setEpisodeReturns(prev => [...prev, totalReturn]);
    setEpisodeCount(prev => prev + 1);
  }, [runEpisode, updatePolicy]);

  // Auto-run
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(trainStep, 300);
      return () => clearTimeout(timer);
    }
  }, [isRunning, trainStep]);

  const reset = () => {
    setTheta(initTheta());
    setPosition(START);
    setCurrentTrajectory([]);
    setEpisodeReturns([]);
    setGradientHistory([]);
    setEpisodeCount(0);
    setIsRunning(false);
  };

  // Visualization of policy at each state
  const policyViz = useMemo(() => {
    return Array.from({ length: WORLD_SIZE }, (_, s) => {
      const probs = getProbs(s);
      return { state: s, leftProb: probs[0], rightProb: probs[1] };
    });
  }, [getProbs]);

  // Average return (last 10)
  const avgReturn = episodeReturns.slice(-10).reduce((a, b) => a + b, 0) /
    Math.max(1, episodeReturns.slice(-10).length);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Policy Gradient Intuition</h1>
        <p className="text-slate-400 mb-6">Understand how policies are optimized directly through gradient ascent</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Environment and Policy */}
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
                  {isRunning ? 'Pause' : 'Train'}
                </button>
                <button
                  onClick={trainStep}
                  disabled={isRunning}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  Step
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Reset
                </button>
                <div className="ml-auto text-sm">
                  <span className="text-slate-400">Episodes:</span>
                  <span className="font-mono font-bold text-green-400 ml-2">{episodeCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">Learning Rate α:</span>
                <input
                  type="range" min="0.01" max="0.5" step="0.01"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="font-mono w-12">{learningRate.toFixed(2)}</span>
              </div>
            </div>

            {/* Environment Visualization */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Environment & Policy</h3>
              <div className="flex justify-center gap-1 mb-4">
                {policyViz.map(({ state, leftProb, rightProb }) => {
                  const isGoal = state === GOAL;
                  const isTrap = state === 0;
                  const wasVisited = currentTrajectory.some(t => t.state === state);

                  return (
                    <div
                      key={state}
                      className={`w-16 h-24 rounded-lg flex flex-col items-center justify-between p-2
                                  ${isGoal ? 'bg-green-600' : isTrap ? 'bg-red-600' : 'bg-slate-700'}
                                  ${wasVisited ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      {/* State label */}
                      <span className="text-xs text-slate-400">s={state}</span>

                      {/* Goal/trap indicator */}
                      {isGoal && <span className="text-xl">🎯</span>}
                      {isTrap && <span className="text-xl">💀</span>}

                      {/* Policy arrows */}
                      {!isGoal && !isTrap && (
                        <div className="flex items-center gap-1 text-xs">
                          <div className="flex flex-col items-center">
                            <span className="text-blue-400">←</span>
                            <span className="font-mono">{(leftProb * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-green-400">→</span>
                            <span className="font-mono">{(rightProb * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-slate-400 text-sm">
                Start at center (s=3). Goal is right (s=6), trap is left (s=0).
              </p>
            </div>

            {/* Return History */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Episode Returns</h3>
                <span className="text-sm">
                  <span className="text-slate-400">Avg (last 10):</span>
                  <span className={`font-mono ml-2 ${avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {avgReturn.toFixed(1)}
                  </span>
                </span>
              </div>
              <div className="h-20 flex items-end gap-px">
                {episodeReturns.slice(-50).map((r, i) => {
                  const normalized = Math.max(0, Math.min(100, (r + 5) / 15 * 100));
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${r >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ height: `${normalized}%`, opacity: 0.7 }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Math and Explanation */}
          <div className="space-y-6">
            {/* Policy Gradient Formula */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                The Policy Gradient Theorem
              </h3>

              <div className="bg-slate-900 p-4 rounded-lg font-mono text-center mb-4">
                <div className="text-lg">
                  ∇<sub>θ</sub>J(θ) = 𝔼<sub>π</sub>[∇<sub>θ</sub> log π(a|s; θ) · G<sub>t</sub>]
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-300">
                <p><strong className="text-blue-400">∇<sub>θ</sub>J(θ)</strong>: Gradient of expected return w.r.t. policy parameters</p>
                <p><strong className="text-green-400">log π(a|s; θ)</strong>: Log probability of taking action a in state s</p>
                <p><strong className="text-yellow-400">G<sub>t</sub></strong>: Return from timestep t (sum of future rewards)</p>
              </div>

              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-slate-300">
                  <strong>Intuition:</strong> Increase probability of actions that led to high returns,
                  decrease probability of actions that led to low returns.
                </p>
              </div>
            </div>

            {/* Current Trajectory */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Last Trajectory</h3>
              {currentTrajectory.length === 0 ? (
                <p className="text-slate-500 text-sm">Run an episode to see trajectory</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {currentTrajectory.map((t, i) => (
                    <div key={i} className="text-xs p-2 bg-slate-700/50 rounded flex items-center gap-2">
                      <span className="text-slate-400 w-8">t={i}</span>
                      <span className="font-mono">s={t.state}</span>
                      <span className={t.action === 'right' ? 'text-green-400' : 'text-blue-400'}>
                        {t.action === 'right' ? '→' : '←'}
                      </span>
                      <span className="text-slate-400">
                        π={t.probs[t.actionIdx].toFixed(2)}
                      </span>
                      <span className={`ml-auto ${t.reward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        R={t.reward.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
              <h3 className="font-semibold mb-3 text-purple-300">💡 Key Insights</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Direct optimization:</strong> No need to learn value function first</li>
                <li>• <strong>Stochastic policies:</strong> Naturally handles exploration</li>
                <li>• <strong>High variance:</strong> Returns vary a lot between episodes</li>
                <li>• <strong>On-policy:</strong> Must use samples from current policy</li>
                <li>• <strong>Credit assignment:</strong> Uses full return G, not just immediate R</li>
              </ul>
            </div>

            {/* Softmax Policy */}
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-2 text-sm">Softmax Policy</h3>
              <div className="bg-slate-900 p-3 rounded font-mono text-xs text-center">
                π(a|s; θ) = exp(θ<sub>s,a</sub>) / Σ<sub>a'</sub> exp(θ<sub>s,a'</sub>)
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Parameters θ are logits. Softmax converts to valid probability distribution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyGradient;
