import React, { useState, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight, TrendingDown,
  Lightbulb, Check, Sparkles, RefreshCw, Target, Zap
} from 'lucide-react';

const Training = () => {
  const [eli5Mode, setEli5Mode] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [lossHistory, setLossHistory] = useState([2.5]);
  const [accuracyHistory, setAccuracyHistory] = useState([0.1]);
  const [learningRate, setLearningRate] = useState(0.01);
  const [batchSize, setBatchSize] = useState(32);
  const [quizAnswers, setQuizAnswers] = useState({});

  // Simulate training
  useEffect(() => {
    let interval;
    if (isTraining && epoch < 50) {
      interval = setInterval(() => {
        setEpoch(prev => {
          const newEpoch = prev + 1;
          // Simulate loss decreasing
          const newLoss = Math.max(0.1, 2.5 * Math.exp(-newEpoch * learningRate * 2) + Math.random() * 0.1);
          const newAcc = Math.min(0.98, 1 - newLoss / 3 + Math.random() * 0.05);
          setLossHistory(h => [...h, newLoss]);
          setAccuracyHistory(h => [...h, newAcc]);
          if (newEpoch >= 50) setIsTraining(false);
          return newEpoch;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isTraining, epoch, learningRate]);

  const resetTraining = () => {
    setEpoch(0);
    setLossHistory([2.5]);
    setAccuracyHistory([0.1]);
    setIsTraining(false);
  };

  const sections = [
    {
      id: 'overview',
      title: "Training Overview",
      content: eli5Mode
        ? "Training is like teaching a dog tricks! You show examples, check if it got it right, tell it how wrong it was, and it adjusts a little. Do this thousands of times and it learns!"
        : "Training a CNN involves iteratively showing the network examples, comparing predictions to ground truth via a loss function, computing gradients through backpropagation, and updating weights to minimize loss. This process repeats for many epochs until convergence."
    },
    {
      id: 'loss',
      title: "Loss Functions",
      content: eli5Mode
        ? "The loss function is like a score that tells the network how badly it messed up. High loss = very wrong, low loss = pretty good! The network tries to make this number as small as possible."
        : "Loss functions quantify prediction error. Cross-entropy loss is standard for classification: L = -Σ(y · log(ŷ)). It penalizes confident wrong predictions heavily. For multi-class, we use categorical cross-entropy; for binary, binary cross-entropy or BCE."
    },
    {
      id: 'backprop',
      title: "Backpropagation",
      content: eli5Mode
        ? "Backprop is how the network figures out which knobs (weights) to turn! It traces backwards from the mistake, figuring out 'if I had changed this weight, how much would it have helped?' Then it adjusts all the knobs a tiny bit."
        : "Backpropagation computes gradients of the loss w.r.t. each parameter using the chain rule. Starting from the output, gradients flow backwards through each layer. Each weight learns how much it contributed to the error, enabling targeted updates."
    },
    {
      id: 'optimizer',
      title: "Optimizers & Learning Rate",
      content: eli5Mode
        ? "The learning rate is how big of steps we take when adjusting weights. Too big = we might overshoot and miss the answer. Too small = training takes forever. Optimizers like Adam help find the right step size automatically!"
        : "Optimizers update weights based on gradients. SGD: w = w - lr × ∇L. Adam adapts learning rates per-parameter using momentum and variance estimates. Learning rate scheduling (decay, warmup) is crucial - too high causes divergence, too low is slow."
    },
    {
      id: 'batches',
      title: "Batches & Epochs",
      content: eli5Mode
        ? "We don't show one picture at a time - that's slow! Instead, we show batches (like 32 pictures). One epoch means we've seen every picture once. Usually we train for many epochs until the network stops improving."
        : "Mini-batch gradient descent processes batches of samples (e.g., 32, 64) before updating weights, balancing computation efficiency and gradient stability. An epoch = one pass through all training data. Training typically runs for 10-200+ epochs until validation loss stops improving."
    },
    {
      id: 'regularization',
      title: "Regularization",
      content: eli5Mode
        ? "Regularization keeps the network from memorizing the answers instead of actually learning! Dropout randomly turns off some neurons during training - like studying with friends who sometimes stay quiet. It forces the network to not rely on any single part too much."
        : "Regularization prevents overfitting. Dropout randomly zeroes activations during training (typically p=0.5). Weight decay (L2) adds λ||w||² to loss, penalizing large weights. Data augmentation (flips, crops, rotations) artificially expands training data. Batch normalization also regularizes."
    }
  ];

  // Loss curve visualization
  const LossCurve = () => {
    const width = 300;
    const height = 150;
    const padding = 30;

    const points = lossHistory.map((loss, i) => ({
      x: padding + (i / Math.max(lossHistory.length - 1, 1)) * (width - 2 * padding),
      y: padding + (1 - loss / 3) * (height - 2 * padding)
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36">
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" />

        {/* Labels */}
        <text x={width / 2} y={height - 5} textAnchor="middle" fill="#64748b" fontSize="10">Epoch</text>
        <text x={10} y={height / 2} textAnchor="middle" fill="#64748b" fontSize="10" transform={`rotate(-90, 10, ${height/2})`}>Loss</text>

        {/* Loss curve */}
        <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2" />

        {/* Current point */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill="#ef4444"
          />
        )}
      </svg>
    );
  };

  // Accuracy curve
  const AccuracyCurve = () => {
    const width = 300;
    const height = 150;
    const padding = 30;

    const points = accuracyHistory.map((acc, i) => ({
      x: padding + (i / Math.max(accuracyHistory.length - 1, 1)) * (width - 2 * padding),
      y: padding + (1 - acc) * (height - 2 * padding)
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" />

        <text x={width / 2} y={height - 5} textAnchor="middle" fill="#64748b" fontSize="10">Epoch</text>
        <text x={10} y={height / 2} textAnchor="middle" fill="#64748b" fontSize="10" transform={`rotate(-90, 10, ${height/2})`}>Accuracy</text>

        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" />

        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill="#10b981"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full">
                Level 9
              </span>
              <span className="text-slate-400">Advanced</span>
            </div>
            <h1 className="text-3xl font-bold">Training a CNN</h1>
            <p className="text-slate-400 mt-1">How neural networks learn from data</p>
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
              {/* Training simulation */}
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => setIsTraining(!isTraining)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isTraining ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {isTraining ? <Pause size={18} /> : <Play size={18} />}
                  {isTraining ? 'Pause' : 'Train'}
                </button>
                <button
                  onClick={resetTraining}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>

              {/* Hyperparameters */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">
                    Learning Rate: {learningRate}
                  </label>
                  <input
                    type="range"
                    min="0.001"
                    max="0.1"
                    step="0.001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={isTraining}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-2">
                    Batch Size: {batchSize}
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="128"
                    step="8"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                    className="w-full"
                    disabled={isTraining}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-red-300 font-semibold">Loss</h4>
                    <span className="font-mono text-red-300">
                      {lossHistory[lossHistory.length - 1].toFixed(3)}
                    </span>
                  </div>
                  <LossCurve />
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-emerald-300 font-semibold">Accuracy</h4>
                    <span className="font-mono text-emerald-300">
                      {(accuracyHistory[accuracyHistory.length - 1] * 100).toFixed(1)}%
                    </span>
                  </div>
                  <AccuracyCurve />
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-400">
                  Epoch: <span className="text-emerald-300 font-mono">{epoch}</span> / 50
                </p>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Cross-Entropy Loss Example</h4>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">True Label (y)</p>
                    <div className="space-y-1">
                      {['Cat', 'Dog', 'Bird'].map((c, i) => (
                        <div key={c} className={`py-1 px-3 rounded ${i === 0 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-700 text-slate-500'}`}>
                          {c}: {i === 0 ? '1' : '0'}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">Prediction (ŷ)</p>
                    <div className="space-y-1">
                      {[
                        { name: 'Cat', prob: 0.7 },
                        { name: 'Dog', prob: 0.2 },
                        { name: 'Bird', prob: 0.1 }
                      ].map((c, i) => (
                        <div key={c.name} className="py-1 px-3 rounded bg-blue-500/30 text-blue-300">
                          {c.name}: {c.prob}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">Loss Calculation</p>
                    <div className="bg-slate-800 rounded p-3 text-sm">
                      <p className="font-mono text-yellow-300">
                        L = -log(0.7)
                      </p>
                      <p className="font-mono text-yellow-300 mt-1">
                        = 0.357
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400">
                    Cross-entropy only cares about the probability assigned to the <span className="text-emerald-300">true class</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-emerald-300 font-semibold mb-2">Good Prediction</h4>
                  <p className="text-sm text-slate-400 mb-2">True class probability: 0.95</p>
                  <p className="font-mono">Loss = -log(0.95) = <span className="text-emerald-300">0.05</span></p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="text-red-300 font-semibold mb-2">Bad Prediction</h4>
                  <p className="text-sm text-slate-400 mb-2">True class probability: 0.05</p>
                  <p className="font-mono">Loss = -log(0.05) = <span className="text-red-300">3.00</span></p>
                </div>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4 text-center">Backpropagation Flow</h4>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {['Input', 'Conv1', 'Pool1', 'Conv2', 'Pool2', 'FC', 'Output', 'Loss'].map((layer, idx) => (
                    <React.Fragment key={layer}>
                      <div className={`px-3 py-2 rounded text-sm ${
                        idx === 7 ? 'bg-red-500/30 text-red-300' :
                        idx === 0 ? 'bg-blue-500/30 text-blue-300' :
                        'bg-violet-500/30 text-violet-300'
                      }`}>
                        {layer}
                      </div>
                      {idx < 7 && (
                        <div className="flex flex-col items-center">
                          <span className="text-emerald-400 text-xs">forward →</span>
                          <span className="text-red-400 text-xs">← gradients</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-6 bg-slate-800 rounded p-4">
                  <p className="font-mono text-sm text-center">
                    <span className="text-red-300">∂L/∂w</span> = <span className="text-yellow-300">∂L/∂ŷ</span> × <span className="text-violet-300">∂ŷ/∂z</span> × <span className="text-blue-300">∂z/∂w</span>
                  </p>
                  <p className="text-center text-xs text-slate-500 mt-2">Chain rule: multiply partial derivatives</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-300 text-sm">
                  <strong>Key insight:</strong> Gradients can vanish (become very small) or explode in deep networks.
                  This is why techniques like batch normalization, residual connections, and careful initialization matter!
                </p>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'SGD', desc: 'Simple but can be slow', formula: 'w = w - lr × ∇L', color: 'blue' },
                  { name: 'Adam', desc: 'Adaptive, most popular', formula: 'Combines momentum + RMSprop', color: 'emerald' },
                  { name: 'AdamW', desc: 'Adam + weight decay', formula: 'Better generalization', color: 'violet' },
                ].map(opt => (
                  <div key={opt.name} className={`bg-slate-900 rounded-lg p-4 border-2 border-${opt.color}-500/30`}>
                    <h4 className={`text-${opt.color}-300 font-semibold mb-2`}>{opt.name}</h4>
                    <p className="text-sm text-slate-400 mb-2">{opt.desc}</p>
                    <p className="text-xs font-mono text-slate-500">{opt.formula}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 rounded-lg p-6">
                <h4 className="text-sm text-slate-400 mb-4">Learning Rate Effect</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-red-300 font-semibold">Too High</p>
                    <p className="text-xs text-slate-400">Overshoots, diverges</p>
                  </div>
                  <div>
                    <div className="text-4xl mb-2">✓</div>
                    <p className="text-emerald-300 font-semibold">Just Right</p>
                    <p className="text-xs text-slate-400">Smooth convergence</p>
                  </div>
                  <div>
                    <div className="text-4xl mb-2">🐌</div>
                    <p className="text-yellow-300 font-semibold">Too Low</p>
                    <p className="text-xs text-slate-400">Very slow training</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-blue-300 font-semibold mb-3">Batch Processing</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-300">Dataset: 50,000 images</p>
                      <p className="text-slate-300">Batch size: 32</p>
                      <p className="text-slate-300">Batches per epoch: <span className="text-blue-300">1,562</span></p>
                      <p className="text-slate-300">Updates per epoch: <span className="text-blue-300">1,562</span></p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-emerald-300 font-semibold mb-3">Training Duration</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-300">Epochs: 100</p>
                      <p className="text-slate-300">Total batches: <span className="text-emerald-300">156,200</span></p>
                      <p className="text-slate-300">Total updates: <span className="text-emerald-300">156,200</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { size: 'Small (8-16)', pros: 'More updates, noisy gradients', cons: 'Slow GPU utilization' },
                  { size: 'Medium (32-64)', pros: 'Good balance', cons: 'Most common choice' },
                  { size: 'Large (128+)', pros: 'Stable gradients, fast', cons: 'May generalize worse' },
                ].map(batch => (
                  <div key={batch.size} className="bg-slate-800 rounded-lg p-4">
                    <h4 className="text-violet-300 font-semibold mb-2">{batch.size}</h4>
                    <p className="text-xs text-emerald-300 mb-1">+ {batch.pros}</p>
                    <p className="text-xs text-slate-400">• {batch.cons}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-violet-300 font-semibold mb-4">Dropout</h4>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {Array(15).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full ${
                          [2, 5, 8, 11, 13].includes(i)
                            ? 'bg-slate-700 opacity-30'
                            : 'bg-violet-500'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">
                    During training, randomly "drop" neurons (set to 0). Forces network to not rely on any single path.
                  </p>
                </div>

                <div className="bg-slate-900 rounded-lg p-6">
                  <h4 className="text-blue-300 font-semibold mb-4">Data Augmentation</h4>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {['Original', 'Flip', 'Rotate', 'Crop'].map((aug, i) => (
                      <div key={aug} className="text-center">
                        <div className={`w-12 h-12 mx-auto rounded ${
                          i === 0 ? 'bg-blue-500' :
                          i === 1 ? 'bg-blue-500 scale-x-[-1]' :
                          i === 2 ? 'bg-blue-500 rotate-12' :
                          'bg-blue-500 scale-90'
                        }`} />
                        <p className="text-xs text-slate-500 mt-1">{aug}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">
                    Create variations of training images. Helps the model generalize beyond exact training examples.
                  </p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-emerald-300 font-semibold mb-2">Weight Decay (L2 Regularization)</h4>
                <p className="font-mono text-sm mb-2">
                  Loss = Cross-Entropy + <span className="text-emerald-300">λ × ||weights||²</span>
                </p>
                <p className="text-sm text-slate-400">
                  Penalizes large weights, encouraging simpler models that generalize better.
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
                What does backpropagation compute?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: 'Gradients of loss w.r.t. weights', correct: true },
                  { text: 'The prediction output', correct: false },
                  { text: 'The learning rate', correct: false },
                  { text: 'The batch size', correct: false },
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
                What is the purpose of dropout?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: 'Prevent overfitting', correct: true },
                  { text: 'Speed up training', correct: false },
                  { text: 'Increase model size', correct: false },
                  { text: 'Reduce loss directly', correct: false },
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
              <span>Training minimizes loss by iteratively updating weights via backpropagation</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>Cross-entropy loss penalizes confident wrong predictions heavily</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>Learning rate is crucial: too high diverges, too low is slow</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>Regularization (dropout, augmentation, weight decay) prevents overfitting</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Training;
