import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, User, Bot, Info, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const RLLoopExplorer = () => {
  // Grid configuration
  const GRID_SIZE = 5;
  const GOAL = { x: 4, y: 0 };
  const TRAP = { x: 2, y: 2 };
  const WALL = { x: 1, y: 1 };

  // State
  const [agentPos, setAgentPos] = useState({ x: 0, y: 4 });
  const [mode, setMode] = useState('human'); // 'human' or 'random'
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [trajectory, setTrajectory] = useState([{ x: 0, y: 4 }]);
  const [totalReward, setTotalReward] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [lastAction, setLastAction] = useState(null);
  const [lastReward, setLastReward] = useState(null);
  const [rewardFlash, setRewardFlash] = useState(null);
  const [episodeHistory, setEpisodeHistory] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Cell rewards
  const [cellRewards, setCellRewards] = useState(() => {
    const rewards = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (x === GOAL.x && y === GOAL.y) rewards[`${x},${y}`] = 10;
        else if (x === TRAP.x && y === TRAP.y) rewards[`${x},${y}`] = -5;
        else rewards[`${x},${y}`] = -0.1; // Small step penalty
      }
    }
    return rewards;
  });

  const actions = ['up', 'down', 'left', 'right'];
  const actionSymbols = { up: '↑', down: '↓', left: '←', right: '→' };

  // Check if position is valid
  const isValidPos = (x, y) => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    if (x === WALL.x && y === WALL.y) return false;
    return true;
  };

  // Get next position for an action
  const getNextPos = (pos, action) => {
    const moves = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const newX = pos.x + moves[action].x;
    const newY = pos.y + moves[action].y;
    return isValidPos(newX, newY) ? { x: newX, y: newY } : pos;
  };

  // Take a step
  const takeStep = useCallback((action) => {
    const newPos = getNextPos(agentPos, action);
    const reward = cellRewards[`${newPos.x},${newPos.y}`];

    setAgentPos(newPos);
    setTrajectory(prev => [...prev, newPos]);
    setTotalReward(prev => prev + reward);
    setStepCount(prev => prev + 1);
    setLastAction(action);
    setLastReward(reward);
    setRewardFlash({ pos: newPos, reward });

    setTimeout(() => setRewardFlash(null), 500);

    // Check if episode ended
    if (newPos.x === GOAL.x && newPos.y === GOAL.y) {
      setIsRunning(false);
      setEpisodeHistory(prev => [...prev, { steps: stepCount + 1, reward: totalReward + reward }]);
    }
  }, [agentPos, cellRewards, stepCount, totalReward]);

  // Random agent step
  useEffect(() => {
    if (mode === 'random' && isRunning) {
      const timer = setTimeout(() => {
        const action = actions[Math.floor(Math.random() * actions.length)];
        takeStep(action);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [mode, isRunning, agentPos, speed, takeStep]);

  // Keyboard controls for human mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode !== 'human') return;
      const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        takeStep(keyMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, takeStep]);

  // Reset episode
  const reset = () => {
    setAgentPos({ x: 0, y: 4 });
    setTrajectory([{ x: 0, y: 4 }]);
    setTotalReward(0);
    setStepCount(0);
    setLastAction(null);
    setLastReward(null);
    setIsRunning(false);
  };

  // Get cell color based on reward
  const getCellColor = (x, y) => {
    if (x === WALL.x && y === WALL.y) return '#1e293b';
    const reward = cellRewards[`${x},${y}`];
    if (reward >= 10) return '#22c55e';
    if (reward >= 1) return '#4ade80';
    if (reward <= -5) return '#ef4444';
    if (reward < 0) return '#475569';
    return '#334155';
  };

  // Render grid cell
  const renderCell = (x, y) => {
    const isAgent = agentPos.x === x && agentPos.y === y;
    const isGoal = x === GOAL.x && y === GOAL.y;
    const isTrap = x === TRAP.x && y === TRAP.y;
    const isWall = x === WALL.x && y === WALL.y;
    const isInTrajectory = trajectory.some(p => p.x === x && p.y === y);
    const reward = cellRewards[`${x},${y}`];
    const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

    return (
      <div
        key={`${x},${y}`}
        className={`relative w-16 h-16 rounded-lg flex items-center justify-center
                    transition-all duration-200 cursor-pointer border-2
                    ${isHovered ? 'border-blue-400 scale-105' : 'border-transparent'}`}
        style={{ backgroundColor: getCellColor(x, y) }}
        onMouseEnter={() => setHoveredCell({ x, y })}
        onMouseLeave={() => setHoveredCell(null)}
        onClick={() => mode === 'human' && !isWall && handleCellClick(x, y)}
      >
        {/* Trajectory trail */}
        {isInTrajectory && !isAgent && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-400/40" />
          </div>
        )}

        {/* Cell labels */}
        {isGoal && <span className="text-2xl">🎯</span>}
        {isTrap && <span className="text-2xl">💀</span>}
        {isWall && <span className="text-2xl">🧱</span>}

        {/* Agent */}
        {isAgent && (
          <div className={`absolute text-3xl ${isRunning ? 'agent-pulse' : ''}`}>
            {mode === 'human' ? '🤖' : '🎲'}
          </div>
        )}

        {/* Reward flash */}
        {rewardFlash && rewardFlash.pos.x === x && rewardFlash.pos.y === y && (
          <div className={`absolute -top-2 font-bold text-lg reward-flash
                          ${rewardFlash.reward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {rewardFlash.reward >= 0 ? '+' : ''}{rewardFlash.reward.toFixed(1)}
          </div>
        )}

        {/* Reward value on hover */}
        {isHovered && !isWall && (
          <div className="absolute -bottom-6 text-xs text-slate-400">
            R: {reward >= 0 ? '+' : ''}{reward}
          </div>
        )}
      </div>
    );
  };

  // Handle cell click for movement
  const handleCellClick = (x, y) => {
    const dx = x - agentPos.x;
    const dy = y - agentPos.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      if (dx === 1) takeStep('right');
      else if (dx === -1) takeStep('left');
      else if (dy === 1) takeStep('down');
      else if (dy === -1) takeStep('up');
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">The RL Loop Explorer</h1>
        <p className="text-slate-400 mb-6">Experience the fundamental Agent-Environment interaction cycle</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Grid World */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('human')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                             ${mode === 'human' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  <User size={16} /> Human
                </button>
                <button
                  onClick={() => setMode('random')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                             ${mode === 'random' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  <Bot size={16} /> Random Agent
                </button>
              </div>

              <div className="flex items-center gap-2">
                {mode === 'random' && (
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                               ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {isRunning ? <Pause size={16} /> : <Play size={16} />}
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                )}
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </div>

            {/* Speed control for random agent */}
            {mode === 'random' && (
              <div className="mb-4 flex items-center gap-4">
                <span className="text-sm text-slate-400">Speed:</span>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="100"
                  value={1100 - speed}
                  onChange={(e) => setSpeed(1100 - parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-slate-400">{speed}ms/step</span>
              </div>
            )}

            {/* Grid */}
            <div className="flex justify-center mb-6">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {Array.from({ length: GRID_SIZE }, (_, y) =>
                  Array.from({ length: GRID_SIZE }, (_, x) => renderCell(x, y))
                )}
              </div>
            </div>

            {/* Keyboard hints for human mode */}
            {mode === 'human' && (
              <div className="flex justify-center gap-4 text-slate-400 text-sm">
                <span>Use arrow keys or WASD to move</span>
                <span>•</span>
                <span>Click adjacent cells to move</span>
              </div>
            )}

            {/* RL Loop Diagram */}
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
              <h3 className="font-semibold mb-3 text-center">The RL Loop</h3>
              <svg viewBox="0 0 400 120" className="w-full max-w-md mx-auto">
                {/* Agent box */}
                <rect x="20" y="40" width="80" height="40" rx="8" fill="#3b82f6" />
                <text x="60" y="65" textAnchor="middle" fill="white" className="text-sm font-medium">Agent</text>

                {/* Environment box */}
                <rect x="300" y="40" width="80" height="40" rx="8" fill="#22c55e" />
                <text x="340" y="65" textAnchor="middle" fill="white" className="text-sm font-medium">Environment</text>

                {/* Action arrow (top) */}
                <path d="M100 50 L300 50" stroke="#f59e0b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
                <text x="200" y="40" textAnchor="middle" fill="#f59e0b" className="text-xs">
                  Action: {lastAction ? actionSymbols[lastAction] : '?'}
                </text>

                {/* State/Reward arrow (bottom) */}
                <path d="M300 70 L100 70" stroke="#8b5cf6" strokeWidth="2" fill="none" markerEnd="url(#arrowhead2)" />
                <text x="200" y="95" textAnchor="middle" fill="#8b5cf6" className="text-xs">
                  State: ({agentPos.x},{agentPos.y}) | Reward: {lastReward !== null ? lastReward.toFixed(1) : '?'}
                </text>

                {/* Arrow markers */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
                  </marker>
                  <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>

          {/* Right: Stats & Info */}
          <div className="space-y-6">
            {/* Current Episode Stats */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info size={18} className="text-blue-400" />
                Current Episode
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-400">Steps</span>
                  <span className="font-mono font-bold">{stepCount}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-400">Total Return</span>
                  <span className={`font-mono font-bold ${totalReward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalReward >= 0 ? '+' : ''}{totalReward.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-400">Position</span>
                  <span className="font-mono">({agentPos.x}, {agentPos.y})</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-400">Last Action</span>
                  <span className="font-mono">{lastAction ? `${actionSymbols[lastAction]} ${lastAction}` : '-'}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-400">Last Reward</span>
                  <span className={`font-mono ${lastReward !== null && lastReward >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {lastReward !== null ? (lastReward >= 0 ? '+' : '') + lastReward.toFixed(1) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Episode History */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Episode History</h3>
              {episodeHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">Reach the goal to complete an episode</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {episodeHistory.map((ep, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-slate-700/50 rounded">
                      <span>Episode {i + 1}</span>
                      <span>{ep.steps} steps</span>
                      <span className={ep.reward >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {ep.reward >= 0 ? '+' : ''}{ep.reward.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  <span>Goal (+10 reward)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">💀</span>
                  <span>Trap (-5 reward)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🧱</span>
                  <span>Wall (impassable)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{mode === 'human' ? '🤖' : '🎲'}</span>
                  <span>Agent ({mode})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-400/40" />
                  <span>Trajectory trail</span>
                </div>
              </div>
            </div>

            {/* Key Concepts */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3 text-blue-400">Key Concepts</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><strong>State:</strong> Agent's position (x, y)</li>
                <li><strong>Action:</strong> Move ↑↓←→</li>
                <li><strong>Reward:</strong> Feedback from environment</li>
                <li><strong>Return:</strong> Cumulative reward (G)</li>
                <li><strong>Episode:</strong> Start → Goal sequence</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RLLoopExplorer;
