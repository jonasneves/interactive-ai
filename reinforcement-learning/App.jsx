import React, { useState } from 'react';
import {
  Gamepad2, Network, TrendingDown, Target, GitBranch,
  Calculator, Dice5, LineChart, Swords, Gauge,
  RefreshCw, Theater, BarChart3, Search, Database,
  Crosshair, Scissors, Trophy, ArrowLeft
} from 'lucide-react';
import { AppShell } from '../shared/components';

// Import Tier 1 modules
import RLLoopExplorer from './tier1/rl-loop-explorer';
import MDPPlayground from './tier1/mdp-playground';
import DiscountFactorVisualizer from './tier1/discount-factor';
import PolicyValueVisualizer from './tier1/policy-value-viz';

// Import Tier 2 modules
import BellmanExplorer from './tier2/bellman-explorer';
import DynamicProgramming from './tier2/dynamic-programming';
import MonteCarlo from './tier2/monte-carlo';
import TDLearning from './tier2/td-learning';
import QLearningVsSARSA from './tier2/q-learning-sarsa';

// Import Tier 3 modules
import PolicyGradient from './tier3/policy-gradient';
import REINFORCE from './tier3/reinforce';
import ActorCritic from './tier3/actor-critic';
import AdvantageEstimation from './tier3/advantage-estimation';

// Import Tier 4 modules
import ExplorationStrategies from './tier4/exploration-strategies';
import ExperienceReplay from './tier4/experience-replay';
import TargetNetwork from './tier4/target-network';
import PPOVisualizer from './tier4/ppo-visualizer';
import RewardShaping from './tier4/reward-shaping';

// Module definitions
const tiers = [
    {
      name: 'Tier 1: Core RL Concepts',
      description: 'Build intuition for the fundamental RL framework',
      color: '#3b82f6',
      modules: [
        {
          id: 'rl-loop',
          name: 'RL Loop Explorer',
          description: 'Understand the Agent-Environment interaction cycle',
          icon: Gamepad2,
          status: 'complete',
          component: RLLoopExplorer,
        },
        {
          id: 'mdp',
          name: 'MDP Playground',
          description: 'Explore states, actions, transitions, and rewards',
          icon: Network,
          status: 'complete',
          component: MDPPlayground,
        },
        {
          id: 'discount',
          name: 'Discount Factor Visualizer',
          description: 'See how γ affects value of future rewards',
          icon: TrendingDown,
          status: 'complete',
          component: DiscountFactorVisualizer,
        },
        {
          id: 'policy-value',
          name: 'Policy vs Value Visualizer',
          description: 'Understand the relationship between π and V',
          icon: Target,
          status: 'complete',
          component: PolicyValueVisualizer,
        },
      ],
    },
    {
      name: 'Tier 2: Value-Based Methods',
      description: 'Learn classical RL algorithms',
      color: '#8b5cf6',
      modules: [
        {
          id: 'bellman',
          name: 'Bellman Equation Explorer',
          description: 'Visualize the recursive structure of value functions',
          icon: GitBranch,
          status: 'complete',
          component: BellmanExplorer,
        },
        {
          id: 'dp',
          name: 'Dynamic Programming Lab',
          description: 'See Policy Iteration and Value Iteration in action',
          icon: Calculator,
          status: 'complete',
          component: DynamicProgramming,
        },
        {
          id: 'monte-carlo',
          name: 'Monte Carlo Methods',
          description: 'Learn from complete episode returns',
          icon: Dice5,
          status: 'complete',
          component: MonteCarlo,
        },
        {
          id: 'td',
          name: 'TD Learning Playground',
          description: 'Understand bootstrapping and TD error',
          icon: LineChart,
          status: 'complete',
          component: TDLearning,
        },
        {
          id: 'q-sarsa',
          name: 'Q-Learning vs SARSA Arena',
          description: 'Compare on-policy vs off-policy learning',
          icon: Swords,
          status: 'complete',
          component: QLearningVsSARSA,
        },
      ],
    },
    {
      name: 'Tier 3: Policy-Based Methods',
      description: 'Modern deep RL foundations',
      color: '#22c55e',
      modules: [
        {
          id: 'policy-gradient',
          name: 'Policy Gradient Intuition',
          description: 'Directly optimize the policy',
          icon: Gauge,
          status: 'complete',
          component: PolicyGradient,
        },
        {
          id: 'reinforce',
          name: 'REINFORCE Step-by-Step',
          description: 'Monte Carlo policy gradient algorithm',
          icon: RefreshCw,
          status: 'complete',
          component: REINFORCE,
        },
        {
          id: 'actor-critic',
          name: 'Actor-Critic Architecture',
          description: 'Combine policy and value learning',
          icon: Theater,
          status: 'complete',
          component: ActorCritic,
        },
        {
          id: 'gae',
          name: 'Advantage Estimation',
          description: 'Understand GAE and variance reduction',
          icon: BarChart3,
          status: 'complete',
          component: AdvantageEstimation,
        },
      ],
    },
    {
      name: 'Tier 4: Advanced Topics',
      description: 'Deep RL techniques and challenges',
      color: '#f59e0b',
      modules: [
        {
          id: 'exploration',
          name: 'Exploration Strategies',
          description: 'Compare ε-greedy, UCB, Boltzmann',
          icon: Search,
          status: 'complete',
          component: ExplorationStrategies,
        },
        {
          id: 'replay',
          name: 'Experience Replay Buffer',
          description: 'Understand why and how replay works',
          icon: Database,
          status: 'complete',
          component: ExperienceReplay,
        },
        {
          id: 'target-network',
          name: 'Target Network Stabilization',
          description: 'Visualize DQN stability techniques',
          icon: Crosshair,
          status: 'complete',
          component: TargetNetwork,
        },
        {
          id: 'ppo',
          name: 'PPO Trust Region',
          description: 'Understand clipped surrogate objective',
          icon: Scissors,
          status: 'complete',
          component: PPOVisualizer,
        },
        {
          id: 'reward-shaping',
          name: 'Reward Shaping Sandbox',
          description: 'See how reward design affects learning',
          icon: Trophy,
          status: 'complete',
          component: RewardShaping,
        },
      ],
    },
  ];

