import React, { useState } from 'react';
import {
  Brain, Zap, Mountain, TrendingDown, Layers, GitBranch,
  ArrowLeft
} from 'lucide-react';
import { AppShell } from '../shared/components';

// Import Tier 1 modules
import NeuronAnatomyExplorer from './tier1/neuron-anatomy';
import ActivationFunctionPlayground from './tier1/activation-playground';
import LossLandscapeNavigator from './tier1/loss-landscape';
import BackpropFlowViz from './backprop-flow';

// Import Tier 2 modules
import LearningRateLab from './tier2/learning-rate-lab';
import BatchVsSGD from './tier2/batch-vs-sgd';
import OptimizerZoo from './tier2/optimizer-zoo';

// Module definitions
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

// Course content component (embeddable, no AppShell)
export function CourseContent({ onBack }) {
  const [activeModule, setActiveModule] = useState(null);

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

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-6xl mx-auto">
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
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              Neural Networks
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Interactive visualizations for building intuition about neural networks
          </p>
        </div>

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

const App = () => {
  return (
    <AppShell>
      <CourseContent />
    </AppShell>
  );
};

export default App;
