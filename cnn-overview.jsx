import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Edit3, Eye, EyeOff, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const CNNFlowViz = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [step, setStep] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [sampleIdx, setSampleIdx] = useState(0);
  const [showMath, setShowMath] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lossHistory, setLossHistory] = useState([]);
  const [particles, setParticles] = useState([]);
  const [hoveredComponent, setHoveredComponent] = useState(null);
  
  // Editable input image
  const [customImage, setCustomImage] = useState([
    [0.1, 0.1, 0.9, 0.1, 0.1],
    [0.1, 0.1, 0.9, 0.1, 0.1],
    [0.9, 0.9, 0.9, 0.9, 0.9],
    [0.1, 0.1, 0.9, 0.1, 0.1],
    [0.1, 0.1, 0.9, 0.1, 0.1],
  ]);
  
  // Preset patterns
  const presetImages = {
    cross: [
      [0.1, 0.1, 0.9, 0.1, 0.1],
      [0.1, 0.1, 0.9, 0.1, 0.1],
      [0.9, 0.9, 0.9, 0.9, 0.9],
      [0.1, 0.1, 0.9, 0.1, 0.1],
      [0.1, 0.1, 0.9, 0.1, 0.1],
    ],
    diagonal: [
      [0.9, 0.2, 0.1, 0.1, 0.1],
      [0.2, 0.9, 0.2, 0.1, 0.1],
      [0.1, 0.2, 0.9, 0.2, 0.1],
      [0.1, 0.1, 0.2, 0.9, 0.2],
      [0.1, 0.1, 0.1, 0.2, 0.9],
    ],
    lshape: [
      [0.9, 0.1, 0.1, 0.1, 0.1],
      [0.9, 0.1, 0.1, 0.1, 0.1],
      [0.9, 0.1, 0.1, 0.1, 0.1],
      [0.9, 0.1, 0.1, 0.1, 0.1],
      [0.9, 0.9, 0.9, 0.9, 0.9],
    ],
  };
  
  const labels = ['Cross', 'Diagonal', 'L-Shape'];
  
  // Kernel presets
  const kernelPresets = {
    edge: { name: 'Edge Detection', kernel: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]] },
    sharpen: { name: 'Sharpen', kernel: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]] },
    blur: { name: 'Blur', kernel: [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]] },
    sobelH: { name: 'Sobel Horizontal', kernel: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]] },
    sobelV: { name: 'Sobel Vertical', kernel: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]] },
  };
  
  const [selectedKernel, setSelectedKernel] = useState('edge');
  const kernel = kernelPresets[selectedKernel].kernel;
  
  const inputImage = customImage;
  
  // Convolution position for animation
  const [convPos, setConvPos] = useState({ row: 0, col: 0 });
  
  // Calculate convolution output
  const calculateConvolution = (img, kern) => {
    const output = [];
    for (let i = 0; i < 3; i++) {
      const row = [];
      for (let j = 0; j < 3; j++) {
        let sum = 0;
        for (let ki = 0; ki < 3; ki++) {
          for (let kj = 0; kj < 3; kj++) {
            sum += img[i + ki][j + kj] * kern[ki][kj];
          }
        }
        row.push(Math.max(0, sum));
      }
      output.push(row);
    }
    return output;
  };
  
  const convOutput = calculateConvolution(inputImage, kernel);
  
  // Calculate element-wise products for visualization
  const getElementWiseProducts = (row, col) => {
    const products = [];
    for (let ki = 0; ki < 3; ki++) {
      for (let kj = 0; kj < 3; kj++) {
        products.push({
          input: inputImage[row + ki]?.[col + kj] || 0,
          kernel: kernel[ki][kj],
          product: (inputImage[row + ki]?.[col + kj] || 0) * kernel[ki][kj],
        });
      }
    }
    return products;
  };
  
  // Max pooling
  const calculatePooling = (conv) => {
    const output = [];
    for (let i = 0; i < 2; i++) {
      const row = [];
      for (let j = 0; j < 2; j++) {
        const vals = [];
        if (conv[i]?.[j] !== undefined) vals.push(conv[i][j]);
        if (conv[i]?.[j+1] !== undefined) vals.push(conv[i][j+1]);
        if (conv[i+1]?.[j] !== undefined) vals.push(conv[i+1][j]);
        if (conv[i+1]?.[j+1] !== undefined) vals.push(conv[i+1][j+1]);
        row.push(vals.length > 0 ? Math.max(...vals) : 0);
      }
      output.push(row);
    }
    return output;
  };
  
  const poolOutput = calculatePooling(convOutput);
  const flattened = poolOutput.flat();
  
  // FC weights
  const fcWeights = [
    [0.5, -0.3, 0.2, 0.1],
    [-0.2, 0.6, -0.1, 0.4],
    [0.1, -0.1, 0.5, -0.2],
  ];
  
  const fcOutput = fcWeights.map(weights => 
    weights.reduce((sum, w, i) => sum + w * (flattened[i] || 0), 0)
  );
  
  const softmax = (arr) => {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  };
  
  const predictions = softmax(fcOutput);
  const predictedClass = predictions.indexOf(Math.max(...predictions));
  
  // Calculate loss
  const targetIdx = Object.keys(presetImages).findIndex(key => 
    JSON.stringify(presetImages[key]) === JSON.stringify(customImage)
  );
  const target = targetIdx >= 0 ? targetIdx : 0;
  const loss = -Math.log(predictions[target] + 1e-7);
  
  // Animation steps
  const steps = [
    { name: 'Input Image', phase: 'input', highlight: ['input'], description: 'Load 5×5 grayscale image' },
    { name: 'Apply Kernel', phase: 'conv', highlight: ['input', 'kernel'], description: 'Slide 3×3 kernel across input' },
    { name: 'Feature Map', phase: 'conv', highlight: ['conv-output'], description: 'Compute dot products → 3×3 map' },
    { name: 'ReLU Activation', phase: 'activation', highlight: ['conv-output', 'relu'], description: 'Apply max(0, x) non-linearity' },
    { name: 'Max Pooling', phase: 'pool', highlight: ['conv-output', 'pool'], description: 'Take max in each 2×2 region' },
    { name: 'Pooled Output', phase: 'pool', highlight: ['pool-output'], description: 'Downsampled to 2×2' },
    { name: 'Flatten', phase: 'flatten', highlight: ['pool-output', 'flatten'], description: 'Reshape to 1D vector [4]' },
    { name: 'Dense Layer', phase: 'fc', highlight: ['flatten', 'fc'], description: 'Multiply by weight matrix' },
    { name: 'Softmax', phase: 'output', highlight: ['fc', 'softmax'], description: 'Convert to probabilities' },
    { name: 'Classification', phase: 'output', highlight: ['softmax', 'prediction'], description: `Predicted: ${labels[predictedClass]}` },
  ];
  
  const currentStep = steps[step];
  const isHighlighted = (id) => currentStep.highlight.includes(id);
  
  const intervalRef = useRef(null);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning(r => !r);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step]);
  
  // Convolution animation
  useEffect(() => {
    if (step === 1 && isRunning) {
      const convInterval = setInterval(() => {
        setConvPos(prev => {
          if (prev.col < 2) return { row: prev.row, col: prev.col + 1 };
          if (prev.row < 2) return { row: prev.row + 1, col: 0 };
          return { row: 0, col: 0 };
        });
      }, 400 / speed);
      return () => clearInterval(convInterval);
    }
  }, [step, isRunning, speed]);
  
  // Main animation loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= steps.length - 1) {
            setLossHistory(h => [...h.slice(-29), loss]);
            setSampleIdx(idx => {
              const next = (idx + 1) % 3;
              if (next === 0) setEpoch(e => e + 1);
              const keys = Object.keys(presetImages);
              setCustomImage(presetImages[keys[next]]);
              return next;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1800 / speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, speed, loss]);
  
  // Particle animation
  useEffect(() => {
    if (isRunning && step >= 1) {
      const particleInterval = setInterval(() => {
        setParticles(prev => {
          const newParticles = prev
            .map(p => ({ ...p, progress: p.progress + 0.05 }))
            .filter(p => p.progress < 1);
          
          if (Math.random() > 0.7) {
            newParticles.push({
              id: Date.now(),
              progress: 0,
              path: step < 3 ? 'input-conv' : step < 6 ? 'conv-pool' : 'pool-fc',
            });
          }
          return newParticles;
        });
      }, 50);
      return () => clearInterval(particleInterval);
    }
  }, [isRunning, step]);
  
  const reset = () => {
    setIsRunning(false);
    setStep(0);
    setEpoch(0);
    setSampleIdx(0);
    setConvPos({ row: 0, col: 0 });
    setLossHistory([]);
    setParticles([]);
  };
  
  const nextStep = () => {
    if (step >= steps.length - 1) {
      setLossHistory(h => [...h.slice(-29), loss]);
      setSampleIdx(idx => {
        const next = (idx + 1) % 3;
        if (next === 0) setEpoch(e => e + 1);
        const keys = Object.keys(presetImages);
        setCustomImage(presetImages[keys[next]]);
        return next;
      });
      setStep(0);
    } else {
      setStep(s => s + 1);
    }
  };
  
  const prevStep = () => {
    setStep(s => Math.max(0, s - 1));
  };
  
  const jumpToStep = (idx) => {
    setStep(idx);
  };
  
  const toggleCell = (i, j) => {
    if (!isDrawing) return;
    setCustomImage(prev => {
      const newImg = prev.map(row => [...row]);
      newImg[i][j] = newImg[i][j] > 0.5 ? 0.1 : 0.9;
      return newImg;
    });
  };
  
  const clearImage = () => {
    setCustomImage(Array(5).fill(null).map(() => Array(5).fill(0.1)));
  };
  
  const getPhaseColor = (phase) => {
    const colors = {
      input: 'bg-blue-500',
      conv: 'bg-violet-500',
      activation: 'bg-yellow-500',
      pool: 'bg-emerald-500',
      flatten: 'bg-pink-500',
      fc: 'bg-orange-500',
      output: 'bg-green-500',
    };
    return colors[phase] || 'bg-gray-500';
  };
  
  const getPhaseGlow = (phase) => {
    const glows = {
      input: 'shadow-blue-500/50',
      conv: 'shadow-violet-500/50',
      activation: 'shadow-yellow-500/50',
      pool: 'shadow-emerald-500/50',
      flatten: 'shadow-pink-500/50',
      fc: 'shadow-orange-500/50',
      output: 'shadow-green-500/50',
    };
    return glows[phase] || 'shadow-gray-500/50';
  };

  const getCellGradient = (val, type) => {
    const intensity = Math.min(1, Math.max(0, val));
    if (type === 'input') {
      return `linear-gradient(135deg, rgba(59, 130, 246, ${intensity * 0.3}) 0%, rgba(59, 130, 246, ${intensity}) 100%)`;
    } else if (type === 'conv') {
      const normalized = Math.min(1, Math.abs(val) / 5);
      return `linear-gradient(135deg, rgba(139, 92, 246, ${normalized * 0.3}) 0%, rgba(139, 92, 246, ${normalized}) 100%)`;
    } else if (type === 'pool') {
      const normalized = Math.min(1, val / 5);
      return `linear-gradient(135deg, rgba(16, 185, 129, ${normalized * 0.3}) 0%, rgba(16, 185, 129, ${normalized}) 100%)`;
    }
    return `rgba(100, 116, 139, ${intensity})`;
  };
  
  const getKernelColor = (val) => {
    if (val > 0) {
      const normalized = Math.min(1, val / 8);
      return `linear-gradient(135deg, rgba(34, 197, 94, ${normalized * 0.3}) 0%, rgba(34, 197, 94, ${normalized}) 100%)`;
    } else {
      const normalized = Math.min(1, Math.abs(val) / 2);
      return `linear-gradient(135deg, rgba(239, 68, 68, ${normalized * 0.3}) 0%, rgba(239, 68, 68, ${normalized}) 100%)`;
    }
  };

  // Mini loss chart
  const LossChart = () => {
    if (lossHistory.length < 2) return null;
    const maxLoss = Math.max(...lossHistory, 2);
    const width = 200;
    const height = 60;
    const points = lossHistory.map((l, i) => 
      `${(i / (lossHistory.length - 1)) * width},${height - (l / maxLoss) * height}`
    ).join(' ');
    
    return (
      <div className="bg-slate-700/50 rounded-lg p-3">
        <div className="text-xs text-gray-400 mb-2">Loss History</div>
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.5)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#lossGradient)"
          />
          <polyline
            points={points}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {lossHistory.length > 0 && (
            <circle
              cx={width}
              cy={height - (lossHistory[lossHistory.length - 1] / maxLoss) * height}
              r="4"
              fill="#ef4444"
              className="animate-pulse"
            />
          )}
        </svg>
        <div className="text-xs text-gray-500 mt-1">
          Current: {loss.toFixed(3)}
        </div>
      </div>
    );
  };

  // Detail view showing element-wise multiplication
  const DetailView = () => {
    if (step !== 1) return null;
    const products = getElementWiseProducts(convPos.row, convPos.col);
    const sum = products.reduce((s, p) => s + p.product, 0);
    
    return (
      <div className="bg-slate-700/50 rounded-lg p-4 mt-4">
        <div className="text-sm font-semibold text-violet-400 mb-3">
          🔍 Convolution Detail at [{convPos.row}, {convPos.col}]
        </div>
        <div className="grid grid-cols-3 gap-1 mb-3">
          {products.map((p, idx) => (
            <div key={idx} className="bg-slate-800 rounded p-2 text-center">
              <div className="text-xs text-gray-400">
                {p.input.toFixed(1)} × {p.kernel.toFixed(1)}
              </div>
              <div className={`text-sm font-mono ${p.product >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {p.product.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center border-t border-slate-600 pt-2">
          <span className="text-gray-400">Sum: </span>
          <span className="text-violet-400 font-bold">{sum.toFixed(2)}</span>
          <span className="text-gray-400"> → ReLU → </span>
          <span className="text-green-400 font-bold">{Math.max(0, sum).toFixed(2)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-violet-400 to-green-400 bg-clip-text text-transparent">
            Convolutional Neural Network Flow
          </h1>
          <p className="text-gray-400">
            Interactive visualization: Input → Convolution → Pooling → Classification
            <span className="text-gray-600 ml-3 text-sm">
              [Space: Play/Pause] [←→: Step] [R: Reset]
            </span>
          </p>
        </div>
        
        {/* Controls */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  isRunning 
                    ? 'bg-slate-600 hover:bg-slate-500' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30'
                }`}
              >
                {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
              </button>
              <button
                onClick={prevStep}
                className="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextStep}
                className="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center gap-2 transition-all"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Speed:</label>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-20 accent-violet-500"
                />
                <span className="text-sm font-mono text-violet-400 w-8">{speed}x</span>
              </div>
              
              <button
                onClick={() => setShowMath(!showMath)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  showMath ? 'bg-violet-600' : 'bg-slate-700'
                }`}
              >
                {showMath ? <Eye size={16} /> : <EyeOff size={16} />}
                <span className="text-sm">Math</span>
              </button>
              
              <button
                onClick={() => setIsDrawing(!isDrawing)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  isDrawing ? 'bg-green-600' : 'bg-slate-700'
                }`}
              >
                <Edit3 size={16} />
                <span className="text-sm">Draw</span>
              </button>
              
              <div className="text-sm font-mono">
                <span className="text-gray-500">Epoch</span>{' '}
                <span className="text-white font-bold">{epoch}</span>
                <span className="text-gray-600 mx-2">|</span>
                <span className="text-gray-500">Sample</span>{' '}
                <span className="text-white font-bold">{sampleIdx + 1}/3</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Step Progress - Clickable */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${getPhaseColor(currentStep.phase)} flex items-center justify-center shadow-lg ${getPhaseGlow(currentStep.phase)}`}>
                <Zap size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{currentStep.name}</h2>
                <p className="text-sm text-gray-400">{currentStep.description}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPhaseColor(currentStep.phase)}`}>
              {currentStep.phase.toUpperCase()}
            </span>
          </div>
          <div className="flex gap-1">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => jumpToStep(idx)}
                className={`flex-1 h-3 rounded-full transition-all duration-300 hover:scale-y-150 ${
                  idx === step 
                    ? `${getPhaseColor(s.phase)} shadow-lg ${getPhaseGlow(s.phase)}` 
                    : idx < step 
                      ? 'bg-slate-600' 
                      : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={s.name}
              />
            ))}
          </div>
        </div>
        
        {/* Main Visualization - Horizontal Flow */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max gap-4">
            
            {/* Input Section */}
            <div 
              className={`flex flex-col items-center transition-all duration-300 ${
                isHighlighted('input') ? 'scale-105' : 'opacity-70'
              }`}
              onMouseEnter={() => setHoveredComponent('input')}
              onMouseLeave={() => setHoveredComponent(null)}
            >
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Input 5×5</div>
              <div className={`relative p-1 rounded-lg transition-all ${
                isHighlighted('input') ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30' : ''
              }`}>
                <div className="grid grid-cols-5 gap-0.5">
                  {inputImage.map((row, i) =>
                    row.map((val, j) => (
                      <div
                        key={`input-${i}-${j}`}
                        onClick={() => toggleCell(i, j)}
                        className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-mono transition-all ${
                          isDrawing ? 'cursor-pointer hover:ring-2 hover:ring-white' : ''
                        }`}
                        style={{ background: getCellGradient(val, 'input') }}
                      >
                        {val > 0.5 ? '' : ''}
                      </div>
                    ))
                  )}
                </div>
                {/* Kernel overlay */}
                {step === 1 && (
                  <div
                    className="absolute border-2 border-yellow-400 rounded bg-yellow-400/20 transition-all duration-200 pointer-events-none"
                    style={{
                      width: 88,
                      height: 88,
                      top: convPos.row * 30 + 4,
                      left: convPos.col * 30 + 4,
                    }}
                  />
                )}
              </div>
              {isDrawing && (
                <div className="flex gap-2 mt-2">
                  <button onClick={clearImage} className="text-xs px-2 py-1 bg-slate-700 rounded hover:bg-slate-600">
                    Clear
                  </button>
                  {Object.entries(presetImages).map(([key, img]) => (
                    <button
                      key={key}
                      onClick={() => setCustomImage(img)}
                      className="text-xs px-2 py-1 bg-slate-700 rounded hover:bg-slate-600 capitalize"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Arrow with particle */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">CONV</div>
              <div className="relative w-16 h-1">
                <div className={`absolute inset-0 rounded-full transition-all ${
                  step >= 1 ? 'bg-gradient-to-r from-blue-500 to-violet-500' : 'bg-slate-600'
                }`} />
                {particles.filter(p => p.path === 'input-conv').map(p => (
                  <div
                    key={p.id}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"
                    style={{ left: `${p.progress * 100}%`, top: -2 }}
                  />
                ))}
              </div>
              <div className={`text-lg transition-all ${step >= 1 ? 'text-violet-400' : 'text-slate-600'}`}>→</div>
            </div>
            
            {/* Kernel */}
            <div 
              className={`flex flex-col items-center transition-all duration-300 ${
                isHighlighted('kernel') || step === 1 ? 'scale-105' : 'opacity-70'
              }`}
            >
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Kernel 3×3</div>
              <div className={`p-1 rounded-lg transition-all ${
                isHighlighted('kernel') ? 'ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/30' : ''
              }`}>
                <div className="grid grid-cols-3 gap-0.5">
                  {kernel.map((row, i) =>
                    row.map((val, j) => (
                      <div
                        key={`kern-${i}-${j}`}
                        className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-mono text-white"
                        style={{ background: getKernelColor(val) }}
                      >
                        {val.toFixed(0)}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <select
                value={selectedKernel}
                onChange={(e) => setSelectedKernel(e.target.value)}
                className="mt-2 text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1"
              >
                {Object.entries(kernelPresets).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
            
            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">ReLU</div>
              <div className={`w-12 h-1 rounded-full transition-all ${
                step >= 2 ? 'bg-gradient-to-r from-violet-500 to-yellow-500' : 'bg-slate-600'
              }`} />
              <div className={`text-lg transition-all ${step >= 2 ? 'text-yellow-400' : 'text-slate-600'}`}>→</div>
            </div>
            
            {/* Conv Output */}
            <div 
              className={`flex flex-col items-center transition-all duration-300 ${
                isHighlighted('conv-output') || isHighlighted('relu') ? 'scale-105' : 'opacity-70'
              }`}
            >
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Feature Map 3×3</div>
              <div className={`p-1 rounded-lg transition-all ${
                isHighlighted('conv-output') ? 'ring-2 ring-violet-500 shadow-lg shadow-violet-500/30' : ''
              }`}>
                <div className="grid grid-cols-3 gap-0.5">
                  {convOutput.map((row, i) =>
                    row.map((val, j) => (
                      <div
                        key={`conv-${i}-${j}`}
                        className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-mono text-white"
                        style={{ background: getCellGradient(val, 'conv') }}
                      >
                        {val.toFixed(1)}
                      </div>
                    ))
                  )}
                </div>
              </div>
              {isHighlighted('relu') && (
                <div className="mt-2 px-2 py-1 bg-yellow-500/20 border border-yellow-500 rounded text-xs text-yellow-400">
                  ReLU Applied ✓
                </div>
              )}
            </div>
            
            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">POOL</div>
              <div className="relative w-12 h-1">
                <div className={`absolute inset-0 rounded-full transition-all ${
                  step >= 4 ? 'bg-gradient-to-r from-yellow-500 to-emerald-500' : 'bg-slate-600'
                }`} />
                {particles.filter(p => p.path === 'conv-pool').map(p => (
                  <div
                    key={p.id}
                    className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
                    style={{ left: `${p.progress * 100}%`, top: -2 }}
                  />
                ))}
              </div>
              <div className={`text-lg transition-all ${step >= 4 ? 'text-emerald-400' : 'text-slate-600'}`}>→</div>
            </div>
            
            {/* Pool Output */}
            <div 
              className={`flex flex-col items-center transition-all duration-300 ${
                isHighlighted('pool-output') || isHighlighted('pool') ? 'scale-105' : 'opacity-70'
              }`}
            >
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Pooled 2×2</div>
              <div className={`p-1 rounded-lg transition-all ${
                isHighlighted('pool-output') ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/30' : ''
              }`}>
                <div className="grid grid-cols-2 gap-0.5">
                  {poolOutput.map((row, i) =>
                    row.map((val, j) => (
                      <div
                        key={`pool-${i}-${j}`}
                        className="w-9 h-9 rounded-sm flex items-center justify-center text-xs font-mono text-white"
                        style={{ background: getCellGradient(val, 'pool') }}
                      >
                        {val.toFixed(1)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">FLAT</div>
              <div className={`w-12 h-1 rounded-full transition-all ${
                step >= 6 ? 'bg-gradient-to-r from-emerald-500 to-pink-500' : 'bg-slate-600'
              }`} />
              <div className={`text-lg transition-all ${step >= 6 ? 'text-pink-400' : 'text-slate-600'}`}>→</div>
            </div>
            
            {/* Flattened */}
            <div 
              className={`flex flex-col items-center transition-all duration-300 ${
                isHighlighted('flatten') ? 'scale-105' : 'opacity-70'
              }`}
            >
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Flatten [4]</div>
              <div className={`flex gap-0.5 p-1 rounded-lg transition-all ${
                isHighlighted('flatten') ? 'ring-2 ring-pink-500 shadow-lg shadow-pink-500/30' : ''
              }`}>
                {flattened.map((val, i) => (
                  <div
                    key={`flat-${i}`}
                    className="w-9 h-9 rounded-sm flex items-center justify-center text-xs font-mono text-white"
                    style={{ background: getCellGradient(val, 'pool') }}
                  >
                    {val.toFixed(1)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-1">FC</div>
              <div className="relative w-12 h-1">
                <div className={`absolute inset-0 rounded-full transition-all ${
                  step >= 7 ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-slate-600'
                }`} />
                {particles.filter(p => p.path === 'pool-fc').map(p => (
                  <div
                    key={p.id}
                    className="absolute w-2 h-2 bg-orange-400 rounded-full shadow-lg shadow-orange-400/50"
                    style={{ left: `${p.progress * 100}%`, top: -2 }}
                  />
                ))}
              </div>
              <div className={`text-lg transition-all ${step >= 7 ? 'text-orange-400' : 'text-slate-600'}`}>→</div>
            </div>
            
            {/* Output Probabilities */}
            <div 
              className={`flex flex-col items-center transition-all duration-300 ${
                isHighlighted('softmax') || isHighlighted('prediction') ? 'scale-105' : 'opacity-70'
              }`}
            >
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Output</div>
              <div className={`p-3 rounded-lg transition-all ${
                isHighlighted('softmax') || isHighlighted('prediction') 
                  ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/30 bg-slate-700/50' 
                  : 'bg-slate-700/30'
              }`}>
                {labels.map((label, i) => {
                  const prob = predictions[i];
                  const isWinner = i === predictedClass;
                  return (
                    <div key={label} className="flex items-center gap-2 mb-2 last:mb-0">
                      <span className={`text-xs w-16 text-right ${isWinner ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                        {label}
                      </span>
                      <div className="w-24 h-4 bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWinner 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                              : 'bg-slate-500'
                          } ${isWinner && isHighlighted('prediction') ? 'animate-pulse' : ''}`}
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs w-12 font-mono ${isWinner ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
              {isHighlighted('prediction') && (
                <div className="mt-2 px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-sm text-green-400 font-bold animate-pulse">
                  ✓ {labels[predictedClass]}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Section: Math + Stats */}
        <div className="grid grid-cols-3 gap-6">
          {/* Calculations Panel */}
          {showMath && (
            <div className="col-span-2 bg-slate-800/80 backdrop-blur rounded-xl p-5 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Mathematical Operations</h3>
              <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                <div className={`p-3 rounded-lg transition-all ${
                  currentStep.phase === 'conv' ? 'bg-violet-900/50 border border-violet-500' : 'bg-slate-700/30'
                }`}>
                  <div className="text-violet-400 font-bold mb-1">CONVOLUTION</div>
                  <div className="text-gray-400">z[i,j] = Σₘ Σₙ x[i+m, j+n] × k[m,n]</div>
                </div>
                
                <div className={`p-3 rounded-lg transition-all ${
                  currentStep.phase === 'activation' ? 'bg-yellow-900/50 border border-yellow-500' : 'bg-slate-700/30'
                }`}>
                  <div className="text-yellow-400 font-bold mb-1">ReLU</div>
                  <div className="text-gray-400">f(x) = max(0, x)</div>
                </div>
                
                <div className={`p-3 rounded-lg transition-all ${
                  currentStep.phase === 'pool' ? 'bg-emerald-900/50 border border-emerald-500' : 'bg-slate-700/30'
                }`}>
                  <div className="text-emerald-400 font-bold mb-1">MAX POOLING</div>
                  <div className="text-gray-400">p[i,j] = max(region[2×2])</div>
                </div>
                
                <div className={`p-3 rounded-lg transition-all ${
                  currentStep.phase === 'fc' ? 'bg-orange-900/50 border border-orange-500' : 'bg-slate-700/30'
                }`}>
                  <div className="text-orange-400 font-bold mb-1">DENSE</div>
                  <div className="text-gray-400">y = Wx + b</div>
                </div>
                
                <div className={`p-3 rounded-lg transition-all ${
                  currentStep.phase === 'output' ? 'bg-green-900/50 border border-green-500' : 'bg-slate-700/30'
                }`}>
                  <div className="text-green-400 font-bold mb-1">SOFTMAX</div>
                  <div className="text-gray-400">σ(z)ᵢ = eᶻⁱ / Σⱼ eᶻʲ</div>
                </div>
                
                <div className={`p-3 rounded-lg transition-all ${
                  currentStep.phase === 'flatten' ? 'bg-pink-900/50 border border-pink-500' : 'bg-slate-700/30'
                }`}>
                  <div className="text-pink-400 font-bold mb-1">FLATTEN</div>
                  <div className="text-gray-400">2D → 1D reshape</div>
                </div>
              </div>
              
              <DetailView />
            </div>
          )}
          
          {/* Stats Panel */}
          <div className={`${showMath ? '' : 'col-span-3'} bg-slate-800/80 backdrop-blur rounded-xl p-5 border border-slate-700`}>
            <h3 className="text-lg font-semibold mb-4">Training Stats</h3>
            
            <LossChart />
            
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-gray-400 text-xs">Predicted</div>
                <div className="text-green-400 font-bold">{labels[predictedClass]}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-gray-400 text-xs">Confidence</div>
                <div className="text-blue-400 font-bold">{(predictions[predictedClass] * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-gray-400 text-xs">FC Output</div>
                <div className="text-orange-400 font-mono text-xs">[{fcOutput.map(v => v.toFixed(2)).join(', ')}]</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-gray-400 text-xs">Flattened</div>
                <div className="text-pink-400 font-mono text-xs">[{flattened.map(v => v.toFixed(1)).join(', ')}]</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-4 text-sm">
              {[
                { phase: 'input', label: 'Input', color: 'bg-blue-500' },
                { phase: 'conv', label: 'Convolution', color: 'bg-violet-500' },
                { phase: 'activation', label: 'Activation', color: 'bg-yellow-500' },
                { phase: 'pool', label: 'Pooling', color: 'bg-emerald-500' },
                { phase: 'flatten', label: 'Flatten', color: 'bg-pink-500' },
                { phase: 'fc', label: 'Dense', color: 'bg-orange-500' },
                { phase: 'output', label: 'Output', color: 'bg-green-500' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${color}`} />
                  <span className="text-gray-400">{label}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-600">
              Image Classification Pipeline • CNN Visualization
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CNNFlowViz;