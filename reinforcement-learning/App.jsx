import {
  Gamepad2, Network, TrendingDown, Target, GitBranch,
  Calculator, Dice5, LineChart, Swords, Gauge,
  RefreshCw, Theater, BarChart3, Search, Database,
  Crosshair, Scissors, Trophy
} from 'lucide-react';
import { AppShell, CourseHub } from '../shared/components';

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

export function CourseContent({ onBack }) {
  return (
    <CourseHub
      title="Reinforcement Learning"
      subtitle="Interactive visualizations for building intuition about RL concepts"
      gradientColors={['#60a5fa', '#c084fc', '#fbbf24']}
      tiers={tiers}
      onBack={onBack}
    />
  );
}

export default function App() {
  return (
    <AppShell>
      <CourseContent />
    </AppShell>
  );
}
