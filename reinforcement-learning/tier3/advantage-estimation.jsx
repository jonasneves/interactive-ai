import React, { useState, useCallback, useMemo } from 'react';
import { Play, RotateCcw, BarChart3, Zap, Shuffle } from 'lucide-react';

const AdvantageEstimation = () => {
  // Simple trajectory for demonstration
  const [trajectory, setTrajectory] = useState(() => generateTrajectory());
  const [lambda, setLambda] = useState(0.95);
  const [gamma, setGamma] = useState(0.99);
  const [selectedStep, setSelectedStep] = useState(0);
  const [showMethod, setShowMethod] = useState('all'); // 'mc', 'td', 'gae', 'all'

  function generateTrajectory() {
    // Generate a sample trajectory with rewards and values
    const length = 8;
    const traj = [];
    for (let i = 0; i < length; i++) {
      traj.push({
        t: i,
        state: `s${i}`,
        action: ['↑', '→', '↓', '←'][Math.floor(Math.random() * 4)],
        reward: i === length - 1 ? 10 : (Math.random() < 0.3 ? 1 : -0.1),
        value: 5 - i * 0.5 + Math.random() * 2, // Decreasing value estimate
        done: i === length - 1
      });
    }
    return traj;
  }

  // Monte Carlo return: G_t = r_t + γr_{t+1} + γ²r_{t+2} + ...
  const mcReturns = useMemo(() => {
    const G = new Array(trajectory.length).fill(0);
    let runningReturn = 0;
    for (let t = trajectory.length - 1; t >= 0; t--) {
      runningReturn = trajectory[t].reward + gamma * runningReturn;
      G[t] = runningReturn;
    }
    return G;
  }, [trajectory, gamma]);

  // MC Advantage: A_t = G_t - V(s_t)
  const mcAdvantages = useMemo(() => {
    return trajectory.map((step, t) => mcReturns[t] - step.value);
  }, [trajectory, mcReturns]);

  // TD(0) Advantage: δ_t = r_t + γV(s_{t+1}) - V(s_t)
  const tdAdvantages = useMemo(() => {
    return trajectory.map((step, t) => {
      const nextValue = t < trajectory.length - 1 ? trajectory[t + 1].value : 0;
      return step.reward + gamma * nextValue - step.value;
    });
  }, [trajectory, gamma]);

  // GAE: A_t = Σ (γλ)^k δ_{t+k}
  const gaeAdvantages = useMemo(() => {
    const A = new Array(trajectory.length).fill(0);
    let runningGae = 0;

    for (let t = trajectory.length - 1; t >= 0; t--) {
      const nextValue = t < trajectory.length - 1 ? trajectory[t + 1].value : 0;
      const delta = trajectory[t].reward + gamma * nextValue - trajectory[t].value;
      runningGae = delta + gamma * lambda * runningGae;
      A[t] = runningGae;
    }
    return A;
  }, [trajectory, gamma, lambda]);

  // Detailed GAE computation for selected step
  const gaeBreakdown = useMemo(() => {
    const t = selectedStep;
    const terms = [];
    let coefficient = 1;

    for (let k = 0; t + k < trajectory.length; k++) {
      const step = trajectory[t + k];
      const nextValue = t + k < trajectory.length - 1 ? trajectory[t + k + 1].value : 0;
      const delta = step.reward + gamma * nextValue - step.value;
      terms.push({
        k,
        coefficient: coefficient.toFixed(3),
        delta: delta.toFixed(3),
        contribution: (coefficient * delta).toFixed(3)
      });
      coefficient *= gamma * lambda;
      if (coefficient < 0.01) break; // Stop when contribution is negligible
    }
    return terms;
  }, [trajectory, selectedStep, gamma, lambda]);

  const regenerate = () => setTrajectory(generateTrajectory());

  const getAdvantageColor = (a) => {
    const normalized = Math.max(-1, Math.min(1, a / 5));
    if (normalized > 0) return `rgba(34, 197, 94, ${Math.abs(normalized)})`;
    return `rgba(239, 68, 68, ${Math.abs(normalized)})`;
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Advantage Estimation Visualizer</h1>
        <p className="text-slate-400 mb-6">Compare MC, TD(0), and GAE(λ) for estimating advantages</p>

        {/* Controls */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={regenerate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
            >
              <Shuffle size={16} /> New Trajectory
            </button>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Show:</span>
              {['all', 'mc', 'td', 'gae'].map(m => (
                <button
                  key={m}
                  onClick={() => setShowMethod(m)}
                  className={`px-3 py-1 rounded text-sm uppercase ${
                    showMethod === m ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">γ:</span>
                <input type="range" min="0.9" max="0.999" step="0.001" value={gamma}
                  onChange={(e) => setGamma(parseFloat(e.target.value))} className="w-20" />
                <span className="font-mono w-12">{gamma.toFixed(3)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">λ:</span>
                <input type="range" min="0" max="1" step="0.05" value={lambda}
                  onChange={(e) => setLambda(parseFloat(e.target.value))} className="w-20" />
                <span className="font-mono w-12">{lambda.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Trajectory and Advantages */}
          <div className="space-y-6">
            {/* Trajectory Table */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-400" />
                Trajectory & Advantage Estimates
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="p-2 text-left">t</th>
                      <th className="p-2 text-left">s</th>
                      <th className="p-2 text-left">a</th>
                      <th className="p-2 text-right">r</th>
                      <th className="p-2 text-right">V(s)</th>
                      {(showMethod === 'all' || showMethod === 'mc') && (
                        <th className="p-2 text-right text-blue-400">A_MC</th>
                      )}
                      {(showMethod === 'all' || showMethod === 'td') && (
                        <th className="p-2 text-right text-green-400">A_TD</th>
                      )}
                      {(showMethod === 'all' || showMethod === 'gae') && (
                        <th className="p-2 text-right text-purple-400">A_GAE</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {trajectory.map((step, t) => (
                      <tr
                        key={t}
                        className={`border-b border-slate-700/50 cursor-pointer transition-colors
                                   ${selectedStep === t ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
                        onClick={() => setSelectedStep(t)}
                      >
                        <td className="p-2 font-mono">{t}</td>
                        <td className="p-2">{step.state}</td>
                        <td className="p-2">{step.action}</td>
                        <td className={`p-2 text-right font-mono ${step.reward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {step.reward.toFixed(1)}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-400">{step.value.toFixed(2)}</td>
                        {(showMethod === 'all' || showMethod === 'mc') && (
                          <td className="p-2 text-right font-mono">
                            <span className="px-2 py-1 rounded" style={{ backgroundColor: getAdvantageColor(mcAdvantages[t]) }}>
                              {mcAdvantages[t].toFixed(2)}
                            </span>
                          </td>
                        )}
                        {(showMethod === 'all' || showMethod === 'td') && (
                          <td className="p-2 text-right font-mono">
                            <span className="px-2 py-1 rounded" style={{ backgroundColor: getAdvantageColor(tdAdvantages[t]) }}>
                              {tdAdvantages[t].toFixed(2)}
                            </span>
                          </td>
                        )}
                        {(showMethod === 'all' || showMethod === 'gae') && (
                          <td className="p-2 text-right font-mono">
                            <span className="px-2 py-1 rounded" style={{ backgroundColor: getAdvantageColor(gaeAdvantages[t]) }}>
                              {gaeAdvantages[t].toFixed(2)}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advantage Chart */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Advantage Comparison</h3>
              <div className="h-40 flex items-end gap-2">
                {trajectory.map((_, t) => (
                  <div key={t} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex gap-px w-full h-32 items-end justify-center">
                      {(showMethod === 'all' || showMethod === 'mc') && (
                        <div
                          className="flex-1 bg-blue-500 rounded-t max-w-3"
                          style={{ height: `${Math.abs(mcAdvantages[t]) / 10 * 100}%`, opacity: 0.7 }}
                        />
                      )}
                      {(showMethod === 'all' || showMethod === 'td') && (
                        <div
                          className="flex-1 bg-green-500 rounded-t max-w-3"
                          style={{ height: `${Math.abs(tdAdvantages[t]) / 10 * 100}%`, opacity: 0.7 }}
                        />
                      )}
                      {(showMethod === 'all' || showMethod === 'gae') && (
                        <div
                          className="flex-1 bg-purple-500 rounded-t max-w-3"
                          style={{ height: `${Math.abs(gaeAdvantages[t]) / 10 * 100}%`, opacity: 0.7 }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{t}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs">
                {(showMethod === 'all' || showMethod === 'mc') && (
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> MC</span>
                )}
                {(showMethod === 'all' || showMethod === 'td') && (
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> TD(0)</span>
                )}
                {(showMethod === 'all' || showMethod === 'gae') && (
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500 rounded"></span> GAE(λ)</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Formulas and Breakdown */}
          <div className="space-y-6">
            {/* Formulas */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                Advantage Estimation Methods
              </h3>

              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${showMethod === 'mc' || showMethod === 'all' ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-blue-400 mb-2">Monte Carlo (High Variance, No Bias)</h4>
                  <div className="font-mono text-sm bg-slate-900 p-2 rounded">
                    A<sup>MC</sup><sub>t</sub> = G<sub>t</sub> - V(s<sub>t</sub>) = Σ<sub>k</sub> γ<sup>k</sup>r<sub>t+k</sub> - V(s<sub>t</sub>)
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Uses actual returns. High variance because future rewards vary.</p>
                </div>

                <div className={`p-4 rounded-lg border ${showMethod === 'td' || showMethod === 'all' ? 'border-green-500 bg-green-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-green-400 mb-2">TD(0) (Low Variance, High Bias)</h4>
                  <div className="font-mono text-sm bg-slate-900 p-2 rounded">
                    A<sup>TD</sup><sub>t</sub> = δ<sub>t</sub> = r<sub>t</sub> + γV(s<sub>t+1</sub>) - V(s<sub>t</sub>)
                  </div>
                  <p className="text-xs text-slate-400 mt-2">One-step TD error. Low variance but biased by V estimate.</p>
                </div>

                <div className={`p-4 rounded-lg border ${showMethod === 'gae' || showMethod === 'all' ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-purple-400 mb-2">GAE(λ) (Tunable Tradeoff)</h4>
                  <div className="font-mono text-sm bg-slate-900 p-2 rounded">
                    A<sup>GAE</sup><sub>t</sub> = Σ<sub>k=0</sub><sup>∞</sup> (γλ)<sup>k</sup> δ<sub>t+k</sub>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">λ=0 → TD(0), λ=1 → MC. Interpolates between both.</p>
                </div>
              </div>
            </div>

            {/* GAE Breakdown for selected step */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">GAE Breakdown for t={selectedStep}</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-4 gap-2 text-slate-400 font-medium">
                  <span>k</span>
                  <span>(γλ)<sup>k</sup></span>
                  <span>δ<sub>t+k</sub></span>
                  <span>Contribution</span>
                </div>
                {gaeBreakdown.map(term => (
                  <div key={term.k} className="grid grid-cols-4 gap-2 p-2 bg-slate-700/50 rounded">
                    <span className="font-mono">{term.k}</span>
                    <span className="font-mono text-purple-400">{term.coefficient}</span>
                    <span className="font-mono text-green-400">{term.delta}</span>
                    <span className="font-mono text-yellow-400">{term.contribution}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-600 flex justify-between">
                  <span className="font-medium">Sum (A<sup>GAE</sup><sub>{selectedStep}</sub>):</span>
                  <span className="font-mono text-purple-400 font-bold">{gaeAdvantages[selectedStep].toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Lambda Effect */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
              <h3 className="font-semibold mb-3 text-purple-300">💡 The λ Parameter</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>λ = 0:</strong> Pure TD(0) - one-step, low variance, high bias</li>
                <li>• <strong>λ = 1:</strong> Pure MC - full return, high variance, no bias</li>
                <li>• <strong>λ = 0.95:</strong> Common default, good tradeoff</li>
                <li>• <strong>Effect:</strong> Higher λ = more future TD errors included</li>
                <li>• <strong>Exponential decay:</strong> (γλ)<sup>k</sup> weights fall off quickly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvantageEstimation;
