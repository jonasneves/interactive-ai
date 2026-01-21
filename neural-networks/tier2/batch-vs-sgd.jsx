import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Layers, Shuffle, Target, Keyboard } from 'lucide-react';

const BatchVsSGD = () => {
  const NUM_POINTS = 30;
  const TRUE_SLOPE = 2;
  const TRUE_INTERCEPT = 1;

  // Generate noisy data points
  const [dataPoints] = useState(() => {
    const points = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      const x = (i / NUM_POINTS) * 4 - 2; // x in [-2, 2]
      const noise = (Math.random() - 0.5) * 2;
      const y = TRUE_SLOPE * x + TRUE_INTERCEPT + noise;
      points.push({ x, y });
    }
    return points;
  });

  // Parameters for each method
  const [batchParams, setBatchParams] = useState({ w: 0, b: 0 });
  const [sgdParams, setSgdParams] = useState({ w: 0, b: 0 });
  const [miniBatchParams, setMiniBatchParams] = useState({ w: 0, b: 0 });

  // History for trajectories
  const [batchHistory, setBatchHistory] = useState([{ w: 0, b: 0 }]);
  const [sgdHistory, setSgdHistory] = useState([{ w: 0, b: 0 }]);
  const [miniBatchHistory, setMiniBatchHistory] = useState([{ w: 0, b: 0 }]);

  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [learningRate, setLearningRate] = useState(0.05);
  const [batchSize, setBatchSize] = useState(8);
  const [selectedMethod, setSelectedMethod] = useState('all');

  // Compute loss for given parameters
  const computeLoss = useCallback((w, b, points = dataPoints) => {
    return points.reduce((sum, p) => {
      const pred = w * p.x + b;
      return sum + (pred - p.y) ** 2;
    }, 0) / points.length;
  }, [dataPoints]);

  // Compute gradients
  const computeGradients = useCallback((w, b, points) => {
    let dw = 0, db = 0;
    points.forEach(p => {
      const pred = w * p.x + b;
      const error = pred - p.y;
      dw += 2 * error * p.x;
      db += 2 * error;
    });
    return { dw: dw / points.length, db: db / points.length };
  }, []);

  // Take one step for all methods
  const takeStep = useCallback(() => {
    // Batch gradient descent (use all points)
    setBatchParams(prev => {
      const { dw, db } = computeGradients(prev.w, prev.b, dataPoints);
      const newParams = { w: prev.w - learningRate * dw, b: prev.b - learningRate * db };
      setBatchHistory(h => [...h.slice(-100), newParams]);
      return newParams;
    });

    // SGD (use single random point)
    setSgdParams(prev => {
      const point = dataPoints[Math.floor(Math.random() * NUM_POINTS)];
      const { dw, db } = computeGradients(prev.w, prev.b, [point]);
      const newParams = { w: prev.w - learningRate * dw, b: prev.b - learningRate * db };
      setSgdHistory(h => [...h.slice(-100), newParams]);
      return newParams;
    });

    // Mini-batch (use batchSize random points)
    setMiniBatchParams(prev => {
      const shuffled = [...dataPoints].sort(() => Math.random() - 0.5);
      const batch = shuffled.slice(0, batchSize);
      const { dw, db } = computeGradients(prev.w, prev.b, batch);
      const newParams = { w: prev.w - learningRate * dw, b: prev.b - learningRate * db };
      setMiniBatchHistory(h => [...h.slice(-100), newParams]);
      return newParams;
    });

    setStep(s => s + 1);
  }, [dataPoints, learningRate, batchSize, computeGradients]);

  // Auto-run
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(takeStep, speed);
      return () => clearTimeout(timer);
    }
  }, [isRunning, takeStep, speed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsRunning(r => !r);
      } else if (e.key === 's') {
        takeStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [takeStep]);

  const reset = () => {
    setBatchParams({ w: 0, b: 0 });
    setSgdParams({ w: 0, b: 0 });
    setMiniBatchParams({ w: 0, b: 0 });
    setBatchHistory([{ w: 0, b: 0 }]);
    setSgdHistory([{ w: 0, b: 0 }]);
    setMiniBatchHistory([{ w: 0, b: 0 }]);
    setStep(0);
    setIsRunning(false);
  };

  // Current losses
  const losses = useMemo(() => ({
    batch: computeLoss(batchParams.w, batchParams.b),
    sgd: computeLoss(sgdParams.w, sgdParams.b),
    miniBatch: computeLoss(miniBatchParams.w, miniBatchParams.b),
  }), [batchParams, sgdParams, miniBatchParams, computeLoss]);

  // Scale for SVG
  const xScale = (x) => 200 + x * 70;
  const yScale = (y) => 150 - y * 30;
  const wScale = (w) => 150 + w * 50;
  const bScale = (b) => 150 - b * 50;

  const methods = [
    { id: 'batch', name: 'Batch GD', color: '#3b82f6', params: batchParams, history: batchHistory },
    { id: 'sgd', name: 'SGD', color: '#ef4444', params: sgdParams, history: sgdHistory },
    { id: 'miniBatch', name: 'Mini-Batch', color: '#22c55e', params: miniBatchParams, history: miniBatchHistory },
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Batch vs SGD Visualizer</h1>
        <p className="text-slate-400 mb-6">Compare gradient descent variants on linear regression</p>

        {/* Controls */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isRunning ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pause' : 'Run All'}
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

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">LR:</span>
              <input
                type="range" min="0.01" max="0.2" step="0.01" value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="font-mono text-sm w-12">{learningRate.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Batch:</span>
              <input
                type="range" min="2" max="16" step="2" value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="font-mono text-sm w-8">{batchSize}</span>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <span className="text-slate-400">Step:</span>
              <span className="font-mono text-blue-400">{step}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
            <Keyboard size={14} />
            <span>Space to run/pause • S to step</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Data and regression lines */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target size={18} className="text-blue-400" />
              Regression Fit
            </h3>

            <svg viewBox="0 0 400 300" className="w-full h-72">
              {/* Grid */}
              <defs>
                <pattern id="regGrid" width="35" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 35 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="400" height="300" fill="url(#regGrid)" />

              {/* Axes */}
              <line x1="200" y1="10" x2="200" y2="290" stroke="#64748b" strokeWidth="1"/>
              <line x1="10" y1="150" x2="390" y2="150" stroke="#64748b" strokeWidth="1"/>

              {/* True line */}
              <line
                x1={xScale(-2.5)}
                y1={yScale(TRUE_SLOPE * -2.5 + TRUE_INTERCEPT)}
                x2={xScale(2.5)}
                y2={yScale(TRUE_SLOPE * 2.5 + TRUE_INTERCEPT)}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="4,4"
              />

              {/* Data points */}
              {dataPoints.map((p, i) => (
                <circle key={i} cx={xScale(p.x)} cy={yScale(p.y)} r="4" fill="#64748b" />
              ))}

              {/* Fitted lines */}
              {methods.map((method) => (
                <line
                  key={method.id}
                  x1={xScale(-2.5)}
                  y1={yScale(method.params.w * -2.5 + method.params.b)}
                  x2={xScale(2.5)}
                  y2={yScale(method.params.w * 2.5 + method.params.b)}
                  stroke={method.color}
                  strokeWidth="2"
                  opacity={selectedMethod === 'all' || selectedMethod === method.id ? 1 : 0.2}
                />
              ))}
            </svg>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setSelectedMethod('all')}
                className={`px-3 py-1 rounded text-sm ${selectedMethod === 'all' ? 'bg-slate-600' : 'bg-slate-700'}`}
              >
                Show All
              </button>
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
                    selectedMethod === method.id ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: method.color + '30',
                    borderColor: method.color,
                  }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                  {method.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Parameter space trajectory */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Layers size={18} className="text-purple-400" />
              Parameter Space Trajectory
            </h3>

            <svg viewBox="0 0 300 300" className="w-full h-72">
              {/* Grid */}
              <defs>
                <pattern id="paramGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="300" height="300" fill="url(#paramGrid)" />

              {/* Axes */}
              <line x1="150" y1="10" x2="150" y2="290" stroke="#64748b" strokeWidth="1"/>
              <line x1="10" y1="150" x2="290" y2="150" stroke="#64748b" strokeWidth="1"/>
              <text x="280" y="145" fill="#64748b" fontSize="12">w</text>
              <text x="155" y="25" fill="#64748b" fontSize="12">b</text>

              {/* Optimal point */}
              <circle cx={wScale(TRUE_SLOPE)} cy={bScale(TRUE_INTERCEPT)} r="8" fill="#22c55e" opacity="0.3" />
              <circle cx={wScale(TRUE_SLOPE)} cy={bScale(TRUE_INTERCEPT)} r="4" fill="#22c55e" />

              {/* Trajectories */}
              {methods.map((method) => (
                <g key={method.id} opacity={selectedMethod === 'all' || selectedMethod === method.id ? 1 : 0.1}>
                  {/* Path */}
                  <path
                    d={method.history.map((p, i) =>
                      `${i === 0 ? 'M' : 'L'} ${wScale(p.w)} ${bScale(p.b)}`
                    ).join(' ')}
                    fill="none"
                    stroke={method.color}
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                  {/* Current position */}
                  <circle
                    cx={wScale(method.params.w)}
                    cy={bScale(method.params.b)}
                    r="6"
                    fill={method.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </svg>

            {/* Parameter values */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="p-2 rounded text-center"
                  style={{ backgroundColor: method.color + '20' }}
                >
                  <div style={{ color: method.color }}>{method.name}</div>
                  <div className="font-mono mt-1">w={method.params.w.toFixed(2)}</div>
                  <div className="font-mono">b={method.params.b.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Loss comparison and explanation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Loss comparison */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Current Loss (MSE)</h3>
            <div className="space-y-3">
              {methods.map((method) => (
                <div key={method.id} className="flex items-center gap-3">
                  <span className="w-24 text-sm" style={{ color: method.color }}>{method.name}</span>
                  <div className="flex-1 h-4 bg-slate-700 rounded overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, 100 - losses[method.id] * 10))}%`,
                        backgroundColor: method.color
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm w-16">{losses[method.id].toFixed(3)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-slate-700/50 rounded text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Optimal Loss:</span>
                <span className="font-mono text-green-400">~0.3</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-slate-400">True params:</span>
                <span className="font-mono">w=2.0, b=1.0</span>
              </div>
            </div>
          </div>

          {/* Method comparison */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/30">
            <h3 className="font-semibold mb-3 text-blue-300">💡 Method Comparison</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-blue-400">Batch GD:</strong> Uses all {NUM_POINTS} points per update. Smooth path but slow per step. Best for small datasets.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-red-400">SGD:</strong> Uses 1 random point per update. Noisy path but fast per step. May escape local minima.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-green-400">Mini-Batch:</strong> Uses {batchSize} points per update. Best of both worlds - commonly used in practice!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchVsSGD;
