import React, { useState, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, RefreshCw, Copy, TrendingUp, Zap } from 'lucide-react';

const TargetNetwork = () => {
  const NUM_PARAMS = 8;
  const UPDATE_FREQ = 10;

  // State
  const [onlineWeights, setOnlineWeights] = useState(() => initWeights());
  const [targetWeights, setTargetWeights] = useState(() => initWeights());
  const [isTraining, setIsTraining] = useState(false);
  const [step, setStep] = useState(0);
  const [updateMode, setUpdateMode] = useState('hard'); // 'hard' or 'soft'
  const [tau, setTau] = useState(0.01);
  const [lossHistory, setLossHistory] = useState([]);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [speed, setSpeed] = useState(300);

  function initWeights() {
    return Array.from({ length: NUM_PARAMS }, () => (Math.random() - 0.5) * 2);
  }

  // Simulate a training step - online network changes
  const trainStep = useCallback(() => {
    // Simulate gradient descent - weights drift toward some target with noise
    const optimalWeights = [1, -1, 0.5, -0.5, 0.8, -0.8, 0.3, -0.3];

    setOnlineWeights(prev => {
      return prev.map((w, i) => {
        const grad = (optimalWeights[i] - w) * 0.1 + (Math.random() - 0.5) * 0.2;
        return w + grad;
      });
    });

    // Compute "loss" as distance from optimal
    const loss = onlineWeights.reduce((sum, w, i) =>
      sum + Math.pow(w - optimalWeights[i], 2), 0) / NUM_PARAMS;

    setLossHistory(prev => [...prev.slice(-50), loss]);
    setStep(prev => prev + 1);

    // Update target network
    if (updateMode === 'hard' && (step + 1) % UPDATE_FREQ === 0) {
      setTargetWeights([...onlineWeights]);
      setUpdateHistory(prev => [...prev, { step: step + 1, type: 'hard' }]);
    } else if (updateMode === 'soft') {
      setTargetWeights(prev =>
        prev.map((w, i) => (1 - tau) * w + tau * onlineWeights[i])
      );
    }
  }, [onlineWeights, step, updateMode, tau]);

  // Force sync target to online
  const syncNetworks = () => {
    setTargetWeights([...onlineWeights]);
    setUpdateHistory(prev => [...prev, { step, type: 'manual' }]);
  };

  // Auto-train
  useEffect(() => {
    if (isTraining) {
      const timer = setTimeout(trainStep, speed);
      return () => clearTimeout(timer);
    }
  }, [isTraining, trainStep, speed]);

  const reset = () => {
    const weights = initWeights();
    setOnlineWeights(weights);
    setTargetWeights([...weights]);
    setStep(0);
    setLossHistory([]);
    setUpdateHistory([]);
    setIsTraining(false);
  };

  // Calculate divergence between networks
  const divergence = onlineWeights.reduce((sum, w, i) =>
    sum + Math.pow(w - targetWeights[i], 2), 0) / NUM_PARAMS;

  const getWeightColor = (w) => {
    const normalized = Math.max(-1, Math.min(1, w));
    if (normalized > 0) return `rgba(59, 130, 246, ${Math.abs(normalized)})`;
    return `rgba(239, 68, 68, ${Math.abs(normalized)})`;
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Target Network Stabilization</h1>
        <p className="text-slate-400 mb-6">See how target networks prevent oscillation in Q-learning</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Network Visualization */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap mb-4">
                <button
                  onClick={() => setIsTraining(!isTraining)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isTraining ? 'bg-red-600' : 'bg-green-600'
                  }`}
                >
                  {isTraining ? <Pause size={16} /> : <Play size={16} />}
                  {isTraining ? 'Pause' : 'Train'}
                </button>
                <button
                  onClick={trainStep}
                  disabled={isTraining}
                  className="px-4 py-2 bg-blue-600 rounded-lg disabled:opacity-50"
                >
                  Step
                </button>
                <button
                  onClick={syncNetworks}
                  className="px-4 py-2 bg-purple-600 rounded-lg flex items-center gap-2"
                >
                  <Copy size={16} /> Sync Target
                </button>
                <button onClick={reset} className="px-4 py-2 bg-slate-700 rounded-lg">
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Update:</span>
                  <button
                    onClick={() => setUpdateMode('hard')}
                    className={`px-3 py-1 rounded text-sm ${updateMode === 'hard' ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    Hard (every {UPDATE_FREQ})
                  </button>
                  <button
                    onClick={() => setUpdateMode('soft')}
                    className={`px-3 py-1 rounded text-sm ${updateMode === 'soft' ? 'bg-green-600' : 'bg-slate-700'}`}
                  >
                    Soft (τ)
                  </button>
                </div>
                {updateMode === 'soft' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">τ:</span>
                    <input type="range" min="0.001" max="0.1" step="0.001" value={tau}
                      onChange={(e) => setTau(parseFloat(e.target.value))} className="w-20" />
                    <span className="font-mono text-sm">{tau.toFixed(3)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Network comparison */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Network Weights</h3>
                <span className="text-sm text-slate-400">Step: {step}</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Online Network */}
                <div>
                  <h4 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} /> Online Q(θ)
                  </h4>
                  <div className="space-y-2">
                    {onlineWeights.map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-6">θ{i}</span>
                        <div className="flex-1 h-6 bg-slate-700 rounded overflow-hidden">
                          <div
                            className="h-full transition-all duration-200"
                            style={{
                              width: `${Math.abs(w) / 2 * 100}%`,
                              backgroundColor: w >= 0 ? '#3b82f6' : '#ef4444',
                              marginLeft: w < 0 ? 'auto' : 0
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs w-12">{w.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Network */}
                <div>
                  <h4 className="font-medium text-green-400 mb-3 flex items-center gap-2">
                    <RefreshCw size={16} /> Target Q(θ⁻)
                  </h4>
                  <div className="space-y-2">
                    {targetWeights.map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-6">θ⁻{i}</span>
                        <div className="flex-1 h-6 bg-slate-700 rounded overflow-hidden">
                          <div
                            className="h-full transition-all duration-200"
                            style={{
                              width: `${Math.abs(w) / 2 * 100}%`,
                              backgroundColor: w >= 0 ? '#22c55e' : '#ef4444',
                              marginLeft: w < 0 ? 'auto' : 0
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs w-12">{w.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divergence indicator */}
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Network Divergence:</span>
                  <span className={`font-mono font-bold ${
                    divergence < 0.1 ? 'text-green-400' : divergence < 0.5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {divergence.toFixed(4)}
                  </span>
                </div>
                <div className="h-2 bg-slate-600 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      divergence < 0.1 ? 'bg-green-500' : divergence < 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, divergence * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Loss Chart */}
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">Training Loss</h3>
              <div className="h-20 flex items-end gap-px">
                {lossHistory.map((loss, i) => {
                  const height = Math.min(100, loss * 50);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-blue-500 rounded-t opacity-70"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Explanation */}
          <div className="space-y-6">
            {/* The Problem */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-red-400" />
                The Problem: Moving Target
              </h3>

              <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm mb-4">
                <div className="text-slate-400 mb-2">DQN Target:</div>
                <div>y = r + γ max<sub>a'</sub> Q(s', a'; <span className="text-red-400">θ</span>)</div>
              </div>

              <p className="text-sm text-slate-300">
                If we use the same network θ for both selecting actions and computing targets,
                the target is constantly changing as we update θ. This creates <strong className="text-red-400">
                oscillations</strong> and <strong className="text-red-400">instability</strong>.
              </p>
            </div>

            {/* The Solution */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-green-400" />
                The Solution: Target Network
              </h3>

              <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm mb-4">
                <div className="text-slate-400 mb-2">Fixed Target:</div>
                <div>y = r + γ max<sub>a'</sub> Q(s', a'; <span className="text-green-400">θ⁻</span>)</div>
              </div>

              <p className="text-sm text-slate-300">
                Use a separate <strong className="text-green-400">target network</strong> θ⁻ that
                is only periodically updated from the online network. This provides stable
                targets for learning.
              </p>
            </div>

            {/* Update Strategies */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Update Strategies</h3>

              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${updateMode === 'hard' ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-blue-400 mb-2">Hard Update</h4>
                  <div className="font-mono text-sm bg-slate-900 p-2 rounded mb-2">
                    Every C steps: θ⁻ ← θ
                  </div>
                  <p className="text-xs text-slate-400">
                    Completely copy online weights every C steps. Used in original DQN.
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${updateMode === 'soft' ? 'border-green-500 bg-green-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-green-400 mb-2">Soft Update (Polyak)</h4>
                  <div className="font-mono text-sm bg-slate-900 p-2 rounded mb-2">
                    Every step: θ⁻ ← τθ + (1-τ)θ⁻
                  </div>
                  <p className="text-xs text-slate-400">
                    Slowly blend in online weights. Used in DDPG, TD3, SAC. Typically τ ≈ 0.005.
                  </p>
                </div>
              </div>
            </div>

            {/* Update History */}
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">Target Updates</h3>
              {updateHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">No updates yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {updateHistory.slice(-15).map((u, i) => (
                    <span key={i} className={`px-2 py-1 rounded text-xs ${
                      u.type === 'hard' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                      Step {u.step}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Key Insight */}
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-500/30">
              <h3 className="font-semibold mb-3 text-green-300">💡 Key Insight</h3>
              <p className="text-sm text-slate-300">
                Target networks are crucial for stable deep RL. Without them, the network
                is "chasing its own tail" — the targets move as fast as the predictions,
                preventing convergence. By freezing targets periodically, we give the
                network a stable objective to optimize.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetNetwork;
