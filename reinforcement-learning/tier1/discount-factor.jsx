import React, { useState, useMemo } from 'react';
import { Info, RotateCcw, TrendingDown, Clock, Coins } from 'lucide-react';

const DiscountFactorVisualizer = () => {
  const [gamma, setGamma] = useState(0.9);
  const [rewards, setRewards] = useState([1, 1, 1, 1, 1, 10, 1, 1, 1, 1]);
  const [horizon, setHorizon] = useState(10);
  const [compareGammas, setCompareGammas] = useState([0, 0.5, 0.9, 0.99]);
  const [selectedStep, setSelectedStep] = useState(null);

  // Calculate discounted returns
  const calculateReturn = (gamma, rewardSequence) => {
    return rewardSequence.reduce((sum, r, t) => sum + r * Math.pow(gamma, t), 0);
  };

  // Calculate discounted value of each reward
  const discountedRewards = useMemo(() => {
    return rewards.slice(0, horizon).map((r, t) => ({
      original: r,
      discounted: r * Math.pow(gamma, t),
      discount: Math.pow(gamma, t),
      step: t,
    }));
  }, [rewards, gamma, horizon]);

  const totalReturn = useMemo(() => calculateReturn(gamma, rewards.slice(0, horizon)), [gamma, rewards, horizon]);

  // Effective horizon calculation
  const effectiveHorizon = gamma < 1 ? 1 / (1 - gamma) : Infinity;

  // Comparison data for multiple gammas
  const comparisonData = useMemo(() => {
    return compareGammas.map(g => ({
      gamma: g,
      return: calculateReturn(g, rewards.slice(0, horizon)),
      effectiveHorizon: g < 1 ? 1 / (1 - g) : Infinity,
      discountedRewards: rewards.slice(0, horizon).map((r, t) => r * Math.pow(g, t)),
    }));
  }, [compareGammas, rewards, horizon]);

  // Update single reward
  const updateReward = (index, value) => {
    const newRewards = [...rewards];
    newRewards[index] = value;
    setRewards(newRewards);
  };

  // Preset reward patterns
  const presets = {
    constant: Array(10).fill(1),
    delayed: [0, 0, 0, 0, 0, 10, 0, 0, 0, 0],
    immediate: [10, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    growing: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    declining: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  };

  const maxReward = Math.max(...rewards.slice(0, horizon));
  const maxDiscounted = Math.max(...discountedRewards.map(d => d.discounted));

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Discount Factor (γ) Visualizer</h1>
        <p className="text-slate-400 mb-6">Understand how discounting affects the value of future rewards</p>

        {/* Main Controls */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gamma Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium flex items-center gap-2">
                  <TrendingDown size={18} className="text-purple-400" />
                  Discount Factor (γ)
                </label>
                <span className="font-mono text-xl text-purple-400">{gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.99"
                step="0.01"
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0 (Myopic)</span>
                <span>0.5</span>
                <span>0.99 (Far-sighted)</span>
              </div>
            </div>

            {/* Horizon Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium flex items-center gap-2">
                  <Clock size={18} className="text-blue-400" />
                  Time Horizon
                </label>
                <span className="font-mono text-xl text-blue-400">{horizon} steps</span>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                step="1"
                value={horizon}
                onChange={(e) => setHorizon(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Preset Patterns */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-400">Reward Patterns:</span>
            {Object.entries(presets).map(([name, values]) => (
              <button
                key={name}
                onClick={() => setRewards(values)}
                className="px-3 py-1 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition-colors capitalize"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Reward Timeline */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Coins size={20} className="text-yellow-400" />
              Reward Timeline
            </h2>

            {/* Original Rewards (editable) */}
            <div className="mb-6">
              <h3 className="text-sm text-slate-400 mb-2">Original Rewards (click to edit)</h3>
              <div className="flex gap-1 items-end h-32">
                {rewards.slice(0, horizon).map((r, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center cursor-pointer group"
                    onMouseEnter={() => setSelectedStep(i)}
                    onMouseLeave={() => setSelectedStep(null)}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-200
                                 ${selectedStep === i ? 'bg-yellow-400' : 'bg-yellow-500/70'}
                                 group-hover:bg-yellow-400`}
                      style={{ height: `${(r / Math.max(10, maxReward)) * 100}px`, minHeight: '4px' }}
                    />
                    <span className="text-xs mt-1 text-slate-400">t={i}</span>
                    <input
                      type="number"
                      min="-10"
                      max="20"
                      value={r}
                      onChange={(e) => updateReward(i, parseFloat(e.target.value) || 0)}
                      className="w-10 text-xs bg-slate-700 rounded px-1 py-0.5 text-center mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Discounted Rewards */}
            <div className="mb-6">
              <h3 className="text-sm text-slate-400 mb-2">Discounted Rewards (γ^t × R)</h3>
              <div className="flex gap-1 items-end h-32">
                {discountedRewards.map((d, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center"
                    onMouseEnter={() => setSelectedStep(i)}
                    onMouseLeave={() => setSelectedStep(null)}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-200
                                 ${selectedStep === i ? 'bg-purple-400' : 'bg-purple-500/70'}`}
                      style={{
                        height: `${Math.abs(d.discounted / Math.max(10, maxReward)) * 100}px`,
                        minHeight: '4px',
                        opacity: d.discount
                      }}
                    />
                    <span className="text-xs mt-1 text-purple-400">{d.discounted.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shrinking Coins Animation */}
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h3 className="text-sm text-slate-400 mb-3">💰 "Shrinking Coins" Metaphor</h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {discountedRewards.slice(0, 8).map((d, i) => (
                  <div key={i} className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center font-bold text-slate-900 transition-all duration-300"
                      style={{
                        width: `${Math.max(20, 50 * d.discount)}px`,
                        height: `${Math.max(20, 50 * d.discount)}px`,
                        fontSize: `${Math.max(8, 14 * d.discount)}px`,
                      }}
                    >
                      {d.original}
                    </div>
                    <span className="text-xs text-slate-500 mt-1">t={i}</span>
                  </div>
                ))}
                {horizon > 8 && <span className="text-slate-500">...</span>}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Future rewards appear smaller because γ^t shrinks them
              </p>
            </div>
          </div>

          {/* Right: Calculations & Comparisons */}
          <div className="space-y-6">
            {/* Return Calculation */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Return Calculation</h2>

              <div className="p-4 bg-slate-700/50 rounded-lg mb-4">
                <div className="text-center mb-4">
                  <span className="formula text-lg">
                    G = Σ γ^t × R_t
                  </span>
                </div>

                {selectedStep !== null && (
                  <div className="text-sm text-slate-300 mb-4 p-3 bg-slate-600/50 rounded">
                    <strong>Step {selectedStep}:</strong><br />
                    R_{selectedStep} = {rewards[selectedStep]}<br />
                    γ^{selectedStep} = {gamma}^{selectedStep} = {Math.pow(gamma, selectedStep).toFixed(4)}<br />
                    Contribution = {(rewards[selectedStep] * Math.pow(gamma, selectedStep)).toFixed(4)}
                  </div>
                )}

                <div className="text-center">
                  <span className="text-3xl font-bold text-green-400">
                    G = {totalReturn.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Effective Horizon */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Effective Horizon ≈ 1/(1-γ)</span>
                  <span className="font-mono text-blue-400">
                    {effectiveHorizon === Infinity ? '∞' : effectiveHorizon.toFixed(1)} steps
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  How far ahead the agent effectively "sees" when planning
                </p>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Compare Different γ Values</h2>

              <div className="space-y-4">
                {comparisonData.map((data, i) => (
                  <div key={i} className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono font-bold" style={{
                        color: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'][i]
                      }}>
                        γ = {data.gamma}
                      </span>
                      <span className="text-slate-400 text-sm">
                        Horizon: {data.effectiveHorizon === Infinity ? '∞' : data.effectiveHorizon.toFixed(1)}
                      </span>
                    </div>

                    {/* Mini bar chart */}
                    <div className="flex gap-0.5 h-8 mb-2">
                      {data.discountedRewards.map((v, j) => (
                        <div
                          key={j}
                          className="flex-1 rounded-sm"
                          style={{
                            backgroundColor: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'][i],
                            height: `${Math.max(2, (v / Math.max(10, maxReward)) * 100)}%`,
                            opacity: 0.3 + 0.7 * Math.pow(data.gamma, j),
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Return:</span>
                      <span className="font-mono font-bold">{data.return.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Info size={18} className="text-blue-400" />
                Key Insights
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-red-900/30 rounded-lg border-l-4 border-red-500">
                  <strong className="text-red-400">γ = 0 (Myopic)</strong>
                  <p className="text-slate-300 mt-1">Only cares about immediate reward. Ignores all future consequences.</p>
                </div>
                <div className="p-3 bg-amber-900/30 rounded-lg border-l-4 border-amber-500">
                  <strong className="text-amber-400">γ = 0.5 (Moderate)</strong>
                  <p className="text-slate-300 mt-1">Future rewards worth half as much each step. Short planning horizon.</p>
                </div>
                <div className="p-3 bg-green-900/30 rounded-lg border-l-4 border-green-500">
                  <strong className="text-green-400">γ = 0.9 (Typical)</strong>
                  <p className="text-slate-300 mt-1">Balances immediate and future rewards. ~10 step effective horizon.</p>
                </div>
                <div className="p-3 bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                  <strong className="text-blue-400">γ → 1 (Far-sighted)</strong>
                  <p className="text-slate-300 mt-1">Values future rewards almost equally. Risk of infinite returns in continuing tasks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Discount? */}
        <div className="mt-6 bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Why Discount Future Rewards?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h3 className="font-medium text-purple-400 mb-2">📊 Mathematical Stability</h3>
              <p className="text-sm text-slate-300">
                In continuing (infinite) tasks, undiscounted returns could be infinite. Discounting ensures G is bounded.
              </p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h3 className="font-medium text-blue-400 mb-2">⏰ Preference for Sooner</h3>
              <p className="text-sm text-slate-300">
                Models real-world preference: $100 today is worth more than $100 in 10 years (uncertainty, opportunity cost).
              </p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h3 className="font-medium text-green-400 mb-2">🎯 Computational Efficiency</h3>
              <p className="text-sm text-slate-300">
                Limits effective planning horizon, making value estimation tractable. Higher γ = more computation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountFactorVisualizer;
