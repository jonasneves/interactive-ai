import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Lightbulb, Check, Sparkles, Layers, Eye, Grid3X3
} from 'lucide-react';

const FeatureMaps = () => {
  const [eli5Mode, setEli5Mode] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [activeKernelIndex, setActiveKernelIndex] = useState(0);
  const [showAllMaps, setShowAllMaps] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Sample input image (8x8)
  const inputImage = [
    [10, 10, 10, 10, 200, 200, 200, 200],
    [10, 10, 10, 10, 200, 200, 200, 200],
    [10, 10, 10, 10, 200, 200, 200, 200],
    [10, 10, 10, 10, 200, 200, 200, 200],
    [200, 200, 200, 200, 10, 10, 10, 10],
    [200, 200, 200, 200, 10, 10, 10, 10],
    [200, 200, 200, 200, 10, 10, 10, 10],
    [200, 200, 200, 200, 10, 10, 10, 10],
  ];

  // Multiple kernels for different features
  const kernels = [
    {
      name: 'Vertical Edge',
      values: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
      color: '#3b82f6'
    },
    {
      name: 'Horizontal Edge',
      values: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
      color: '#8b5cf6'
    },
    {
      name: 'Diagonal',
      values: [[2, 1, 0], [1, 0, -1], [0, -1, -2]],
      color: '#10b981'
    },
    {
      name: 'Corner Detect',
      values: [[1, -1, -1], [-1, 4, -1], [-1, -1, 1]],
      color: '#f59e0b'
    },
  ];

  // Apply convolution
  const applyConvolution = (image, kernel) => {
    const result = [];
    for (let i = 0; i < image.length - 2; i++) {
      const row = [];
      for (let j = 0; j < image[0].length - 2; j++) {
        let sum = 0;
        for (let ki = 0; ki < 3; ki++) {
          for (let kj = 0; kj < 3; kj++) {
            sum += image[i + ki][j + kj] * kernel[ki][kj];
          }
        }
        row.push(sum);
      }
      result.push(row);
    }
    return result;
  };

  // Generate all feature maps
  const featureMaps = kernels.map(k => applyConvolution(inputImage, k.values));

  // Normalize for display
  const normalizeMap = (map) => {
    const flat = map.flat();
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    const range = max - min || 1;
    return map.map(row => row.map(val => Math.round(((val - min) / range) * 255)));
  };

  const sections = [
    {
      id: 'what',
      title: "What Are Feature Maps?",
      content: eli5Mode
        ? "When a kernel slides over an image, it creates a new picture called a feature map! Each feature map shows where a specific pattern (like edges or corners) is found in the original image."
        : "A feature map (or activation map) is the output produced when a kernel/filter convolves over an input. Each feature map represents the presence and location of a specific feature detected by its corresponding kernel."
    },
    {
      id: 'multiple',
      title: "Multiple Feature Maps",
      content: eli5Mode
        ? "CNNs use LOTS of different kernels at once - like having many different detectives each looking for their own clue. One finds horizontal lines, another finds corners, etc. More kernels = finding more patterns!"
        : "A single convolutional layer typically uses multiple kernels (e.g., 32, 64, 128) to detect different features simultaneously. Each kernel produces one feature map, so the output is a stack of feature maps - increasing depth as we go deeper."
    },
    {
      id: 'depth',
      title: "Channels & Depth",
      content: eli5Mode
        ? "Feature maps stack up like a deck of cards! The stack gets taller (more channels) as we add more kernels. A layer with 64 kernels makes a stack 64 cards tall!"
        : "Input images have channels (1 for grayscale, 3 for RGB). After convolution with N kernels, we get N feature maps. These become the 'channels' for the next layer. Depth grows: [H,W,1] → [H',W',32] → [H'',W'',64] ..."
    },
    {
      id: 'hierarchy',
      title: "Feature Hierarchy",
      content: eli5Mode
        ? "Early layers see simple things like edges. Later layers combine those edges to see shapes. Even later layers see whole objects! It's like building with LEGO - start with small pieces, build bigger things."
        : "CNNs learn hierarchical features. Early layers detect low-level features (edges, colors). Middle layers combine these into mid-level features (textures, shapes). Deep layers recognize high-level concepts (objects, faces)."
    }
  ];

  // Animation
  useEffect(() => {
    let interval;
    if (animating) {
      interval = setInterval(() => {
        setAnimStep(prev => {
          if (prev >= 35) { // 6x6 output
            setAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [animating]);

  const resetAnim = () => {
    setAnimStep(0);
    setAnimating(false);
  };

  // Feature map visualization
  const FeatureMapGrid = ({ data, color, size = 30, showValues = false }) => {
    const normalized = normalizeMap(data);
    return (
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${data[0].length}, ${size}px)` }}
      >
        {normalized.map((row, i) =>
          row.map((val, j) => (
            <div
              key={`${i}-${j}`}
              className="flex items-center justify-center text-xs font-mono rounded-sm"
              style={{
                width: size,
                height: size,
                backgroundColor: `rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, ${val / 255})`,
                color: val > 127 ? '#000' : '#fff'
              }}
            >
              {showValues && <span style={{ fontSize: size < 25 ? '8px' : '10px' }}>{data[i][j]}</span>}
            </div>
          ))
        )}
      </div>
    );
  };

  // Input image display
  const InputImageGrid = ({ highlight = null }) => (
    <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(8, 28px)' }}>
      {inputImage.map((row, i) =>
        row.map((val, j) => {
          const isHighlighted = highlight &&
            i >= highlight.row && i < highlight.row + 3 &&
            j >= highlight.col && j < highlight.col + 3;
          return (
            <div
              key={`${i}-${j}`}
              className={`w-7 h-7 flex items-center justify-center text-xs font-mono rounded-sm transition-all ${
                isHighlighted ? 'ring-2 ring-yellow-400 scale-110 z-10' : ''
              }`}
              style={{
                backgroundColor: `rgb(${val}, ${val}, ${val})`,
                color: val > 127 ? '#000' : '#fff'
              }}
            >
              {val}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-violet-500/20 text-violet-300 text-sm rounded-full">
                Level 6
              </span>
              <span className="text-slate-400">Core CNN</span>
            </div>
            <h1 className="text-3xl font-bold">Building Feature Maps</h1>
            <p className="text-slate-400 mt-1">How CNNs extract and stack features</p>
          </div>

          <button
            onClick={() => setEli5Mode(!eli5Mode)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              eli5Mode
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Lightbulb size={18} />
            {eli5Mode ? 'ELI5 Mode ON' : 'ELI5 Mode'}
          </button>
        </div>

        {/* Section Navigator */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {sections.map((section, idx) => (
            <button
              key={section.id}
              onClick={() => { setCurrentSection(idx); resetAnim(); }}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentSection === idx
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">{sections[currentSection].title}</h2>
          <p className="text-slate-300 leading-relaxed mb-6">{sections[currentSection].content}</p>

          {currentSection === 0 && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => { resetAnim(); setAnimating(true); }}
                  className="px-4 py-2 bg-violet-500/20 text-violet-300 rounded-lg flex items-center gap-2 hover:bg-violet-500/30"
                >
                  <Play size={18} />
                  Animate Convolution
                </button>
                <button
                  onClick={resetAnim}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-600"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Input */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-sm text-slate-400 mb-3 text-center">Input Image (8×8)</h4>
                  <div className="flex justify-center">
                    <InputImageGrid
                      highlight={animStep < 36 ? {
                        row: Math.floor(animStep / 6),
                        col: animStep % 6
                      } : null}
                    />
                  </div>
                </div>

                {/* Kernel */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-sm text-slate-400 mb-3 text-center">
                    Kernel: {kernels[activeKernelIndex].name}
                  </h4>
                  <div className="flex justify-center mb-4">
                    <div className="grid grid-cols-3 gap-1">
                      {kernels[activeKernelIndex].values.map((row, i) =>
                        row.map((val, j) => (
                          <div
                            key={`${i}-${j}`}
                            className="w-12 h-12 flex items-center justify-center font-mono rounded"
                            style={{ backgroundColor: kernels[activeKernelIndex].color + '40' }}
                          >
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center gap-2">
                    {kernels.map((k, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setActiveKernelIndex(idx); resetAnim(); }}
                        className={`w-8 h-8 rounded-full transition-all ${
                          idx === activeKernelIndex ? 'ring-2 ring-white scale-110' : ''
                        }`}
                        style={{ backgroundColor: k.color }}
                        title={k.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Output */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-sm text-slate-400 mb-3 text-center">Feature Map (6×6)</h4>
                  <div className="flex justify-center">
                    <FeatureMapGrid
                      data={featureMaps[activeKernelIndex]}
                      color={kernels[activeKernelIndex].color}
                      size={35}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setShowAllMaps(!showAllMaps)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    showAllMaps ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  <Layers size={18} />
                  {showAllMaps ? 'Hide All Maps' : 'Show All Feature Maps'}
                </button>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {kernels.map((kernel, idx) => (
                    <div key={idx} className="text-center">
                      <h4 className="text-sm mb-2" style={{ color: kernel.color }}>
                        {kernel.name}
                      </h4>
                      <div className="flex justify-center mb-2">
                        <FeatureMapGrid
                          data={featureMaps[idx]}
                          color={kernel.color}
                          size={showAllMaps ? 30 : 25}
                        />
                      </div>
                      {showAllMaps && (
                        <div className="grid grid-cols-3 gap-0.5 mt-2 mx-auto w-fit">
                          {kernel.values.map((row, i) =>
                            row.map((val, j) => (
                              <div
                                key={`${i}-${j}`}
                                className="w-6 h-6 flex items-center justify-center text-xs font-mono rounded"
                                style={{ backgroundColor: kernel.color + '30' }}
                              >
                                {val}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
                <p className="text-violet-300 text-sm">
                  <strong>Key insight:</strong> Each kernel detects a different feature! The vertical edge
                  kernel lights up where it finds vertical edges, while the horizontal edge kernel responds
                  to horizontal edges. Together, they give the network a rich understanding of the image.
                </p>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Dimension Changes Through Layers</h4>

                <div className="flex items-center justify-center gap-4 overflow-x-auto pb-4">
                  {[
                    { shape: '28×28×1', label: 'Input', color: '#64748b' },
                    { shape: '26×26×32', label: 'Conv1', color: '#3b82f6' },
                    { shape: '24×24×64', label: 'Conv2', color: '#8b5cf6' },
                    { shape: '22×22×128', label: 'Conv3', color: '#10b981' },
                  ].map((layer, idx) => (
                    <React.Fragment key={idx}>
                      <div className="text-center">
                        <div
                          className="rounded-lg p-4 mb-2"
                          style={{ backgroundColor: layer.color + '20', borderColor: layer.color, borderWidth: 2 }}
                        >
                          <p className="font-mono text-lg" style={{ color: layer.color }}>
                            {layer.shape}
                          </p>
                        </div>
                        <p className="text-sm text-slate-400">{layer.label}</p>
                      </div>
                      {idx < 3 && (
                        <ChevronRight size={24} className="text-slate-600 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="text-center text-slate-400 text-sm mt-4">
                  Notice: Spatial dimensions shrink, but depth (channels) grows!
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">Input Channels</h4>
                  <p className="text-sm text-slate-400">
                    Grayscale: 1 channel<br/>
                    RGB: 3 channels<br/>
                    Previous layer output becomes next input
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-violet-300 font-semibold mb-2">Output Channels</h4>
                  <p className="text-sm text-slate-400">
                    = Number of kernels<br/>
                    32, 64, 128 common choices<br/>
                    More channels = more features
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-emerald-300 font-semibold mb-2">Kernel Dimensions</h4>
                  <p className="text-sm text-slate-400">
                    3D kernels for multi-channel input<br/>
                    e.g., 3×3×32 for 32-channel input<br/>
                    Still produces 1 feature map each
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-6 text-center">Feature Hierarchy in CNNs</h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Layer 1', features: 'Edges, Lines', examples: '─ │ ╲ ╱', color: '#3b82f6' },
                    { name: 'Layer 2-3', features: 'Textures, Corners', examples: '◢ ◣ ⊞ ◎', color: '#8b5cf6' },
                    { name: 'Layer 4-5', features: 'Parts, Shapes', examples: '👁 👃 🚗', color: '#10b981' },
                    { name: 'Deep Layers', features: 'Objects, Concepts', examples: '😀 🐕 🏠', color: '#f59e0b' },
                  ].map((level, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg p-4 text-center"
                      style={{ backgroundColor: level.color + '15', borderColor: level.color, borderWidth: 1 }}
                    >
                      <h5 className="font-semibold mb-2" style={{ color: level.color }}>{level.name}</h5>
                      <p className="text-2xl mb-2">{level.examples}</p>
                      <p className="text-sm text-slate-400">{level.features}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>Low-level</span>
                    <div className="w-32 h-2 bg-gradient-to-r from-blue-500 via-violet-500 to-amber-500 rounded-full" />
                    <span>High-level</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-300 text-sm">
                  <strong>This is the magic of deep learning!</strong> The network automatically learns
                  this hierarchy - we don't hand-craft features. Early layers learn edges because that's
                  what helps solve the task; deeper layers build on those to recognize complex objects.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quiz */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-400" />
            Quick Quiz
          </h3>

          <div className="space-y-6">
            <div>
              <p className="text-slate-300 mb-3">
                If a conv layer has 64 kernels applied to a 28×28×32 input, what is the output depth?
              </p>
              <div className="flex gap-3 flex-wrap">
                {[32, 64, 96, 2048].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({...quizAnswers, q1: ans})}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      quizAnswers.q1 === undefined
                        ? 'border-slate-600 hover:border-slate-500'
                        : ans === 64
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : quizAnswers.q1 === ans
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-slate-600 opacity-50'
                    }`}
                    disabled={quizAnswers.q1 !== undefined}
                  >
                    <span className="font-mono">{ans}</span>
                  </button>
                ))}
              </div>
              {quizAnswers.q1 !== undefined && (
                <p className={`mt-2 text-sm ${quizAnswers.q1 === 64 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {quizAnswers.q1 === 64
                    ? '✓ Correct! Output depth = number of kernels, regardless of input depth.'
                    : '✗ Output depth equals the number of kernels (64), not the input depth!'}
                </p>
              )}
            </div>

            <div>
              <p className="text-slate-300 mb-3">
                Which features do early CNN layers typically detect?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: 'Edges and simple patterns', correct: true },
                  { text: 'Faces and objects', correct: false },
                  { text: 'Colors only', correct: false },
                  { text: 'Random noise', correct: false },
                ].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({...quizAnswers, q2: option.correct})}
                    className={`px-4 py-2 rounded-lg border text-left transition-all ${
                      quizAnswers.q2 === undefined
                        ? 'border-slate-600 hover:border-slate-500'
                        : option.correct
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-slate-600 opacity-50'
                    }`}
                    disabled={quizAnswers.q2 !== undefined}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-6">
          <h3 className="font-semibold mb-3 text-violet-300">Key Takeaways</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>Each kernel produces one feature map showing where its pattern appears</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>Multiple kernels run in parallel, creating a stack of feature maps</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>Output depth = number of kernels; this becomes input channels for next layer</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>CNNs automatically learn hierarchical features: edges → parts → objects</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeatureMaps;
