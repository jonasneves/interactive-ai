import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Paintbrush, RotateCcw, Download, Sparkles, Eye, Grid, Layers, ChevronLeft, ChevronRight, CheckCircle, Upload, Eraser } from 'lucide-react';

const KernelGallery = () => {
  const [selectedKernel, setSelectedKernel] = useState('edge');
  const [customKernel, setCustomKernel] = useState([
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [imageSize, setImageSize] = useState(12); // 12x12 canvas
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushValue, setBrushValue] = useState(1);
  const [showComparison, setShowComparison] = useState(false);
  const [animatingKernel, setAnimatingKernel] = useState(false);
  const [kernelPos, setKernelPos] = useState({ row: 0, col: 0 });

  // Canvas for drawing - initialized with a simple pattern
  const [canvas, setCanvas] = useState(() => {
    const size = 12;
    const arr = Array(size).fill(null).map(() => Array(size).fill(0.1));
    // Draw a vertical line
    for (let i = 2; i < size - 2; i++) {
      arr[i][5] = 0.9;
      arr[i][6] = 0.9;
    }
    // Draw a horizontal line
    for (let j = 2; j < size - 2; j++) {
      arr[5][j] = 0.9;
      arr[6][j] = 0.9;
    }
    // Add some diagonal
    for (let k = 0; k < 4; k++) {
      arr[2 + k][9 + Math.floor(k/2)] = 0.9;
    }
    return arr;
  });

  // Preset kernels with descriptions
  const kernelPresets = {
    identity: {
      name: 'Identity',
      kernel: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
      description: 'Outputs the same image - useful as a baseline',
      category: 'basic',
      color: 'gray',
    },
    edge: {
      name: 'Edge Detection',
      kernel: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
      description: 'Detects all edges by finding areas of rapid intensity change',
      category: 'edge',
      color: 'violet',
    },
    edgeH: {
      name: 'Horizontal Edges',
      kernel: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
      description: 'Sobel filter for horizontal edges (gradients in Y direction)',
      category: 'edge',
      color: 'blue',
    },
    edgeV: {
      name: 'Vertical Edges',
      kernel: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
      description: 'Sobel filter for vertical edges (gradients in X direction)',
      category: 'edge',
      color: 'cyan',
    },
    sharpen: {
      name: 'Sharpen',
      kernel: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
      description: 'Enhances edges and fine details by increasing contrast',
      category: 'enhance',
      color: 'yellow',
    },
    blur: {
      name: 'Box Blur',
      kernel: [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]],
      description: 'Averages neighboring pixels, reducing noise and detail',
      category: 'blur',
      color: 'emerald',
    },
    gaussianBlur: {
      name: 'Gaussian Blur',
      kernel: [[1/16, 2/16, 1/16], [2/16, 4/16, 2/16], [1/16, 2/16, 1/16]],
      description: 'Weighted average giving more importance to center pixels',
      category: 'blur',
      color: 'green',
    },
    emboss: {
      name: 'Emboss',
      kernel: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]],
      description: 'Creates a 3D-like raised effect on edges',
      category: 'effect',
      color: 'orange',
    },
    bottomSobel: {
      name: 'Bottom Sobel',
      kernel: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
      description: 'Emphasizes edges at the bottom of objects',
      category: 'edge',
      color: 'pink',
    },
    outline: {
      name: 'Laplacian',
      kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]],
      description: 'Detects edges using second derivative (outline effect)',
      category: 'edge',
      color: 'red',
    },
  };

  const activeKernel = isCustomMode ? customKernel : kernelPresets[selectedKernel].kernel;

  // Apply convolution
  const applyConvolution = useCallback((img, kern) => {
    const rows = img.length;
    const cols = img[0].length;
    const kSize = kern.length;
    const pad = Math.floor(kSize / 2);
    const output = [];

    for (let i = 0; i < rows - kSize + 1; i++) {
      const row = [];
      for (let j = 0; j < cols - kSize + 1; j++) {
        let sum = 0;
        for (let ki = 0; ki < kSize; ki++) {
          for (let kj = 0; kj < kSize; kj++) {
            sum += img[i + ki][j + kj] * kern[ki][kj];
          }
        }
        row.push(sum);
      }
      output.push(row);
    }
    return output;
  }, []);

  const outputImage = applyConvolution(canvas, activeKernel);

  // Normalize output for display
  const normalizeForDisplay = (arr) => {
    const flat = arr.flat();
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    const range = max - min || 1;
    return arr.map(row => row.map(val => (val - min) / range));
  };

  const normalizedOutput = normalizeForDisplay(outputImage);

  // Handle drawing on canvas
  const handleCanvasClick = (i, j) => {
    if (!isDrawing) return;
    setCanvas(prev => {
      const newCanvas = prev.map(row => [...row]);
      newCanvas[i][j] = brushValue;
      return newCanvas;
    });
  };

  const handleCanvasDrag = (i, j) => {
    setCanvas(prev => {
      const newCanvas = prev.map(row => [...row]);
      newCanvas[i][j] = brushValue;
      return newCanvas;
    });
  };

  // Handle custom kernel editing
  const updateCustomKernel = (i, j, value) => {
    const num = parseFloat(value) || 0;
    setCustomKernel(prev => {
      const newKernel = prev.map(row => [...row]);
      newKernel[i][j] = num;
      return newKernel;
    });
  };

  // Preset patterns
  const loadPattern = (name) => {
    const size = imageSize;
    let newCanvas = Array(size).fill(null).map(() => Array(size).fill(0.1));

    switch (name) {
      case 'cross':
        for (let i = 0; i < size; i++) {
          newCanvas[i][Math.floor(size / 2)] = 0.9;
          newCanvas[Math.floor(size / 2)][i] = 0.9;
        }
        break;
      case 'diagonal':
        for (let i = 0; i < size; i++) {
          newCanvas[i][i] = 0.9;
          if (i + 1 < size) newCanvas[i][i + 1] = 0.9;
        }
        break;
      case 'square':
        for (let i = 3; i < size - 3; i++) {
          newCanvas[3][i] = 0.9;
          newCanvas[size - 4][i] = 0.9;
          newCanvas[i][3] = 0.9;
          newCanvas[i][size - 4] = 0.9;
        }
        break;
      case 'circle':
        const center = size / 2;
        const radius = size / 3;
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const dist = Math.sqrt((i - center) ** 2 + (j - center) ** 2);
            if (Math.abs(dist - radius) < 1) {
              newCanvas[i][j] = 0.9;
            }
          }
        }
        break;
      case 'gradient':
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            newCanvas[i][j] = j / size;
          }
        }
        break;
      case 'checker':
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            newCanvas[i][j] = (i + j) % 2 === 0 ? 0.9 : 0.1;
          }
        }
        break;
      default:
        break;
    }
    setCanvas(newCanvas);
  };

  const clearCanvas = () => {
    setCanvas(Array(imageSize).fill(null).map(() => Array(imageSize).fill(0.1)));
  };

  // Animation for kernel visualization
  useEffect(() => {
    if (!animatingKernel) return;
    const maxRow = canvas.length - 3;
    const maxCol = canvas[0].length - 3;

    const interval = setInterval(() => {
      setKernelPos(prev => {
        if (prev.col < maxCol) return { ...prev, col: prev.col + 1 };
        if (prev.row < maxRow) return { row: prev.row + 1, col: 0 };
        return { row: 0, col: 0 };
      });
    }, 150);

    return () => clearInterval(interval);
  }, [animatingKernel, canvas]);

  const getKernelColor = (val) => {
    if (val > 0) {
      const intensity = Math.min(1, Math.abs(val) / 8);
      return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`;
    } else if (val < 0) {
      const intensity = Math.min(1, Math.abs(val) / 2);
      return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`;
    }
    return 'rgba(100, 116, 139, 0.3)';
  };

  const getCategoryColor = (category) => {
    const colors = {
      basic: 'bg-gray-500',
      edge: 'bg-violet-500',
      enhance: 'bg-yellow-500',
      blur: 'bg-emerald-500',
      effect: 'bg-orange-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span className="px-2 py-1 bg-violet-500/20 rounded text-violet-400">Level 5</span>
            <span>→</span>
            <span>CNN Course</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 via-emerald-400 to-yellow-400 bg-clip-text text-transparent">
            Kernel Gallery
          </h1>
          <p className="text-gray-400">
            Explore how different kernels detect different features
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Kernel Selection */}
          <div className="col-span-3 space-y-4">
            <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Layers size={20} className="text-violet-400" />
                Kernel Presets
              </h3>

              {/* Category filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['edge', 'blur', 'enhance', 'effect'].map(cat => (
                  <span key={cat} className={`px-2 py-1 rounded text-xs ${getCategoryColor(cat)} bg-opacity-20 text-white capitalize`}>
                    {cat}
                  </span>
                ))}
              </div>

              {/* Kernel list */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {Object.entries(kernelPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedKernel(key); setIsCustomMode(false); }}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedKernel === key && !isCustomMode
                        ? 'bg-violet-600/50 border border-violet-500 shadow-lg shadow-violet-500/20'
                        : 'bg-slate-700/50 hover:bg-slate-600/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{preset.name}</span>
                      <span className={`w-2 h-2 rounded-full ${getCategoryColor(preset.category)}`} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{preset.description}</p>
                  </button>
                ))}
              </div>

              {/* Custom kernel toggle */}
              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className={`w-full mt-4 p-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  isCustomMode
                    ? 'bg-yellow-600/50 border border-yellow-500'
                    : 'bg-slate-700/50 hover:bg-slate-600/50 border border-transparent'
                }`}
              >
                <Sparkles size={16} />
                <span>Custom Kernel</span>
              </button>
            </div>
          </div>

          {/* Center Panel - Visualization */}
          <div className="col-span-6 space-y-4">
            {/* Active Kernel Display */}
            <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {isCustomMode ? 'Custom Kernel' : kernelPresets[selectedKernel].name}
                </h3>
                <button
                  onClick={() => setAnimatingKernel(!animatingKernel)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    animatingKernel ? 'bg-violet-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {animatingKernel ? 'Stop' : 'Animate'}
                </button>
              </div>

              {/* Kernel matrix */}
              <div className="flex justify-center mb-4">
                <div className="grid grid-cols-3 gap-1">
                  {activeKernel.map((row, i) =>
                    row.map((val, j) => (
                      <div
                        key={`k-${i}-${j}`}
                        className="relative"
                      >
                        {isCustomMode ? (
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => updateCustomKernel(i, j, e.target.value)}
                            className="w-16 h-16 text-center font-mono text-lg rounded border-2 border-slate-600 focus:border-yellow-500 bg-slate-700 text-white outline-none"
                            step="0.5"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 flex items-center justify-center font-mono text-lg rounded border-2 border-slate-600"
                            style={{ backgroundColor: getKernelColor(val) }}
                          >
                            {typeof val === 'number' ? (val % 1 === 0 ? val : val.toFixed(2)) : val}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {!isCustomMode && (
                <p className="text-center text-gray-400 text-sm">
                  {kernelPresets[selectedKernel].description}
                </p>
              )}

              {/* Color legend */}
              <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500/50" />
                  <span className="text-gray-400">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500/50" />
                  <span className="text-gray-400">Negative</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-500/50" />
                  <span className="text-gray-400">Zero</span>
                </div>
              </div>
            </div>

            {/* Input/Output Comparison */}
            <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye size={20} className="text-emerald-400" />
                  Result Preview
                </h3>
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    showComparison ? 'bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {showComparison ? 'Hide Original' : 'Compare'}
                </button>
              </div>

              <div className={`grid gap-6 ${showComparison ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {/* Original (if showing) */}
                {showComparison && (
                  <div>
                    <div className="text-sm text-blue-400 mb-2 font-semibold text-center">INPUT</div>
                    <div className="relative flex justify-center">
                      <div
                        className="grid gap-px bg-slate-600 p-1 rounded"
                        style={{ gridTemplateColumns: `repeat(${canvas[0].length}, 1fr)` }}
                      >
                        {canvas.map((row, i) =>
                          row.map((val, j) => (
                            <div
                              key={`in-${i}-${j}`}
                              className="w-4 h-4 rounded-sm"
                              style={{
                                backgroundColor: `rgba(59, 130, 246, ${val})`,
                              }}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Output */}
                <div>
                  <div className="text-sm text-emerald-400 mb-2 font-semibold text-center">
                    OUTPUT ({outputImage.length}×{outputImage[0]?.length || 0})
                  </div>
                  <div className="relative flex justify-center">
                    <div
                      className="grid gap-px bg-slate-600 p-1 rounded"
                      style={{ gridTemplateColumns: `repeat(${outputImage[0]?.length || 1}, 1fr)` }}
                    >
                      {normalizedOutput.map((row, i) =>
                        row.map((val, j) => {
                          const isActive = animatingKernel && i === kernelPos.row && j === kernelPos.col;
                          return (
                            <div
                              key={`out-${i}-${j}`}
                              className={`w-4 h-4 rounded-sm transition-all ${isActive ? 'ring-2 ring-yellow-400 z-10' : ''}`}
                              style={{
                                backgroundColor: `rgba(16, 185, 129, ${val})`,
                                transform: isActive ? 'scale(1.3)' : 'scale(1)',
                              }}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* What this kernel detects */}
              {!isCustomMode && (
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-sm font-semibold text-violet-400 mb-1">What it detects:</div>
                  <p className="text-sm text-gray-300">
                    {selectedKernel === 'edge' && 'Highlights all edges by finding pixels that differ significantly from their neighbors in all directions.'}
                    {selectedKernel === 'edgeH' && 'Responds strongly to horizontal lines and edges - notice how vertical lines in your drawing light up!'}
                    {selectedKernel === 'edgeV' && 'Responds strongly to vertical lines and edges - notice how horizontal lines in your drawing light up!'}
                    {selectedKernel === 'sharpen' && 'Amplifies differences between pixels, making edges and details more pronounced.'}
                    {selectedKernel === 'blur' && 'Averages each pixel with its neighbors, smoothing out sharp transitions and noise.'}
                    {selectedKernel === 'gaussianBlur' && 'Like box blur but with a bell-curve weighting, producing smoother, more natural blur.'}
                    {selectedKernel === 'emboss' && 'Creates a 3D effect by highlighting edges on one side while darkening the opposite side.'}
                    {selectedKernel === 'identity' && 'Passes the image through unchanged - the center 1 means "keep this pixel as is".'}
                    {selectedKernel === 'bottomSobel' && 'Emphasizes horizontal edges with brighter response at the bottom of objects.'}
                    {selectedKernel === 'outline' && 'Second-derivative edge detector that produces thin outlines of shapes.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Drawing Tools */}
          <div className="col-span-3 space-y-4">
            <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Paintbrush size={20} className="text-blue-400" />
                Draw Input
              </h3>

              {/* Drawing canvas */}
              <div className="flex justify-center mb-4">
                <div
                  className="grid gap-px bg-slate-600 p-1 rounded cursor-crosshair"
                  style={{ gridTemplateColumns: `repeat(${canvas[0].length}, 1fr)` }}
                  onMouseLeave={() => setIsDrawing(false)}
                >
                  {canvas.map((row, i) =>
                    row.map((val, j) => (
                      <div
                        key={`draw-${i}-${j}`}
                        className="w-4 h-4 rounded-sm transition-colors hover:ring-1 hover:ring-white"
                        style={{
                          backgroundColor: `rgba(59, 130, 246, ${val})`,
                        }}
                        onMouseDown={() => {
                          setIsDrawing(true);
                          handleCanvasDrag(i, j);
                        }}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseEnter={() => {
                          if (isDrawing) handleCanvasDrag(i, j);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Brush controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Brush:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBrushValue(0.9)}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        brushValue > 0.5 ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      Draw
                    </button>
                    <button
                      onClick={() => setBrushValue(0.1)}
                      className={`px-3 py-1 rounded text-sm transition-all flex items-center gap-1 ${
                        brushValue <= 0.5 ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <Eraser size={14} /> Erase
                    </button>
                  </div>
                </div>

                <button
                  onClick={clearCanvas}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw size={16} />
                  <span>Clear Canvas</span>
                </button>
              </div>

              {/* Preset patterns */}
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Quick Patterns:</div>
                <div className="grid grid-cols-3 gap-2">
                  {['cross', 'diagonal', 'square', 'circle', 'gradient', 'checker'].map(pattern => (
                    <button
                      key={pattern}
                      onClick={() => loadPattern(pattern)}
                      className="py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs capitalize transition-all"
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning Insight */}
            <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-slate-700">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-400" />
                Key Insight
              </h3>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong className="text-emerald-400">CNNs learn these kernels automatically!</strong>
                  {' '}During training, the network discovers which patterns are useful for the task.
                  Early layers learn simple patterns (edges), while deeper layers combine them into complex features (faces, objects).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Kernel Comparison */}
        <div className="mt-6 bg-slate-800/80 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Side-by-Side Comparison: Same Image, Different Kernels</h3>
          <div className="grid grid-cols-5 gap-4">
            {['identity', 'edge', 'edgeH', 'edgeV', 'blur'].map(kernelKey => {
              const preset = kernelPresets[kernelKey];
              const output = applyConvolution(canvas, preset.kernel);
              const normalized = normalizeForDisplay(output);

              return (
                <div key={kernelKey} className="text-center">
                  <div className="text-sm text-gray-400 mb-2">{preset.name}</div>
                  <div className="flex justify-center">
                    <div
                      className="grid gap-px bg-slate-600 p-1 rounded"
                      style={{ gridTemplateColumns: `repeat(${output[0]?.length || 1}, 1fr)` }}
                    >
                      {normalized.map((row, i) =>
                        row.map((val, j) => (
                          <div
                            key={`cmp-${kernelKey}-${i}-${j}`}
                            className="w-2 h-2 rounded-sm"
                            style={{
                              backgroundColor: `rgba(16, 185, 129, ${val})`,
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <a href="#" className="text-gray-400 hover:text-white flex items-center gap-2">
            <ChevronLeft size={16} /> Level 4: Convolution
          </a>
          <a href="#" className="text-violet-400 hover:text-violet-300 flex items-center gap-2">
            Level 6: Feature Maps <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default KernelGallery;
