import React, { useState, useMemo } from 'react';
import { Info, RotateCcw, Shuffle, Play, Pause } from 'lucide-react';

const MDPPlayground = () => {
  // Preset MDPs
  const presets = {
    simple: {
      name: 'Simple Grid',
      states: ['S0', 'S1', 'S2', 'Goal'],
      actions: ['right', 'down'],
      transitions: {
        'S0-right': [{ state: 'S1', prob: 1.0, reward: -1 }],
        'S0-down': [{ state: 'S2', prob: 1.0, reward: -1 }],
        'S1-right': [{ state: 'Goal', prob: 1.0, reward: 10 }],
        'S1-down': [{ state: 'S2', prob: 1.0, reward: -1 }],
        'S2-right': [{ state: 'Goal', prob: 1.0, reward: 10 }],
        'S2-down': [{ state: 'S2', prob: 1.0, reward: -1 }],
      },
      positions: { S0: { x: 100, y: 100 }, S1: { x: 300, y: 100 }, S2: { x: 100, y: 250 }, Goal: { x: 300, y: 250 } },
    },
    stochastic: {
      name: 'Slippery Grid',
      states: ['S0', 'S1', 'S2', 'Goal'],
      actions: ['right', 'down'],
      transitions: {
        'S0-right': [{ state: 'S1', prob: 0.8, reward: -1 }, { state: 'S2', prob: 0.2, reward: -1 }],
        'S0-down': [{ state: 'S2', prob: 0.8, reward: -1 }, { state: 'S1', prob: 0.2, reward: -1 }],
        'S1-right': [{ state: 'Goal', prob: 0.8, reward: 10 }, { state: 'S2', prob: 0.2, reward: -5 }],
        'S1-down': [{ state: 'S2', prob: 0.8, reward: -1 }, { state: 'Goal', prob: 0.2, reward: 10 }],
        'S2-right': [{ state: 'Goal', prob: 0.8, reward: 10 }, { state: 'S0', prob: 0.2, reward: -1 }],
        'S2-down': [{ state: 'S2', prob: 1.0, reward: -1 }],
      },
      positions: { S0: { x: 100, y: 100 }, S1: { x: 300, y: 100 }, S2: { x: 100, y: 250 }, Goal: { x: 300, y: 250 } },
    },
    cliff: {
      name: 'Cliff Walking',
      states: ['Start', 'S1', 'S2', 'Cliff', 'Safe', 'Goal'],
      actions: ['right', 'up'],
      transitions: {
        'Start-right': [{ state: 'Cliff', prob: 1.0, reward: -100 }],
        'Start-up': [{ state: 'Safe', prob: 1.0, reward: -1 }],
        'Safe-right': [{ state: 'Goal', prob: 1.0, reward: 10 }],
        'Safe-up': [{ state: 'Safe', prob: 1.0, reward: -1 }],
        'Cliff-right': [{ state: 'Goal', prob: 1.0, reward: 10 }],
        'Cliff-up': [{ state: 'Start', prob: 1.0, reward: -1 }],
      },
      positions: { Start: { x: 80, y: 250 }, Cliff: { x: 200, y: 250 }, Safe: { x: 80, y: 100 }, Goal: { x: 320, y: 175 } },
    },
  };

  const [currentPreset, setCurrentPreset] = useState('simple');
  const [mdp, setMdp] = useState(presets.simple);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [currentState, setCurrentState] = useState('S0');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [showMarkovDemo, setShowMarkovDemo] = useState(false);

  // Get available actions for a state
  const getActionsForState = (state) => {
    return mdp.actions.filter(action => mdp.transitions[`${state}-${action}`]);
  };

  // Sample from transition
  const sampleTransition = (state, action) => {
    const transitions = mdp.transitions[`${state}-${action}`];
    if (!transitions) return null;

    const rand = Math.random();
    let cumProb = 0;
    for (const t of transitions) {
      cumProb += t.prob;
      if (rand < cumProb) return t;
    }
    return transitions[transitions.length - 1];
  };

  // Take a step in simulation
  const takeStep = (action) => {
    const result = sampleTransition(currentState, action);
    if (result) {
      setSimulationHistory(prev => [...prev, {
        from: currentState,
        action,
        to: result.state,
        reward: result.reward,
      }]);
      setCurrentState(result.state);
    }
  };

  // Reset simulation
  const resetSimulation = () => {
    setCurrentState(mdp.states[0]);
    setSimulationHistory([]);
  };

  // Load preset
  const loadPreset = (name) => {
    setCurrentPreset(name);
    setMdp(presets[name]);
    setSelectedState(null);
    setSelectedAction(null);
    setCurrentState(presets[name].states[0]);
    setSimulationHistory([]);
  };

  // Colors for states
  const stateColors = {
    default: '#475569',
    selected: '#3b82f6',
    current: '#22c55e',
    goal: '#f59e0b',
    danger: '#ef4444',
  };

  const getStateColor = (state) => {
    if (state === currentState) return stateColors.current;
    if (state === selectedState) return stateColors.selected;
    if (state.toLowerCase().includes('goal')) return stateColors.goal;
    if (state.toLowerCase().includes('cliff') || state.toLowerCase().includes('trap')) return stateColors.danger;
    return stateColors.default;
  };

  // Render state node
  const renderState = (state) => {
    const pos = mdp.positions[state];
    const isGoal = state.toLowerCase().includes('goal');
    const isDanger = state.toLowerCase().includes('cliff');

    return (
      <g key={state}>
        {/* State circle */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r={35}
          fill={getStateColor(state)}
          stroke={selectedState === state ? '#fff' : '#64748b'}
          strokeWidth={selectedState === state ? 3 : 2}
          className="cursor-pointer transition-all duration-200 state-glow"
          onClick={() => {
            setSelectedState(state);
            setSelectedAction(null);
          }}
        />

        {/* State label */}
        <text
          x={pos.x}
          y={pos.y + 5}
          textAnchor="middle"
          fill="white"
          className="text-sm font-bold pointer-events-none"
        >
          {state}
        </text>

        {/* Goal/danger icons */}
        {isGoal && (
          <text x={pos.x} y={pos.y - 45} textAnchor="middle" className="text-xl">🎯</text>
        )}
        {isDanger && (
          <text x={pos.x} y={pos.y - 45} textAnchor="middle" className="text-xl">⚠️</text>
        )}

        {/* Current state indicator */}
        {state === currentState && (
          <circle
            cx={pos.x}
            cy={pos.y}
            r={42}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="5,5"
            className="animate-spin"
            style={{ animationDuration: '3s' }}
          />
        )}
      </g>
    );
  };

  // Render transition arrow
  const renderTransition = (fromState, action, transitions) => {
    const from = mdp.positions[fromState];
    const isSelected = selectedState === fromState && selectedAction === action;

    return transitions.map((t, i) => {
      const to = mdp.positions[t.state];
      if (!to) return null;

      // Calculate arrow path with curve for multiple transitions
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Offset for self-loops and parallel edges
      const offset = i * 15 - (transitions.length - 1) * 7.5;

      // Arrow start/end adjusted for node radius
      const startX = from.x + (dx / dist) * 40;
      const startY = from.y + (dy / dist) * 40;
      const endX = to.x - (dx / dist) * 40;
      const endY = to.y - (dy / dist) * 40;

      // Control point for curve
      const midX = (startX + endX) / 2 - dy / dist * offset;
      const midY = (startY + endY) / 2 + dx / dist * offset;

      const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

      const color = t.reward >= 0 ? '#22c55e' : '#ef4444';
      const opacity = isSelected ? 1 : (t.prob < 1 ? 0.5 + t.prob * 0.5 : 0.7);

      return (
        <g key={`${fromState}-${action}-${t.state}-${i}`}>
          {/* Arrow path */}
          <path
            d={pathD}
            fill="none"
            stroke={isSelected ? '#fff' : color}
            strokeWidth={isSelected ? 3 : 2 * t.prob + 1}
            opacity={opacity}
            markerEnd={`url(#arrow-${t.reward >= 0 ? 'green' : 'red'})`}
            className="transition-all duration-200"
          />

          {/* Probability label */}
          {t.prob < 1 && (
            <text
              x={midX}
              y={midY - 8}
              textAnchor="middle"
              fill="#94a3b8"
              className="text-xs"
            >
              p={t.prob}
            </text>
          )}

          {/* Reward label */}
          <text
            x={midX}
            y={midY + 12}
            textAnchor="middle"
            fill={color}
            className="text-xs font-bold"
          >
            R={t.reward}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">MDP Playground</h1>
        <p className="text-slate-400 mb-6">Explore states, actions, transitions, and the Markov property</p>

        {/* Preset Selector */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 flex items-center gap-4 flex-wrap">
          <span className="text-slate-400">Environment:</span>
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className={`px-4 py-2 rounded-lg transition-colors
                         ${currentPreset === key ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: State Diagram */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">State-Transition Diagram</h2>

            <svg viewBox="0 0 400 350" className="w-full bg-slate-900/50 rounded-lg">
              <defs>
                <marker id="arrow-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
                </marker>
                <marker id="arrow-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                </marker>
              </defs>

              {/* Render transitions */}
              {Object.entries(mdp.transitions).map(([key, transitions]) => {
                const [state, action] = key.split('-');
                return renderTransition(state, action, transitions);
              })}

              {/* Render states */}
              {mdp.states.map(renderState)}
            </svg>

            {/* Simulation Controls */}
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Interactive Simulation</h3>
                <button
                  onClick={resetSimulation}
                  className="px-3 py-1 bg-slate-600 rounded hover:bg-slate-500 flex items-center gap-2"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-slate-400">Current State:</span>
                <span className="px-3 py-1 bg-green-600 rounded font-mono">{currentState}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400">Actions:</span>
                {getActionsForState(currentState).map(action => (
                  <button
                    key={action}
                    onClick={() => takeStep(action)}
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors capitalize"
                  >
                    {action}
                  </button>
                ))}
                {getActionsForState(currentState).length === 0 && (
                  <span className="text-slate-500 italic">Terminal state reached</span>
                )}
              </div>

              {/* Trajectory */}
              {simulationHistory.length > 0 && (
                <div className="mt-3 p-3 bg-slate-800 rounded-lg max-h-32 overflow-y-auto">
                  <h4 className="text-xs text-slate-400 mb-2">Trajectory:</h4>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {simulationHistory.map((h, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="bg-slate-700 px-2 py-0.5 rounded">{h.from}</span>
                        <span className="text-slate-500">--{h.action}--&gt;</span>
                        <span className={`px-1 ${h.reward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          (R={h.reward})
                        </span>
                        {i < simulationHistory.length - 1 && <span className="text-slate-500">→</span>}
                      </span>
                    ))}
                    <span className="bg-green-700 px-2 py-0.5 rounded">{currentState}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-6">
            {/* Selected State Info */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info size={18} className="text-blue-400" />
                {selectedState ? `State: ${selectedState}` : 'Click a state'}
              </h3>

              {selectedState ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm text-slate-400 mb-2">Available Actions:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {getActionsForState(selectedState).map(action => (
                        <button
                          key={action}
                          onClick={() => setSelectedAction(action)}
                          className={`px-3 py-1 rounded transition-colors capitalize
                                     ${selectedAction === action ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedAction && mdp.transitions[`${selectedState}-${selectedAction}`] && (
                    <div>
                      <h4 className="text-sm text-slate-400 mb-2">Transitions P(s'|s,a):</h4>
                      <div className="space-y-2">
                        {mdp.transitions[`${selectedState}-${selectedAction}`].map((t, i) => (
                          <div key={i} className="p-2 bg-slate-700/50 rounded flex justify-between">
                            <span>→ {t.state}</span>
                            <span className="text-slate-400">p={t.prob}</span>
                            <span className={t.reward >= 0 ? 'text-green-400' : 'text-red-400'}>
                              R={t.reward}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Select a state to see its actions and transitions</p>
              )}
            </div>

            {/* MDP Components */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">MDP Components</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <strong className="text-blue-400">State Space S</strong>
                  <p className="text-slate-300 mt-1">
                    {'{' + mdp.states.join(', ') + '}'}
                  </p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <strong className="text-purple-400">Action Space A</strong>
                  <p className="text-slate-300 mt-1">
                    {'{' + mdp.actions.join(', ') + '}'}
                  </p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <strong className="text-green-400">Transition Function</strong>
                  <p className="text-slate-300 mt-1">P(s'|s,a) - shown on arrows</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg">
                  <strong className="text-amber-400">Reward Function</strong>
                  <p className="text-slate-300 mt-1">R(s,a,s') - labeled on transitions</p>
                </div>
              </div>
            </div>

            {/* Markov Property */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3 text-purple-400">The Markov Property</h3>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-300 mb-3">
                  "The future is independent of the past given the present"
                </p>
                <div className="formula text-center text-sm">
                  P(S_{'{t+1}'} | S_t) = P(S_{'{t+1}'} | S_0, S_1, ..., S_t)
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  To predict the next state, we only need the current state—not how we got there.
                </p>
              </div>

              {simulationHistory.length >= 2 && (
                <div className="mt-3 p-3 bg-purple-900/30 rounded-lg border border-purple-700">
                  <p className="text-xs text-purple-300">
                    💡 Notice: Your transition probabilities from <strong>{currentState}</strong> are the same
                    regardless of how you got there!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MDPPlayground;
