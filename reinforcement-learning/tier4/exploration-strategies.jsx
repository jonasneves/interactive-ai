import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, Shuffle, TrendingUp, Zap } from 'lucide-react';

const ExplorationStrategies = () => {
  const NUM_ARMS = 5;
  const TRUE_MEANS = [1.0, 2.5, 1.5, 3.0, 0.5]; // True reward means

  // State for each strategy
  const [strategies, setStrategies] = useState(() => initStrategies());
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [selectedStrategy, setSelectedStrategy] = useState('epsilon');

  function initStrategies() {
    return {
      greedy: initStrategy(),
      epsilon: initStrategy(),
      ucb: initStrategy(),
      boltzmann: initStrategy(),
    };
  }

  function initStrategy() {
    return {
      Q: new Array(NUM_ARMS).fill(0),
      N: new Array(NUM_ARMS).fill(0),
      totalReward: 0,
      rewards: [],
      actions: []
    };
  }

  // Sample reward from arm (Gaussian with unit variance)
  const sampleReward = (arm) => {
    const mean = TRUE_MEANS[arm];
    // Box-Muller transform for Gaussian
    const u1 = Math.random();
    const u2 = Math.random();
    return mean + Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  // Epsilon-greedy action selection
  const selectEpsilonGreedy = useCallback((Q, epsilon = 0.1) => {
    if (Math.random() < epsilon) {
      return Math.floor(Math.random() * NUM_ARMS);
    }
    let maxQ = Math.max(...Q);
    let maxArms = Q.map((q, i) => q === maxQ ? i : -1).filter(i => i >= 0);
    return maxArms[Math.floor(Math.random() * maxArms.length)];
  }, []);

  // Pure greedy
  const selectGreedy = useCallback((Q) => {
    let maxQ = Math.max(...Q);
    let maxArms = Q.map((q, i) => q === maxQ ? i : -1).filter(i => i >= 0);
    return maxArms[Math.floor(Math.random() * maxArms.length)];
  }, []);

  // UCB action selection
  const selectUCB = useCallback((Q, N, t, c = 2) => {
    // If any arm hasn't been tried, try it
    for (let i = 0; i < NUM_ARMS; i++) {
      if (N[i] === 0) return i;
    }

    const ucbValues = Q.map((q, i) => q + c * Math.sqrt(Math.log(t + 1) / N[i]));
    return ucbValues.indexOf(Math.max(...ucbValues));
  }, []);

  // Boltzmann (softmax) action selection
  const selectBoltzmann = useCallback((Q, temperature = 1.0) => {
    const exp = Q.map(q => Math.exp(q / temperature));
    const sum = exp.reduce((a, b) => a + b, 0);
    const probs = exp.map(e => e / sum);

    const r = Math.random();
    let cumsum = 0;
    for (let i = 0; i < NUM_ARMS; i++) {
      cumsum += probs[i];
      if (r < cumsum) return i;
    }
    return NUM_ARMS - 1;
  }, []);

  // Take one step for all strategies
  const takeStep = useCallback(() => {
    setStrategies(prev => {
      const newStrategies = { ...prev };

      // Greedy
      const greedyArm = selectGreedy(prev.greedy.Q);
      const greedyReward = sampleReward(greedyArm);
      newStrategies.greedy = updateStrategy(prev.greedy, greedyArm, greedyReward);

      // Epsilon-greedy
      const epsilonArm = selectEpsilonGreedy(prev.epsilon.Q, 0.1);
      const epsilonReward = sampleReward(epsilonArm);
      newStrategies.epsilon = updateStrategy(prev.epsilon, epsilonArm, epsilonReward);

      // UCB
      const ucbArm = selectUCB(prev.ucb.Q, prev.ucb.N, step);
      const ucbReward = sampleReward(ucbArm);
      newStrategies.ucb = updateStrategy(prev.ucb, ucbArm, ucbReward);

      // Boltzmann
      const boltzmannArm = selectBoltzmann(prev.boltzmann.Q, 0.5);
      const boltzmannReward = sampleReward(boltzmannArm);
      newStrategies.boltzmann = updateStrategy(prev.boltzmann, boltzmannArm, boltzmannReward);

      return newStrategies;
    });

    setStep(prev => prev + 1);
  }, [step, selectGreedy, selectEpsilonGreedy, selectUCB, selectBoltzmann]);

  const updateStrategy = (strategy, arm, reward) => {
    const newN = [...strategy.N];
    const newQ = [...strategy.Q];
    newN[arm] += 1;
    newQ[arm] = newQ[arm] + (reward - newQ[arm]) / newN[arm]; // Incremental mean

    return {
      Q: newQ,
      N: newN,
      totalReward: strategy.totalReward + reward,
      rewards: [...strategy.rewards.slice(-100), reward],
      actions: [...strategy.actions.slice(-100), arm]
    };
  };

  // Auto-run
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(takeStep, speed);
      return () => clearTimeout(timer);
    }
  }, [isRunning, takeStep, speed]);

  const reset = () => {
    setStrategies(initStrategies());
    setStep(0);
    setIsRunning(false);
  };

  // Get UCB values for display
  const ucbValues = useMemo(() => {
    if (step === 0) return new Array(NUM_ARMS).fill(Infinity);
    return strategies.ucb.Q.map((q, i) => {
      if (strategies.ucb.N[i] === 0) return Infinity;
      return q + 2 * Math.sqrt(Math.log(step + 1) / strategies.ucb.N[i]);
    });
  }, [strategies.ucb, step]);

  // Get Boltzmann probabilities
  const boltzmannProbs = useMemo(() => {
    const exp = strategies.boltzmann.Q.map(q => Math.exp(q / 0.5));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(e => e / sum);
  }, [strategies.boltzmann.Q]);

  const strategyInfo = {
    greedy: { name: 'Pure Greedy', color: '#ef4444', desc: 'Always pick best-known arm' },
    epsilon: { name: 'ε-Greedy (ε=0.1)', color: '#3b82f6', desc: 'Random 10%, greedy 90%' },
    ucb: { name: 'UCB (c=2)', color: '#22c55e', desc: 'Optimism in face of uncertainty' },
    boltzmann: { name: 'Boltzmann (τ=0.5)', color: '#a855f7', desc: 'Softmax over Q-values' }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Exploration Strategies Gallery</h1>
        <p className="text-slate-400 mb-6">Compare different exploration methods on a multi-armed bandit problem</p>

        {/* Controls */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isRunning ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pause' : 'Run All'}
            </button>
            <button
              onClick={takeStep}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 rounded-lg disabled:opacity-50"
            >
              Step
            </button>
            <button onClick={reset} className="px-4 py-2 bg-slate-700 rounded-lg">
              <RotateCcw size={16} />
            </button>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-slate-400">Speed:</span>
              <input type="range" min="50" max="500" value={550 - speed}
                onChange={(e) => setSpeed(550 - parseInt(e.target.value))} className="w-20" />
            </div>

            <div className="ml-auto">
              <span className="text-slate-400">Steps:</span>
              <span className="font-mono font-bold text-blue-400 ml-2">{step}</span>
            </div>
          </div>
        </div>

        {/* True arm values */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-3">True Arm Means (Hidden from agent)</h3>
          <div className="flex gap-2">
            {TRUE_MEANS.map((mean, i) => (
              <div key={i} className={`flex-1 p-3 rounded-lg text-center ${
                mean === Math.max(...TRUE_MEANS) ? 'bg-green-600' : 'bg-slate-700'
              }`}>
                <div className="text-sm text-slate-400">Arm {i}</div>
                <div className="font-mono font-bold">{mean.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy comparisons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(strategies).map(([key, strategy]) => {
            const info = strategyInfo[key];
            const avgReward = strategy.totalReward / Math.max(1, step);
            const optimalPct = strategy.actions.filter(a => a === 3).length / Math.max(1, strategy.actions.length) * 100;

            return (
              <div
                key={key}
                className="bg-slate-800 rounded-xl p-6 border-2 cursor-pointer transition-all hover:scale-[1.02]"
                style={{ borderColor: selectedStrategy === key ? info.color : 'transparent' }}
                onClick={() => setSelectedStrategy(key)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: info.color }}>{info.name}</h3>
                  <div className="text-sm text-slate-400">{info.desc}</div>
                </div>

                {/* Q-values and action counts */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {strategy.Q.map((q, i) => (
                    <div key={i} className="text-center">
                      <div className={`h-16 rounded-lg flex flex-col items-center justify-center ${
                        q === Math.max(...strategy.Q) ? 'bg-yellow-600/50' : 'bg-slate-700'
                      }`}>
                        <div className="font-mono text-sm">{q.toFixed(2)}</div>
                        <div className="text-xs text-slate-400">n={strategy.N[i]}</div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Arm {i}</div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-400">Avg Reward:</span>
                    <span className="font-mono ml-2">{avgReward.toFixed(2)}</span>
                  </div>
                  <div className="p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-400">Optimal %:</span>
                    <span className={`font-mono ml-2 ${optimalPct > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {optimalPct.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Extra info based on strategy */}
                {key === 'ucb' && (
                  <div className="mt-4 p-2 bg-green-900/30 rounded text-xs">
                    <span className="text-green-400">UCB Values: </span>
                    {ucbValues.map((v, i) => (
                      <span key={i} className="font-mono mx-1">
                        {v === Infinity ? '∞' : v.toFixed(2)}
                      </span>
                    ))}
                  </div>
                )}
                {key === 'boltzmann' && (
                  <div className="mt-4 p-2 bg-purple-900/30 rounded text-xs">
                    <span className="text-purple-400">Probabilities: </span>
                    {boltzmannProbs.map((p, i) => (
                      <span key={i} className="font-mono mx-1">{(p * 100).toFixed(0)}%</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cumulative reward comparison */}
        <div className="bg-slate-800 rounded-xl p-6 mt-6">
          <h3 className="font-semibold mb-4">Cumulative Reward Comparison</h3>
          <div className="h-20 flex items-end gap-4">
            {Object.entries(strategies).map(([key, strategy]) => {
              const maxReward = Math.max(...Object.values(strategies).map(s => s.totalReward), 1);
              return (
                <div key={key} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${(strategy.totalReward / maxReward) * 100}%`,
                      minHeight: '4px',
                      backgroundColor: strategyInfo[key].color
                    }}
                  />
                  <span className="text-xs text-slate-400 mt-2">{strategyInfo[key].name.split(' ')[0]}</span>
                  <span className="font-mono text-sm">{strategy.totalReward.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key insights */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 mt-6 border border-blue-500/30">
          <h3 className="font-semibold mb-3 text-blue-300">💡 Key Insights</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <strong className="text-red-400">Greedy:</strong> Gets stuck on suboptimal arm if first samples are unlucky
            </div>
            <div>
              <strong className="text-blue-400">ε-Greedy:</strong> Simple but wastes exploration on known-bad arms
            </div>
            <div>
              <strong className="text-green-400">UCB:</strong> Explores uncertain arms, converges to optimal
            </div>
            <div>
              <strong className="text-purple-400">Boltzmann:</strong> Smooth exploration, temperature controls randomness
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorationStrategies;
