import React, { useState, useMemo } from 'react';
import { Info, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const ActivationFunctionPlayground = () => {
  const [currentX, setCurrentX] = useState(1.5);
  const [selectedFunctions, setSelectedFunctions] = useState(['sigmoid', 'relu']);
  const [showDerivatives, setShowDerivatives] = useState(true);
  const [showFormulas, setShowFormulas] = useState(true);

  // All activation functions with their properties
  const activationFunctions = {
    sigmoid: {
      name: 'Sigmoid',
      fn: (x) => 1 / (1 + Math.exp(-x)),
      derivative: (x) => {
        const s = 1 / (1 + Math.exp(-x));
        return s * (1 - s);
      },
      formula: 'σ(x) = 1/(1+e⁻ˣ)',
      derivativeFormula: "σ'(x) = σ(x)(1-σ(x))",
      color: '#8b5cf6',
      range: '(0, 1)',
      zeroCentered: false,
      vanishingGradient: true,
      description: 'Classic activation, outputs probability-like values. Suffers from vanishing gradients.',
    },
    tanh: {
      name: 'Tanh',
      fn: (x) => Math.tanh(x),
      derivative: (x) => 1 - Math.tanh(x) ** 2,
      formula: 'tanh(x) = (eˣ-e⁻ˣ)/(eˣ+e⁻ˣ)',
      derivativeFormula: "tanh'(x) = 1 - tanh²(x)",
      color: '#f59e0b',
      range: '(-1, 1)',
      zeroCentered: true,
      vanishingGradient: true,
      description: 'Zero-centered sigmoid. Better than sigmoid but still has vanishing gradient issue.',
    },
    relu: {
      name: 'ReLU',
      fn: (x) => Math.max(0, x),
      derivative: (x) => (x > 0 ? 1 : 0),
      formula: 'ReLU(x) = max(0, x)',
      derivativeFormula: "ReLU'(x) = 1 if x>0, else 0",
      color: '#22c55e',
      range: '[0, ∞)',
      zeroCentered: false,
      vanishingGradient: false,
      dyingRelu: true,
      description: 'Most popular. Fast, no vanishing gradient, but can "die" if inputs always negative.',
    },
    leakyRelu: {
      name: 'Leaky ReLU',
      fn: (x) => (x > 0 ? x : 0.01 * x),
      derivative: (x) => (x > 0 ? 1 : 0.01),
      formula: 'LReLU(x) = max(0.01x, x)',
      derivativeFormula: "LReLU'(x) = 1 if x>0, else 0.01",
      color: '#14b8a6',
      range: '(-∞, ∞)',
      zeroCentered: false,
      vanishingGradient: false,
      description: 'Fixes dying ReLU by allowing small gradient when x < 0.',
    },
    elu: {
      name: 'ELU',
      fn: (x) => (x > 0 ? x : Math.exp(x) - 1),
      derivative: (x) => (x > 0 ? 1 : Math.exp(x)),
      formula: 'ELU(x) = x if x>0, else eˣ-1',
      derivativeFormula: "ELU'(x) = 1 if x>0, else eˣ",
      color: '#ec4899',
      range: '(-1, ∞)',
      zeroCentered: false,
      vanishingGradient: false,
      description: 'Smooth for x < 0, can produce negative outputs. More computationally expensive.',
    },
    swish: {
      name: 'Swish',
      fn: (x) => x / (1 + Math.exp(-x)),
      derivative: (x) => {
        const s = 1 / (1 + Math.exp(-x));
        return s + x * s * (1 - s);
      },
      formula: 'Swish(x) = x·σ(x)',
      derivativeFormula: "Swish'(x) = σ(x) + x·σ(x)(1-σ(x))",
      color: '#06b6d4',
      range: '(-0.28, ∞)',
      zeroCentered: false,
      vanishingGradient: false,
      description: 'Self-gated activation from Google. Smooth and non-monotonic.',
    },
    gelu: {
      name: 'GELU',
      fn: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))),
      derivative: (x) => {
        const cdf = 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
        const pdf = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
        return cdf + x * pdf;
      },
      formula: 'GELU(x) ≈ 0.5x(1+tanh(√(2/π)(x+0.044715x³)))',
      derivativeFormula: "GELU'(x) = Φ(x) + x·φ(x)",
      color: '#f43f5e',
      range: '(-0.17, ∞)',
      zeroCentered: false,
      vanishingGradient: false,
      description: 'Used in transformers (BERT, GPT). Probabilistic approach to gating.',
    },
    softplus: {
      name: 'Softplus',
      fn: (x) => Math.log(1 + Math.exp(x)),
      derivative: (x) => 1 / (1 + Math.exp(-x)),
      formula: 'Softplus(x) = ln(1+eˣ)',
      derivativeFormula: "Softplus'(x) = σ(x)",
      color: '#a855f7',
      range: '(0, ∞)',
      zeroCentered: false,
      vanishingGradient: false,
      description: 'Smooth approximation of ReLU. Derivative is sigmoid!',
    },
  };

  const toggleFunction = (key) => {
    if (selectedFunctions.includes(key)) {
      if (selectedFunctions.length > 1) {
        setSelectedFunctions(selectedFunctions.filter((f) => f !== key));
      }
    } else {
      if (selectedFunctions.length < 4) {
        setSelectedFunctions([...selectedFunctions, key]);
      }
    }
  };

  // Generate curve points for all functions
  const curveData = useMemo(() => {
    const data = {};
    Object.keys(activationFunctions).forEach((key) => {
      const fn = activationFunctions[key];
      const points = [];
      const derivPoints = [];
      for (let x = -5; x <= 5; x += 0.05) {
        points.push({ x, y: fn.fn(x) });
        derivPoints.push({ x, y: fn.derivative(x) });
      }
      data[key] = { points, derivPoints };
    });
    return data;
  }, []);

  // SVG coordinate conversion
  const toSvgX = (x, width = 400) => (x + 5) * (width / 10);
  const toSvgY = (y, height = 200, scale = 40) => height / 2 - y * scale;

  // Comparison table data
  const comparisonData = selectedFunctions.map((key) => {
    const fn = activationFunctions[key];
    return {
      key,
      name: fn.name,
      color: fn.color,
      fX: fn.fn(currentX),
      fPrimeX: fn.derivative(currentX),
      range: fn.range,
      zeroCentered: fn.zeroCentered,
      vanishingGradient: fn.vanishingGradient,
    };
  });

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Activation Function Playground</h1>
        <p className="text-slate-400 mb-6">
          Compare activation functions and their derivatives — crucial for understanding gradient flow
        </p>

        {/* Function Selector */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-400 mr-2">Select functions (max 4):</span>
              {Object.entries(activationFunctions).map(([key, { name, color }]) => (
                <button
                  key={key}
                  onClick={() => toggleFunction(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedFunctions.includes(key)
                      ? 'ring-2 ring-offset-2 ring-offset-slate-800'
                      : 'bg-slate-700 hover:bg-slate-600 opacity-60'
                  }`}
                  style={{
                    backgroundColor: selectedFunctions.includes(key) ? color : undefined,
                    ringColor: color,
                  }}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDerivatives(!showDerivatives)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  showDerivatives ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                {showDerivatives ? <Eye size={16} /> : <EyeOff size={16} />}
                Derivatives
              </button>
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  showFormulas ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                Formulas
              </button>
            </div>
          </div>
        </div>

        {/* X Value Slider */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Input x:</span>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.01"
              value={currentX}
              onChange={(e) => setCurrentX(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-lg font-mono font-bold w-20 text-right">{currentX.toFixed(2)}</span>
          </div>
        </div>

        {/* Graphs */}
        <div className={`grid gap-6 mb-6 ${showDerivatives ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* f(x) Graph */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">f(x) — Activation Functions</h2>
            <svg viewBox="0 0 400 200" className="w-full bg-slate-900 rounded-lg">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#grid)" />

              {/* Axes */}
              <line x1="0" y1="100" x2="400" y2="100" stroke="#64748b" strokeWidth="1" />
              <line x1="200" y1="0" x2="200" y2="200" stroke="#64748b" strokeWidth="1" />

              {/* Axis labels */}
              <text x="390" y="115" fill="#94a3b8" className="text-xs">x</text>
              <text x="205" y="15" fill="#94a3b8" className="text-xs">f(x)</text>
              <text x="205" y="115" fill="#64748b" className="text-xs">0</text>

              {/* Saturation zone indicator (for sigmoid/tanh) */}
              {selectedFunctions.some((f) => activationFunctions[f].vanishingGradient) && (
                <>
                  <rect x="0" y="0" width="80" height="200" fill="#ef4444" opacity="0.1" />
                  <rect x="320" y="0" width="80" height="200" fill="#ef4444" opacity="0.1" />
                  <text x="40" y="190" textAnchor="middle" fill="#ef4444" className="text-xs" opacity="0.7">
                    saturated
                  </text>
                  <text x="360" y="190" textAnchor="middle" fill="#ef4444" className="text-xs" opacity="0.7">
                    saturated
                  </text>
                </>
              )}

              {/* Function curves */}
              {selectedFunctions.map((key) => (
                <path
                  key={key}
                  d={curveData[key].points
                    .map((p, i) => {
                      const sx = toSvgX(p.x);
                      const sy = toSvgY(p.y);
                      return `${i === 0 ? 'M' : 'L'} ${sx} ${Math.max(5, Math.min(195, sy))}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke={activationFunctions[key].color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ))}

              {/* Current x vertical line */}
              <line
                x1={toSvgX(currentX)}
                y1="0"
                x2={toSvgX(currentX)}
                y2="200"
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="4,4"
              />

              {/* Current points */}
              {selectedFunctions.map((key) => {
                const fn = activationFunctions[key];
                const y = fn.fn(currentX);
                return (
                  <g key={key}>
                    <circle
                      cx={toSvgX(currentX)}
                      cy={Math.max(5, Math.min(195, toSvgY(y)))}
                      r="6"
                      fill={fn.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}

              {/* Legend */}
              {selectedFunctions.map((key, i) => (
                <g key={key} transform={`translate(10, ${15 + i * 20})`}>
                  <rect width="12" height="12" rx="2" fill={activationFunctions[key].color} />
                  <text x="18" y="10" fill="#e2e8f0" className="text-xs">
                    {activationFunctions[key].name}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* f'(x) Derivative Graph */}
          {showDerivatives && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">f'(x) — Derivatives (for Backprop)</h2>
              <svg viewBox="0 0 400 200" className="w-full bg-slate-900 rounded-lg">
                {/* Grid */}
                <rect width="400" height="200" fill="url(#grid)" />

                {/* Axes */}
                <line x1="0" y1="100" x2="400" y2="100" stroke="#64748b" strokeWidth="1" />
                <line x1="200" y1="0" x2="200" y2="200" stroke="#64748b" strokeWidth="1" />

                {/* Labels */}
                <text x="390" y="115" fill="#94a3b8" className="text-xs">x</text>
                <text x="205" y="15" fill="#94a3b8" className="text-xs">f'(x)</text>

                {/* Gradient reference line at y=1 */}
                <line x1="0" y1={toSvgY(1)} x2="400" y2={toSvgY(1)} stroke="#22c55e" strokeWidth="1" strokeDasharray="2,4" opacity="0.5" />
                <text x="5" y={toSvgY(1) - 5} fill="#22c55e" className="text-xs" opacity="0.7">healthy gradient (1)</text>

                {/* Vanishing gradient zone */}
                <rect x="0" y={toSvgY(0.1)} width="400" height={toSvgY(0) - toSvgY(0.1)} fill="#ef4444" opacity="0.1" />
                <text x="5" y={toSvgY(0.05)} fill="#ef4444" className="text-xs" opacity="0.7">vanishing zone</text>

                {/* Derivative curves */}
                {selectedFunctions.map((key) => (
                  <path
                    key={key}
                    d={curveData[key].derivPoints
                      .map((p, i) => {
                        const sx = toSvgX(p.x);
                        const sy = toSvgY(p.y);
                        return `${i === 0 ? 'M' : 'L'} ${sx} ${Math.max(5, Math.min(195, sy))}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke={activationFunctions[key].color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="6,3"
                  />
                ))}

                {/* Current x line */}
                <line
                  x1={toSvgX(currentX)}
                  y1="0"
                  x2={toSvgX(currentX)}
                  y2="200"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />

                {/* Current derivative points */}
                {selectedFunctions.map((key) => {
                  const fn = activationFunctions[key];
                  const y = fn.derivative(currentX);
                  return (
                    <g key={key}>
                      <circle
                        cx={toSvgX(currentX)}
                        cy={Math.max(5, Math.min(195, toSvgY(y)))}
                        r="6"
                        fill={fn.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })}

                {/* Legend */}
                {selectedFunctions.map((key, i) => (
                  <g key={key} transform={`translate(10, ${15 + i * 20})`}>
                    <rect width="12" height="12" rx="2" fill={activationFunctions[key].color} />
                    <text x="18" y="10" fill="#e2e8f0" className="text-xs">
                      {activationFunctions[key].name}'
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Comparison at x = {currentX.toFixed(2)}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-3 text-slate-400">Function</th>
                <th className="text-right py-2 px-3 text-slate-400">f({currentX.toFixed(2)})</th>
                <th className="text-right py-2 px-3 text-slate-400">f'({currentX.toFixed(2)})</th>
                <th className="text-center py-2 px-3 text-slate-400">Range</th>
                <th className="text-center py-2 px-3 text-slate-400">Zero-centered?</th>
                <th className="text-center py-2 px-3 text-slate-400">Vanishing Gradient?</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row) => (
                <tr key={row.key} className="border-b border-slate-700/50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: row.color }} />
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono" style={{ color: row.color }}>
                    {row.fX.toFixed(4)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    <span
                      className={
                        row.fPrimeX < 0.1
                          ? 'text-red-400'
                          : row.fPrimeX > 0.9
                          ? 'text-green-400'
                          : 'text-slate-300'
                      }
                    >
                      {row.fPrimeX.toFixed(4)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-400">{row.range}</td>
                  <td className="py-3 px-3 text-center">
                    {row.zeroCentered ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-slate-500">✗</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.vanishingGradient ? (
                      <span className="text-red-400 flex items-center justify-center gap-1">
                        <AlertTriangle size={14} /> Yes
                      </span>
                    ) : (
                      <span className="text-green-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formulas Panel */}
        {showFormulas && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Mathematical Formulas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedFunctions.map((key) => {
                const fn = activationFunctions[key];
                return (
                  <div
                    key={key}
                    className="p-4 rounded-lg border-l-4"
                    style={{ backgroundColor: fn.color + '15', borderColor: fn.color }}
                  >
                    <div className="font-semibold mb-2" style={{ color: fn.color }}>
                      {fn.name}
                    </div>
                    <div className="font-mono text-sm text-slate-300 mb-1">{fn.formula}</div>
                    <div className="font-mono text-xs text-slate-400">{fn.derivativeFormula}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Descriptions */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Function Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedFunctions.map((key) => {
              const fn = activationFunctions[key];
              return (
                <div
                  key={key}
                  className="p-4 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: fn.color }} />
                    <span className="font-semibold">{fn.name}</span>
                  </div>
                  <p className="text-sm text-slate-300">{fn.description}</p>
                  {fn.dyingRelu && (
                    <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Can suffer from "dying ReLU" problem
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Info size={18} className="text-blue-400" />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-red-500">
              <div className="font-medium text-red-400 mb-1">Vanishing Gradients</div>
              <p className="text-slate-300">
                When f'(x) is very small (near 0), gradients shrink exponentially in deep networks. Sigmoid/tanh
                saturate at extreme values, causing this issue.
              </p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-green-500">
              <div className="font-medium text-green-400 mb-1">ReLU's Constant Gradient</div>
              <p className="text-slate-300">
                ReLU's derivative is exactly 1 for positive inputs, which means gradients flow without shrinking.
                This is why ReLU became dominant in deep learning.
              </p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-amber-500">
              <div className="font-medium text-amber-400 mb-1">Zero-Centered Outputs</div>
              <p className="text-slate-300">
                Tanh is zero-centered, making optimization easier because gradients don't have a consistent bias
                in one direction.
              </p>
            </div>
          </div>

          {/* Interactive insight based on current x */}
          <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
            <div className="text-blue-300 font-medium mb-1">Current Observation (x = {currentX.toFixed(2)})</div>
            <p className="text-slate-300 text-sm">
              {Math.abs(currentX) > 3 ? (
                <>
                  At x = {currentX.toFixed(2)}, notice how sigmoid and tanh are{' '}
                  <span className="text-red-400">saturated</span> (derivatives near 0), while ReLU maintains a{' '}
                  <span className="text-green-400">constant gradient</span>. This is why deep networks with
                  sigmoid/tanh struggle to learn.
                </>
              ) : Math.abs(currentX) < 0.5 ? (
                <>
                  Near x = 0, all activations behave somewhat similarly. The derivatives are largest here for
                  sigmoid/tanh, making this the "active zone" where learning happens.
                </>
              ) : currentX < 0 ? (
                <>
                  For negative x, ReLU outputs 0 with 0 gradient — if neurons consistently receive negative inputs,
                  they "die" and stop learning. Leaky ReLU and ELU solve this by allowing small negative outputs.
                </>
              ) : (
                <>
                  In the positive region, ReLU acts like a linear function (f(x) = x). GELU and Swish add slight
                  non-linearity even here, which can help with certain tasks.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivationFunctionPlayground;
