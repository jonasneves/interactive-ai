import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, TrendingDown, Keyboard } from 'lucide-react';

const LearningRateLab = () => {
  // Learning rate scenarios
  const [learningRate, setLearningRate] = useState(0.1);
  const [position, setPosition] = useState(4); // Start far from minimum
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([4]);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(300);

  // The loss function: simple quadratic L(x) = x²
  // Gradient: dL/dx = 2x
  // Optimal: x = 0

  const loss = (x) => x * x;
  const gradient = (x) => 2 * x;

  // Compute current loss and gradient
  const currentLoss = useMemo(() => loss(position), [position]);
  const currentGradient = useMemo(() => gradient(position), [position]);

  // Take a gradient descent step
  const takeStep = useCallback(() => {
    setPosition(prev => {
      const grad = gradient(prev);
      const newPos = prev - learningRate * grad;

      // Clamp to prevent explosion beyond view
      const clamped = Math.max(-10, Math.min(10, newPos));
      setHistory(h => [...h.slice(-50), clamped]);
      return clamped;
    });
    setStep(s => s + 1);
  }, [learningRate]);

  // Auto-run
  useEffect(() => {
    if (isRunning && Math.abs(position) > 0.0001) {
      const timer = setTimeout(takeStep, speed);
      return () => clearTimeout(timer);
    } else if (Math.abs(position) <= 0.0001) {
      setIsRunning(false);
    }
  }, [isRunning, takeStep, speed, position]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setLearningRate(lr => Math.max(0.01, lr - (e.shiftKey ? 0.1 : 0.01)));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setLearningRate(lr => Math.min(1.5, lr + (e.shiftKey ? 0.1 : 0.01)));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsRunning(r => !r);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const reset = () => {
    setPosition(4);
    setHistory([4]);
    setStep(0);
    setIsRunning(false);
  };

  // Determine behavior category
  const behavior = useMemo(() => {
    if (learningRate < 0.1) return { type: 'slow', color: '#3b82f6', label: 'Too Slow' };
    if (learningRate <= 0.5) return { type: 'good', color: '#22c55e', label: 'Good Range' };
    if (learningRate <= 0.9) return { type: 'fast', color: '#eab308', label: 'Fast/Oscillating' };
    return { type: 'diverge', color: '#ef4444', label: 'Diverging!' };
  }, [learningRate]);

  // Generate loss curve points for visualization
  const curvePoints = useMemo(() => {
    const points = [];
    for (let x = -5; x <= 5; x += 0.1) {
      points.push({ x, y: loss(x) });
    }
    return points;
  }, []);

  // Scale for SVG
  const xScale = (x) => 200 + x * 35;
  const yScale = (y) => 180 - y * 6;

  // Preset learning rates
  const presets = [
    { lr: 0.01, label: 'Very Small', desc: 'Slow but stable' },
    { lr: 0.1, label: 'Small', desc: 'Good starting point' },
    { lr: 0.5, label: 'Medium', desc: 'Fast convergence' },
    { lr: 0.9, label: 'Large', desc: 'Oscillates around minimum' },
    { lr: 1.1, label: 'Too Large', desc: 'Diverges!' },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Learning Rate Lab</h1>
        <p className="text-slate-400 mb-6">Explore how learning rate affects gradient descent convergence</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Visualization */}
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
                  onClick={takeStep}
                  disabled={isRunning}
                  className="px-4 py-2 bg-blue-600 rounded-lg disabled:opacity-50"
                >
                  Step
                </button>
                <button onClick={reset} className="px-4 py-2 bg-slate-700 rounded-lg">
                  <RotateCcw size={16} />
                </button>

                <div className="ml-auto text-sm">
                  <span className="text-slate-400">Step:</span>
                  <span className="font-mono text-blue-400 ml-2">{step}</span>
                </div>
              </div>

              {/* Learning rate slider */}
              <div className="p-3 rounded-lg bg-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300">Learning Rate (α)</span>
                  <span className="font-mono text-lg" style={{ color: behavior.color }}>
                    {learningRate.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1.5"
                  step="0.01"
                  value={learningRate}
                  onChange={(e) => { setLearningRate(parseFloat(e.target.value)); reset(); }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0.01</span>
                  <span style={{ color: behavior.color }}>{behavior.label}</span>
                  <span>1.5</span>
                </div>
              </div>

              {/* Keyboard hint */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                <Keyboard size={14} />
                <span>←→ adjust LR • Space to run/pause • Shift for larger steps</span>
              </div>
            </div>

            {/* Loss curve visualization */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Loss Landscape: L(x) = x²</h3>
              <svg viewBox="0 0 400 200" className="w-full h-64">
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="35" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 35 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="400" height="200" fill="url(#grid)" />

                {/* Axes */}
                <line x1="20" y1="180" x2="380" y2="180" stroke="#64748b" strokeWidth="1"/>
                <line x1="200" y1="10" x2="200" y2="190" stroke="#64748b" strokeWidth="1"/>

                {/* Loss curve */}
                <path
                  d={curvePoints.map((p, i) =>
                    `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />

                {/* Minimum marker */}
                <circle cx={xScale(0)} cy={yScale(0)} r="6" fill="#22c55e" opacity="0.5"/>
                <text x={xScale(0)} y={yScale(0) + 20} textAnchor="middle" fill="#22c55e" fontSize="10">
                  minimum
                </text>

                {/* History trail */}
                {history.slice(-20).map((x, i, arr) => (
                  <circle
                    key={i}
                    cx={xScale(x)}
                    cy={yScale(loss(x))}
                    r={2 + i * 0.2}
                    fill={behavior.color}
                    opacity={0.3 + i / arr.length * 0.7}
                  />
                ))}

                {/* Current position */}
                <circle
                  cx={xScale(position)}
                  cy={yScale(currentLoss)}
                  r="8"
                  fill={behavior.color}
                  stroke="white"
                  strokeWidth="2"
                />

                {/* Gradient arrow */}
                {Math.abs(currentGradient) > 0.01 && (
                  <g>
                    <line
                      x1={xScale(position)}
                      y1={yScale(currentLoss)}
                      x2={xScale(position - Math.sign(currentGradient) * 1.5)}
                      y2={yScale(currentLoss)}
                      stroke="#f59e0b"
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                    />
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
                      </marker>
                    </defs>
                  </g>
                )}

                {/* Labels */}
                <text x="380" y="195" fill="#64748b" fontSize="10">x</text>
                <text x="205" y="15" fill="#64748b" fontSize="10">L(x)</text>
              </svg>

              {/* Current values */}
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div className="p-2 bg-slate-700/50 rounded">
                  <div className="text-xs text-slate-400">Position (x)</div>
                  <div className="font-mono text-lg">{position.toFixed(3)}</div>
                </div>
                <div className="p-2 bg-slate-700/50 rounded">
                  <div className="text-xs text-slate-400">Loss L(x)</div>
                  <div className="font-mono text-lg text-blue-400">{currentLoss.toFixed(3)}</div>
                </div>
                <div className="p-2 bg-slate-700/50 rounded">
                  <div className="text-xs text-slate-400">Gradient</div>
                  <div className="font-mono text-lg text-yellow-400">{currentGradient.toFixed(3)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Explanation and presets */}
          <div className="space-y-6">
            {/* Update rule */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingDown size={18} className="text-blue-400" />
                Gradient Descent Update
              </h3>

              <div className="bg-slate-900 p-4 rounded-lg font-mono text-center mb-4">
                <span className="text-slate-400">x</span>
                <span className="text-white mx-2">←</span>
                <span className="text-slate-400">x</span>
                <span className="text-white mx-2">-</span>
                <span style={{ color: behavior.color }}>{learningRate.toFixed(2)}</span>
                <span className="text-white mx-2">×</span>
                <span className="text-yellow-400">{currentGradient.toFixed(2)}</span>
              </div>

              <div className="text-sm text-slate-300 space-y-2">
                <p>The <strong className="text-white">learning rate α</strong> controls how big each step is.</p>
                <p>Step size = α × gradient = <span className="font-mono" style={{ color: behavior.color }}>
                  {(learningRate * Math.abs(currentGradient)).toFixed(3)}
                </span></p>
              </div>
            </div>

            {/* Presets */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Try These Learning Rates</h3>
              <div className="space-y-2">
                {presets.map((preset) => (
                  <button
                    key={preset.lr}
                    onClick={() => { setLearningRate(preset.lr); reset(); }}
                    className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                      Math.abs(learningRate - preset.lr) < 0.01
                        ? 'bg-blue-600 ring-2 ring-blue-400'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <div>
                      <span className="font-semibold">{preset.label}</span>
                      <span className="text-slate-400 text-sm ml-2">α = {preset.lr}</span>
                    </div>
                    <span className="text-sm text-slate-300">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Behavior explanation */}
            <div
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: behavior.color + '15',
                borderColor: behavior.color + '40'
              }}
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: behavior.color }}>
                {behavior.type === 'diverge' && <AlertTriangle size={18} />}
                {behavior.type === 'good' && <Zap size={18} />}
                Current Behavior: {behavior.label}
              </h3>

              <p className="text-sm text-slate-300">
                {behavior.type === 'slow' && (
                  "With a very small learning rate, convergence is slow but stable. Each step is tiny, requiring many iterations to reach the minimum."
                )}
                {behavior.type === 'good' && (
                  "This is a good learning rate range! Steps are large enough for quick convergence, but small enough to avoid overshooting."
                )}
                {behavior.type === 'fast' && (
                  "With a large learning rate, the optimizer oscillates around the minimum. It may still converge but wastes steps bouncing back and forth."
                )}
                {behavior.type === 'diverge' && (
                  "Learning rate is too high! Each step overshoots so badly that we move further from the minimum. The loss explodes instead of decreasing."
                )}
              </p>
            </div>

            {/* Key insight */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/30">
              <h3 className="font-semibold mb-3 text-blue-300">💡 Key Insight</h3>
              <p className="text-sm text-slate-300">
                For a quadratic loss function L(x) = x², convergence is guaranteed when α &lt; 1
                (since the Hessian is 2). At α = 1, we get perfect one-step convergence.
                Above α = 1, the updates overshoot and diverge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningRateLab;
