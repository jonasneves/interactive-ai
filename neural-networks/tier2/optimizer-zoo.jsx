import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, GitBranch, Zap, Target, Keyboard } from 'lucide-react';

const OptimizerZoo = () => {
  // Beale's function - a classic optimization test function with interesting saddle points
  // f(x,y) = (1.5 - x + xy)² + (2.25 - x + xy²)² + (2.625 - x + xy³)²
  // Minimum at (3, 0.5)

  const beale = (x, y) => {
    return Math.pow(1.5 - x + x*y, 2) +
           Math.pow(2.25 - x + x*y*y, 2) +
           Math.pow(2.625 - x + x*y*y*y, 2);
  };

  const bealeGrad = (x, y) => {
    const term1 = 1.5 - x + x*y;
    const term2 = 2.25 - x + x*y*y;
    const term3 = 2.625 - x + x*y*y*y;

    const dx = 2*term1*(-1 + y) + 2*term2*(-1 + y*y) + 2*term3*(-1 + y*y*y);
    const dy = 2*term1*x + 2*term2*2*x*y + 2*term3*3*x*y*y;

    return { dx, dy };
  };

  const START = { x: -1, y: 1 };
  const OPTIMAL = { x: 3, y: 0.5 };

  // Optimizer states
  const [sgd, setSgd] = useState({ x: START.x, y: START.y });
  const [momentum, setMomentum] = useState({ x: START.x, y: START.y, vx: 0, vy: 0 });
  const [rmsprop, setRmsprop] = useState({ x: START.x, y: START.y, sx: 0, sy: 0 });
  const [adam, setAdam] = useState({ x: START.x, y: START.y, mx: 0, my: 0, vx: 0, vy: 0, t: 0 });

  // Histories
  const [histories, setHistories] = useState({
    sgd: [{ x: START.x, y: START.y }],
    momentum: [{ x: START.x, y: START.y }],
    rmsprop: [{ x: START.x, y: START.y }],
    adam: [{ x: START.x, y: START.y }],
  });

  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(100);
  const [learningRate, setLearningRate] = useState(0.01);
  const [selectedOptimizer, setSelectedOptimizer] = useState('all');

  // Hyperparameters
  const beta1 = 0.9;  // Momentum coefficient
  const beta2 = 0.999; // RMSprop/Adam second moment
  const epsilon = 1e-8;

  const takeStep = useCallback(() => {
    // SGD
    setSgd(prev => {
      const { dx, dy } = bealeGrad(prev.x, prev.y);
      const newPos = { x: prev.x - learningRate * dx, y: prev.y - learningRate * dy };
      setHistories(h => ({ ...h, sgd: [...h.sgd.slice(-200), newPos] }));
      return newPos;
    });

    // Momentum
    setMomentum(prev => {
      const { dx, dy } = bealeGrad(prev.x, prev.y);
      const vx = beta1 * prev.vx - learningRate * dx;
      const vy = beta1 * prev.vy - learningRate * dy;
      const newPos = { x: prev.x + vx, y: prev.y + vy, vx, vy };
      setHistories(h => ({ ...h, momentum: [...h.momentum.slice(-200), { x: newPos.x, y: newPos.y }] }));
      return newPos;
    });

    // RMSprop
    setRmsprop(prev => {
      const { dx, dy } = bealeGrad(prev.x, prev.y);
      const sx = beta2 * prev.sx + (1 - beta2) * dx * dx;
      const sy = beta2 * prev.sy + (1 - beta2) * dy * dy;
      const newX = prev.x - learningRate * dx / (Math.sqrt(sx) + epsilon);
      const newY = prev.y - learningRate * dy / (Math.sqrt(sy) + epsilon);
      const newPos = { x: newX, y: newY, sx, sy };
      setHistories(h => ({ ...h, rmsprop: [...h.rmsprop.slice(-200), { x: newX, y: newY }] }));
      return newPos;
    });

    // Adam
    setAdam(prev => {
      const t = prev.t + 1;
      const { dx, dy } = bealeGrad(prev.x, prev.y);

      // First moment (momentum)
      const mx = beta1 * prev.mx + (1 - beta1) * dx;
      const my = beta1 * prev.my + (1 - beta1) * dy;

      // Second moment (RMSprop)
      const vx = beta2 * prev.vx + (1 - beta2) * dx * dx;
      const vy = beta2 * prev.vy + (1 - beta2) * dy * dy;

      // Bias correction
      const mxHat = mx / (1 - Math.pow(beta1, t));
      const myHat = my / (1 - Math.pow(beta1, t));
      const vxHat = vx / (1 - Math.pow(beta2, t));
      const vyHat = vy / (1 - Math.pow(beta2, t));

      const newX = prev.x - learningRate * mxHat / (Math.sqrt(vxHat) + epsilon);
      const newY = prev.y - learningRate * myHat / (Math.sqrt(vyHat) + epsilon);

      const newPos = { x: newX, y: newY, mx, my, vx, vy, t };
      setHistories(h => ({ ...h, adam: [...h.adam.slice(-200), { x: newX, y: newY }] }));
      return newPos;
    });

    setStep(s => s + 1);
  }, [learningRate]);

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
      } else if (e.key >= '1' && e.key <= '4') {
        const opts = ['sgd', 'momentum', 'rmsprop', 'adam'];
        setSelectedOptimizer(opts[parseInt(e.key) - 1]);
      } else if (e.key === '0') {
        setSelectedOptimizer('all');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [takeStep]);

  const reset = () => {
    setSgd({ x: START.x, y: START.y });
    setMomentum({ x: START.x, y: START.y, vx: 0, vy: 0 });
    setRmsprop({ x: START.x, y: START.y, sx: 0, sy: 0 });
    setAdam({ x: START.x, y: START.y, mx: 0, my: 0, vx: 0, vy: 0, t: 0 });
    setHistories({
      sgd: [{ x: START.x, y: START.y }],
      momentum: [{ x: START.x, y: START.y }],
      rmsprop: [{ x: START.x, y: START.y }],
      adam: [{ x: START.x, y: START.y }],
    });
    setStep(0);
    setIsRunning(false);
  };

  // Current losses
  const losses = useMemo(() => ({
    sgd: beale(sgd.x, sgd.y),
    momentum: beale(momentum.x, momentum.y),
    rmsprop: beale(rmsprop.x, rmsprop.y),
    adam: beale(adam.x, adam.y),
  }), [sgd, momentum, rmsprop, adam]);

  const optimizers = [
    { id: 'sgd', name: 'SGD', color: '#64748b', pos: sgd, history: histories.sgd },
    { id: 'momentum', name: 'Momentum', color: '#3b82f6', pos: momentum, history: histories.momentum },
    { id: 'rmsprop', name: 'RMSprop', color: '#22c55e', pos: rmsprop, history: histories.rmsprop },
    { id: 'adam', name: 'Adam', color: '#a855f7', pos: adam, history: histories.adam },
  ];

  // Scale for visualization
  const xScale = (x) => 50 + (x + 2) * 70;
  const yScale = (y) => 250 - (y + 1) * 100;

  // Generate contour data
  const contours = useMemo(() => {
    const levels = [0.1, 0.5, 1, 2, 5, 10, 20, 50, 100];
    return levels;
  }, []);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Optimizer Zoo</h1>
        <p className="text-slate-400 mb-6">Compare SGD, Momentum, RMSprop, and Adam on Beale's function</p>

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

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">LR:</span>
              <input
                type="range" min="0.001" max="0.05" step="0.001" value={learningRate}
                onChange={(e) => { setLearningRate(parseFloat(e.target.value)); reset(); }}
                className="w-24"
              />
              <span className="font-mono text-sm w-14">{learningRate.toFixed(3)}</span>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <span className="text-slate-400">Step:</span>
              <span className="font-mono text-blue-400">{step}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
            <Keyboard size={14} />
            <span>Space run/pause • S step • 0 show all • 1-4 select optimizer</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Contour visualization */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target size={18} className="text-green-400" />
              Optimization Landscape (Beale's Function)
            </h3>

            <svg viewBox="0 0 450 300" className="w-full h-80">
              {/* Background gradient to simulate contours */}
              <defs>
                <radialGradient id="contourGrad" cx="75%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                  <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.1" />
                </radialGradient>
              </defs>
              <rect width="450" height="300" fill="url(#contourGrad)" />

              {/* Grid */}
              <defs>
                <pattern id="optGrid" width="35" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 35 0 L 0 0 0 25" fill="none" stroke="#334155" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="450" height="300" fill="url(#optGrid)" />

              {/* Approximate contour lines */}
              {[0.5, 1, 2, 5, 10, 20, 50].map((level, i) => (
                <ellipse
                  key={level}
                  cx={xScale(OPTIMAL.x)}
                  cy={yScale(OPTIMAL.y)}
                  rx={15 + i * 25}
                  ry={10 + i * 18}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                  transform={`rotate(-15, ${xScale(OPTIMAL.x)}, ${yScale(OPTIMAL.y)})`}
                />
              ))}

              {/* Start point */}
              <circle cx={xScale(START.x)} cy={yScale(START.y)} r="8" fill="#ef4444" opacity="0.3" />
              <text x={xScale(START.x) + 12} y={yScale(START.y) + 4} fill="#ef4444" fontSize="10">start</text>

              {/* Optimal point */}
              <circle cx={xScale(OPTIMAL.x)} cy={yScale(OPTIMAL.y)} r="10" fill="#22c55e" opacity="0.3" />
              <circle cx={xScale(OPTIMAL.x)} cy={yScale(OPTIMAL.y)} r="5" fill="#22c55e" />
              <text x={xScale(OPTIMAL.x) + 12} y={yScale(OPTIMAL.y) + 4} fill="#22c55e" fontSize="10">min</text>

              {/* Optimizer paths and positions */}
              {optimizers.map((opt) => (
                <g key={opt.id} opacity={selectedOptimizer === 'all' || selectedOptimizer === opt.id ? 1 : 0.1}>
                  {/* Trail */}
                  <path
                    d={opt.history.map((p, i) =>
                      `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`
                    ).join(' ')}
                    fill="none"
                    stroke={opt.color}
                    strokeWidth="2"
                    opacity="0.7"
                  />
                  {/* Current position */}
                  <circle
                    cx={xScale(opt.pos.x)}
                    cy={yScale(opt.pos.y)}
                    r="7"
                    fill={opt.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              ))}

              {/* Axis labels */}
              <text x="420" y="290" fill="#64748b" fontSize="12">x</text>
              <text x="30" y="20" fill="#64748b" fontSize="12">y</text>
            </svg>

            {/* Optimizer selector */}
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <button
                onClick={() => setSelectedOptimizer('all')}
                className={`px-3 py-1 rounded text-sm ${selectedOptimizer === 'all' ? 'bg-slate-600 ring-1 ring-white' : 'bg-slate-700'}`}
              >
                All
              </button>
              {optimizers.map((opt, i) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOptimizer(opt.id)}
                  className={`px-3 py-1 rounded text-sm flex items-center gap-2 transition-all ${
                    selectedOptimizer === opt.id ? 'ring-2 scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: opt.color + '30',
                    ringColor: opt.color,
                  }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }} />
                  {opt.name}
                  <span className="text-xs text-slate-400">[{i + 1}]</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Stats and explanations */}
          <div className="space-y-4">
            {/* Current losses */}
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3 text-sm">Loss Values</h3>
              <div className="space-y-2">
                {optimizers.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }} />
                    <span className="flex-1">{opt.name}</span>
                    <span className="font-mono" style={{ color: opt.color }}>
                      {losses[opt.id] < 1000 ? losses[opt.id].toFixed(2) : '∞'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimizer explanations */}
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                <GitBranch size={16} className="text-purple-400" />
                Algorithm Details
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-2 rounded" style={{ backgroundColor: '#64748b20' }}>
                  <div className="font-semibold text-slate-400">SGD</div>
                  <div className="font-mono mt-1">θ ← θ - α∇L</div>
                  <div className="text-slate-500 mt-1">Simple but can be slow in ravines</div>
                </div>

                <div className="p-2 rounded" style={{ backgroundColor: '#3b82f620' }}>
                  <div className="font-semibold text-blue-400">Momentum</div>
                  <div className="font-mono mt-1">v ← βv - α∇L</div>
                  <div className="font-mono">θ ← θ + v</div>
                  <div className="text-slate-500 mt-1">Accumulates velocity, escapes local minima</div>
                </div>

                <div className="p-2 rounded" style={{ backgroundColor: '#22c55e20' }}>
                  <div className="font-semibold text-green-400">RMSprop</div>
                  <div className="font-mono mt-1">s ← β₂s + (1-β₂)g²</div>
                  <div className="font-mono">θ ← θ - α·g/√s</div>
                  <div className="text-slate-500 mt-1">Adapts LR per parameter</div>
                </div>

                <div className="p-2 rounded" style={{ backgroundColor: '#a855f720' }}>
                  <div className="font-semibold text-purple-400">Adam</div>
                  <div className="font-mono mt-1">m ← β₁m + (1-β₁)g</div>
                  <div className="font-mono">v ← β₂v + (1-β₂)g²</div>
                  <div className="text-slate-500 mt-1">Best of both: momentum + adaptive LR</div>
                </div>
              </div>
            </div>

            {/* Key insight */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/30">
              <h3 className="font-semibold mb-2 text-purple-300 text-sm">💡 Why Adam Wins</h3>
              <p className="text-xs text-slate-300">
                Adam combines momentum (first moment) with adaptive learning rates (second moment),
                plus bias correction for early steps. This makes it robust to hyperparameter choices
                and effective on most problems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizerZoo;
