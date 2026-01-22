import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Target, Mountain, Waves, Layers, ChevronDown } from 'lucide-react';

const LossLandscapeNavigator = () => {
  // View state
  const [viewMode, setViewMode] = useState('contour'); // 'contour' or '3d'
  const [landscape, setLandscape] = useState('convex');
  const [isRunning, setIsRunning] = useState(false);
  const [learningRate, setLearningRate] = useState(0.1);

  // Position and history
  const [position, setPosition] = useState({ w1: 3, w2: 3 });
  const [trajectory, setTrajectory] = useState([]);
  const [step, setStep] = useState(0);

  // 3D rotation
  const [rotation, setRotation] = useState({ x: 30, y: -30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Landscape definitions
  const landscapes = {
    convex: {
      name: 'Convex Bowl',
      icon: Target,
      description: 'Simple quadratic loss with guaranteed global minimum',
      fn: (w1, w2) => 0.5 * (w1 * w1 + w2 * w2),
      gradient: (w1, w2) => ({ dw1: w1, dw2: w2 }),
      minimum: { w1: 0, w2: 0 },
      minLoss: 0,
    },
    ravine: {
      name: 'Ravine',
      icon: Waves,
      description: 'Narrow valley — shows why momentum helps',
      fn: (w1, w2) => 0.5 * (0.1 * w1 * w1 + 10 * w2 * w2),
      gradient: (w1, w2) => ({ dw1: 0.1 * w1, dw2: 10 * w2 }),
      minimum: { w1: 0, w2: 0 },
      minLoss: 0,
    },
    saddle: {
      name: 'Saddle Point',
      icon: Layers,
      description: 'Flat region with mixed curvature — gradient ≈ 0 but not minimum',
      fn: (w1, w2) => w1 * w1 - w2 * w2,
      gradient: (w1, w2) => ({ dw1: 2 * w1, dw2: -2 * w2 }),
      minimum: { w1: 0, w2: null }, // saddle at origin
      minLoss: null,
    },
    multimodal: {
      name: 'Multiple Minima',
      icon: Mountain,
      description: 'Multiple local minima — starting point matters',
      fn: (w1, w2) => {
        const r = Math.sqrt(w1 * w1 + w2 * w2);
        return 1 - Math.cos(2 * Math.PI * r) + 0.1 * r * r;
      },
      gradient: (w1, w2) => {
        const r = Math.sqrt(w1 * w1 + w2 * w2) + 1e-8;
        const dr_dw1 = w1 / r;
        const dr_dw2 = w2 / r;
        const dL_dr = 2 * Math.PI * Math.sin(2 * Math.PI * r) + 0.2 * r;
        return { dw1: dL_dr * dr_dw1, dw2: dL_dr * dr_dw2 };
      },
      minimum: { w1: 0, w2: 0 },
      minLoss: 0,
    },
    rosenbrock: {
      name: 'Rosenbrock',
      icon: Mountain,
      description: 'Classic hard optimization benchmark — banana-shaped valley',
      fn: (w1, w2) => Math.pow(1 - w1, 2) + 100 * Math.pow(w2 - w1 * w1, 2),
      gradient: (w1, w2) => ({
        dw1: -2 * (1 - w1) - 400 * w1 * (w2 - w1 * w1),
        dw2: 200 * (w2 - w1 * w1),
      }),
      minimum: { w1: 1, w2: 1 },
      minLoss: 0,
    },
  };

  const currentLandscape = landscapes[landscape];
  const loss = currentLandscape.fn(position.w1, position.w2);
  const gradient = currentLandscape.gradient(position.w1, position.w2);
  const gradientMagnitude = Math.sqrt(gradient.dw1 ** 2 + gradient.dw2 ** 2);

  // Reset to new position
  const resetPosition = useCallback((newPos = { w1: 3, w2: 3 }) => {
    setIsRunning(false);
    setPosition(newPos);
    setTrajectory([newPos]);
    setStep(0);
  }, []);

  // Handle landscape change
  useEffect(() => {
    // Set appropriate starting position for each landscape
    const startPositions = {
      convex: { w1: 3, w2: 3 },
      ravine: { w1: 3, w2: 0.3 },
      saddle: { w1: 0.1, w2: 2 },
      multimodal: { w1: 2.5, w2: 2.5 },
      rosenbrock: { w1: -1.5, w2: 2 },
    };
    resetPosition(startPositions[landscape]);
  }, [landscape, resetPosition]);

  // Gradient descent step
  const gradientStep = useCallback(() => {
    setPosition((prev) => {
      const grad = currentLandscape.gradient(prev.w1, prev.w2);
      const newW1 = prev.w1 - learningRate * grad.dw1;
      const newW2 = prev.w2 - learningRate * grad.dw2;

      // Clamp to bounds
      const clamped = {
        w1: Math.max(-4, Math.min(4, newW1)),
        w2: Math.max(-4, Math.min(4, newW2)),
      };

      setTrajectory((traj) => [...traj, clamped]);
      setStep((s) => s + 1);

      return clamped;
    });
  }, [currentLandscape, learningRate]);

  // Animation loop
  useEffect(() => {
    if (isRunning) {
      animationRef.current = setInterval(gradientStep, 100);
    } else {
      clearInterval(animationRef.current);
    }
    return () => clearInterval(animationRef.current);
  }, [isRunning, gradientStep]);

  // Stop if converged
  useEffect(() => {
    if (gradientMagnitude < 0.01 && isRunning) {
      setIsRunning(false);
    }
  }, [gradientMagnitude, isRunning]);

  // Canvas click to set position
  const handleCanvasClick = (e) => {
    if (viewMode !== 'contour') return;
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 8 - 4;
    const y = 4 - ((e.clientY - rect.top) / rect.height) * 8;
    resetPosition({ w1: x, w2: y });
  };

  // 3D rotation drag
  const handleMouseDown = (e) => {
    if (viewMode === '3d') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && viewMode === '3d') {
      setRotation((prev) => ({
        x: Math.max(10, Math.min(80, prev.x + (e.clientY - dragStart.y) * 0.5)),
        y: prev.y + (e.clientX - dragStart.x) * 0.5,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Generate contour data
  const generateContours = () => {
    const contours = [];
    const levels = landscape === 'rosenbrock'
      ? [0.1, 1, 5, 20, 100, 500, 2000]
      : [0.5, 1, 2, 4, 8, 16, 32];

    for (let level of levels) {
      const paths = [];
      // Simple marching squares approximation
      const resolution = 50;
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const w1 = (i / resolution) * 8 - 4;
          const w2 = (j / resolution) * 8 - 4;
          const val = currentLandscape.fn(w1, w2);
          if (Math.abs(val - level) < level * 0.15) {
            paths.push({ x: w1, y: w2 });
          }
        }
      }
      contours.push({ level, paths });
    }
    return contours;
  };

  // Convert world coords to SVG
  const toSvg = (w1, w2) => ({
    x: ((w1 + 4) / 8) * 400,
    y: ((4 - w2) / 8) * 400,
  });

  // Color for loss value
  const lossToColor = (val) => {
    const maxVal = landscape === 'rosenbrock' ? 1000 : 20;
    const t = Math.min(1, val / maxVal);
    const r = Math.floor(255 * t);
    const g = Math.floor(100 * (1 - t));
    const b = Math.floor(255 * (1 - t));
    return `rgb(${r},${g},${b})`;
  };

  const contours = generateContours();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Loss Landscape Navigator</h1>
        <p className="text-slate-400 mb-6">
          Visualize gradient descent as navigating a loss surface
        </p>

        {/* Controls */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pause' : 'Drop Ball'}
            </button>
            <button
              onClick={() => resetPosition()}
              className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">View:</span>
              <button
                onClick={() => setViewMode('contour')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  viewMode === 'contour' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                Contour
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  viewMode === '3d' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                3D Surface
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">η:</span>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm font-mono w-12">{learningRate.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Landscape Selector */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-400 mr-2">Landscape:</span>
            {Object.entries(landscapes).map(([key, { name, icon: Icon }]) => (
              <button
                key={key}
                onClick={() => setLandscape(key)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  landscape === key
                    ? 'bg-purple-600 ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-800'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <Icon size={16} />
                {name}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-2">{currentLandscape.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualization */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {viewMode === 'contour' ? 'Contour Plot (Top-Down View)' : '3D Loss Surface'}
            </h2>

            {viewMode === 'contour' ? (
              <svg
                viewBox="0 0 400 400"
                className="w-full bg-slate-900 rounded-lg cursor-crosshair"
                onClick={handleCanvasClick}
              >
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="400" fill="url(#grid)" />

                {/* Axes */}
                <line x1="200" y1="0" x2="200" y2="400" stroke="#64748b" strokeWidth="1" />
                <line x1="0" y1="200" x2="400" y2="200" stroke="#64748b" strokeWidth="1" />
                <text x="390" y="215" fill="#94a3b8" className="text-xs">w₁</text>
                <text x="205" y="15" fill="#94a3b8" className="text-xs">w₂</text>

                {/* Contour points */}
                {contours.map(({ level, paths }, i) => (
                  <g key={i}>
                    {paths.map((p, j) => {
                      const svg = toSvg(p.x, p.y);
                      return (
                        <circle
                          key={j}
                          cx={svg.x}
                          cy={svg.y}
                          r="1.5"
                          fill={lossToColor(level)}
                          opacity="0.6"
                        />
                      );
                    })}
                  </g>
                ))}

                {/* Minimum marker */}
                {currentLandscape.minimum.w1 !== null && currentLandscape.minimum.w2 !== null && (
                  <g>
                    <circle
                      cx={toSvg(currentLandscape.minimum.w1, currentLandscape.minimum.w2).x}
                      cy={toSvg(currentLandscape.minimum.w1, currentLandscape.minimum.w2).y}
                      r="8"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                    />
                    <text
                      x={toSvg(currentLandscape.minimum.w1, currentLandscape.minimum.w2).x + 12}
                      y={toSvg(currentLandscape.minimum.w1, currentLandscape.minimum.w2).y + 4}
                      fill="#22c55e"
                      className="text-xs"
                    >
                      min
                    </text>
                  </g>
                )}

                {/* Trajectory */}
                {trajectory.length > 1 && (
                  <path
                    d={trajectory
                      .map((p, i) => {
                        const svg = toSvg(p.w1, p.w2);
                        return `${i === 0 ? 'M' : 'L'} ${svg.x} ${svg.y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />
                )}

                {/* Trajectory points */}
                {trajectory.map((p, i) => {
                  const svg = toSvg(p.w1, p.w2);
                  return (
                    <circle
                      key={i}
                      cx={svg.x}
                      cy={svg.y}
                      r={i === trajectory.length - 1 ? 8 : 3}
                      fill={i === trajectory.length - 1 ? '#3b82f6' : '#60a5fa'}
                      opacity={i === trajectory.length - 1 ? 1 : 0.5}
                    />
                  );
                })}

                {/* Gradient vector */}
                {gradientMagnitude > 0.1 && (
                  <g>
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
                      </marker>
                    </defs>
                    <line
                      x1={toSvg(position.w1, position.w2).x}
                      y1={toSvg(position.w1, position.w2).y}
                      x2={toSvg(position.w1, position.w2).x - gradient.dw1 * 20}
                      y2={toSvg(position.w1, position.w2).y + gradient.dw2 * 20}
                      stroke="#ef4444"
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                    />
                  </g>
                )}

                {/* Click hint */}
                <text x="200" y="390" textAnchor="middle" fill="#64748b" className="text-xs">
                  Click anywhere to set starting position
                </text>
              </svg>
            ) : (
              /* 3D View */
              <div
                className="w-full aspect-square bg-slate-900 rounded-lg relative overflow-hidden cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* 3D wireframe approximation */}
                  {(() => {
                    const points = [];
                    const resolution = 20;
                    const scale = 15;
                    const maxZ = landscape === 'rosenbrock' ? 100 : 10;

                    for (let i = 0; i <= resolution; i++) {
                      for (let j = 0; j <= resolution; j++) {
                        const w1 = (i / resolution) * 8 - 4;
                        const w2 = (j / resolution) * 8 - 4;
                        const z = Math.min(maxZ, currentLandscape.fn(w1, w2));

                        // Simple isometric projection
                        const radX = (rotation.x * Math.PI) / 180;
                        const radY = (rotation.y * Math.PI) / 180;

                        const x3d = w1 * scale;
                        const y3d = w2 * scale;
                        const z3d = -z * 3;

                        // Rotation
                        const x2 = x3d * Math.cos(radY) - y3d * Math.sin(radY);
                        const y2 = x3d * Math.sin(radY) + y3d * Math.cos(radY);
                        const y3 = y2 * Math.cos(radX) - z3d * Math.sin(radX);

                        points.push({
                          x: 200 + x2,
                          y: 200 - y3,
                          z: z,
                          w1,
                          w2,
                          i,
                          j,
                        });
                      }
                    }

                    // Draw wireframe
                    const lines = [];
                    for (let i = 0; i < resolution; i++) {
                      for (let j = 0; j < resolution; j++) {
                        const idx = i * (resolution + 1) + j;
                        const p1 = points[idx];
                        const p2 = points[idx + 1];
                        const p3 = points[idx + resolution + 1];

                        if (p2) {
                          lines.push(
                            <line
                              key={`h-${i}-${j}`}
                              x1={p1.x}
                              y1={p1.y}
                              x2={p2.x}
                              y2={p2.y}
                              stroke={lossToColor(p1.z)}
                              strokeWidth="0.5"
                              opacity="0.6"
                            />
                          );
                        }
                        if (p3) {
                          lines.push(
                            <line
                              key={`v-${i}-${j}`}
                              x1={p1.x}
                              y1={p1.y}
                              x2={p3.x}
                              y2={p3.y}
                              stroke={lossToColor(p1.z)}
                              strokeWidth="0.5"
                              opacity="0.6"
                            />
                          );
                        }
                      }
                    }

                    // Current position
                    const currZ = Math.min(maxZ, loss);
                    const radX = (rotation.x * Math.PI) / 180;
                    const radY = (rotation.y * Math.PI) / 180;
                    const cx3d = position.w1 * scale;
                    const cy3d = position.w2 * scale;
                    const cz3d = -currZ * 3;
                    const cx2 = cx3d * Math.cos(radY) - cy3d * Math.sin(radY);
                    const cy2 = cx3d * Math.sin(radY) + cy3d * Math.cos(radY);
                    const cy3 = cy2 * Math.cos(radX) - cz3d * Math.sin(radX);

                    return (
                      <>
                        {lines}
                        <circle cx={200 + cx2} cy={200 - cy3} r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
                      </>
                    );
                  })()}
                </svg>
                <div className="absolute bottom-2 left-2 text-xs text-slate-500">Drag to rotate</div>
              </div>
            )}
          </div>

          {/* Right Panel - Stats */}
          <div className="space-y-6">
            {/* Current State */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Current State</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Position</span>
                  <span className="font-mono">
                    w₁={position.w1.toFixed(3)}, w₂={position.w2.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Loss</span>
                  <span className="font-mono text-lg" style={{ color: lossToColor(loss) }}>
                    {loss.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">|∇L|</span>
                  <span className={`font-mono ${gradientMagnitude < 0.1 ? 'text-green-400' : 'text-slate-300'}`}>
                    {gradientMagnitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Steps</span>
                  <span className="font-mono">{step}</span>
                </div>
              </div>
            </div>

            {/* Gradient Info */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Gradient</h2>
              <div className="space-y-2 font-mono text-sm">
                <div className="p-2 bg-slate-700/50 rounded">
                  <span className="text-slate-400">∂L/∂w₁ = </span>
                  <span className="text-red-400">{gradient.dw1.toFixed(4)}</span>
                </div>
                <div className="p-2 bg-slate-700/50 rounded">
                  <span className="text-slate-400">∂L/∂w₂ = </span>
                  <span className="text-red-400">{gradient.dw2.toFixed(4)}</span>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Gradient points "uphill" — we move opposite direction
                </div>
              </div>
            </div>

            {/* Loss Curve */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Loss Over Steps</h2>
              <svg viewBox="0 0 200 100" className="w-full bg-slate-900 rounded">
                {/* Axes */}
                <line x1="30" y1="80" x2="190" y2="80" stroke="#64748b" strokeWidth="1" />
                <line x1="30" y1="10" x2="30" y2="80" stroke="#64748b" strokeWidth="1" />
                <text x="110" y="95" textAnchor="middle" fill="#64748b" className="text-xs">steps</text>
                <text x="15" y="45" fill="#64748b" className="text-xs" transform="rotate(-90, 15, 45)">loss</text>

                {/* Loss curve */}
                {trajectory.length > 1 && (
                  <path
                    d={trajectory
                      .map((p, i) => {
                        const lossVal = currentLandscape.fn(p.w1, p.w2);
                        const maxLoss = landscape === 'rosenbrock' ? 500 : 30;
                        const x = 30 + (i / Math.max(trajectory.length - 1, 1)) * 160;
                        const y = 80 - Math.min(lossVal / maxLoss, 1) * 65;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                )}
              </svg>
            </div>

            {/* Status */}
            <div className={`p-4 rounded-lg ${
              gradientMagnitude < 0.01 ? 'bg-green-900/50 border border-green-600' :
              gradientMagnitude < 0.1 ? 'bg-amber-900/50 border border-amber-600' :
              'bg-slate-700/50'
            }`}>
              {gradientMagnitude < 0.01 ? (
                <div className="text-green-400 font-medium">✓ Converged!</div>
              ) : gradientMagnitude < 0.1 ? (
                <div className="text-amber-400 font-medium">Almost there...</div>
              ) : isRunning ? (
                <div className="text-blue-400 font-medium">Descending...</div>
              ) : (
                <div className="text-slate-400">Click "Drop Ball" to start</div>
              )}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 bg-slate-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-blue-500">
              <div className="font-medium text-blue-400 mb-1">Learning Rate</div>
              <p className="text-slate-300">
                Too high → overshoots minimum (try η=0.5 on convex). Too low → very slow convergence.
              </p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-purple-500">
              <div className="font-medium text-purple-400 mb-1">Saddle Points</div>
              <p className="text-slate-300">
                Gradient ≈ 0 but not a minimum. Common in high dimensions — SGD noise helps escape.
              </p>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-amber-500">
              <div className="font-medium text-amber-400 mb-1">Local Minima</div>
              <p className="text-slate-300">
                In multimodal landscapes, starting position determines which minimum you find.
              </p>
            </div>
          </div>

          {/* Landscape-specific insight */}
          <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
            <div className="text-blue-300 font-medium mb-1">About {currentLandscape.name}</div>
            <p className="text-slate-300 text-sm">
              {landscape === 'convex' && (
                <>
                  The simplest loss surface — a bowl shape. Gradient descent always finds the global minimum regardless of starting point.
                  Try different learning rates to see convergence speed change.
                </>
              )}
              {landscape === 'ravine' && (
                <>
                  Notice the "zigzag" behavior! The gradient points mostly across the valley rather than along it.
                  This is why momentum-based optimizers (like Adam) were invented — they accumulate velocity along the ravine.
                </>
              )}
              {landscape === 'saddle' && (
                <>
                  At the origin, both gradients are zero — but it's not a minimum! The surface curves up in w₁ direction but down in w₂.
                  In high-dimensional neural networks, saddle points are actually more common than local minima.
                </>
              )}
              {landscape === 'multimodal' && (
                <>
                  Multiple valleys create local minima. Try different starting positions — you'll converge to different minima!
                  In practice, neural network loss surfaces have many local minima, but most are "good enough."
                </>
              )}
              {landscape === 'rosenbrock' && (
                <>
                  A classic optimization benchmark. The global minimum at (1,1) sits in a narrow, curved valley.
                  Finding the valley is easy; following it to the minimum is hard. Great test for optimizers!
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LossLandscapeNavigator;
