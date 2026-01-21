import React, { useState } from 'react';
import {
  ChevronRight, Lightbulb, Check, Sparkles, Eye,
  Search, Layers, ZoomIn, Target, AlertTriangle
} from 'lucide-react';

const Interpretability = () => {
  const [eli5Mode, setEli5Mode] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({});

  const sections = [
    {
      id: 'why',
      title: "Why Interpretability?",
      content: eli5Mode
        ? "Imagine a doctor using AI to help diagnose patients. Wouldn't you want to know WHY the AI thinks you're sick? Interpretability lets us peek inside the black box to understand what the network learned!"
        : "Interpretability is crucial for trust, debugging, and safety. We need to verify CNNs learn meaningful features, not spurious correlations. Medical, legal, and safety-critical applications require explainable decisions. Understanding failures helps improve models."
    },
    {
      id: 'filters',
      title: "Visualizing Filters",
      content: eli5Mode
        ? "The first layers learn simple stuff - edges going different directions, colors, basic textures. It's like the alphabet of vision! Deeper layers combine these into more complex patterns."
        : "Filter visualization shows what patterns each kernel detects. Early layers typically learn Gabor-like edge detectors at various orientations and frequencies, color blobs, and simple textures. These are the 'vocabulary' that deeper layers build upon."
    },
    {
      id: 'activations',
      title: "Activation Maximization",
      content: eli5Mode
        ? "We can ask: what image would make this neuron the MOST excited? Start with noise and slowly change it to maximize the neuron's response. The result shows what the neuron 'dreams' about!"
        : "Activation maximization finds input patterns that maximally activate a target neuron/channel. Starting from noise or a real image, gradient ascent optimizes the input to maximize activation. Reveals what each unit has learned to detect."
    },
    {
      id: 'saliency',
      title: "Saliency & Attention Maps",
      content: eli5Mode
        ? "Saliency maps highlight which parts of the image the network looked at to make its decision. It's like asking someone 'what made you think this was a cat?' and they point to the ears and whiskers."
        : "Saliency methods compute gradients of the output w.r.t. input pixels, showing which regions most affect the prediction. Grad-CAM uses gradients flowing into final conv layers to produce class-discriminative heatmaps. Attention mechanisms explicitly learn where to focus."
    },
    {
      id: 'features',
      title: "Feature Visualization",
      content: eli5Mode
        ? "By looking at what activates each neuron across many images, we can figure out what it's looking for. Some neurons detect eyes, some detect wheels, some detect textures like fur or brick!"
        : "Feature visualization combines multiple techniques: showing image patches that maximally activate neurons, generating synthetic inputs via optimization, and analyzing what patterns neurons respond to. Deep layers often correspond to semantic concepts (faces, objects, textures)."
    },
    {
      id: 'limitations',
      title: "Limitations & Cautions",
      content: eli5Mode
        ? "CNNs can sometimes learn the wrong thing! They might recognize wolves by the snow in the background, not the wolf itself. That's why we need to check what they actually learned."
        : "CNNs can learn shortcut features (e.g., hospital labels for X-ray diagnosis) instead of true patterns. They may be sensitive to adversarial perturbations invisible to humans. Interpretability tools can themselves be unreliable. Always validate with domain experts."
    }
  ];

  // Filter visualization simulation
  const FilterGrid = ({ layer }) => {
    const filters = layer === 1 ? [
      { name: 'Vertical', pattern: '│││' },
      { name: 'Horizontal', pattern: '═══' },
      { name: 'Diagonal ↘', pattern: '╲╲╲' },
      { name: 'Diagonal ↗', pattern: '╱╱╱' },
      { name: 'Red blob', color: '#ef4444' },
      { name: 'Green blob', color: '#22c55e' },
      { name: 'Blue blob', color: '#3b82f6' },
      { name: 'Yellow blob', color: '#eab308' },
    ] : [
      { name: 'Texture', pattern: '◊◊◊' },
      { name: 'Corner', pattern: '⌐¬' },
      { name: 'Circle', pattern: '○' },
      { name: 'Grid', pattern: '▦' },
      { name: 'Eye-like', pattern: '◉' },
      { name: 'Wheel-like', pattern: '◎' },
      { name: 'Face part', pattern: '△' },
      { name: 'Fur texture', pattern: '≋≋' },
    ];

    return (
      <div className="grid grid-cols-4 gap-3">
        {filters.map((f, i) => (
          <div key={i} className="bg-slate-800 rounded-lg p-3 text-center">
            <div
              className="w-12 h-12 mx-auto mb-2 rounded flex items-center justify-center text-2xl"
              style={{ backgroundColor: f.color || '#1e293b' }}
            >
              {f.emoji || f.pattern || ''}
            </div>
            <p className="text-xs text-slate-400">{f.name}</p>
          </div>
        ))}
      </div>
    );
  };

  // Saliency map simulation
  const SaliencyDemo = () => (
    <div className="grid grid-cols-3 gap-6">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto bg-slate-700 rounded-lg flex items-center justify-center mb-2">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8" cy="9" r="2" />
            <circle cx="16" cy="9" r="2" />
            <path d="M9 15c1.5 1 4.5 1 6 0" />
          </svg>
        </div>
        <p className="text-sm text-slate-400">Input Image</p>
      </div>
      <div className="text-center">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500/20 via-yellow-500/50 to-red-500/20 rounded-lg flex items-center justify-center mb-2 relative">
          <div className="absolute top-4 left-8 w-8 h-4 bg-red-500/60 rounded-full blur-sm" />
          <div className="absolute top-4 right-8 w-8 h-4 bg-red-500/60 rounded-full blur-sm" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-6 h-3 bg-yellow-500/60 rounded-full blur-sm" />
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" className="opacity-30">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8" cy="9" r="2" />
            <circle cx="16" cy="9" r="2" />
          </svg>
        </div>
        <p className="text-sm text-slate-400">Saliency Map</p>
      </div>
      <div className="text-center">
        <div className="w-32 h-32 mx-auto bg-slate-700 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8" cy="9" r="2" />
            <circle cx="16" cy="9" r="2" />
            <path d="M9 15c1.5 1 4.5 1 6 0" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-500/30 to-transparent" />
          <div className="absolute top-2 left-6 text-xs bg-emerald-500/80 px-1 rounded">eyes</div>
          <div className="absolute bottom-4 text-xs bg-emerald-500/80 px-1 rounded">mouth</div>
        </div>
        <p className="text-sm text-slate-400">Highlighted Regions</p>
      </div>
    </div>
  );

  // Feature hierarchy visualization
  const FeatureHierarchy = () => (
    <div className="grid grid-cols-4 gap-4">
      {[
        { layer: 'Conv1', features: ['─', '│', '╱', '╲'], label: 'Edges' },
        { layer: 'Conv3', features: ['◢', '◣', '⊞', '◎'], label: 'Textures' },
        { layer: 'Conv5', features: ['◉', '△', '●', '◇'], label: 'Parts' },
        { layer: 'FC', features: ['A', 'B', 'C', 'D'], label: 'Objects' },
      ].map((level, i) => (
        <div key={i} className="bg-slate-900 rounded-lg p-4">
          <h4 className="text-sm text-slate-400 mb-2">{level.layer}</h4>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {level.features.map((f, j) => (
              <div key={j} className="bg-slate-800 rounded p-2 text-center text-xl">
                {f}
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-emerald-300">{level.label}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full">
                Level 12
              </span>
              <span className="text-slate-400">Advanced</span>
            </div>
            <h1 className="text-3xl font-bold">What CNNs Actually Learn</h1>
            <p className="text-slate-400 mt-1">Interpretability and visualization techniques</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Search, title: 'Debug', desc: 'Find why models fail on certain inputs' },
                  { icon: Target, title: 'Trust', desc: 'Verify models learn correct features' },
                  { icon: AlertTriangle, title: 'Safety', desc: 'Detect biases and shortcuts' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-900 rounded-lg p-4">
                    <item.icon size={24} className="text-emerald-400 mb-2" />
                    <h4 className="font-semibold text-emerald-300 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-300 text-sm">
                  <strong>Real example:</strong> A CNN trained to detect pneumonia learned to recognize
                  the text "PORTABLE" on X-rays instead of actual lung patterns, because portable X-rays
                  were more common for sick patients. Interpretability caught this shortcut!
                </p>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => setSelectedLayer(1)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedLayer === 1 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Early Layer (Conv1)
                </button>
                <button
                  onClick={() => setSelectedLayer(5)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedLayer === 5 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Deeper Layer (Conv5)
                </button>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">
                  Learned Filters - {selectedLayer === 1 ? 'Early Layer' : 'Deeper Layer'}
                </h4>
                <FilterGrid layer={selectedLayer} />
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <p className="text-emerald-300 text-sm">
                  {selectedLayer === 1
                    ? "Early layers learn universal features that work for almost any image task: edges, colors, and simple textures. These are similar across different CNNs!"
                    : "Deeper layers learn task-specific features: eyes and faces for face recognition, wheels for car detection, etc. These are more interpretable but less transferable."}
                </p>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Activation Maximization Process</h4>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-4xl opacity-30">📺</span>
                    </div>
                    <p className="text-xs text-slate-400">Random noise</p>
                  </div>

                  <ChevronRight size={24} className="text-slate-600" />

                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-900/50 to-violet-900/50 rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-4xl opacity-50">🌀</span>
                    </div>
                    <p className="text-xs text-slate-400">After 100 steps</p>
                  </div>

                  <ChevronRight size={24} className="text-slate-600" />

                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-4xl opacity-70">👁</span>
                    </div>
                    <p className="text-xs text-slate-400">After 500 steps</p>
                  </div>

                  <ChevronRight size={24} className="text-slate-600" />

                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-800/50 to-emerald-900/50 rounded-lg mb-2 flex items-center justify-center ring-2 ring-emerald-400">
                      <span className="text-4xl">👁</span>
                    </div>
                    <p className="text-xs text-emerald-300">Converged: "Eye"</p>
                  </div>
                </div>

                <p className="text-center text-sm text-slate-400 mt-4">
                  Gradient ascent modifies the input to maximize a specific neuron's activation
                </p>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Saliency Map: Where is the CNN Looking?</h4>
                <SaliencyDemo />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">Gradient-based</h4>
                  <p className="text-sm text-slate-400">
                    Compute ∂output/∂input. High gradient = small input change → big output change.
                    Fast but can be noisy.
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-violet-300 font-semibold mb-2">Grad-CAM</h4>
                  <p className="text-sm text-slate-400">
                    Uses gradients flowing into final conv layer. Produces smoother, class-specific
                    heatmaps. Most popular method.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Feature Hierarchy: Simple → Complex</h4>
                <FeatureHierarchy />
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <p className="text-emerald-300 text-sm">
                  <strong>This hierarchy emerges automatically!</strong> We don't tell the network to
                  learn edges first, then textures, then parts. The learning algorithm discovers this
                  is the most efficient representation through training.
                </p>
              </div>
            </div>
          )}

          {currentSection === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-red-300 font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Shortcut Learning
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Wolves detected by snow (not wolf features)</li>
                    <li>• COVID X-rays detected by hospital markers</li>
                    <li>• Ships detected by water, not ship structure</li>
                  </ul>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <h4 className="text-amber-300 font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Adversarial Vulnerability
                  </h4>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Tiny invisible perturbations fool the model</li>
                    <li>• Adding noise can flip predictions</li>
                    <li>• Patches can cause targeted misclassification</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="font-semibold mb-4 text-center">Best Practices</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'Diverse test sets',
                    'Domain expert review',
                    'Multiple interp methods',
                    'Adversarial testing',
                  ].map((practice, i) => (
                    <div key={i} className="bg-slate-800 rounded-lg p-3 text-center">
                      <Check size={20} className="mx-auto text-emerald-400 mb-2" />
                      <p className="text-sm text-slate-300">{practice}</p>
                    </div>
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
                What do early CNN layers typically learn?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: 'Edges and simple textures', correct: true },
                  { text: 'Complete objects', correct: false },
                  { text: 'Faces and body parts', correct: false },
                  { text: 'Scene categories', correct: false },
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
                What is a "shortcut" in CNN learning?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { text: 'Learning spurious correlations instead of true patterns', correct: true },
                  { text: 'Skip connections in ResNet', correct: false },
                  { text: 'Using smaller kernels', correct: false },
                  { text: 'Training for fewer epochs', correct: false },
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
              <span>Interpretability builds trust and catches bugs before deployment</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>CNNs learn hierarchical features: edges → textures → parts → objects</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>Saliency maps and Grad-CAM show which regions drive predictions</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>Always verify CNNs learn correct features, not shortcuts or biases</span>
            </li>
          </ul>
        </div>

        {/* Congratulations */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500/20 via-violet-500/20 to-blue-500/20 rounded-xl p-8 border border-emerald-500/30 text-center">
          <h2 className="text-2xl font-bold mb-2">🎉 Congratulations!</h2>
          <p className="text-slate-300 mb-4">
            You've completed the entire CNN course! You now understand pixels to predictions,
            from basic convolutions to state-of-the-art architectures.
          </p>
          <p className="text-emerald-300">
            Keep exploring, keep learning, and build amazing things with CNNs!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Interpretability;
