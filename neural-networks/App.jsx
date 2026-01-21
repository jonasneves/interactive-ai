import React, { useState } from 'react';
import {
  Brain, Zap, Mountain, TrendingDown, Layers, GitBranch,
  Play, ChevronRight, Lock, CheckCircle, ArrowLeft
} from 'lucide-react';

// Import Tier 1 modules
import NeuronAnatomyExplorer from './tier1/neuron-anatomy';
import ActivationFunctionPlayground from './tier1/activation-playground';
import LossLandscapeNavigator from './tier1/loss-landscape';
import BackpropFlowViz from './backprop-flow';

// Import Tier 2 modules
import LearningRateLab from './tier2/learning-rate-lab';
import BatchVsSGD from './tier2/batch-vs-sgd';
import OptimizerZoo from './tier2/optimizer-zoo';

const App = () => {
  const [activeModule, setActiveModule] = useState(null);

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

  // If a module is active, render it with a back button
  if (activeModule) {
    const module = tiers
      .flatMap((t) => t.modules)
      .find((m) => m.id === activeModule);

    if (module && module.component) {
      const ModuleComponent = module.component;
      return (
        <div className="relative">
          {/* Back button */}
          <button
            onClick={() => setActiveModule(null)}
            className="fixed top-4 left-4 z-50 px-4 py-2 bg-slate-800/90 backdrop-blur rounded-lg
                       text-white flex items-center gap-2 hover:bg-slate-700 transition-colors
                       border border-slate-700"
          >
            <ArrowLeft size={18} />
            Back to Hub
          </button>
          <ModuleComponent />
        </div>
      );
    }
  }

  // Render the hub
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              Neural Network Visualizations
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Interactive educational artifacts for building deep intuition about neural networks
          </p>
        </div>

        {/* Tiers */}
        {tiers.map((tier, tierIndex) => (
          <div key={tierIndex} className="mb-12">
            {/* Tier Header */}
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

            {/* Module Cards */}
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
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {module.status === 'complete' ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <Lock size={20} className="text-slate-600" />
                      )}
                    </div>

                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: tier.color + '20' }}
                    >
                      <Icon size={24} style={{ color: tier.color }} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">{module.description}</p>

                    {/* Action */}
                    {isAvailable ? (
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: tier.color }}>
                        <Play size={16} />
                        Launch Visualization
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Lock size={14} />
                        Coming Soon
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            Open source educational project •{' '}
            <span className="text-slate-400">7 interactive visualizations complete</span>
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Run <code className="bg-slate-800 px-2 py-1 rounded">make help</code> for available commands
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
