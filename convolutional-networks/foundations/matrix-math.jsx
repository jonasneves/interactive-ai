import React, { useState, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Lightbulb, Check, Sparkles, Calculator, Grid3X3
} from 'lucide-react';

const MatrixMath = () => {
  const [eli5Mode, setEli5Mode] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [dotProductHighlight, setDotProductHighlight] = useState(-1);

  // Sample vectors for dot product
  const vectorA = [2, 3, 1];
  const vectorB = [4, -1, 5];

  // Sample matrices
  const matrixA = [
    [1, 2],
    [3, 4],
  ];
  const matrixB = [
    [5, 6],
    [7, 8],
  ];

  // Dot product animation
  useEffect(() => {
    let interval;
    if (isPlaying && currentSection === 1) {
      interval = setInterval(() => {
        setDotProductHighlight(prev => {
          if (prev >= vectorA.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSection]);

  const calculateDotProduct = () => {
    return vectorA.reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  };

  const getPartialDotProduct = (upToIndex) => {
    return vectorA.slice(0, upToIndex + 1).reduce((sum, val, idx) => sum + val * vectorB[idx], 0);
  };

  const sections = [
    {
      id: 'vectors',
      title: "Vectors: Lists of Numbers",
      content: eli5Mode
        ? "A vector is just a list of numbers in a row! Like a shopping list with prices: [$2, $3, $1]. We can add vectors together or multiply them by a number."
        : "Vectors are ordered collections of numbers. In ML, we use vectors to represent data points, weights, and more. Vectors have both magnitude (length) and can point in a direction in n-dimensional space."
    },
    {
      id: 'dot-product',
      title: "The Dot Product",
      content: eli5Mode
        ? "The dot product is like a matching game! Take two lists, multiply matching pairs together, then add everything up. It tells us how 'similar' two lists are."
        : "The dot product (inner product) multiplies corresponding elements and sums the results: a·b = Σ(aᵢ × bᵢ). It's fundamental to neural networks - every neuron computes a dot product of inputs and weights."
    },
    {
      id: 'matrices',
      title: "Matrices: 2D Arrays",
      content: eli5Mode
        ? "A matrix is like a spreadsheet - numbers arranged in rows and columns. Images are matrices! Each pixel value sits in its own little box in the grid."
        : "Matrices are 2D arrays of numbers with dimensions rows × columns. They're used to represent images, transformations, and weight layers in neural networks. Matrix operations enable efficient parallel computation."
    },
    {
      id: 'element-wise',
      title: "Element-wise Operations",
      content: eli5Mode
        ? "Element-wise means doing the same thing to each matching box in two matrices. Add box 1 to box 1, box 2 to box 2, and so on. Like adding two identical Sudoku grids number by number!"
        : "Element-wise operations apply the same operation to corresponding elements: (A + B)ᵢⱼ = Aᵢⱼ + Bᵢⱼ. Also called Hadamard operations. Activation functions in CNNs are applied element-wise."
    },
    {
      id: 'matrix-mult',
      title: "Matrix Multiplication",
      content: eli5Mode
        ? "Matrix multiplication is like taking dot products of rows and columns! Take a row from the first matrix, a column from the second, do a dot product, and that's one number in your answer."
        : "Matrix multiplication (A×B) produces a new matrix where each element is a dot product of a row from A and column from B. Dimensions must align: (m×n) × (n×p) = (m×p). This is the core operation in neural network layers."
    }
  ];

  const resetAnimation = () => {
    setDotProductHighlight(-1);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                Level 2
              </span>
              <span className="text-slate-400">Prerequisites</span>
            </div>
            <h1 className="text-3xl font-bold">Dot Products & Matrix Math</h1>
            <p className="text-slate-400 mt-1">The mathematical foundation of neural networks</p>
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
              onClick={() => { setCurrentSection(idx); resetAnimation(); }}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentSection === idx
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">{sections[currentSection].title}</h2>
          <p className="text-slate-300 leading-relaxed mb-6">{sections[currentSection].content}</p>

          {/* Interactive Visualizations */}
          {currentSection === 0 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h3 className="text-sm text-slate-400 mb-4">Vector Representation</h3>
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <p className="text-sm text-slate-500 mb-2 text-center">Vector A</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl text-slate-400">[</span>
                      {vectorA.map((val, idx) => (
                        <span key={idx} className="px-4 py-2 bg-blue-500/20 rounded text-blue-300 font-mono text-xl">
                          {val}
                        </span>
                      ))}
                      <span className="text-2xl text-slate-400">]</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2 text-center">Vector B</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl text-slate-400">[</span>
                      {vectorB.map((val, idx) => (
                        <span key={idx} className="px-4 py-2 bg-violet-500/20 rounded text-violet-300 font-mono text-xl">
                          {val}
                        </span>
                      ))}
                      <span className="text-2xl text-slate-400">]</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-slate-400 mt-4">
                  Each vector has <span className="text-blue-300">3 elements</span> - we call this a 3-dimensional vector
                </p>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => { resetAnimation(); setIsPlaying(true); }}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg flex items-center gap-2 hover:bg-emerald-500/30"
                >
                  <Play size={18} />
                  Animate
                </button>
                <button
                  onClick={resetAnimation}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-600"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <h3 className="text-sm text-slate-400 mb-6 text-center">Dot Product: A · B</h3>

                {/* Vector Display */}
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-2">
                    {vectorA.map((val, idx) => (
                      <div
                        key={idx}
                        className={`px-4 py-2 rounded font-mono text-xl transition-all ${
                          idx <= dotProductHighlight
                            ? 'bg-blue-500 text-white scale-110'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                    <span className="text-2xl text-slate-400 mx-2">·</span>
                    {vectorB.map((val, idx) => (
                      <div
                        key={idx}
                        className={`px-4 py-2 rounded font-mono text-xl transition-all ${
                          idx <= dotProductHighlight
                            ? 'bg-violet-500 text-white scale-110'
                            : 'bg-violet-500/20 text-violet-300'
                        }`}
                      >
                        {val}
                      </div>
                    ))}
                  </div>

                  {/* Calculation Steps */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-lg">
                      <span className="text-slate-400">=</span>
                      {vectorA.map((val, idx) => (
                        <span key={idx} className="flex items-center">
                          <span className={`transition-all ${
                            idx <= dotProductHighlight ? 'text-yellow-300' : 'text-slate-500'
                          }`}>
                            ({val} × {vectorB[idx]})
                          </span>
                          {idx < vectorA.length - 1 && <span className="text-slate-400 mx-1">+</span>}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-lg mt-2">
                      <span className="text-slate-400">=</span>
                      {vectorA.map((val, idx) => (
                        <span key={idx} className="flex items-center">
                          <span className={`font-mono transition-all ${
                            idx <= dotProductHighlight ? 'text-yellow-300' : 'text-slate-500'
                          }`}>
                            {val * vectorB[idx]}
                          </span>
                          {idx < vectorA.length - 1 && <span className="text-slate-400 mx-1">+</span>}
                        </span>
                      ))}
                    </div>

                    <div className="text-2xl mt-4 font-bold">
                      <span className="text-slate-400">=</span>
                      <span className={`ml-2 ${
                        dotProductHighlight >= 0 ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {dotProductHighlight >= 0 ? getPartialDotProduct(dotProductHighlight) : '?'}
                      </span>
                      {dotProductHighlight === vectorA.length - 1 && (
                        <span className="text-emerald-400 ml-2">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Why it matters:</strong> Every neuron in a neural network computes a dot product
                  between its inputs and weights. This single operation is the building block of deep learning!
                </p>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h3 className="text-sm text-slate-400 mb-4">2×2 Matrix</h3>
                <div className="flex justify-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="flex items-center">
                      <span className="text-4xl text-slate-400 mr-2">[</span>
                      <div className="grid grid-cols-2 gap-2">
                        {matrixA.map((row, rowIdx) =>
                          row.map((val, colIdx) => (
                            <div
                              key={`${rowIdx}-${colIdx}`}
                              className="w-16 h-16 bg-blue-500/20 rounded flex items-center justify-center text-2xl font-mono text-blue-300"
                            >
                              {val}
                            </div>
                          ))
                        )}
                      </div>
                      <span className="text-4xl text-slate-400 ml-2">]</span>
                    </div>
                    <div className="flex gap-8 mt-2 text-sm text-slate-500">
                      <span>col 0</span>
                      <span>col 1</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center ml-4 text-sm text-slate-500">
                    <span className="mb-6">row 0</span>
                    <span>row 1</span>
                  </div>
                </div>
                <p className="text-center text-slate-400 mt-4">
                  Matrix A is <span className="text-blue-300">2 rows × 2 columns</span> = shape (2, 2)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-sm text-slate-400 mb-2">As Code (Python/NumPy)</h4>
                  <pre className="text-sm font-mono text-slate-300">
{`import numpy as np

A = np.array([
    [1, 2],
    [3, 4]
])

print(A.shape)  # (2, 2)`}
                  </pre>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-sm text-slate-400 mb-2">Accessing Elements</h4>
                  <pre className="text-sm font-mono text-slate-300">
{`A[0, 0] = 1  # row 0, col 0
A[0, 1] = 2  # row 0, col 1
A[1, 0] = 3  # row 1, col 0
A[1, 1] = 4  # row 1, col 1`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h3 className="text-sm text-slate-400 mb-4 text-center">Element-wise Addition: A + B</h3>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {/* Matrix A */}
                  <div className="grid grid-cols-2 gap-1">
                    {matrixA.map((row, rowIdx) =>
                      row.map((val, colIdx) => (
                        <div
                          key={`a-${rowIdx}-${colIdx}`}
                          className="w-12 h-12 bg-blue-500/20 rounded flex items-center justify-center font-mono text-blue-300"
                        >
                          {val}
                        </div>
                      ))
                    )}
                  </div>

                  <span className="text-2xl text-slate-400">+</span>

                  {/* Matrix B */}
                  <div className="grid grid-cols-2 gap-1">
                    {matrixB.map((row, rowIdx) =>
                      row.map((val, colIdx) => (
                        <div
                          key={`b-${rowIdx}-${colIdx}`}
                          className="w-12 h-12 bg-violet-500/20 rounded flex items-center justify-center font-mono text-violet-300"
                        >
                          {val}
                        </div>
                      ))
                    )}
                  </div>

                  <span className="text-2xl text-slate-400">=</span>

                  {/* Result */}
                  <div className="grid grid-cols-2 gap-1">
                    {matrixA.map((row, rowIdx) =>
                      row.map((val, colIdx) => (
                        <div
                          key={`r-${rowIdx}-${colIdx}`}
                          className="w-12 h-12 bg-emerald-500/20 rounded flex items-center justify-center font-mono text-emerald-300"
                        >
                          {val + matrixB[rowIdx][colIdx]}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-6 text-center text-slate-400">
                  <p>Each position: <span className="text-blue-300">Aᵢⱼ</span> + <span className="text-violet-300">Bᵢⱼ</span> = <span className="text-emerald-300">Cᵢⱼ</span></p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <h3 className="text-sm text-slate-400 mb-4 text-center">Element-wise Multiplication (Hadamard): A ⊙ B</h3>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="grid grid-cols-2 gap-1">
                    {matrixA.map((row, rowIdx) =>
                      row.map((val, colIdx) => (
                        <div
                          key={`a-${rowIdx}-${colIdx}`}
                          className="w-12 h-12 bg-blue-500/20 rounded flex items-center justify-center font-mono text-blue-300"
                        >
                          {val}
                        </div>
                      ))
                    )}
                  </div>

                  <span className="text-2xl text-slate-400">⊙</span>

                  <div className="grid grid-cols-2 gap-1">
                    {matrixB.map((row, rowIdx) =>
                      row.map((val, colIdx) => (
                        <div
                          key={`b-${rowIdx}-${colIdx}`}
                          className="w-12 h-12 bg-violet-500/20 rounded flex items-center justify-center font-mono text-violet-300"
                        >
                          {val}
                        </div>
                      ))
                    )}
                  </div>

                  <span className="text-2xl text-slate-400">=</span>

                  <div className="grid grid-cols-2 gap-1">
                    {matrixA.map((row, rowIdx) =>
                      row.map((val, colIdx) => (
                        <div
                          key={`r-${rowIdx}-${colIdx}`}
                          className="w-12 h-12 bg-emerald-500/20 rounded flex items-center justify-center font-mono text-emerald-300"
                        >
                          {val * matrixB[rowIdx][colIdx]}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h3 className="text-sm text-slate-400 mb-4 text-center">Matrix Multiplication: A × B</h3>

                <div className="flex items-start justify-center gap-4 flex-wrap">
                  {/* Matrix A */}
                  <div>
                    <p className="text-xs text-slate-500 text-center mb-2">A (2×2)</p>
                    <div className="grid grid-cols-2 gap-1">
                      {matrixA.map((row, rowIdx) =>
                        row.map((val, colIdx) => (
                          <div
                            key={`a-${rowIdx}-${colIdx}`}
                            className="w-12 h-12 bg-blue-500/20 rounded flex items-center justify-center font-mono text-blue-300"
                          >
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <span className="text-2xl text-slate-400 mt-8">×</span>

                  {/* Matrix B */}
                  <div>
                    <p className="text-xs text-slate-500 text-center mb-2">B (2×2)</p>
                    <div className="grid grid-cols-2 gap-1">
                      {matrixB.map((row, rowIdx) =>
                        row.map((val, colIdx) => (
                          <div
                            key={`b-${rowIdx}-${colIdx}`}
                            className="w-12 h-12 bg-violet-500/20 rounded flex items-center justify-center font-mono text-violet-300"
                          >
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <span className="text-2xl text-slate-400 mt-8">=</span>

                  {/* Result */}
                  <div>
                    <p className="text-xs text-slate-500 text-center mb-2">C (2×2)</p>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        [1*5+2*7, 1*6+2*8],
                        [3*5+4*7, 3*6+4*8]
                      ].map((row, rowIdx) =>
                        row.map((val, colIdx) => (
                          <div
                            key={`c-${rowIdx}-${colIdx}`}
                            className="w-12 h-12 bg-emerald-500/20 rounded flex items-center justify-center font-mono text-emerald-300"
                          >
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Example: C[0,0] = row 0 of A · column 0 of B</p>
                  <p className="text-center font-mono">
                    <span className="text-blue-300">[1, 2]</span>
                    <span className="text-slate-400"> · </span>
                    <span className="text-violet-300">[5, 7]</span>
                    <span className="text-slate-400"> = </span>
                    <span className="text-yellow-300">(1×5) + (2×7)</span>
                    <span className="text-slate-400"> = </span>
                    <span className="text-emerald-300">19</span>
                  </p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  <strong>Dimension Rule:</strong> To multiply matrices, the inner dimensions must match!
                  (m × <span className="underline">n</span>) × (<span className="underline">n</span> × p) → (m × p)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Section */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-400" />
            Quick Quiz
          </h3>

          <div className="space-y-6">
            <div>
              <p className="text-slate-300 mb-3">
                1. What is the dot product of [1, 2, 3] and [4, 5, 6]?
              </p>
              <div className="flex gap-3 flex-wrap">
                {[32, 21, 15, 36].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({...quizAnswers, q1: ans})}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      quizAnswers.q1 === undefined
                        ? 'border-slate-600 hover:border-slate-500'
                        : ans === 32
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
                <p className={`mt-2 text-sm ${quizAnswers.q1 === 32 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {quizAnswers.q1 === 32
                    ? '✓ Correct! (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32'
                    : '✗ Try: (1×4) + (2×5) + (3×6)'}
                </p>
              )}
            </div>

            <div>
              <p className="text-slate-300 mb-3">
                2. Can you multiply a (3×2) matrix by a (3×4) matrix?
              </p>
              <div className="flex gap-3">
                {['Yes', 'No'].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({...quizAnswers, q2: ans})}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      quizAnswers.q2 === undefined
                        ? 'border-slate-600 hover:border-slate-500'
                        : ans === 'No'
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
                <p className={`mt-2 text-sm ${quizAnswers.q2 === 'No' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {quizAnswers.q2 === 'No'
                    ? '✓ Correct! Inner dimensions must match: (3×2) needs (2×?) to multiply'
                    : '✗ Remember: inner dimensions must match! 2 ≠ 3'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="font-semibold mb-3 text-blue-300">Key Takeaways</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>The dot product is the fundamental operation in neural networks</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>Matrices let us represent images and perform batch operations</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>Element-wise operations act on corresponding positions</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>Matrix multiplication requires matching inner dimensions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatrixMath;
