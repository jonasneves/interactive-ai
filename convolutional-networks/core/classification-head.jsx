import React, { useState, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight,
  Lightbulb, Check, Sparkles, Layers, Target
} from 'lucide-react';

const ClassificationHead = () => {
  const [eli5Mode, setEli5Mode] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animPhase, setAnimPhase] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Sample feature vector (after flattening/GAP)
  const featureVector = [0.8, 0.2, 0.9, 0.1, 0.6, 0.7, 0.3, 0.5];

  // Sample logits (pre-softmax)
  const logits = [2.1, 0.5, 3.8, -0.2, 1.2];
  const classNames = ['Cat', 'Dog', 'Bird', 'Fish', 'Rabbit'];

  // Softmax calculation
  const softmax = (arr) => {
    const maxVal = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - maxVal));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  };

  const probabilities = softmax(logits);

  const sections = [
    {
      id: 'role',
      title: "What is the Classification Head?",
      content: eli5Mode
        ? "After all the convolutions and pooling, we need to make a decision! The classification head is like the final judge - it looks at all the features the CNN found and says 'I think this is a cat!'"
        : "The classification head is the final portion of a CNN that transforms learned feature representations into class predictions. It typically consists of one or more fully connected (dense) layers followed by a softmax activation for multi-class classification."
    },
    {
      id: 'flatten',
      title: "Flattening Features",
      content: eli5Mode
        ? "Before the final decision, we take all those feature maps (like stacked cards) and line them up in a single row. It's like spreading out all your puzzle pieces so you can see everything at once!"
        : "Feature maps from the last conv/pool layer must be flattened into a 1D vector before feeding into dense layers. A 7×7×512 feature map becomes a 25,088-dimensional vector. Alternatively, Global Average Pooling can reduce this to just 512 values."
    },
    {
      id: 'dense',
      title: "Fully Connected Layers",
      content: eli5Mode
        ? "Fully connected means every neuron looks at EVERYTHING from the previous layer. It's like asking a detective who has access to all the clues to make the final decision about what's in the picture."
        : "Fully connected (dense) layers connect every input to every output. They combine the spatially-distributed features into a compact representation. These layers have the most parameters in traditional CNNs (e.g., VGG-16: 123M of 138M total)."
    },
    {
      id: 'softmax',
      title: "Softmax & Probabilities",
      content: eli5Mode
        ? "Softmax is like turning scores into percentages that add up to 100%. If one class has a high score and others are low, softmax makes it very confident. It helps the network say 'I'm 90% sure this is a cat, 8% dog, 2% other.'"
        : "Softmax converts raw logits into a probability distribution where all outputs sum to 1. σ(z)ᵢ = exp(zᵢ) / Σexp(zⱼ). The highest probability becomes the predicted class. For binary classification, sigmoid activation is used instead."
    },
    {
      id: 'alternatives',
      title: "Modern Alternatives",
      content: eli5Mode
        ? "Newer CNNs found a shortcut! Instead of those big fully connected layers, they use Global Average Pooling to shrink features directly to class predictions. It's simpler and often works just as well!"
        : "Modern architectures often replace FC layers with Global Average Pooling (GAP) followed by a single classification layer. This dramatically reduces parameters, prevents overfitting, and makes the network more interpretable. Some networks also use 1×1 convolutions for dimensionality reduction."
    }
  ];

  // Animation phases
  useEffect(() => {
    let interval;
    if (animating) {
      interval = setInterval(() => {
        setAnimPhase(prev => {
          if (prev >= 4) {
            setAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [animating]);

  const resetAnim = () => {
    setAnimPhase(0);
    setAnimating(false);
  };

  // Visualization components
  const FeatureMapStack = ({ active }) => (
    <div className="relative w-24 h-24">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`absolute w-16 h-16 rounded transition-all duration-500 ${
            active ? 'bg-blue-500/60' : 'bg-slate-700'
          }`}
          style={{
            top: i * 4,
            left: i * 4,
            zIndex: 4 - i,
          }}
        />
      ))}
      <p className="absolute -bottom-6 left-0 right-0 text-xs text-slate-500 text-center">
        7×7×512
      </p>
    </div>
  );

  const FlattenedVector = ({ active }) => (
    <div className="flex gap-0.5">
      {Array(12).fill(0).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-8 rounded-sm transition-all ${
            active ? 'bg-violet-500' : 'bg-slate-700'
          }`}
        />
      ))}
      <span className="text-slate-500 ml-1">...</span>
      <p className="absolute -bottom-6 left-0 right-0 text-xs text-slate-500 text-center">
        25,088
      </p>
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
                Level 8
              </span>
              <span className="text-slate-400">Core CNN</span>
            </div>
            <h1 className="text-3xl font-bold">The Classification Head</h1>
            <p className="text-slate-400 mt-1">From features to predictions</p>
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
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => { resetAnim(); setAnimating(true); }}
                  className="px-4 py-2 bg-violet-500/20 text-violet-300 rounded-lg flex items-center gap-2 hover:bg-violet-500/30"
                >
                  <Play size={18} />
                  Animate Classification
                </button>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {[
                    { label: 'Features', phase: 0, color: 'blue' },
                    { label: 'Flatten', phase: 1, color: 'violet' },
                    { label: 'Dense', phase: 2, color: 'purple' },
                    { label: 'Softmax', phase: 3, color: 'emerald' },
                    { label: 'Prediction', phase: 4, color: 'yellow' },
                  ].map((step, idx) => (
                    <React.Fragment key={step.label}>
                      <div
                        className={`px-4 py-3 rounded-lg text-center transition-all ${
                          animPhase >= step.phase
                            ? `bg-${step.color}-500/30 border-2 border-${step.color}-500`
                            : 'bg-slate-800 border-2 border-slate-700'
                        }`}
                        style={{
                          backgroundColor: animPhase >= step.phase ? `var(--${step.color}-500-30)` : undefined,
                          borderColor: animPhase >= step.phase ? `var(--${step.color}-500)` : undefined
                        }}
                      >
                        <p className={`text-sm font-medium ${
                          animPhase >= step.phase ? 'text-white' : 'text-slate-500'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                      {idx < 4 && <ChevronRight size={20} className="text-slate-600" />}
                    </React.Fragment>
                  ))}
                </div>

                {animPhase >= 4 && (
                  <div className="mt-6 text-center">
                    <p className="text-2xl text-yellow-300 font-bold">🐦 Bird (87.2%)</p>
                    <p className="text-slate-400 text-sm mt-1">Predicted class with highest probability</p>
                  </div>
                )}
              </div>

              <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
                <p className="text-violet-300 text-sm">
                  <strong>The journey:</strong> Raw pixels → Convolutions learn features → Pooling reduces size →
                  Classification head makes the final call!
                </p>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-6 text-center">Flattening a Feature Map</h4>

                <div className="flex items-center justify-center gap-8">
                  {/* 3D feature maps */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      {[0, 1, 2].map(z => (
                        <div
                          key={z}
                          className="absolute bg-blue-500/50 border border-blue-400 rounded"
                          style={{
                            width: 60,
                            height: 60,
                            top: z * 8,
                            left: z * 8,
                            zIndex: 10 - z
                          }}
                        >
                          <div className="grid grid-cols-3 gap-0.5 p-1">
                            {Array(9).fill(0).map((_, i) => (
                              <div key={i} className="w-4 h-4 bg-blue-400/50 rounded-sm" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-slate-400">7×7×512</p>
                    <p className="text-xs text-slate-500">Feature maps</p>
                  </div>

                  <ChevronRight size={32} className="text-violet-400" />

                  {/* Flattened vector */}
                  <div className="text-center">
                    <div className="flex gap-1 flex-wrap w-48 justify-center mb-4">
                      {Array(24).fill(0).map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-violet-500/70 rounded-sm" />
                      ))}
                      <span className="text-violet-300">...</span>
                    </div>
                    <p className="text-sm text-slate-400">25,088</p>
                    <p className="text-xs text-slate-500">1D vector</p>
                  </div>
                </div>

                <div className="mt-6 bg-slate-800 rounded-lg p-4">
                  <p className="font-mono text-sm text-center">
                    flatten(7 × 7 × 512) = 7 × 7 × 512 = <span className="text-violet-300">25,088</span> values
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">Traditional Flatten</h4>
                  <p className="text-sm text-slate-400">
                    Reshape [H, W, C] → [H × W × C]<br/>
                    Preserves all spatial information<br/>
                    Can be very large (25K+ values)
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-emerald-300 font-semibold mb-2">Global Average Pooling</h4>
                  <p className="text-sm text-slate-400">
                    Average each channel → [C]<br/>
                    [7, 7, 512] → [512]<br/>
                    Much smaller, less overfitting!
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-6 text-center">Fully Connected Layer</h4>

                <svg viewBox="0 0 400 200" className="w-full h-48">
                  {/* Input neurons */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <g key={`in-${i}`}>
                      <circle cx="60" cy={40 + i * 30} r="12" fill="#3b82f6" />
                      <text x="60" y={44 + i * 30} textAnchor="middle" fill="white" fontSize="10">
                        {featureVector[i]}
                      </text>
                    </g>
                  ))}
                  <text x="60" y="195" textAnchor="middle" fill="#64748b" fontSize="10">Input (512)</text>

                  {/* Connections (simplified) */}
                  {[0, 1, 2, 3, 4].map(i =>
                    [0, 1, 2].map(j => (
                      <line
                        key={`${i}-${j}`}
                        x1="72" y1={40 + i * 30}
                        x2="188" y2={55 + j * 45}
                        stroke="#475569"
                        strokeWidth="0.5"
                        opacity="0.5"
                      />
                    ))
                  )}

                  {/* Hidden layer */}
                  {[0, 1, 2].map(i => (
                    <circle key={`h-${i}`} cx="200" cy={55 + i * 45} r="15" fill="#8b5cf6" />
                  ))}
                  <text x="200" y="195" textAnchor="middle" fill="#64748b" fontSize="10">Hidden (256)</text>

                  {/* More connections */}
                  {[0, 1, 2].map(i =>
                    [0, 1, 2, 3, 4].map(j => (
                      <line
                        key={`h-${i}-${j}`}
                        x1="215" y1={55 + i * 45}
                        x2="328" y2={40 + j * 30}
                        stroke="#475569"
                        strokeWidth="0.5"
                        opacity="0.5"
                      />
                    ))
                  )}

                  {/* Output neurons */}
                  {classNames.map((name, i) => (
                    <g key={`out-${i}`}>
                      <circle cx="340" cy={40 + i * 30} r="12" fill="#10b981" />
                      <text x="365" y={44 + i * 30} fill="#94a3b8" fontSize="9">{name}</text>
                    </g>
                  ))}
                  <text x="340" y="195" textAnchor="middle" fill="#64748b" fontSize="10">Output (5)</text>
                </svg>

                <div className="mt-4 bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-slate-300">
                    <strong>Parameters in this example:</strong><br/>
                    • Input→Hidden: 512 × 256 + 256 bias = <span className="text-blue-300">131,328</span><br/>
                    • Hidden→Output: 256 × 5 + 5 bias = <span className="text-violet-300">1,285</span><br/>
                    • Total: <span className="text-emerald-300">132,613</span> parameters
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-300 text-sm">
                  <strong>Parameter explosion!</strong> VGG-16 has 138M parameters, with 123M (89%) in the FC layers alone.
                  This is why modern networks use GAP and smaller FC layers.
                </p>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Softmax Transformation</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Logits */}
                  <div>
                    <h5 className="text-sm text-slate-400 mb-2 text-center">Raw Logits</h5>
                    <div className="space-y-2">
                      {logits.map((val, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-12">{classNames[i]}</span>
                          <div className="flex-1 h-6 bg-slate-700 rounded overflow-hidden">
                            <div
                              className="h-full bg-blue-500/50"
                              style={{ width: `${Math.max(0, (val + 1) * 20)}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm w-10">{val.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow with formula */}
                  <div className="text-center">
                    <ChevronRight size={32} className="text-violet-400 mx-auto mb-2" />
                    <p className="text-xs font-mono text-violet-300">
                      σ(z)ᵢ = eᶻⁱ / Σeᶻʲ
                    </p>
                  </div>

                  {/* Probabilities */}
                  <div>
                    <h5 className="text-sm text-slate-400 mb-2 text-center">Probabilities</h5>
                    <div className="space-y-2">
                      {probabilities.map((val, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-12">{classNames[i]}</span>
                          <div className="flex-1 h-6 bg-slate-700 rounded overflow-hidden">
                            <div
                              className={`h-full ${i === 2 ? 'bg-emerald-500' : 'bg-emerald-500/50'}`}
                              style={{ width: `${val * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm w-14">{(val * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-emerald-300">
                    Prediction: <strong>{classNames[probabilities.indexOf(Math.max(...probabilities))]}</strong> with {(Math.max(...probabilities) * 100).toFixed(1)}% confidence
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sum of probabilities: {probabilities.reduce((a, b) => a + b, 0).toFixed(3)} ≈ 1.0
                  </p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-sm text-slate-400 mb-2">Key Properties of Softmax</h4>
                <ul className="text-sm space-y-1 text-slate-300">
                  <li>• All outputs are positive (exponential is always positive)</li>
                  <li>• Outputs sum to 1.0 (valid probability distribution)</li>
                  <li>• Amplifies differences (large logit → high probability)</li>
                  <li>• Differentiable (can compute gradients for training)</li>
                </ul>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traditional */}
                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-red-300 font-semibold mb-4">Traditional (VGG-style)</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Conv features</span>
                      <span className="font-mono text-slate-400">7×7×512</span>
                    </div>
                    <ChevronRight size={16} className="mx-auto text-slate-600" />
                    <div className="flex items-center justify-between">
                      <span>Flatten</span>
                      <span className="font-mono text-slate-400">25,088</span>
                    </div>
                    <ChevronRight size={16} className="mx-auto text-slate-600" />
                    <div className="flex items-center justify-between">
                      <span>FC (4096)</span>
                      <span className="font-mono text-red-300">~103M params</span>
                    </div>
                    <ChevronRight size={16} className="mx-auto text-slate-600" />
                    <div className="flex items-center justify-between">
                      <span>FC (4096)</span>
                      <span className="font-mono text-red-300">~17M params</span>
                    </div>
                    <ChevronRight size={16} className="mx-auto text-slate-600" />
                    <div className="flex items-center justify-between">
                      <span>FC (1000)</span>
                      <span className="font-mono text-slate-400">~4M params</span>
                    </div>
                  </div>
                </div>

                {/* Modern */}
                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-emerald-300 font-semibold mb-4">Modern (ResNet-style)</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Conv features</span>
                      <span className="font-mono text-slate-400">7×7×2048</span>
                    </div>
                    <ChevronRight size={16} className="mx-auto text-slate-600" />
                    <div className="flex items-center justify-between">
                      <span>Global Avg Pool</span>
                      <span className="font-mono text-emerald-300">2,048</span>
                    </div>
                    <ChevronRight size={16} className="mx-auto text-slate-600" />
                    <div className="flex items-center justify-between">
                      <span>FC (1000)</span>
                      <span className="font-mono text-emerald-300">~2M params</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-emerald-300 text-center">
                        60× fewer parameters in classification head!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <p className="text-emerald-300 text-sm">
                  <strong>Benefits of GAP:</strong>
                  <br/>• Massive parameter reduction
                  <br/>• Acts as structural regularizer (less overfitting)
                  <br/>• No arbitrary FC layer sizes to tune
                  <br/>• Enforces correspondence between feature maps and categories
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
                What do softmax outputs represent?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: 'Probabilities summing to 1', correct: true },
                  { text: 'Raw scores (logits)', correct: false },
                  { text: 'Feature magnitudes', correct: false },
                  { text: 'Loss values', correct: false },
                ].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({...quizAnswers, q1: option.correct})}
                    className={`px-4 py-2 rounded-lg border text-left transition-all ${
                      quizAnswers.q1 === undefined
                        ? 'border-slate-600 hover:border-slate-500'
                        : option.correct
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-slate-600 opacity-50'
                    }`}
                    disabled={quizAnswers.q1 !== undefined}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-slate-300 mb-3">
                Why is Global Average Pooling preferred over large FC layers?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { text: 'Fewer parameters, less overfitting', correct: true },
                  { text: 'Better accuracy always', correct: false },
                  { text: 'Faster training always', correct: false },
                  { text: 'Required by all frameworks', correct: false },
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
              <span>Classification head converts spatial features into class predictions</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>Flattening creates a 1D vector; GAP is a more efficient alternative</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>FC layers combine features but have many parameters</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-violet-400 mt-1 flex-shrink-0" />
              <span>Softmax converts logits to probabilities that sum to 1</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClassificationHead;
