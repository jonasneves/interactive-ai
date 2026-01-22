import React, { useState, useMemo } from 'react';
import { Info, RotateCcw, Zap } from 'lucide-react';

const NeuronAnatomyExplorer = () => {
  // Neuron parameters
  const [x1, setX1] = useState(0.7);
  const [x2, setX2] = useState(0.3);
  const [w1, setW1] = useState(1.2);
  const [w2, setW2] = useState(0.8);
  const [bias, setBias] = useState(-0.5);
  const [activation, setActivation] = useState('sigmoid');
  const [showPulse, setShowPulse] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);

  // Activation functions
  const activationFunctions = {
    sigmoid: {
      name: 'Sigmoid',
      fn: (z) => 1 / (1 + Math.exp(-z)),
      formula: 'σ(z) = 1/(1+e⁻ᶻ)',
      range: '(0, 1)',
      color: '#8b5cf6',
    },
    relu: {
      name: 'ReLU',
      fn: (z) => Math.max(0, z),
      formula: 'f(z) = max(0, z)',
      range: '[0, ∞)',
      color: '#22c55e',
    },
    tanh: {
      name: 'Tanh',
      fn: (z) => Math.tanh(z),
      formula: 'f(z) = tanh(z)',
      range: '(-1, 1)',
      color: '#f59e0b',
    },
    linear: {
      name: 'Linear',
      fn: (z) => z,
      formula: 'f(z) = z',
      range: '(-∞, ∞)',
      color: '#3b82f6',
    },
  };

  // Calculations
  const z = x1 * w1 + x2 * w2 + bias;
  const y = activationFunctions[activation].fn(z);

  // Generate activation function curve points
  const curvePoints = useMemo(() => {
    const points = [];
    for (let i = -5; i <= 5; i += 0.1) {
      points.push({
        x: i,
        y: activationFunctions[activation].fn(i),
      });
    }
    return points;
  }, [activation]);

  // Tooltip content
  const tooltips = {
    x1: { title: 'Input x₁', desc: 'First input signal to the neuron. In a real network, this could be a pixel value, a feature, or output from another neuron.' },
    x2: { title: 'Input x₂', desc: 'Second input signal. Neurons can have many inputs, each representing different features of the data.' },
    w1: { title: 'Weight w₁', desc: 'Controls how much x₁ influences the output. Positive = excitatory, Negative = inhibitory. Learning adjusts these values.' },
    w2: { title: 'Weight w₂', desc: 'Controls how much x₂ influences the output. Larger magnitude = stronger influence on the neuron\'s decision.' },
    bias: { title: 'Bias b', desc: 'Shifts the activation threshold. Allows the neuron to activate even when inputs are zero. Think of it as the neuron\'s "baseline mood".' },
    sum: { title: 'Weighted Sum (z)', desc: 'The linear combination of inputs: z = x₁w₁ + x₂w₂ + b. This is the "pre-activation" value before applying the activation function.' },
    activation: { title: 'Activation Function', desc: 'Introduces non-linearity. Without it, stacking layers would just be one big linear function. This is what makes neural networks powerful.' },
    output: { title: 'Output (ŷ)', desc: 'The neuron\'s final output after applying the activation function. This becomes input to the next layer or the final prediction.' },
  };

  const reset = () => {
    setX1(0.7);
    setX2(0.3);
    setW1(1.2);
    setW2(0.8);
    setBias(-0.5);
  };

  const triggerPulse = () => {
    setShowPulse(true);
    setTimeout(() => setShowPulse(false), 1500);
  };

  // SVG helper for weight line color/thickness
  const getWeightStyle = (w) => ({
    stroke: w >= 0 ? '#22c55e' : '#ef4444',
    strokeWidth: Math.max(1, Math.abs(w) * 3),
  });

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Neuron Anatomy Explorer</h1>
        <p className="text-slate-400 mb-6">Understand how a single artificial neuron computes its output</p>

        {/* Controls Bar */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={triggerPulse}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Zap size={16} /> Fire Neuron
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Activation:</span>
            {Object.entries(activationFunctions).map(([key, { name, color }]) => (
              <button
                key={key}
                onClick={() => setActivation(key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  activation === key
                    ? 'ring-2 ring-offset-2 ring-offset-slate-800'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                style={{
                  backgroundColor: activation === key ? color : undefined,
                  ringColor: color,
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Neuron Diagram */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Neuron Architecture</h2>

            <svg viewBox="0 0 500 400" className="w-full">
              <defs>
                {/* Pulse animation gradient */}
                <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>

                {/* Glow filter */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Connection: x1 to sum */}
              <line
                x1="100" y1="100" x2="220" y2="180"
                {...getWeightStyle(w1)}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {showPulse && (
                <circle r="6" fill="#3b82f6" filter="url(#glow)">
                  <animateMotion dur="0.5s" repeatCount="1" path="M100,100 L220,180" />
                </circle>
              )}

              {/* Connection: x2 to sum */}
              <line
                x1="100" y1="260" x2="220" y2="180"
                {...getWeightStyle(w2)}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {showPulse && (
                <circle r="6" fill="#3b82f6" filter="url(#glow)">
                  <animateMotion dur="0.5s" repeatCount="1" path="M100,260 L220,180" />
                </circle>
              )}

              {/* Connection: bias to sum */}
              <line
                x1="250" y1="300" x2="250" y2="220"
                {...getWeightStyle(bias)}
                strokeLinecap="round"
                className="transition-all duration-300"
              />

              {/* Connection: sum to activation */}
              <line
                x1="290" y1="180" x2="350" y2="180"
                stroke="#64748b"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {showPulse && (
                <circle r="6" fill="#f59e0b" filter="url(#glow)">
                  <animateMotion dur="0.3s" begin="0.5s" repeatCount="1" path="M290,180 L350,180" />
                </circle>
              )}

              {/* Connection: activation to output */}
              <line
                x1="410" y1="180" x2="470" y2="180"
                stroke="#64748b"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {showPulse && (
                <circle r="6" fill={activationFunctions[activation].color} filter="url(#glow)">
                  <animateMotion dur="0.3s" begin="0.8s" repeatCount="1" path="M410,180 L470,180" />
                </circle>
              )}

              {/* Input x1 */}
              <g
                onMouseEnter={() => setHoveredElement('x1')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              >
                <circle
                  cx="70" cy="100" r="35"
                  fill={hoveredElement === 'x1' ? '#3b82f6' : '#475569'}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                <text x="70" y="95" textAnchor="middle" fill="white" className="text-lg font-bold">x₁</text>
                <text x="70" y="115" textAnchor="middle" fill="#94a3b8" className="text-sm">{x1.toFixed(2)}</text>
              </g>

              {/* Input x2 */}
              <g
                onMouseEnter={() => setHoveredElement('x2')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              >
                <circle
                  cx="70" cy="260" r="35"
                  fill={hoveredElement === 'x2' ? '#3b82f6' : '#475569'}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                <text x="70" y="255" textAnchor="middle" fill="white" className="text-lg font-bold">x₂</text>
                <text x="70" y="275" textAnchor="middle" fill="#94a3b8" className="text-sm">{x2.toFixed(2)}</text>
              </g>

              {/* Weight labels */}
              <g
                onMouseEnter={() => setHoveredElement('w1')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              >
                <text
                  x="140" y="125"
                  fill={hoveredElement === 'w1' ? '#22c55e' : '#94a3b8'}
                  className="text-sm font-bold transition-all duration-300"
                >
                  w₁={w1.toFixed(2)}
                </text>
              </g>

              <g
                onMouseEnter={() => setHoveredElement('w2')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              >
                <text
                  x="140" y="235"
                  fill={hoveredElement === 'w2' ? '#22c55e' : '#94a3b8'}
                  className="text-sm font-bold transition-all duration-300"
                >
                  w₂={w2.toFixed(2)}
                </text>
              </g>

              {/* Sum node */}
              <g
                onMouseEnter={() => setHoveredElement('sum')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              >
                <circle
                  cx="250" cy="180" r="40"
                  fill={hoveredElement === 'sum' ? '#f59e0b' : '#475569'}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                <text x="250" y="175" textAnchor="middle" fill="white" className="text-2xl">Σ</text>
                <text x="250" y="198" textAnchor="middle" fill="#94a3b8" className="text-xs">z={z.toFixed(3)}</text>
              </g>

              {/* Bias node */}
              <g
                onMouseEnter={() => setHoveredElement('bias')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              >
                <circle
                  cx="250" cy="320" r="25"
                  fill={hoveredElement === 'bias' ? '#22c55e' : '#475569'}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                <text x="250" y="325" textAnchor="middle" fill="white" className="text-sm font-bold">b</text>
                <text x="250" y="360" textAnchor="middle" fill="#94a3b8" className="text-xs">{bias.toFixed(2)}</text>
              </g>

              {/* Activation node */}
              <g
                onMouseEnter={() => setHoveredElement('activation')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              >
                <circle
                  cx="380" cy="180" r="40"
                  fill={hoveredElement === 'activation' ? activationFunctions[activation].color : '#475569'}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                <text x="380" y="175" textAnchor="middle" fill="white" className="text-sm font-bold">f(z)</text>
                <text x="380" y="198" textAnchor="middle" fill="#94a3b8" className="text-xs">{activationFunctions[activation].name}</text>
              </g>

              {/* Output */}
              <g
                onMouseEnter={() => setHoveredElement('output')}
                onMouseLeave={() => setHoveredElement(null)}
                className="cursor-pointer"
              >
                <circle
                  cx="480" cy="180" r="20"
                  fill={hoveredElement === 'output' ? '#34d399' : activationFunctions[activation].color}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="transition-all duration-300"
                  filter={showPulse ? 'url(#glow)' : undefined}
                />
                <text x="480" y="185" textAnchor="middle" fill="white" className="text-sm font-bold">ŷ</text>
                <text x="480" y="220" textAnchor="middle" fill="#94a3b8" className="text-sm font-bold">{y.toFixed(3)}</text>
              </g>

              {/* Labels */}
              <text x="70" y="50" textAnchor="middle" fill="#64748b" className="text-xs">INPUTS</text>
              <text x="250" y="50" textAnchor="middle" fill="#64748b" className="text-xs">WEIGHTED SUM</text>
              <text x="380" y="50" textAnchor="middle" fill="#64748b" className="text-xs">ACTIVATION</text>
              <text x="480" y="50" textAnchor="middle" fill="#64748b" className="text-xs">OUTPUT</text>
            </svg>

            {/* Tooltip */}
            {hoveredElement && tooltips[hoveredElement] && (
              <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-blue-400" />
                  <span className="font-semibold">{tooltips[hoveredElement].title}</span>
                </div>
                <p className="text-sm text-slate-300">{tooltips[hoveredElement].desc}</p>
              </div>
            )}
          </div>

          {/* Right: Controls & Calculations */}
          <div className="space-y-6">
            {/* Parameter Controls */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Parameters</h2>

              <div className="space-y-4">
                {/* Input x1 */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm text-slate-400">Input x₁</label>
                    <span className="text-sm font-mono">{x1.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={x1}
                    onChange={(e) => setX1(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Input x2 */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm text-slate-400">Input x₂</label>
                    <span className="text-sm font-mono">{x2.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={x2}
                    onChange={(e) => setX2(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="border-t border-slate-700 my-4" />

                {/* Weight w1 */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm text-slate-400">Weight w₁</label>
                    <span className={`text-sm font-mono ${w1 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {w1.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.01"
                    value={w1}
                    onChange={(e) => setW1(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                {/* Weight w2 */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm text-slate-400">Weight w₂</label>
                    <span className={`text-sm font-mono ${w2 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {w2.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.01"
                    value={w2}
                    onChange={(e) => setW2(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>

                {/* Bias */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm text-slate-400">Bias b</label>
                    <span className={`text-sm font-mono ${bias >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bias.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.01"
                    value={bias}
                    onChange={(e) => setBias(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Computation Breakdown */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Computation</h2>

              <div className="space-y-3 font-mono text-sm">
                {/* Weighted sum */}
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-slate-400 mb-1">Step 1: Weighted Sum</div>
                  <div className="text-blue-300">
                    z = x₁·w₁ + x₂·w₂ + b
                  </div>
                  <div className="text-slate-300 mt-1">
                    z = ({x1.toFixed(2)})({w1.toFixed(2)}) + ({x2.toFixed(2)})({w2.toFixed(2)}) + ({bias.toFixed(2)})
                  </div>
                  <div className="text-white font-bold mt-1">
                    z = {(x1 * w1).toFixed(3)} + {(x2 * w2).toFixed(3)} + {bias.toFixed(3)} = {z.toFixed(3)}
                  </div>
                </div>

                {/* Activation */}
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-slate-400 mb-1">Step 2: Activation Function</div>
                  <div style={{ color: activationFunctions[activation].color }}>
                    {activationFunctions[activation].formula}
                  </div>
                  <div className="text-slate-300 mt-1">
                    ŷ = {activationFunctions[activation].name}({z.toFixed(3)})
                  </div>
                  <div className="text-white font-bold mt-1">
                    ŷ = {y.toFixed(4)}
                  </div>
                </div>

                {/* Output info */}
                <div className="p-3 bg-slate-700/50 rounded-lg border-l-4" style={{ borderColor: activationFunctions[activation].color }}>
                  <div className="text-slate-400 text-xs">Output Range: {activationFunctions[activation].range}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-slate-300">Final Output:</span>
                    <span className="text-2xl font-bold" style={{ color: activationFunctions[activation].color }}>
                      {y.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activation Function Graph */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Activation Function: {activationFunctions[activation].name}</h2>

              <svg viewBox="0 0 300 150" className="w-full">
                {/* Grid */}
                <line x1="30" y1="75" x2="270" y2="75" stroke="#334155" strokeWidth="1" />
                <line x1="150" y1="10" x2="150" y2="140" stroke="#334155" strokeWidth="1" />

                {/* Axis labels */}
                <text x="280" y="80" fill="#64748b" className="text-xs">z</text>
                <text x="155" y="15" fill="#64748b" className="text-xs">f(z)</text>

                {/* Function curve */}
                <path
                  d={curvePoints
                    .map((p, i) => {
                      const svgX = 150 + p.x * 24;
                      const svgY = 75 - p.y * 50;
                      return `${i === 0 ? 'M' : 'L'} ${svgX} ${Math.max(10, Math.min(140, svgY))}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke={activationFunctions[activation].color}
                  strokeWidth="2"
                />

                {/* Current z marker */}
                <line
                  x1={150 + z * 24}
                  y1="10"
                  x2={150 + z * 24}
                  y2="140"
                  stroke="#64748b"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />

                {/* Current point */}
                <circle
                  cx={150 + z * 24}
                  cy={Math.max(10, Math.min(140, 75 - y * 50))}
                  r="6"
                  fill={activationFunctions[activation].color}
                  stroke="white"
                  strokeWidth="2"
                />

                {/* Labels */}
                <text x={150 + z * 24} y="148" textAnchor="middle" fill="#94a3b8" className="text-xs">
                  z={z.toFixed(2)}
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="mt-6 bg-slate-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Info size={18} className="text-blue-400" />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <div className="font-medium text-green-400 mb-1">Weights Control Sensitivity</div>
              <p className="text-slate-300">
                Larger |w| means the input has more influence. Positive weights are excitatory, negative weights are inhibitory.
              </p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <div className="font-medium text-amber-400 mb-1">Bias Shifts the Threshold</div>
              <p className="text-slate-300">
                The bias lets the neuron fire even when inputs are zero. It controls how "eager" the neuron is to activate.
              </p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <div className="font-medium text-purple-400 mb-1">Activation Adds Non-linearity</div>
              <p className="text-slate-300">
                Without activation functions, any number of layers would just be one linear transformation. Non-linearity enables learning complex patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuronAnatomyExplorer;
