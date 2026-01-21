import React, { useState } from 'react';
import {
  ChevronRight, Lightbulb, Check, Sparkles, Layers,
  ArrowRight, Plus, Zap
} from 'lucide-react';

const DeeperNetworks = () => {
  const [eli5Mode, setEli5Mode] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [activeSkipConnection, setActiveSkipConnection] = useState(false);

  const sections = [
    {
      id: 'depth',
      title: "Why Go Deeper?",
      content: eli5Mode
        ? "Deeper networks can learn more complicated things! Like how you need to learn letters before words before sentences, deeper networks can build up from simple patterns to complex understanding."
        : "Deeper networks can learn more complex hierarchical representations. Each layer extracts increasingly abstract features. However, simply stacking more layers doesn't work due to vanishing gradients and degradation problems - innovations were needed."
    },
    {
      id: 'problems',
      title: "The Depth Problem",
      content: eli5Mode
        ? "When networks got too deep, they actually got WORSE! The signal would get weaker and weaker going through all those layers, like playing telephone with too many people. The message gets lost!"
        : "Training very deep networks faces two key challenges: 1) Vanishing gradients - gradients become tiny through many multiplications, preventing early layers from learning. 2) Degradation - adding layers increases training error, even with normalized initialization."
    },
    {
      id: 'batchnorm',
      title: "Batch Normalization",
      content: eli5Mode
        ? "Batch Norm is like a reset button at each layer! It makes sure the numbers stay in a nice range, not too big or too small. This helps signals flow smoothly through the network."
        : "Batch Normalization normalizes layer inputs to have zero mean and unit variance across the batch, then applies learnable scale (γ) and shift (β). It reduces internal covariate shift, allows higher learning rates, and acts as regularization."
    },
    {
      id: 'residual',
      title: "Residual Connections",
      content: eli5Mode
        ? "Residual connections are shortcuts! Instead of making each layer learn everything from scratch, we let the original signal skip ahead and add to the layer's output. If a layer can't improve anything, it can just pass the signal through!"
        : "ResNet's key innovation: skip connections that add the input directly to the output: y = F(x) + x. This lets gradients flow directly through the identity path, and layers only need to learn the 'residual' (difference). Enabled training of 100+ layer networks."
    },
    {
      id: 'architectures',
      title: "Modern Building Blocks",
      content: eli5Mode
        ? "Modern CNNs use clever building blocks like LEGOs! Bottleneck blocks squeeze information down then expand it back. Inception modules look at different sizes at once. These tricks let us build really powerful networks!"
        : "Modern CNNs use efficient blocks: Bottleneck (1×1→3×3→1×1 with skip), Depthwise Separable Conv (spatial then channel-wise), Squeeze-and-Excitation (channel attention), Inverted Residual (expand→depthwise→project). These balance accuracy and efficiency."
    }
  ];

  // Residual Block Visualization
  const ResidualBlock = () => (
    <svg viewBox="0 0 400 200" className="w-full h-48">
      {/* Main path */}
      <rect x="50" y="80" width="60" height="40" rx="4" fill="#3b82f6" />
      <text x="80" y="105" textAnchor="middle" fill="white" fontSize="12">Conv</text>

      <rect x="130" y="80" width="60" height="40" rx="4" fill="#8b5cf6" />
      <text x="160" y="105" textAnchor="middle" fill="white" fontSize="12">BN+ReLU</text>

      <rect x="210" y="80" width="60" height="40" rx="4" fill="#3b82f6" />
      <text x="240" y="105" textAnchor="middle" fill="white" fontSize="12">Conv</text>

      <rect x="290" y="80" width="60" height="40" rx="4" fill="#8b5cf6" />
      <text x="320" y="105" textAnchor="middle" fill="white" fontSize="12">BN</text>

      {/* Arrows on main path */}
      <line x1="110" y1="100" x2="130" y2="100" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />
      <line x1="190" y1="100" x2="210" y2="100" stroke="#475569" strokeWidth="2" />
      <line x1="270" y1="100" x2="290" y2="100" stroke="#475569" strokeWidth="2" />

      {/* Skip connection */}
      <path
        d={`M 50 100 L 30 100 L 30 40 L 370 40 L 370 100`}
        fill="none"
        stroke={activeSkipConnection ? "#10b981" : "#475569"}
        strokeWidth={activeSkipConnection ? "3" : "2"}
        strokeDasharray={activeSkipConnection ? "0" : "5,5"}
      />
      <text x="200" y="30" textAnchor="middle" fill={activeSkipConnection ? "#10b981" : "#64748b"} fontSize="11">
        Skip Connection (identity)
      </text>

      {/* Addition */}
      <circle cx="370" cy="100" r="15" fill="#10b981" />
      <text x="370" y="105" textAnchor="middle" fill="white" fontSize="16">+</text>

      {/* Output */}
      <line x1="385" y1="100" x2="400" y2="100" stroke="#475569" strokeWidth="2" />

      {/* Input */}
      <line x1="0" y1="100" x2="50" y2="100" stroke="#475569" strokeWidth="2" />
      <text x="25" y="90" textAnchor="middle" fill="#64748b" fontSize="10">x</text>

      {/* Labels */}
      <text x="200" y="150" textAnchor="middle" fill="#64748b" fontSize="10">F(x)</text>
      <text x="370" y="140" textAnchor="middle" fill="#10b981" fontSize="10">F(x) + x</text>
    </svg>
  );

  // Bottleneck Block
  const BottleneckBlock = () => (
    <svg viewBox="0 0 400 180" className="w-full h-40">
      {/* 1x1 reduce */}
      <rect x="30" y="70" width="70" height="40" rx="4" fill="#3b82f6" />
      <text x="65" y="95" textAnchor="middle" fill="white" fontSize="11">1×1 Conv</text>
      <text x="65" y="125" textAnchor="middle" fill="#64748b" fontSize="9">256→64</text>

      {/* 3x3 */}
      <rect x="120" y="70" width="70" height="40" rx="4" fill="#8b5cf6" />
      <text x="155" y="95" textAnchor="middle" fill="white" fontSize="11">3×3 Conv</text>
      <text x="155" y="125" textAnchor="middle" fill="#64748b" fontSize="9">64→64</text>

      {/* 1x1 expand */}
      <rect x="210" y="70" width="70" height="40" rx="4" fill="#3b82f6" />
      <text x="245" y="95" textAnchor="middle" fill="white" fontSize="11">1×1 Conv</text>
      <text x="245" y="125" textAnchor="middle" fill="#64748b" fontSize="9">64→256</text>

      {/* Arrows */}
      <line x1="100" y1="90" x2="120" y2="90" stroke="#475569" strokeWidth="2" />
      <line x1="190" y1="90" x2="210" y2="90" stroke="#475569" strokeWidth="2" />

      {/* Skip */}
      <path d="M 30 90 L 10 90 L 10 30 L 300 30 L 300 90" fill="none" stroke="#10b981" strokeWidth="2" />

      {/* Add */}
      <circle cx="300" cy="90" r="12" fill="#10b981" />
      <text x="300" y="94" textAnchor="middle" fill="white" fontSize="14">+</text>

      <line x1="280" y1="90" x2="288" y2="90" stroke="#475569" strokeWidth="2" />
      <line x1="312" y1="90" x2="330" y2="90" stroke="#475569" strokeWidth="2" />

      {/* Title */}
      <text x="200" y="165" textAnchor="middle" fill="#64748b" fontSize="10">
        Bottleneck: reduce → process → expand (fewer params!)
      </text>
    </svg>
  );

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full">
                Level 10
              </span>
              <span className="text-slate-400">Advanced</span>
            </div>
            <h1 className="text-3xl font-bold">Deeper Networks</h1>
            <p className="text-slate-400 mt-1">Techniques that enable very deep CNNs</p>
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
              onClick={() => setCurrentSection(idx)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                currentSection === idx
                  ? 'bg-emerald-500 text-white'
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
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Network Depth Over Time</h4>
                <div className="flex items-end justify-center gap-4 h-48">
                  {[
                    { name: 'LeNet', year: '1998', layers: 5, height: 20 },
                    { name: 'AlexNet', year: '2012', layers: 8, height: 32 },
                    { name: 'VGG', year: '2014', layers: 19, height: 76 },
                    { name: 'GoogLeNet', year: '2014', layers: 22, height: 88 },
                    { name: 'ResNet', year: '2015', layers: 152, height: 180 },
                  ].map(net => (
                    <div key={net.name} className="flex flex-col items-center">
                      <div
                        className="w-12 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t transition-all"
                        style={{ height: net.height }}
                      />
                      <p className="text-xs text-slate-300 mt-2">{net.name}</p>
                      <p className="text-xs text-slate-500">{net.layers}L</p>
                      <p className="text-xs text-slate-600">{net.year}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <p className="text-emerald-300 text-sm">
                  <strong>The trend:</strong> Deeper networks generally achieve better accuracy,
                  but only if trained correctly. ResNet's 152 layers wouldn't have been possible
                  without skip connections!
                </p>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-red-300 font-semibold mb-4">Vanishing Gradients</h4>
                  <div className="flex items-center gap-2 mb-4">
                    {[1.0, 0.5, 0.25, 0.12, 0.06, 0.03].map((val, i) => (
                      <div key={i} className="text-center">
                        <div
                          className="w-8 rounded bg-red-500"
                          style={{ height: val * 60 }}
                        />
                        <p className="text-xs text-slate-500 mt-1">{val}</p>
                      </div>
                    ))}
                    <span className="text-slate-500">→</span>
                    <div className="text-center">
                      <div className="w-8 h-1 rounded bg-red-500" />
                      <p className="text-xs text-slate-500 mt-1">~0</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    Gradients multiply through layers. Many small values ({"<"}1) → gradient vanishes
                  </p>
                </div>

                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-yellow-300 font-semibold mb-4">Degradation Problem</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">20 layers:</span>
                      <div className="flex-1 h-4 bg-slate-700 rounded overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '90%' }} />
                      </div>
                      <span className="text-sm text-slate-400">10% error</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">56 layers:</span>
                      <div className="flex-1 h-4 bg-slate-700 rounded overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: '85%' }} />
                      </div>
                      <span className="text-sm text-slate-400">15% error!</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-4">
                    More layers = worse training error? That shouldn't happen if deeper = better capacity!
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Batch Normalization</h4>

                <div className="flex items-center justify-center gap-8 flex-wrap">
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-2">Before BN</p>
                    <div className="flex gap-1">
                      {[-2.5, 0.1, 3.2, -1.8, 4.1].map((v, i) => (
                        <div key={i} className="w-10 h-10 bg-red-500/30 rounded flex items-center justify-center text-xs">
                          {v}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Varying distributions</p>
                  </div>

                  <ChevronRight size={24} className="text-violet-400" />

                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-2">Normalize</p>
                    <div className="bg-slate-800 rounded p-2 text-sm font-mono">
                      <p>μ = mean(x)</p>
                      <p>σ = std(x)</p>
                      <p>x̂ = (x - μ) / σ</p>
                    </div>
                  </div>

                  <ChevronRight size={24} className="text-violet-400" />

                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-2">Scale & Shift</p>
                    <div className="bg-slate-800 rounded p-2 text-sm font-mono">
                      <p>y = γ × x̂ + β</p>
                      <p className="text-xs text-slate-500">(learnable)</p>
                    </div>
                  </div>

                  <ChevronRight size={24} className="text-violet-400" />

                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-2">After BN</p>
                    <div className="flex gap-1">
                      {[-0.8, 0.2, 1.1, -0.5, 1.4].map((v, i) => (
                        <div key={i} className="w-10 h-10 bg-emerald-500/30 rounded flex items-center justify-center text-xs">
                          {v}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Stable distribution</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { benefit: 'Higher learning rates', desc: 'More stable training' },
                  { benefit: 'Regularization', desc: 'Slight noise from batch stats' },
                  { benefit: 'Less sensitive init', desc: 'Works with various initializations' },
                ].map(b => (
                  <div key={b.benefit} className="bg-slate-800 rounded-lg p-4 text-center">
                    <p className="text-emerald-300 font-semibold">{b.benefit}</p>
                    <p className="text-xs text-slate-400 mt-1">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setActiveSkipConnection(!activeSkipConnection)}
                  className={`px-4 py-2 rounded-lg ${
                    activeSkipConnection ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {activeSkipConnection ? 'Skip Connection Active' : 'Activate Skip Connection'}
                </button>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <ResidualBlock />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">Without Skip</h4>
                  <p className="font-mono text-sm mb-2">y = F(x)</p>
                  <p className="text-sm text-slate-400">
                    Layer must learn entire desired mapping. Hard to learn identity if needed.
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-emerald-300 font-semibold mb-2">With Skip</h4>
                  <p className="font-mono text-sm mb-2">y = F(x) + x</p>
                  <p className="text-sm text-slate-400">
                    Layer only learns the residual! If F(x)=0, identity passes through automatically.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <p className="text-emerald-300 text-sm">
                  <strong>Key insight:</strong> Skip connections provide a "gradient highway" -
                  gradients can flow directly from late to early layers without degrading through
                  many weight matrices. This enabled training networks with 100+ layers!
                </p>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Bottleneck Block (ResNet)</h4>
                <BottleneckBlock />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-violet-300 font-semibold mb-4">Depthwise Separable Conv</h4>
                  <div className="flex items-center gap-4 justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-violet-500/30 rounded grid grid-cols-3 gap-0.5 p-1">
                        {Array(9).fill(0).map((_, i) => (
                          <div key={i} className="bg-violet-500 rounded-sm" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">3×3 per channel</p>
                    </div>
                    <Plus size={16} className="text-slate-500" />
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500/30 rounded flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-500 rounded" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">1×1 combine</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-4 text-center">
                    8-9× fewer parameters than regular conv!
                  </p>
                </div>

                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-amber-300 font-semibold mb-4">Squeeze-and-Excitation</h4>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="flex flex-col gap-1">
                      {[0.9, 0.3, 0.8, 0.2].map((w, i) => (
                        <div
                          key={i}
                          className="h-4 bg-amber-500 rounded-sm"
                          style={{ width: w * 60 }}
                        />
                      ))}
                    </div>
                    <span className="text-slate-400 mx-2">×</span>
                    <div className="w-16 h-16 bg-slate-700 rounded grid grid-cols-2 gap-1 p-1">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-slate-600 rounded-sm" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-4 text-center">
                    Learn to emphasize important channels
                  </p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-sm text-slate-400 mb-2">Used In Modern Architectures</h4>
                <div className="flex flex-wrap gap-2">
                  {['ResNet', 'ResNeXt', 'EfficientNet', 'MobileNet', 'ConvNeXt'].map(arch => (
                    <span key={arch} className="px-3 py-1 bg-slate-700 rounded text-sm text-slate-300">
                      {arch}
                    </span>
                  ))}
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
                What problem do residual connections solve?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: 'Vanishing gradients & degradation', correct: true },
                  { text: 'Slow inference speed', correct: false },
                  { text: 'Large model size', correct: false },
                  { text: 'Data augmentation', correct: false },
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
                In a residual block y = F(x) + x, what does F(x) learn?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: 'The residual (difference from input)', correct: true },
                  { text: 'The complete output directly', correct: false },
                  { text: 'The input unchanged', correct: false },
                  { text: 'Random features', correct: false },
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
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <h3 className="font-semibold mb-3 text-emerald-300">Key Takeaways</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>Deeper networks learn better features but face gradient challenges</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>Batch normalization stabilizes training by normalizing layer inputs</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>Residual connections allow gradients to flow through identity shortcuts</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>Modern blocks (bottleneck, depthwise) balance accuracy and efficiency</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeeperNetworks;
