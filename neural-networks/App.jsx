import {
  Brain, Zap, Mountain, TrendingDown, Layers, GitBranch
} from 'lucide-react';
import { AppShell, CourseHub } from '../shared/components';

// Import Tier 1 modules
import NeuronAnatomyExplorer from './tier1/neuron-anatomy';
import ActivationFunctionPlayground from './tier1/activation-playground';
import LossLandscapeNavigator from './tier1/loss-landscape';
import BackpropFlowViz from './backprop-flow';

// Import Tier 2 modules
import LearningRateLab from './tier2/learning-rate-lab';
import BatchVsSGD from './tier2/batch-vs-sgd';
import OptimizerZoo from './tier2/optimizer-zoo';

const tiers = [
  {
    name: 'Tier 1: Foundation Concepts',
    description: 'Build intuition for the basic building blocks',
    color: '#3b82f6',
    modules: [
      {
        id: 'neuron',
        name: 'Neuron Anatomy Explorer',
        description: 'Understand how a single artificial neuron computes its output',
        icon: Brain,
        status: 'complete',
        component: NeuronAnatomyExplorer,
      },
      {
        id: 'activation',
        name: 'Activation Function Playground',
        description: 'Compare activation functions and their derivatives',
        icon: Zap,
        status: 'complete',
        component: ActivationFunctionPlayground,
      },
      {
        id: 'landscape',
        name: 'Loss Landscape Navigator',
        description: 'Visualize gradient descent as navigating a loss surface',
        icon: Mountain,
        status: 'complete',
        component: LossLandscapeNavigator,
      },
    ],
  },
  {
    name: 'Tier 2: Training Dynamics',
    description: 'Understand how neural networks learn',
    color: '#8b5cf6',
    modules: [
      {
        id: 'lr',
        name: 'Learning Rate Lab',
        description: 'See why learning rate choice matters',
        icon: TrendingDown,
        status: 'complete',
        component: LearningRateLab,
      },
      {
        id: 'sgd',
        name: 'Batch vs SGD Visualizer',
        description: 'Compare gradient descent variants',
        icon: Layers,
        status: 'complete',
        component: BatchVsSGD,
      },
      {
        id: 'optimizer',
        name: 'Optimizer Zoo',
        description: 'Understand momentum, RMSprop, Adam',
        icon: GitBranch,
        status: 'complete',
        component: OptimizerZoo,
      },
    ],
  },
  {
    name: 'Reference',
    description: 'Original visualization',
    color: '#22c55e',
    modules: [
      {
        id: 'backprop',
        name: 'Backpropagation Flow',
        description: 'Step-by-step gradient flow through the network',
        icon: GitBranch,
        status: 'complete',
        component: BackpropFlowViz,
      },
    ],
  },
];

export function CourseContent({ onBack }) {
  return (
    <CourseHub
      title="Neural Network Visualizations"
      subtitle="Interactive educational artifacts for building deep intuition about neural networks"
      gradientColors={['#60a5fa', '#c084fc', '#4ade80']}
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
