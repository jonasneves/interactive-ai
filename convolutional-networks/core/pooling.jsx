import React, { useState, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Lightbulb, Check, Sparkles, Minimize2, ArrowDownRight
} from 'lucide-react';

const Pooling = () => {
  const [eli5Mode, setEli5Mode] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [poolType, setPoolType] = useState('max'); // max, avg, global
  const [poolSize, setPoolSize] = useState(2);
  const [stride, setStride] = useState(2);
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Sample input (4x4 feature map)
  const inputMap = [
    [1, 3, 2, 1],
    [4, 6, 8, 2],
    [5, 2, 9, 4],
    [7, 1, 3, 6],
  ];

  // Larger sample for stride visualization
  const largeInput = [
    [1, 3, 2, 1, 5, 2],
    [4, 6, 8, 2, 3, 1],
    [5, 2, 9, 4, 7, 8],
    [7, 1, 3, 6, 2, 4],
    [2, 8, 4, 5, 9, 3],
    [6, 3, 7, 1, 4, 6],
  ];

  // Apply pooling
  const applyPooling = (input, size, stride, type) => {
    const result = [];
    for (let i = 0; i <= input.length - size; i += stride) {
      const row = [];
      for (let j = 0; j <= input[0].length - size; j += stride) {
        let values = [];
        for (let pi = 0; pi < size; pi++) {
          for (let pj = 0; pj < size; pj++) {
            values.push(input[i + pi][j + pj]);
          }
        }
        if (type === 'max') {
          row.push(Math.max(...values));
        } else if (type === 'avg') {
          row.push(Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10);
        }
      }
      result.push(row);
    }
    return result;
  };

  const pooledOutput = applyPooling(inputMap, poolSize, stride, poolType);

  const sections = [
    {
      id: 'what',
      title: "What is Pooling?",
      content: eli5Mode
        ? "Pooling makes the feature map smaller by summarizing regions! Like when you zoom out on a map - you lose details but keep the important stuff. It helps CNNs work faster and focus on what matters."
        : "Pooling (subsampling/downsampling) reduces the spatial dimensions of feature maps. It summarizes regions, reducing parameters and computation while providing some translation invariance - the network becomes less sensitive to exact feature positions."
    },
    {
      id: 'types',
      title: "Max vs Average Pooling",
      content: eli5Mode
        ? "Max pooling picks the biggest number in each region - like finding the loudest voice in a crowd. Average pooling takes the average - like measuring the crowd's overall mood. Max is more popular because it keeps the strongest signals!"
        : "Max pooling takes the maximum value in each window, preserving the strongest activations. Average pooling computes the mean, smoothing the features. Max pooling is more common as it better preserves important features and provides some noise resistance."
    },
    {
      id: 'stride',
      title: "Pool Size & Stride",
      content: eli5Mode
        ? "Pool size is how big each region is (usually 2×2). Stride is how far the window jumps each time. With stride=2, we cut the size in half! It's like taking every other sample."
        : "Pool size determines the window dimensions (commonly 2×2). Stride controls how much the window moves between operations. With 2×2 pooling and stride 2 (most common), spatial dimensions are halved, significantly reducing computation for deeper layers."
    },
    {
      id: 'global',
      title: "Global Average Pooling",
      content: eli5Mode
        ? "Global pooling squishes an entire feature map into just ONE number! It's like summarizing a whole book in a single word. This is often used right before making the final prediction."
        : "Global Average Pooling (GAP) reduces each feature map to a single value by averaging all positions. It's often used before the final classification layer, replacing fully connected layers and drastically reducing parameters while maintaining spatial invariance."
    },
    {
      id: 'when',
      title: "Where in the Network?",
      content: eli5Mode
        ? "Pooling usually comes after convolution and ReLU. The pattern is: Convolve → Activate → Pool, repeated multiple times. Each pooling layer makes the image smaller but keeps the important features!"
        : "Pooling typically follows Conv+ReLU blocks. Modern architectures use it sparingly (every few conv layers) or replace it with strided convolutions. The general pattern: Conv→ReLU→Conv→ReLU→Pool, progressively reducing spatial dimensions while increasing depth."
    }
  ];

  // Animation
  useEffect(() => {
    let interval;
    if (animating) {
      const maxSteps = Math.ceil(inputMap.length / stride) * Math.ceil(inputMap[0].length / stride);
      interval = setInterval(() => {
        setAnimStep(prev => {
          if (prev >= maxSteps - 1) {
            setAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [animating, stride]);

  const resetAnim = () => {
    setAnimStep(0);
    setAnimating(false);
  };

  // Get current window position for animation
  const getWindowPos = (step) => {
    const cols = Math.ceil(inputMap[0].length / stride);
    return {
      row: Math.floor(step / cols) * stride,
      col: (step % cols) * stride
    };
  };

  // Grid visualization
  const PoolingGrid = ({ data, windowPos = null, poolSize: pSize = 2 }) => (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${data[0].length}, 50px)` }}>
      {data.map((row, i) =>
        row.map((val, j) => {
          const inWindow = windowPos &&
            i >= windowPos.row && i < windowPos.row + pSize &&
            j >= windowPos.col && j < windowPos.col + pSize;
          const isMax = inWindow && val === Math.max(
            ...data.slice(windowPos.row, windowPos.row + pSize)
              .flatMap(r => r.slice(windowPos.col, windowPos.col + pSize))
          );

          return (
            <div
              key={`${i}-${j}`}
              className={`w-12 h-12 flex items-center justify-center font-mono text-lg rounded transition-all ${
                inWindow
                  ? isMax && poolType === 'max'
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 scale-110 z-10'
                    : 'bg-yellow-500/30 text-yellow-100'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {val}
            </div>
          );
        })
      )}
    </div>
  );

  // Output grid with highlighting
  const OutputGrid = ({ data, highlightIdx = -1 }) => (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${data[0].length}, 50px)` }}>
      {data.map((row, i) =>
        row.map((val, j) => {
          const idx = i * data[0].length + j;
          return (
            <div
              key={`${i}-${j}`}
              className={`w-12 h-12 flex items-center justify-center font-mono text-lg rounded transition-all ${
                idx <= highlightIdx
                  ? 'bg-emerald-500/80 text-white'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {idx <= highlightIdx ? val : '?'}
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
                Level 7
              </span>
              <span className="text-slate-400">Core CNN</span>
            </div>
            <h1 className="text-3xl font-bold">Pooling</h1>
            <p className="text-slate-400 mt-1">Downsampling for efficiency and invariance</p>
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
                  Animate {poolType === 'max' ? 'Max' : 'Average'} Pooling
                </button>
                <button
                  onClick={resetAnim}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-600"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Input */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-sm text-slate-400 mb-3 text-center">Input (4×4)</h4>
                  <div className="flex justify-center">
                    <PoolingGrid
                      data={inputMap}
                      windowPos={animating || animStep > 0 ? getWindowPos(animStep) : null}
                      poolSize={poolSize}
                    />
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center justify-center">
                  <ArrowDownRight size={48} className="text-violet-400 rotate-[-45deg]" />
                  <p className="text-sm text-slate-400 mt-2">{poolSize}×{poolSize} {poolType} pool</p>
                  <p className="text-xs text-slate-500">stride {stride}</p>
                </div>

                {/* Output */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-sm text-slate-400 mb-3 text-center">
                    Output ({pooledOutput.length}×{pooledOutput[0].length})
                  </h4>
                  <div className="flex justify-center">
                    <OutputGrid data={pooledOutput} highlightIdx={animStep} />
                  </div>
                </div>
              </div>

              <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 text-center">
                <p className="text-violet-300">
                  4×4 input → 2×2 output = <strong>75% reduction</strong> in spatial size!
                </p>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => { setPoolType('max'); resetAnim(); }}
                  className={`px-4 py-2 rounded-lg ${
                    poolType === 'max' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Max Pooling
                </button>
                <button
                  onClick={() => { setPoolType('avg'); resetAnim(); }}
                  className={`px-4 py-2 rounded-lg ${
                    poolType === 'avg' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Average Pooling
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Max pooling example */}
                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-emerald-300 font-semibold mb-4 text-center">Max Pooling</h4>
                  <div className="flex items-center justify-center gap-4">
                    <div className="grid grid-cols-2 gap-1">
                      {[[1, 3], [4, 6]].map((row, i) =>
                        row.map((val, j) => (
                          <div
                            key={`${i}-${j}`}
                            className={`w-12 h-12 flex items-center justify-center font-mono rounded ${
                              val === 6 ? 'bg-emerald-500 text-white' : 'bg-slate-700'
                            }`}
                          >
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                    <span className="text-2xl">→</span>
                    <div className="w-12 h-12 bg-emerald-500 rounded flex items-center justify-center font-mono text-xl">
                      6
                    </div>
                  </div>
                  <p className="text-center text-sm text-slate-400 mt-3">max(1, 3, 4, 6) = 6</p>
                </div>

                {/* Average pooling example */}
                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-blue-300 font-semibold mb-4 text-center">Average Pooling</h4>
                  <div className="flex items-center justify-center gap-4">
                    <div className="grid grid-cols-2 gap-1">
                      {[[1, 3], [4, 6]].map((row, i) =>
                        row.map((val, j) => (
                          <div
                            key={`${i}-${j}`}
                            className="w-12 h-12 flex items-center justify-center font-mono bg-blue-500/30 rounded"
                          >
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                    <span className="text-2xl">→</span>
                    <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center font-mono text-xl">
                      3.5
                    </div>
                  </div>
                  <p className="text-center text-sm text-slate-400 mt-3">(1+3+4+6)/4 = 3.5</p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-sm text-slate-400 mb-2">When to use which?</h4>
                <ul className="text-sm space-y-1 text-slate-300">
                  <li>• <strong>Max pooling:</strong> Most CNNs - preserves strongest features, noise-resistant</li>
                  <li>• <strong>Avg pooling:</strong> Sometimes for final layers, or when you want smoother gradients</li>
                </ul>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Pool Size:</span>
                  {[2, 3].map(size => (
                    <button
                      key={size}
                      onClick={() => { setPoolSize(size); resetAnim(); }}
                      className={`px-3 py-1 rounded ${
                        poolSize === size ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {size}×{size}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Stride:</span>
                  {[1, 2].map(s => (
                    <button
                      key={s}
                      onClick={() => { setStride(s); resetAnim(); }}
                      className={`px-3 py-1 rounded ${
                        stride === s ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h4 className="text-sm text-slate-400 mb-3">Input (4×4)</h4>
                    <PoolingGrid data={inputMap} />
                  </div>
                  <div>
                    <h4 className="text-sm text-slate-400 mb-3">
                      Output with {poolSize}×{poolSize} pool, stride={stride}
                    </h4>
                    <PoolingGrid data={applyPooling(inputMap, poolSize, stride, poolType)} />
                    <p className="text-xs text-slate-500 mt-2">
                      Output size: {applyPooling(inputMap, poolSize, stride, poolType).length}×
                      {applyPooling(inputMap, poolSize, stride, poolType)[0].length}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                  <p className="font-mono text-sm text-center">
                    Output Size = ⌊(Input - PoolSize) / Stride⌋ + 1
                  </p>
                  <p className="text-xs text-slate-400 text-center mt-1">
                    = ⌊(4 - {poolSize}) / {stride}⌋ + 1 = {applyPooling(inputMap, poolSize, stride, poolType).length}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-emerald-300 font-semibold mb-2">Stride = Pool Size</h4>
                  <p className="text-sm text-slate-400">
                    Non-overlapping windows. Clean halving of dimensions. Most common approach.
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">Stride &lt; Pool Size</h4>
                  <p className="text-sm text-slate-400">
                    Overlapping windows. More gradual reduction. Less information loss but more computation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Global Average Pooling</h4>

                <div className="flex items-center justify-center gap-8">
                  {/* Input feature map */}
                  <div>
                    <p className="text-xs text-slate-500 text-center mb-2">Feature Map (4×4)</p>
                    <div className="grid grid-cols-4 gap-1">
                      {inputMap.map((row, i) =>
                        row.map((val, j) => (
                          <div
                            key={`${i}-${j}`}
                            className="w-10 h-10 flex items-center justify-center font-mono text-sm bg-blue-500/30 rounded"
                          >
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <Minimize2 size={32} className="text-violet-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">GAP</p>
                  </div>

                  {/* Single output value */}
                  <div>
                    <p className="text-xs text-slate-500 text-center mb-2">Output (1×1)</p>
                    <div className="w-16 h-16 flex items-center justify-center font-mono text-xl bg-emerald-500 rounded">
                      {(inputMap.flat().reduce((a, b) => a + b, 0) / 16).toFixed(1)}
                    </div>
                  </div>
                </div>

                <p className="text-center text-slate-400 mt-4 text-sm">
                  Average of all 16 values: ({inputMap.flat().join(' + ')}) / 16 = {(inputMap.flat().reduce((a, b) => a + b, 0) / 16).toFixed(1)}
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-300 text-sm">
                  <strong>Why Global Average Pooling?</strong><br/>
                  Instead of flattening + dense layers (lots of parameters), GAP reduces each feature map to one
                  number. If you have 512 feature maps, GAP gives you a 512-dimensional vector - ready for classification!
                </p>
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-sm text-slate-400 mb-2">Parameter Comparison</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-red-300">Without GAP:</p>
                    <p className="text-slate-400">7×7×512 flatten → 1000 classes</p>
                    <p className="font-mono text-red-300">= 25,088,000 params!</p>
                  </div>
                  <div>
                    <p className="text-emerald-300">With GAP:</p>
                    <p className="text-slate-400">512 (from GAP) → 1000 classes</p>
                    <p className="font-mono text-emerald-300">= 512,000 params</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Typical CNN Block Structure</h4>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {[
                    { name: 'Conv', color: '#3b82f6' },
                    { name: 'ReLU', color: '#8b5cf6' },
                    { name: 'Conv', color: '#3b82f6' },
                    { name: 'ReLU', color: '#8b5cf6' },
                    { name: 'Pool', color: '#10b981' },
                  ].map((block, idx) => (
                    <React.Fragment key={idx}>
                      <div
                        className="px-4 py-3 rounded-lg text-white text-sm font-medium"
                        style={{ backgroundColor: block.color }}
                      >
                        {block.name}
                      </div>
                      {idx < 4 && <ChevronRight size={20} className="text-slate-500" />}
                    </React.Fragment>
                  ))}
                </div>

                <p className="text-center text-slate-400 mt-4 text-sm">
                  This block is repeated, with pooling typically after every 2-3 conv layers
                </p>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4">Dimension Journey (VGG-style)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="pb-2">Layer</th>
                        <th className="pb-2">Size</th>
                        <th className="pb-2">Channels</th>
                        <th className="pb-2">Reduction</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr><td>Input</td><td>224×224</td><td>3</td><td>-</td></tr>
                      <tr className="text-blue-300"><td>Conv Block 1</td><td>224×224</td><td>64</td><td>-</td></tr>
                      <tr className="text-emerald-300"><td>Pool 1</td><td>112×112</td><td>64</td><td>÷2</td></tr>
                      <tr className="text-blue-300"><td>Conv Block 2</td><td>112×112</td><td>128</td><td>-</td></tr>
                      <tr className="text-emerald-300"><td>Pool 2</td><td>56×56</td><td>128</td><td>÷2</td></tr>
                      <tr className="text-blue-300"><td>Conv Block 3</td><td>56×56</td><td>256</td><td>-</td></tr>
                      <tr className="text-emerald-300"><td>Pool 3</td><td>28×28</td><td>256</td><td>÷2</td></tr>
                      <tr className="text-blue-300"><td>Conv Block 4</td><td>28×28</td><td>512</td><td>-</td></tr>
                      <tr className="text-emerald-300"><td>Pool 4</td><td>14×14</td><td>512</td><td>÷2</td></tr>
                      <tr className="text-blue-300"><td>Conv Block 5</td><td>14×14</td><td>512</td><td>-</td></tr>
                      <tr className="text-emerald-300"><td>Pool 5</td><td>7×7</td><td>512</td><td>÷2</td></tr>
                    </tbody>
                  </table>
                </div>
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
                What is max pooling on the region [[5, 8], [3, 9]]?
              </p>
              <div className="flex gap-3">
                {[5, 6.25, 8, 9].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({...quizAnswers, q1: ans})}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      quizAnswers.q1 === undefined
                        ? 'border-slate-600 hover:border-slate-500'
                        : ans === 9
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
                <p className={`mt-2 text-sm ${quizAnswers.q1 === 9 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {quizAnswers.q1 === 9
                    ? '✓ Correct! Max pooling takes the maximum value: 9'
                    : '✗ Max pooling takes the maximum, not the average!'}
                </p>
              )}
            </div>

            <div>
              <p className="text-slate-300 mb-3">
                A 32×32 feature map with 2×2 max pooling (stride 2) becomes what size?
              </p>
              <div className="flex gap-3">
                {['16×16', '30×30', '31×31', '64×64'].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({...quizAnswers, q2: ans})}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      quizAnswers.q2 === undefined
                        ? 'border-slate-600 hover:border-slate-500'
                        : ans === '16×16'
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : quizAnswers.q2 === ans
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-slate-600 opacity-50'
                    }`}
                    disabled={quizAnswers.q2 !== undefined}
                  >
                    {ans}
                  </button>
                ))}
              </div>
              {quizAnswers.q2 !== undefined && (
                <p className={`mt-2 text-sm ${quizAnswers.q2 === '16×16' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {quizAnswers.q2 === '16×16'
                    ? '✓ Correct! With stride=pool size, dimensions are halved.'
                    : '✗ With 2×2 pooling and stride 2, each dimension is halved: 32/2 = 16'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-6">
          <h3 className="font-semibold mb-3 text-violet-300">Key Takeaways</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>Pooling reduces spatial dimensions, cutting computation and parameters</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>Max pooling keeps strongest activations; average pooling smooths features</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>2×2 pooling with stride 2 halves each spatial dimension</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>Global Average Pooling collapses spatial dims entirely, replacing dense layers</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pooling;
