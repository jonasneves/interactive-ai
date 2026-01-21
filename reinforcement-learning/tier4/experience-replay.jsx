import React, { useState, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Database, Shuffle, Zap } from 'lucide-react';

const ExperienceReplay = () => {
  const BUFFER_CAPACITY = 20;
  const BATCH_SIZE = 4;

  // State
  const [buffer, setBuffer] = useState([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [sampledBatch, setSampledBatch] = useState([]);
  const [stepCount, setStepCount] = useState(0);
  const [collectSpeed, setCollectSpeed] = useState(500);
  const [showAnimation, setShowAnimation] = useState(null);
  const [prioritized, setPrioritized] = useState(false);
  const [priorities, setPriorities] = useState([]);

  // Simulate collecting an experience
  const collectExperience = useCallback(() => {
    const experience = {
      id: stepCount,
      state: `s${Math.floor(Math.random() * 10)}`,
      action: ['↑', '↓', '←', '→'][Math.floor(Math.random() * 4)],
      reward: Math.random() < 0.2 ? (Math.random() * 10).toFixed(1) : (-0.1).toFixed(1),
      nextState: `s${Math.floor(Math.random() * 10)}`,
      done: Math.random() < 0.1,
      tdError: (Math.random() * 2 - 1).toFixed(2), // For prioritized replay
      timestamp: Date.now()
    };

    setBuffer(prev => {
      const newBuffer = [...prev, experience];
      if (newBuffer.length > BUFFER_CAPACITY) {
        return newBuffer.slice(-BUFFER_CAPACITY);
      }
      return newBuffer;
    });

    setPriorities(prev => {
      const newPriorities = [...prev, Math.abs(parseFloat(experience.tdError)) + 0.01];
      if (newPriorities.length > BUFFER_CAPACITY) {
        return newPriorities.slice(-BUFFER_CAPACITY);
      }
      return newPriorities;
    });

    setShowAnimation('add');
    setTimeout(() => setShowAnimation(null), 300);
    setStepCount(prev => prev + 1);
  }, [stepCount]);

  // Sample a batch from buffer
  const sampleBatch = useCallback(() => {
    if (buffer.length < BATCH_SIZE) return;

    let indices;
    if (prioritized) {
      // Prioritized sampling based on TD error
      const totalPriority = priorities.reduce((a, b) => a + b, 0);
      const probs = priorities.map(p => p / totalPriority);

      indices = [];
      for (let i = 0; i < BATCH_SIZE; i++) {
        let r = Math.random();
        let cumsum = 0;
        for (let j = 0; j < probs.length; j++) {
          cumsum += probs[j];
          if (r < cumsum) {
            indices.push(j);
            break;
          }
        }
      }
    } else {
      // Uniform random sampling
      indices = [];
      const available = [...Array(buffer.length).keys()];
      for (let i = 0; i < BATCH_SIZE && available.length > 0; i++) {
        const idx = Math.floor(Math.random() * available.length);
        indices.push(available[idx]);
        available.splice(idx, 1);
      }
    }

    const batch = indices.map(i => ({ ...buffer[i], bufferIdx: i }));
    setSampledBatch(batch);
    setShowAnimation('sample');
    setTimeout(() => setShowAnimation(null), 500);
  }, [buffer, priorities, prioritized]);

  // Auto-collect
  useEffect(() => {
    if (isCollecting) {
      const timer = setTimeout(collectExperience, collectSpeed);
      return () => clearTimeout(timer);
    }
  }, [isCollecting, collectExperience, collectSpeed]);

  const reset = () => {
    setBuffer([]);
    setSampledBatch([]);
    setPriorities([]);
    setStepCount(0);
    setIsCollecting(false);
    setShowAnimation(null);
  };

  const getRewardColor = (r) => {
    const reward = parseFloat(r);
    if (reward > 5) return 'text-green-400';
    if (reward > 0) return 'text-green-300';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Experience Replay Buffer</h1>
        <p className="text-slate-400 mb-6">Visualize how experiences are stored, sampled, and reused for training</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Buffer Visualization */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-4 flex-wrap mb-4">
                <button
                  onClick={() => setIsCollecting(!isCollecting)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isCollecting ? 'bg-red-600' : 'bg-green-600'
                  }`}
                >
                  {isCollecting ? <Pause size={16} /> : <Play size={16} />}
                  {isCollecting ? 'Pause' : 'Collect'}
                </button>
                <button
                  onClick={collectExperience}
                  disabled={isCollecting}
                  className="px-4 py-2 bg-blue-600 rounded-lg disabled:opacity-50"
                >
                  Add One
                </button>
                <button
                  onClick={sampleBatch}
                  disabled={buffer.length < BATCH_SIZE}
                  className="px-4 py-2 bg-purple-600 rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <Shuffle size={16} /> Sample Batch
                </button>
                <button onClick={reset} className="px-4 py-2 bg-slate-700 rounded-lg">
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Speed:</span>
                  <input type="range" min="100" max="1000" value={1100 - collectSpeed}
                    onChange={(e) => setCollectSpeed(1100 - parseInt(e.target.value))} className="w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prioritized}
                      onChange={(e) => setPrioritized(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Prioritized Replay</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Buffer Display */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Database size={18} className="text-blue-400" />
                  Replay Buffer
                </h3>
                <span className="text-sm text-slate-400">
                  {buffer.length} / {BUFFER_CAPACITY}
                </span>
              </div>

              {/* Buffer slots */}
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: BUFFER_CAPACITY }, (_, i) => {
                  const exp = buffer[i];
                  const isSampled = sampledBatch.some(b => b.bufferIdx === i);
                  const isNew = i === buffer.length - 1 && showAnimation === 'add';

                  return (
                    <div
                      key={i}
                      className={`p-2 rounded-lg text-xs transition-all duration-300 ${
                        exp
                          ? isSampled
                            ? 'bg-purple-600 scale-105 ring-2 ring-purple-400'
                            : isNew
                              ? 'bg-green-600 scale-110'
                              : 'bg-slate-700'
                          : 'bg-slate-800 border border-slate-700 border-dashed'
                      }`}
                    >
                      {exp ? (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">#{exp.id}</span>
                            <span className={getRewardColor(exp.reward)}>R:{exp.reward}</span>
                          </div>
                          <div className="text-slate-300">{exp.state}→{exp.nextState}</div>
                          {prioritized && (
                            <div className="text-yellow-400 text-xs">
                              p:{priorities[i]?.toFixed(2)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-slate-600">Empty</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(buffer.length / BUFFER_CAPACITY) * 100}%` }}
                />
              </div>
            </div>

            {/* Sampled Batch */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shuffle size={18} className="text-purple-400" />
                Sampled Batch (size={BATCH_SIZE})
              </h3>

              {sampledBatch.length === 0 ? (
                <p className="text-slate-500 text-sm">Click "Sample Batch" to draw random experiences</p>
              ) : (
                <div className="space-y-2">
                  {sampledBatch.map((exp, i) => (
                    <div key={i} className="p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg flex items-center gap-4">
                      <span className="text-purple-400 w-16">#{exp.id}</span>
                      <span className="font-mono">{exp.state}</span>
                      <span className="text-blue-400">{exp.action}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-mono">{exp.nextState}</span>
                      <span className={`ml-auto ${getRewardColor(exp.reward)}`}>R={exp.reward}</span>
                      {exp.done && <span className="text-yellow-400">(done)</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Explanation */}
          <div className="space-y-6">
            {/* How it works */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                How Experience Replay Works
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="font-medium text-blue-400 mb-2">1. Store Experiences</div>
                  <p className="text-sm text-slate-300">
                    Each (s, a, r, s', done) tuple is stored in a fixed-size buffer.
                    When full, oldest experiences are overwritten (FIFO).
                  </p>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="font-medium text-purple-400 mb-2">2. Sample Mini-Batches</div>
                  <p className="text-sm text-slate-300">
                    Randomly sample batches for training, breaking correlations
                    between consecutive experiences.
                  </p>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="font-medium text-green-400 mb-2">3. Learn from Replay</div>
                  <p className="text-sm text-slate-300">
                    Use sampled batch to compute loss and update network.
                    Same experience can be used multiple times.
                  </p>
                </div>
              </div>
            </div>

            {/* Uniform vs Prioritized */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Uniform vs Prioritized Replay</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${!prioritized ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-blue-400 mb-2">Uniform Sampling</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Equal probability for all</li>
                    <li>• Simple to implement</li>
                    <li>• Unbiased gradients</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-lg border ${prioritized ? 'border-yellow-500 bg-yellow-900/20' : 'border-slate-700'}`}>
                  <h4 className="font-medium text-yellow-400 mb-2">Prioritized (PER)</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Sample by |TD error|</li>
                    <li>• Learn more from surprises</li>
                    <li>• Needs importance sampling</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-blue-900/30 to-green-900/30 rounded-xl p-6 border border-blue-500/30">
              <h3 className="font-semibold mb-3 text-blue-300">💡 Why Experience Replay?</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• <strong>Break correlations:</strong> Consecutive samples are highly correlated, which hurts learning</li>
                <li>• <strong>Data efficiency:</strong> Each experience can be used for multiple updates</li>
                <li>• <strong>Stable learning:</strong> Smoother gradients from diverse mini-batches</li>
                <li>• <strong>Off-policy:</strong> Learn from old experiences collected under different policies</li>
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">Buffer Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-700/50 rounded">
                  <span className="text-slate-400">Total Collected:</span>
                  <span className="font-mono ml-2">{stepCount}</span>
                </div>
                <div className="p-3 bg-slate-700/50 rounded">
                  <span className="text-slate-400">Buffer Usage:</span>
                  <span className="font-mono ml-2">{((buffer.length / BUFFER_CAPACITY) * 100).toFixed(0)}%</span>
                </div>
                <div className="p-3 bg-slate-700/50 rounded">
                  <span className="text-slate-400">Avg Reward:</span>
                  <span className="font-mono ml-2">
                    {buffer.length > 0
                      ? (buffer.reduce((a, b) => a + parseFloat(b.reward), 0) / buffer.length).toFixed(2)
                      : '-'}
                  </span>
                </div>
                <div className="p-3 bg-slate-700/50 rounded">
                  <span className="text-slate-400">Done Episodes:</span>
                  <span className="font-mono ml-2">{buffer.filter(b => b.done).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceReplay;
