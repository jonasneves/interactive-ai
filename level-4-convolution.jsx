import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Volume2, Grid, Zap, HelpCircle, CheckCircle } from 'lucide-react';

const ConvolutionDeepDive = () => {
  // Mode: '1d' for audio/signal, '2d' for image
  const [mode, setMode] = useState('1d');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showELI5, setShowELI5] = useState(false);
  const [kernelPos, setKernelPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [kernelPos2D, setKernelPos2D] = useState({ row: 0, col: 0 });
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // 1D Signal data (audio-like waveform)
  const signal1D = [0.2, 0.4, 0.8, 1.0, 0.8, 0.4, 0.2, 0.1, 0.3, 0.6, 0.9, 0.7, 0.3, 0.1, 0.2, 0.5, 0.8, 0.6, 0.3, 0.1];
  const kernel1D = [0.25, 0.5, 0.25]; // Smoothing kernel

  // 2D Image data (5x5)
  const [image2D, setImage2D] = useState([
    [0.1, 0.1, 0.9, 0.1, 0.1],
    [0.1, 0.1, 0.9, 0.1, 0.1],
    [0.9, 0.9, 0.9, 0.9, 0.9],
    [0.1, 0.1, 0.9, 0.1, 0.1],
    [0.1, 0.1, 0.9, 0.1, 0.1],
  ]);

  const kernel2D = [
    [-1, -1, -1],
    [-1, 8, -1],
    [-1, -1, -1],
  ]; // Edge detection

  // Calculate 1D convolution output
  const calculate1DConv = useCallback(() => {
    const output = [];
    for (let i = 0; i <= signal1D.length - kernel1D.length; i++) {
      let sum = 0;
      for (let j = 0; j < kernel1D.length; j++) {
        sum += signal1D[i + j] * kernel1D[j];
      }
      output.push(sum);
    }
    return output;
  }, []);

  const output1D = calculate1DConv();

  // Calculate single 1D convolution step
  const get1DStepDetails = (pos) => {
    const elements = [];
    let sum = 0;
    for (let j = 0; j < kernel1D.length; j++) {
      const inputVal = signal1D[pos + j];
      const kernelVal = kernel1D[j];
      const product = inputVal * kernelVal;
      elements.push({ input: inputVal, kernel: kernelVal, product });
      sum += product;
    }
    return { elements, sum };
  };

  // Calculate 2D convolution output
  const calculate2DConv = useCallback(() => {
    const output = [];
    for (let i = 0; i <= image2D.length - 3; i++) {
      const row = [];
      for (let j = 0; j <= image2D[0].length - 3; j++) {
        let sum = 0;
        for (let ki = 0; ki < 3; ki++) {
          for (let kj = 0; kj < 3; kj++) {
            sum += image2D[i + ki][j + kj] * kernel2D[ki][kj];
          }
        }
        row.push(Math.max(0, sum));
      }
      output.push(row);
    }
    return output;
  }, [image2D]);

  const output2D = calculate2DConv();

  // Get 2D step details
  const get2DStepDetails = (row, col) => {
    const elements = [];
    let sum = 0;
    for (let ki = 0; ki < 3; ki++) {
      for (let kj = 0; kj < 3; kj++) {
        const inputVal = image2D[row + ki]?.[col + kj] ?? 0;
        const kernelVal = kernel2D[ki][kj];
        const product = inputVal * kernelVal;
        elements.push({ input: inputVal, kernel: kernelVal, product, ki, kj });
        sum += product;
      }
    }
    return { elements, sum, reluOutput: Math.max(0, sum) };
  };

  // Animation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (mode === '1d') {
        setKernelPos(prev => {
          const maxPos = signal1D.length - kernel1D.length;
          return prev >= maxPos ? 0 : prev + 1;
        });
      } else {
        setKernelPos2D(prev => {
          const maxRow = image2D.length - 3;
          const maxCol = image2D[0].length - 3;
          if (prev.col < maxCol) return { ...prev, col: prev.col + 1 };
          if (prev.row < maxRow) return { row: prev.row + 1, col: 0 };
          return { row: 0, col: 0 };
        });
      }
    }, 800 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, mode, speed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (mode === '1d') {
          setKernelPos(p => Math.min(signal1D.length - kernel1D.length, p + 1));
        } else {
          setKernelPos2D(prev => {
            const maxCol = image2D[0].length - 3;
            const maxRow = image2D.length - 3;
            if (prev.col < maxCol) return { ...prev, col: prev.col + 1 };
            if (prev.row < maxRow) return { row: prev.row + 1, col: 0 };
            return prev;
          });
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (mode === '1d') {
          setKernelPos(p => Math.max(0, p - 1));
        } else {
          setKernelPos2D(prev => {
            if (prev.col > 0) return { ...prev, col: prev.col - 1 };
            if (prev.row > 0) return { row: prev.row - 1, col: image2D[0].length - 3 };
            return prev;
          });
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode]);

  const reset = () => {
    setIsPlaying(false);
    setKernelPos(0);
    setKernelPos2D({ row: 0, col: 0 });
    setQuizAnswer(null);
    setQuizSubmitted(false);
  };

  // Learning steps content
  const learningSteps = [
    {
      title: 'What is Convolution?',
      content: 'Convolution is a mathematical operation that combines two functions to produce a third. In neural networks, we slide a small "kernel" (filter) across our input, computing dot products at each position.',
      eli5: 'Imagine looking through a magnifying glass 🔍 and sliding it across a picture. At each spot, you take notes about what you see. Convolution does the same thing with numbers!',
    },
    {
      title: 'The Sliding Window',
      content: 'The kernel "slides" across the input one step at a time. At each position, we multiply corresponding elements and sum them up. This is called a dot product.',
      eli5: 'Like a caterpillar 🐛 crawling across a leaf, looking at a few squares at a time and writing down what it finds!',
    },
    {
      title: 'Finding Patterns',
      content: 'Different kernels detect different features. An edge detection kernel finds boundaries. A blur kernel smooths images. The kernel values determine what pattern it responds to.',
      eli5: 'Different magnifying glasses can find different things - one might find edges of shapes, another might find where colors change. Each glass has a special superpower! ✨',
    },
    {
      title: 'From 1D to 2D',
      content: 'Audio signals are 1D (just time). Images are 2D (width × height). The same sliding window concept applies - we just slide in two directions instead of one.',
      eli5: 'In 1D, the caterpillar crawls in a straight line →. In 2D, it zigzags across the whole picture like reading a book! 📖',
    },
  ];

  const currentStep = learningSteps[step];

  // Quiz questions
  const quizQuestions = [
    {
      question: 'If a 3×3 kernel slides across a 5×5 image (no padding), what size is the output?',
      options: ['5×5', '4×4', '3×3', '2×2'],
      correct: 2,
      explanation: 'The kernel can start at positions 0, 1, 2 in each direction (3 positions total), giving a 3×3 output.',
    },
    {
      question: 'What does an edge detection kernel respond strongly to?',
      options: ['Uniform regions', 'Sudden changes in intensity', 'Dark pixels', 'Light pixels'],
      correct: 1,
      explanation: 'Edge detection kernels have negative and positive values that cancel out in uniform regions but produce large outputs where intensity changes.',
    },
  ];

  const currentQuiz = quizQuestions[mode === '1d' ? 0 : 1];

  // 1D Visualization
  const render1DVisualization = () => {
    const stepDetails = get1DStepDetails(kernelPos);
    const svgWidth = 800;
    const svgHeight = 300;
    const margin = { top: 40, right: 20, bottom: 40, left: 60 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const barWidth = width / signal1D.length;
    const outputBarWidth = width / output1D.length;

    return (
      <div className="space-y-4">
        {/* Signal Visualization */}
        <div className="bg-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-blue-400 mb-2 font-semibold">INPUT SIGNAL (1D Audio Waveform)</div>
          <svg width={svgWidth} height={svgHeight} className="overflow-visible">
            <defs>
              <linearGradient id="signalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="kernelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Axis */}
            <line x1={margin.left} y1={margin.top + height} x2={margin.left + width} y2={margin.top + height} stroke="#475569" strokeWidth="2" />

            {/* Signal bars */}
            {signal1D.map((val, i) => {
              const isInKernel = i >= kernelPos && i < kernelPos + kernel1D.length;
              const barHeight = val * (height - 20);
              return (
                <g key={i}>
                  <rect
                    x={margin.left + i * barWidth + 2}
                    y={margin.top + height - barHeight}
                    width={barWidth - 4}
                    height={barHeight}
                    fill={isInKernel ? 'url(#kernelGrad)' : 'url(#signalGrad)'}
                    className={`transition-all duration-200 ${isInKernel ? 'opacity-100' : 'opacity-60'}`}
                    rx="2"
                  />
                  {isInKernel && (
                    <text
                      x={margin.left + i * barWidth + barWidth / 2}
                      y={margin.top + height - barHeight - 8}
                      textAnchor="middle"
                      className="fill-yellow-400 text-xs font-mono"
                    >
                      {val.toFixed(2)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Kernel overlay box */}
            <rect
              x={margin.left + kernelPos * barWidth}
              y={margin.top}
              width={kernel1D.length * barWidth}
              height={height}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeDasharray="5,5"
              className="animate-pulse"
              rx="4"
            />

            {/* Kernel label */}
            <text
              x={margin.left + kernelPos * barWidth + (kernel1D.length * barWidth) / 2}
              y={margin.top - 10}
              textAnchor="middle"
              className="fill-yellow-400 text-sm font-bold"
            >
              KERNEL [{kernel1D.join(', ')}]
            </text>
          </svg>
        </div>

        {/* Calculation breakdown */}
        <div className="bg-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-violet-400 mb-3 font-semibold">ELEMENT-WISE MULTIPLICATION</div>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {stepDetails.elements.map((el, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-blue-500/30 border border-blue-500 rounded px-3 py-2 text-center">
                  <div className="text-xs text-blue-400">input</div>
                  <div className="text-lg font-mono text-blue-300">{el.input.toFixed(2)}</div>
                </div>
                <span className="text-yellow-400 text-xl">×</span>
                <div className="bg-yellow-500/30 border border-yellow-500 rounded px-3 py-2 text-center">
                  <div className="text-xs text-yellow-400">kernel</div>
                  <div className="text-lg font-mono text-yellow-300">{el.kernel.toFixed(2)}</div>
                </div>
                <span className="text-gray-400 text-xl">=</span>
                <div className="bg-green-500/30 border border-green-500 rounded px-3 py-2 text-center">
                  <div className="text-xs text-green-400">product</div>
                  <div className="text-lg font-mono text-green-300">{el.product.toFixed(3)}</div>
                </div>
                {i < stepDetails.elements.length - 1 && (
                  <span className="text-white text-xl ml-2">+</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="text-gray-400">Sum = </span>
            <span className="text-2xl font-bold text-emerald-400">{stepDetails.sum.toFixed(3)}</span>
            <span className="text-gray-400 ml-4">→ Output position {kernelPos}</span>
          </div>
        </div>

        {/* Output signal */}
        <div className="bg-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-emerald-400 mb-2 font-semibold">OUTPUT SIGNAL (Convolved)</div>
          <svg width={svgWidth} height={150}>
            {output1D.map((val, i) => {
              const barHeight = Math.min(val, 1) * 100;
              const isActive = i === kernelPos;
              return (
                <g key={i}>
                  <rect
                    x={margin.left + i * outputBarWidth + 2}
                    y={120 - barHeight}
                    width={outputBarWidth - 4}
                    height={barHeight}
                    fill={isActive ? '#10b981' : '#065f46'}
                    className={`transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-60'}`}
                    rx="2"
                  />
                  {isActive && (
                    <>
                      <circle cx={margin.left + i * outputBarWidth + outputBarWidth / 2} cy={120 - barHeight - 10} r="6" fill="#10b981" className="animate-ping" />
                      <circle cx={margin.left + i * outputBarWidth + outputBarWidth / 2} cy={120 - barHeight - 10} r="4" fill="#10b981" />
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // 2D Visualization
  const render2DVisualization = () => {
    const stepDetails = get2DStepDetails(kernelPos2D.row, kernelPos2D.col);
    const cellSize = 50;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          {/* Input Image */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="text-sm text-blue-400 mb-3 font-semibold">INPUT IMAGE (5×5)</div>
            <div className="relative inline-block">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(5, ${cellSize}px)` }}>
                {image2D.map((row, i) =>
                  row.map((val, j) => {
                    const isInKernel = i >= kernelPos2D.row && i < kernelPos2D.row + 3 &&
                                       j >= kernelPos2D.col && j < kernelPos2D.col + 3;
                    return (
                      <div
                        key={`${i}-${j}`}
                        className={`flex items-center justify-center font-mono text-sm rounded transition-all duration-200 ${
                          isInKernel
                            ? 'ring-2 ring-yellow-400 bg-yellow-500/30 text-white scale-105 z-10'
                            : 'bg-blue-500/30 text-blue-300'
                        }`}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          opacity: isInKernel ? 1 : 0.5,
                        }}
                      >
                        {val.toFixed(1)}
                      </div>
                    );
                  })
                )}
              </div>
              {/* Kernel overlay */}
              <div
                className="absolute border-3 border-yellow-400 rounded pointer-events-none"
                style={{
                  width: 3 * cellSize + 8,
                  height: 3 * cellSize + 8,
                  top: kernelPos2D.row * (cellSize + 4) - 2,
                  left: kernelPos2D.col * (cellSize + 4) - 2,
                  boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
                }}
              />
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Kernel position: [{kernelPos2D.row}, {kernelPos2D.col}]
            </div>
          </div>

          {/* Kernel */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="text-sm text-yellow-400 mb-3 font-semibold">KERNEL (3×3 Edge Detection)</div>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(3, ${cellSize}px)` }}>
              {kernel2D.map((row, i) =>
                row.map((val, j) => (
                  <div
                    key={`k-${i}-${j}`}
                    className={`flex items-center justify-center font-mono text-sm rounded ${
                      val > 0 ? 'bg-green-500/50 text-green-300' : val < 0 ? 'bg-red-500/50 text-red-300' : 'bg-gray-500/50 text-gray-300'
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {val}
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Green = positive, Red = negative
            </div>
          </div>
        </div>

        {/* Calculation Grid */}
        <div className="bg-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-violet-400 mb-3 font-semibold">ELEMENT-WISE MULTIPLICATION (9 products)</div>
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            {stepDetails.elements.map((el, idx) => (
              <div key={idx} className="bg-slate-800 rounded p-2 text-center">
                <div className="text-xs text-gray-400 mb-1">
                  <span className="text-blue-400">{el.input.toFixed(1)}</span>
                  <span className="text-yellow-400"> × </span>
                  <span className={el.kernel >= 0 ? 'text-green-400' : 'text-red-400'}>{el.kernel}</span>
                </div>
                <div className={`text-lg font-mono ${el.product >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {el.product.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center border-t border-slate-600 pt-4">
            <div className="text-gray-400">
              Sum of products = <span className={`text-xl font-bold ${stepDetails.sum >= 0 ? 'text-violet-400' : 'text-red-400'}`}>{stepDetails.sum.toFixed(2)}</span>
            </div>
            <div className="text-gray-400 mt-2">
              After ReLU = <span className="text-xl font-bold text-emerald-400">{stepDetails.reluOutput.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Output Feature Map */}
        <div className="bg-slate-700/50 rounded-xl p-4">
          <div className="text-sm text-emerald-400 mb-3 font-semibold">OUTPUT FEATURE MAP (3×3)</div>
          <div className="flex justify-center">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(3, ${cellSize}px)` }}>
              {output2D.map((row, i) =>
                row.map((val, j) => {
                  const isActive = i === kernelPos2D.row && j === kernelPos2D.col;
                  const intensity = Math.min(1, val / 5);
                  return (
                    <div
                      key={`out-${i}-${j}`}
                      className={`flex items-center justify-center font-mono text-sm rounded transition-all duration-200 ${
                        isActive ? 'ring-2 ring-emerald-400 scale-110' : ''
                      }`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: `rgba(16, 185, 129, ${intensity})`,
                        color: intensity > 0.5 ? 'white' : '#10b981',
                      }}
                    >
                      {val.toFixed(1)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-400">Level 4</span>
            <span>→</span>
            <span>CNN Course</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-violet-400 to-yellow-400 bg-clip-text text-transparent">
            What is Convolution?
          </h1>
          <p className="text-gray-400">
            Deep dive into the fundamental operation of CNNs
            <span className="text-gray-600 ml-3 text-sm">[Space: Play/Pause] [←→: Step]</span>
          </p>
        </div>

        {/* Learning Progress */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Zap size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{currentStep.title}</h2>
                <p className="text-sm text-gray-400">Step {step + 1} of {learningSteps.length}</p>
              </div>
            </div>
            <button
              onClick={() => setShowELI5(!showELI5)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                showELI5 ? 'bg-yellow-500 text-black' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <HelpCircle size={16} />
              <span className="text-sm">ELI5</span>
            </button>
          </div>

          {/* Step content */}
          <div className={`p-4 rounded-lg transition-all ${showELI5 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-slate-700/50'}`}>
            <p className="text-gray-300">
              {showELI5 ? currentStep.eli5 : currentStep.content}
            </p>
          </div>

          {/* Step navigation */}
          <div className="flex gap-2 mt-4">
            {learningSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setStep(idx)}
                className={`flex-1 h-2 rounded-full transition-all ${
                  idx === step ? 'bg-violet-500 shadow-lg shadow-violet-500/30' : idx < step ? 'bg-slate-600' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => setStep(s => Math.min(learningSteps.length - 1, s + 1))}
              disabled={step === learningSteps.length - 1}
              className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('1d'); reset(); }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  mode === '1d' ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <Volume2 size={18} />
                <span>1D Signal</span>
              </button>
              <button
                onClick={() => { setMode('2d'); reset(); }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  mode === '2d' ? 'bg-violet-600 shadow-lg shadow-violet-500/30' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <Grid size={18} />
                <span>2D Image</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  isPlaying ? 'bg-slate-600' : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
              </button>
              <button
                onClick={reset}
                className="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all"
              >
                <RotateCcw size={16} />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Speed:</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-20 accent-violet-500"
                />
                <span className="text-sm font-mono text-violet-400 w-8">{speed}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700">
          {mode === '1d' ? render1DVisualization() : render2DVisualization()}
        </div>

        {/* Mini Quiz */}
        <div className="bg-slate-800/80 backdrop-blur rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-green-400" />
            <h3 className="text-lg font-semibold">Quick Check</h3>
          </div>
          <p className="text-gray-300 mb-4">{currentQuiz.question}</p>
          <div className="grid grid-cols-2 gap-3">
            {currentQuiz.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!quizSubmitted) setQuizAnswer(idx);
                }}
                className={`p-3 rounded-lg text-left transition-all ${
                  quizSubmitted
                    ? idx === currentQuiz.correct
                      ? 'bg-green-500/30 border-2 border-green-500'
                      : idx === quizAnswer
                        ? 'bg-red-500/30 border-2 border-red-500'
                        : 'bg-slate-700/50'
                    : quizAnswer === idx
                      ? 'bg-violet-500/30 border-2 border-violet-500'
                      : 'bg-slate-700/50 hover:bg-slate-600/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {quizAnswer !== null && !quizSubmitted && (
            <button
              onClick={() => setQuizSubmitted(true)}
              className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-all"
            >
              Check Answer
            </button>
          )}
          {quizSubmitted && (
            <div className={`mt-4 p-4 rounded-lg ${quizAnswer === currentQuiz.correct ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
              <p className={quizAnswer === currentQuiz.correct ? 'text-green-400' : 'text-yellow-400'}>
                {quizAnswer === currentQuiz.correct ? '✓ Correct!' : '✗ Not quite.'}
              </p>
              <p className="text-gray-300 mt-2">{currentQuiz.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigation to next level */}
        <div className="mt-6 flex justify-between">
          <a href="#" className="text-gray-400 hover:text-white flex items-center gap-2">
            <ChevronLeft size={16} /> Back to Overview
          </a>
          <a href="#" className="text-violet-400 hover:text-violet-300 flex items-center gap-2">
            Level 5: Kernel Gallery <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConvolutionDeepDive;