// Course content component (embeddable, no AppShell)
export function CourseContent({ onBack }) {
  const [activeModule, setActiveModule] = useState(null);

  // If a module is active, render it with a back button
  if (activeModule) {
    const module = tiers
      .flatMap((t) => t.modules)
      .find((m) => m.id === activeModule);

    if (module && module.component) {
      const ModuleComponent = module.component;
      return (
        <div className="relative">
          <button
            onClick={() => setActiveModule(null)}
            className="fixed top-4 left-20 z-50 px-4 py-2 bg-slate-800/90 backdrop-blur rounded-lg
                       text-white flex items-center gap-2 hover:bg-slate-700 transition-colors
                       border border-slate-700"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <ModuleComponent />
        </div>
      );
    }
  }

  // Render the hub
  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-4 left-20 z-50 px-4 py-2 bg-slate-800/90 backdrop-blur rounded-lg
                         text-white flex items-center gap-2 hover:bg-slate-700 transition-colors
                         border border-slate-700"
            >
              <ArrowLeft size={18} />
              Home
            </button>
          )}
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              Reinforcement Learning
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Interactive visualizations for building intuition about RL concepts
          </p>
        </div>

        {/* Tiers */}
        {tiers.map((tier, tierIndex) => (
          <div key={tierIndex} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-2 h-12 rounded-full"
                style={{ backgroundColor: tier.color }}
              />
              <div>
                <h2 className="text-2xl font-bold" style={{ color: tier.color }}>
                  {tier.name}
                </h2>
                <p className="text-slate-400">{tier.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tier.modules.map((module) => {
                const Icon = module.icon;
                const isAvailable = module.status === 'complete';

                return (
                  <button
                    key={module.id}
                    onClick={() => isAvailable && setActiveModule(module.id)}
                    disabled={!isAvailable}
                    className={`group relative p-6 rounded-xl text-left transition-all duration-300
                      ${
                        isAvailable
                          ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 cursor-pointer card-hover'
                          : 'bg-slate-800/20 border border-slate-800 cursor-not-allowed opacity-60'
                      }`}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: tier.color + '20' }}
                    >
                      <Icon size={24} style={{ color: tier.color }} />
                    </div>

                    <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">{module.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Standalone app with AppShell wrapper
const App = () => {
  return (
    <AppShell>
      <CourseContent />
    </AppShell>
  );
};

export default App;
