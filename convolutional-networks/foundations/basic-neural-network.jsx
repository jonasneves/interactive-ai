import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Lightbulb, Check, Sparkles, Zap, TrendingUp
} from 'lucide-react';

const BasicNeuralNetwork = () => {
  const [eli5Mode, setEli5Mode] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [inputValues, setInputValues] = useState([0.5, 0.8]);
  const [weights, setWeights] = useState([[0.4, 0.6], [0.3, 0.7]]);
  const [bias, setBias] = useState(0.1);
  const canvasRef = useRef(null);

  // Activation functions
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  const relu = (x) => Math.max(0, x);
  const tanh = (x) => Math.tanh(x);

  const [activeActivation, setActiveActivation] = useState('relu');

  // Calculate neuron output
  const calculateOutput = () => {
    const weightedSum = inputValues[0] * weights[0][0] + inputValues[1] * weights[0][1] + bias;
    switch (activeActivation) {
      case 'sigmoid': return sigmoid(weightedSum);
      case 'relu': return relu(weightedSum);
      case 'tanh': return tanh(weightedSum);
      default: return weightedSum;
    }
  };

  const sections = [
    {
      id: 'neuron',
      title: "The Artificial Neuron",
      content: eli5Mode
        ? "A neuron is like a tiny decision maker! It takes some numbers, multiplies each by how important it is (weights), adds them up, and decides whether to 'fire' or not."
        : "An artificial neuron mimics biological neurons. It computes a weighted sum of inputs, adds a bias term, and applies an activation function: output = f(Σ(wᵢxᵢ) + b)"
    },
    {
      id: 'weights',
      title: "Weights & Biases",
      content: eli5Mode
        ? "Weights are like volume knobs - they control how much attention the neuron pays to each input. Bias is like a starting point that shifts everything up or down."
        : "Weights (w) determine the importance of each input. Bias (b) allows the neuron to shift its activation threshold. These are the learnable parameters that training adjusts."
    },
    {
      id: 'activation',
      title: "Activation Functions",
      content: eli5Mode
        ? "The activation function decides if the neuron should 'fire'. ReLU is simple: if negative, output 0; if positive, let it through. It's like a gate that only opens one way!"
        : "Activation functions introduce non-linearity, allowing networks to learn complex patterns. Common functions: ReLU (max(0,x)), Sigmoid (1/(1+e^-x)), Tanh. Without them, stacked layers would just be one big linear transformation."
    },
    {
      id: 'layers',
      title: "Layers & Networks",
      content: eli5Mode
        ? "Stack neurons in layers like a sandwich! Input layer receives data, hidden layers do the thinking, output layer gives the answer. More layers = more complex thinking!"
        : "Neural networks organize neurons into layers: input layer (receives features), hidden layers (learn representations), and output layer (produces predictions). Deep networks have many hidden layers."
    },
    {
      id: 'forward',
      title: "Forward Propagation",
      content: eli5Mode
        ? "Forward propagation is like a relay race! Data starts at the beginning, gets passed through each layer, and each neuron does its calculation before passing the result forward."
        : "Forward propagation computes the network output by sequentially applying each layer's transformation. Input flows through the network, with each layer's output becoming the next layer's input."
    }
  ];

  // Animation for forward pass
  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationPhase(prev => {
          if (prev >= 4) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  const resetAnimation = () => {
    setAnimationPhase(0);
    setIsAnimating(false);
  };

  // Simple neural network visualization
  const NeuronViz = () => {
    const weightedSum = inputValues[0] * weights[0][0] + inputValues[1] * weights[0][1] + bias;
    const output = calculateOutput();

    return (
      <svg viewBox="0 0 500 300" className="w-full h-64">
        {/* Connections */}
        <line x1="80" y1="100" x2="220" y2="150" stroke={animationPhase >= 1 ? "#60a5fa" : "#475569"} strokeWidth="2" />
        <line x1="80" y1="200" x2="220" y2="150" stroke={animationPhase >= 1 ? "#60a5fa" : "#475569"} strokeWidth="2" />
        <line x1="280" y1="150" x2="400" y2="150" stroke={animationPhase >= 3 ? "#10b981" : "#475569"} strokeWidth="2" />

        {/* Weight labels */}
        <text x="130" y="110" fill="#94a3b8" fontSize="12">w₁={weights[0][0]}</text>
        <text x="130" y="200" fill="#94a3b8" fontSize="12">w₂={weights[0][1]}</text>

        {/* Input nodes */}
        <circle cx="80" cy="100" r="25" fill={animationPhase >= 0 ? "#3b82f6" : "#1e293b"} stroke="#60a5fa" strokeWidth="2" />
        <text x="80" y="105" textAnchor="middle" fill="white" fontSize="12">{inputValues[0]}</text>
        <text x="80" y="65" textAnchor="middle" fill="#94a3b8" fontSize="11">x₁</text>

        <circle cx="80" cy="200" r="25" fill={animationPhase >= 0 ? "#3b82f6" : "#1e293b"} stroke="#60a5fa" strokeWidth="2" />
        <text x="80" y="205" textAnchor="middle" fill="white" fontSize="12">{inputValues[1]}</text>
        <text x="80" y="240" textAnchor="middle" fill="#94a3b8" fontSize="11">x₂</text>

        {/* Neuron */}
        <circle cx="250" cy="150" r="35" fill={animationPhase >= 2 ? "#8b5cf6" : "#1e293b"} stroke="#a78bfa" strokeWidth="2" />
        <text x="250" y="145" textAnchor="middle" fill="white" fontSize="10">Σ + b</text>
        <text x="250" y="160" textAnchor="middle" fill="#c4b5fd" fontSize="9">{activeActivation}</text>

        {/* Bias */}
        <text x="250" y="200" textAnchor="middle" fill="#94a3b8" fontSize="11">b={bias}</text>

        {/* Output node */}
        <circle cx="400" cy="150" r="30" fill={animationPhase >= 4 ? "#10b981" : "#1e293b"} stroke="#34d399" strokeWidth="2" />
        <text x="400" y="155" textAnchor="middle" fill="white" fontSize="12">
          {animationPhase >= 4 ? output.toFixed(3) : '?'}
        </text>
        <text x="400" y="195" textAnchor="middle" fill="#94a3b8" fontSize="11">output</text>

        {/* Calculation display */}
        {animationPhase >= 2 && (
          <text x="250" y="250" textAnchor="middle" fill="#fbbf24" fontSize="11">
            Σ = {weightedSum.toFixed(3)}
          </text>
        )}
      </svg>
    );
  };

  // Network layer visualization
  const NetworkViz = () => (
    <svg viewBox="0 0 500 250" className="w-full h-48">
      {/* Layer labels */}
      <text x="60" y="20" textAnchor="middle" fill="#94a3b8" fontSize="11">Input</text>
      <text x="180" y="20" textAnchor="middle" fill="#94a3b8" fontSize="11">Hidden 1</text>
      <text x="300" y="20" textAnchor="middle" fill="#94a3b8" fontSize="11">Hidden 2</text>
      <text x="420" y="20" textAnchor="middle" fill="#94a3b8" fontSize="11">Output</text>

      {/* Connections (simplified) */}
      {[50, 100, 150, 200].map((y1) =>
        [60, 110, 160].map((y2, i) => (
          <line key={`h1-${y1}-${y2}`} x1="80" y1={y1} x2="160" y2={y2 + 40} stroke="#475569" strokeWidth="1" opacity="0.5" />
        ))
      )}
      {[60, 110, 160].map((y1) =>
        [70, 120, 170].map((y2, i) => (
          <line key={`h2-${y1}-${y2}`} x1="200" y1={y1 + 40} x2="280" y2={y2 + 30} stroke="#475569" strokeWidth="1" opacity="0.5" />
        ))
      )}
      {[70, 120, 170].map((y1) =>
        [100, 150].map((y2, i) => (
          <line key={`out-${y1}-${y2}`} x1="320" y1={y1 + 30} x2="400" y2={y2 + 10} stroke="#475569" strokeWidth="1" opacity="0.5" />
        ))
      )}

      {/* Input layer */}
      {[50, 100, 150, 200].map((y, i) => (
        <circle key={`in-${i}`} cx="60" cy={y} r="15" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
      ))}

      {/* Hidden layer 1 */}
      {[100, 150, 200].map((y, i) => (
        <circle key={`h1-${i}`} cx="180" cy={y} r="15" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
      ))}

      {/* Hidden layer 2 */}
      {[100, 150, 200].map((y, i) => (
        <circle key={`h2-${i}`} cx="300" cy={y} r="15" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
      ))}

      {/* Output layer */}
      {[110, 160].map((y, i) => (
        <circle key={`out-${i}`} cx="420" cy={y} r="15" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
      ))}
    </svg>
  );

  // Activation function plot
  const ActivationPlot = ({ func, name, color }) => {
    const points = [];
    for (let x = -5; x <= 5; x += 0.2) {
      let y;
      switch (func) {
        case 'sigmoid': y = sigmoid(x); break;
        case 'relu': y = relu(x); break;
        case 'tanh': y = tanh(x); break;
        default: y = x;
      }
      points.push(`${100 + x * 15},${80 - y * 30}`);
    }

    return (
      <div
        className={`bg-slate-900 rounded-lg p-4 cursor-pointer transition-all ${
          activeActivation === func ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''
        }`}
        style={{ ringColor: color }}
        onClick={() => setActiveActivation(func)}
      >
        <svg viewBox="0 0 200 120" className="w-full h-24">
          {/* Axes */}
          <line x1="20" y1="80" x2="180" y2="80" stroke="#475569" strokeWidth="1" />
          <line x1="100" y1="10" x2="100" y2="110" stroke="#475569" strokeWidth="1" />

          {/* Function curve */}
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />

          {/* Label */}
          <text x="100" y="115" textAnchor="middle" fill="#94a3b8" fontSize="10">{name}</text>
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                Level 3
              </span>
              <span className="text-slate-400">Prerequisites</span>
            </div>
            <h1 className="text-3xl font-bold">Basic Neural Networks</h1>
            <p className="text-slate-400 mt-1">Understanding the building blocks before convolution</p>
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

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">{sections[currentSection].title}</h2>
          <p className="text-slate-300 leading-relaxed mb-6">{sections[currentSection].content}</p>

          {/* Interactive Visualizations */}
          {currentSection === 0 && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => { resetAnimation(); setIsAnimating(true); }}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg flex items-center gap-2 hover:bg-emerald-500/30"
                >
                  <Play size={18} />
                  Animate Forward Pass
                </button>
                <button
                  onClick={resetAnimation}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-600"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <NeuronViz />
              </div>

              {/* Input controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Input x₁: {inputValues[0]}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={inputValues[0]}
                    onChange={(e) => setInputValues([parseFloat(e.target.value), inputValues[1]])}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Input x₂: {inputValues[1]}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={inputValues[1]}
                    onChange={(e) => setInputValues([inputValues[0], parseFloat(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-sm font-mono text-slate-300">
                  <span className="text-blue-300">output</span> = {activeActivation}(
                  <span className="text-yellow-300">{inputValues[0]}</span>×{weights[0][0]} +
                  <span className="text-yellow-300">{inputValues[1]}</span>×{weights[0][1]} + {bias}
                  ) = <span className="text-emerald-300">{calculateOutput().toFixed(4)}</span>
                </p>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-sm text-slate-400 mb-4">Adjust Weights</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-300 block mb-2">
                        Weight 1 (w₁): <span className="text-blue-300">{weights[0][0]}</span>
                      </label>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={weights[0][0]}
                        onChange={(e) => setWeights([[parseFloat(e.target.value), weights[0][1]], weights[1]])}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 block mb-2">
                        Weight 2 (w₂): <span className="text-violet-300">{weights[0][1]}</span>
                      </label>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={weights[0][1]}
                        onChange={(e) => setWeights([[weights[0][0], parseFloat(e.target.value)], weights[1]])}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300 block mb-2">
                        Bias (b): <span className="text-emerald-300">{bias}</span>
                      </label>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={bias}
                        onChange={(e) => setBias(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-sm text-slate-400 mb-4">Effect on Output</h4>
                  <div className="h-40 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-mono text-emerald-300 mb-2">
                        {calculateOutput().toFixed(4)}
                      </p>
                      <p className="text-slate-400 text-sm">
                        Weighted sum: {(inputValues[0] * weights[0][0] + inputValues[1] * weights[0][1] + bias).toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 text-center">
                    Try negative weights to see how they flip the input's influence!
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-slate-400 mb-4">Click to select an activation function:</p>
              <div className="grid grid-cols-3 gap-4">
                <ActivationPlot func="relu" name="ReLU" color="#10b981" />
                <ActivationPlot func="sigmoid" name="Sigmoid" color="#3b82f6" />
                <ActivationPlot func="tanh" name="Tanh" color="#8b5cf6" />
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-sm text-slate-400 mb-2">Selected: {activeActivation.toUpperCase()}</h4>
                <div className="font-mono text-sm">
                  {activeActivation === 'relu' && (
                    <p className="text-emerald-300">f(x) = max(0, x) - Simple and efficient, most popular in CNNs</p>
                  )}
                  {activeActivation === 'sigmoid' && (
                    <p className="text-blue-300">f(x) = 1/(1+e⁻ˣ) - Squashes to (0,1), good for probabilities</p>
                  )}
                  {activeActivation === 'tanh' && (
                    <p className="text-violet-300">f(x) = tanh(x) - Squashes to (-1,1), zero-centered</p>
                  )}
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  <strong>Why ReLU for CNNs?</strong> It's computationally efficient, avoids vanishing gradients,
                  and creates sparse activations (many zeros), which helps CNNs focus on important features.
                </p>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-4">
                <NetworkViz />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-2">Input Layer</h4>
                  <p className="text-sm text-slate-400">Receives raw features (pixels, numbers, etc.)</p>
                </div>
                <div className="bg-violet-500/10 rounded-lg p-4">
                  <h4 className="text-violet-300 font-semibold mb-2">Hidden Layers</h4>
                  <p className="text-sm text-slate-400">Learn intermediate representations</p>
                </div>
                <div className="bg-emerald-500/10 rounded-lg p-4">
                  <h4 className="text-emerald-300 font-semibold mb-2">Output Layer</h4>
                  <p className="text-sm text-slate-400">Produces final predictions/classifications</p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-slate-300">
                  <strong>Parameters in this network:</strong><br/>
                  • Input→Hidden1: 4×3 = 12 weights + 3 biases = 15 params<br/>
                  • Hidden1→Hidden2: 3×3 = 9 weights + 3 biases = 12 params<br/>
                  • Hidden2→Output: 3×2 = 6 weights + 2 biases = 8 params<br/>
                  • <span className="text-emerald-300">Total: 35 learnable parameters</span>
                </p>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => { resetAnimation(); setIsAnimating(true); }}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg flex items-center gap-2 hover:bg-emerald-500/30"
                >
                  <Play size={18} />
                  Watch Forward Pass
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
                <div className="flex items-center justify-between gap-4">
                  {['Input', 'Weighted Sum', 'Activation', 'Output'].map((step, idx) => (
                    <div
                      key={step}
                      className={`flex-1 text-center p-4 rounded-lg transition-all ${
                        animationPhase >= idx ? 'bg-emerald-500/20' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`text-2xl mb-2 ${animationPhase >= idx ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {idx + 1}
                      </div>
                      <p className={`text-sm ${animationPhase >= idx ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Arrows */}
                <div className="flex justify-between px-16 -mt-16 pointer-events-none">
                  {[0, 1, 2].map(i => (
                    <ChevronRight
                      key={i}
                      size={24}
                      className={`transition-all ${animationPhase > i ? 'text-emerald-300' : 'text-slate-600'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm">
                <p className="text-slate-400 mb-2"># Forward pass pseudocode</p>
                <p><span className="text-blue-300">for</span> layer <span className="text-blue-300">in</span> network.layers:</p>
                <p className="pl-4">z = dot(input, weights) + bias  <span className="text-slate-500"># weighted sum</span></p>
                <p className="pl-4">output = activation(z)          <span className="text-slate-500"># apply activation</span></p>
                <p className="pl-4">input = output                  <span className="text-slate-500"># for next layer</span></p>
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
                What is ReLU(−3)?
              </p>
              <div className="flex gap-3">
                {[0, -3, 3, 'undefined'].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({...quizAnswers, q1: ans})}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      quizAnswers.q1 === undefined
                        ? 'border-slate-600 hover:border-slate-500'
                        : ans === 0
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
                <p className={`mt-2 text-sm ${quizAnswers.q1 === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {quizAnswers.q1 === 0
                    ? '✓ Correct! ReLU returns 0 for any negative input.'
                    : '✗ Remember: ReLU(x) = max(0, x). For negatives, it returns 0.'}
                </p>
              )}
            </div>

            <div>
              <p className="text-slate-300 mb-3">
                Why are activation functions necessary?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { text: 'To introduce non-linearity', correct: true },
                  { text: 'To make computation faster', correct: false },
                  { text: 'To reduce memory usage', correct: false },
                  { text: 'To increase weights', correct: false },
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
              {quizAnswers.q2 !== undefined && (
                <p className={`mt-2 text-sm ${quizAnswers.q2 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {quizAnswers.q2
                    ? '✓ Correct! Without non-linearity, stacking layers would be equivalent to a single linear transformation.'
                    : '✗ Activations add non-linearity, enabling networks to learn complex patterns.'}
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
              <span>Neurons compute: output = activation(weights · inputs + bias)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>Weights and biases are learned parameters adjusted during training</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>Activation functions (especially ReLU) introduce crucial non-linearity</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <span>Forward propagation flows data through layers to produce output</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BasicNeuralNetwork;
