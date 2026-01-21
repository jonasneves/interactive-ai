import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, Shield, TrendingUp, Keyboard } from 'lucide-react';

const PPOVisualizer = () => {
  // Parameters
  const [epsilon, setEpsilon] = useState(0.2);
  const [ratio, setRatio] = useState(1.0);
  const [advantage, setAdvantage] = useState(1.0);
  const [activeParam, setActiveParam] = useState('ratio'); // which param keyboard controls

  // Keyboard controls
  const handleKeyDown = useCallback((e) => {
    const step = e.shiftKey ? 0.1 : 0.02;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? step : -step;

      if (activeParam === 'ratio') {
        setRatio(prev => Math.max(0, Math.min(3, prev + delta)));
      } else if (activeParam === 'advantage') {
        setAdvantage(prev => Math.max(-2, Math.min(2, prev + delta)));
      } else if (activeParam === 'epsilon') {
        setEpsilon(prev => Math.max(0.05, Math.min(0.5, prev + delta * 0.5)));
      }
    }

    // Tab to switch active parameter
    if (e.key === 'Tab' && !e.ctrlKey) {
      e.preventDefault();
      const params = ['ratio', 'advantage', 'epsilon'];
      const idx = params.indexOf(activeParam);
      setActiveParam(params[(idx + 1) % params.length]);
    }
  }, [activeParam]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Compute clipped objective
  const computeObjective = useMemo(() => {
    const unclipped = ratio * advantage;
    const clipped = Math.max(1 - epsilon, Math.min(1 + epsilon, ratio)) * advantage;
    const objective = Math.min(unclipped, clipped);

    return {
      unclipped,
      clipped,
      objective,
      isClipped: Math.abs(unclipped - objective) > 0.001
    };
  }, [ratio, advantage, epsilon]);

  // Generate curve data for visualization
  const curveData = useMemo(() => {
    const points = [];
    for (let r = 0; r <= 3; r += 0.05) {
      const unclipped = r * advantage;
      const clipped = Math.max(1 - epsilon, Math.min(1 + epsilon, r)) * advantage;
      const obj = Math.min(unclipped, clipped);
      points.push({ r, unclipped, clipped, objective: obj });
    }
    return points;
  }, [advantage, epsilon]);

  // SVG dimensions
  const width = 400;
  const height = 250;
  const padding = 40;

  const scaleX = (r) => padding + (r / 3) * (width - 2 * padding);
  const scaleY = (v) => height - padding - ((v + 2) / 4) * (height - 2 * padding);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">PPO Trust Region Visualizer</h1>
        <p className="text-slate-400 mb-6">Understand the clipped surrogate objective that makes PPO stable</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Interactive Graph */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Parameters</h3>

              <div className="space-y-4">
                <div
                  className={`p-2 rounded-lg transition-all cursor-pointer ${activeParam === 'epsilon' ? 'bg-purple-900/30 ring-1 ring-purple-500' : 'hover:bg-slate-700/50'}`}
                  onClick={() => setActiveParam('epsilon')}
                >
                  <div className="flex justify-between mb-2">
                    <span className={activeParam === 'epsilon' ? 'text-purple-300' : 'text-slate-400'}>ε (clip range)</span>
                    <span className="font-mono text-purple-400">{epsilon.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0.05" max="0.5" step="0.01" value={epsilon}
                    onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div
                  className={`p-2 rounded-lg transition-all cursor-pointer ${activeParam === 'ratio' ? 'bg-blue-900/30 ring-1 ring-blue-500' : 'hover:bg-slate-700/50'}`}
                  onClick={() => setActiveParam('ratio')}
                >
                  <div className="flex justify-between mb-2">
                    <span className={activeParam === 'ratio' ? 'text-blue-300' : 'text-slate-400'}>π(a|s)/π_old(a|s) (ratio)</span>
                    <span className="font-mono text-blue-400">{ratio.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0" max="3" step="0.05" value={ratio}
                    onChange={(e) => setRatio(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div
                  className={`p-2 rounded-lg transition-all cursor-pointer ${activeParam === 'advantage' ? 'bg-green-900/30 ring-1 ring-green-500' : 'hover:bg-slate-700/50'}`}
                  onClick={() => setActiveParam('advantage')}
                >
                  <div className="flex justify-between mb-2">
                    <span className={activeParam === 'advantage' ? 'text-green-300' : 'text-slate-400'}>Â (advantage estimate)</span>
                    <span className={`font-mono ${advantage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {advantage.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range" min="-2" max="2" step="0.1" value={advantage}
                    onChange={(e) => setAdvantage(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Keyboard hint */}
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-700">
                  <Keyboard size={14} />
                  <span>Tab to switch • ←→ to adjust • Shift for larger steps</span>
                </div>
              </div>
            </div>

            {/* Graph */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Clipped Surrogate Objective</h3>

              <svg viewBox={`0 0 ${width} ${height}`} className="w-full bg-slate-900 rounded-lg">
                {/* Grid lines */}
                <line x1={scaleX(1)} y1={padding} x2={scaleX(1)} y2={height - padding}
                  stroke="#475569" strokeWidth="1" strokeDasharray="4" />
                <line x1={padding} y1={scaleY(0)} x2={width - padding} y2={scaleY(0)}
                  stroke="#475569" strokeWidth="1" strokeDasharray="4" />

                {/* Clip boundaries */}
                <line x1={scaleX(1 - epsilon)} y1={padding} x2={scaleX(1 - epsilon)} y2={height - padding}
                  stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2" />
                <line x1={scaleX(1 + epsilon)} y1={padding} x2={scaleX(1 + epsilon)} y2={height - padding}
                  stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2" />

                {/* Shaded clip region */}
                <rect
                  x={scaleX(1 - epsilon)}
                  y={padding}
                  width={scaleX(1 + epsilon) - scaleX(1 - epsilon)}
                  height={height - 2 * padding}
                  fill="rgba(139, 92, 246, 0.1)"
                />

                {/* Unclipped line (dashed) */}
                <path
                  d={curveData.map((p, i) =>
                    `${i === 0 ? 'M' : 'L'} ${scaleX(p.r)} ${scaleY(p.unclipped)}`
                  ).join(' ')}
                  stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="4"
                />

                {/* Clipped objective (solid) */}
                <path
                  d={curveData.map((p, i) =>
                    `${i === 0 ? 'M' : 'L'} ${scaleX(p.r)} ${scaleY(p.objective)}`
                  ).join(' ')}
                  stroke="#22c55e" strokeWidth="3" fill="none"
                />

                {/* Current point */}
                <circle
                  cx={scaleX(ratio)}
                  cy={scaleY(computeObjective.objective)}
                  r="8"
                  fill={computeObjective.isClipped ? '#ef4444' : '#22c55e'}
                  stroke="white"
                  strokeWidth="2"
                />

                {/* Axis labels */}
                <text x={width / 2} y={height - 5} textAnchor="middle" fill="#94a3b8" fontSize="12">
                  Probability Ratio r(θ)
                </text>
                <text x={15} y={height / 2} textAnchor="middle" fill="#94a3b8" fontSize="12"
                  transform={`rotate(-90, 15, ${height / 2})`}>
                  Objective L
                </text>

                {/* Tick labels */}
                <text x={scaleX(1)} y={height - padding + 15} textAnchor="middle" fill="#64748b" fontSize="10">1.0</text>
                <text x={scaleX(1 - epsilon)} y={height - padding + 15} textAnchor="middle" fill="#8b5cf6" fontSize="10">
                  {(1 - epsilon).toFixed(1)}
                </text>
                <text x={scaleX(1 + epsilon)} y={height - padding + 15} textAnchor="middle" fill="#8b5cf6" fontSize="10">
                  {(1 + epsilon).toFixed(1)}
                </text>
              </svg>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-blue-500" style={{ borderBottom: '2px dashed #3b82f6' }}></span>
                  Unclipped r·Â
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-green-500 rounded"></span>
                  PPO Objective
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-purple-500/30 rounded"></span>
                  Trust Region
                </span>
              </div>
            </div>

            {/* Current values */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                  <div className="text-sm text-slate-400">Unclipped</div>
                  <div className="font-mono text-blue-400">{computeObjective.unclipped.toFixed(3)}</div>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                  <div className="text-sm text-slate-400">Clipped</div>
                  <div className="font-mono text-purple-400">{computeObjective.clipped.toFixed(3)}</div>
                </div>
                <div className={`p-3 rounded-lg text-center ${
                  computeObjective.isClipped ? 'bg-red-900/50' : 'bg-green-900/50'
                }`}>
                  <div className="text-sm text-slate-400">PPO Objective</div>
                  <div className={`font-mono font-bold ${
                    computeObjective.isClipped ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {computeObjective.objective.toFixed(3)}
                    {computeObjective.isClipped && ' (clipped)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Explanation */}
          <div className="space-y-6">
            {/* PPO Objective */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                The PPO Clipped Objective
              </h3>

              <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm mb-4">
                <div className="text-green-400">L<sup>CLIP</sup>(θ) = 𝔼[min(</div>
                <div className="pl-4 text-blue-400">r(θ) · Â,</div>
                <div className="pl-4 text-purple-400">clip(r(θ), 1-ε, 1+ε) · Â</div>
                <div className="text-green-400">)]</div>
              </div>

              <div className="text-sm text-slate-300 space-y-2">
                <p><strong className="text-blue-400">r(θ)</strong> = π(a|s;θ) / π(a|s;θ_old) — probability ratio</p>
                <p><strong className="text-green-400">Â</strong> — advantage estimate (is action better than average?)</p>
                <p><strong className="text-purple-400">ε</strong> — clip range (typically 0.1-0.3)</p>
              </div>
            </div>

            {/* Why Clipping */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield size={18} className="text-purple-400" />
                Why Clip?
              </h3>

              <div className="space-y-4 text-sm">
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="font-medium text-yellow-400 mb-1">The Problem</div>
                  <p className="text-slate-300">
                    Large policy updates can be destructive. If r(θ) becomes too big,
                    the policy might change drastically and never recover.
                  </p>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="font-medium text-green-400 mb-1">The Solution</div>
                  <p className="text-slate-300">
                    Clipping limits the "effective" gradient when r(θ) goes outside
                    [1-ε, 1+ε]. This creates a "trust region" where updates are safe.
                  </p>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="font-medium text-blue-400 mb-1">Pessimistic Bound</div>
                  <p className="text-slate-300">
                    Taking the minimum ensures we're conservative. We don't get credit
                    for making the ratio larger when the advantage is positive.
                  </p>
                </div>
              </div>
            </div>

            {/* Advantage Sign */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Effect of Advantage Sign</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={`p-4 rounded-lg border ${advantage >= 0 ? 'border-green-500 bg-green-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-green-400 mb-2">Â &gt; 0 (Good Action)</h4>
                  <p className="text-slate-300">
                    Increase probability of action, but clip prevents going above 1+ε ratio.
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${advantage < 0 ? 'border-red-500 bg-red-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-red-400 mb-2">Â &lt; 0 (Bad Action)</h4>
                  <p className="text-slate-300">
                    Decrease probability of action, but clip prevents going below 1-ε ratio.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Insight */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
              <h3 className="font-semibold mb-3 text-purple-300">💡 Why PPO Works</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Simple:</strong> Just one hyperparameter ε to tune</li>
                <li>• <strong>Stable:</strong> No KL penalty to balance</li>
                <li>• <strong>Efficient:</strong> Multiple epochs per batch</li>
                <li>• <strong>Robust:</strong> Works across many domains</li>
                <li>• <strong>First-order:</strong> No Hessian computation needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPOVisualizer;
