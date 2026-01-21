import React, { useState } from 'react';
import {
  Image, Grid3X3, Brain, Layers, Palette, Map, Minimize2,
  Target, GraduationCap, GitBranch, Building, Eye,
  ArrowLeft, Sparkles
} from 'lucide-react';
import { AppShell } from '../shared/components';

// Import Foundations modules
import PixelsAndImages from './foundations/pixels-and-images';
import MatrixMath from './foundations/matrix-math';
import BasicNeuralNetwork from './foundations/basic-neural-network';

// Import Core CNN modules
import ConvolutionDeepDive from './core/convolution-deep-dive';
import KernelGallery from './core/kernel-gallery';
import FeatureMaps from './core/feature-maps';
import Pooling from './core/pooling';
import ClassificationHead from './core/classification-head';

// Import Advanced modules
import Training from './advanced/training';
import DeeperNetworks from './advanced/deeper-networks';
import FamousArchitectures from './advanced/famous-architectures';
import Interpretability from './advanced/interpretability';

// Import Reference
import CNNOverview from './reference/cnn-overview';

// Module definitions organized by tier
const tiers = [
    {
      name: 'Foundations',
      description: 'Prerequisites - images, math, and basic neural networks',
      color: '#3b82f6',
      modules: [
        {
          id: 'pixels',
          name: 'Pixels & Images',
          description: 'How computers see images as numbers',
          icon: Image,
          status: 'complete',
          component: PixelsAndImages,
        },
        {
          id: 'matrix',
          name: 'Matrix Math',
          description: 'The mathematical foundation of convolutions',
          icon: Grid3X3,
          status: 'complete',
          component: MatrixMath,
        },
        {
          id: 'basic-nn',
          name: 'Basic Neural Network',
          description: 'Understanding neurons, layers, and activation',
          icon: Brain,
          status: 'complete',
          component: BasicNeuralNetwork,
        },
      ],
    },
    {
      name: 'Core CNN Concepts',
      description: 'The building blocks that make CNNs special',
      color: '#8b5cf6',
      modules: [
        {
          id: 'convolution',
          name: 'Convolution Deep Dive',
          description: 'The core operation - sliding windows and feature detection',
          icon: Layers,
          status: 'complete',
          component: ConvolutionDeepDive,
        },
        {
          id: 'kernels',
          name: 'Kernel Gallery',
          description: 'Explore edge detectors, blurs, and learned filters',
          icon: Palette,
          status: 'complete',
          component: KernelGallery,
        },
        {
          id: 'feature-maps',
          name: 'Feature Maps',
          description: 'See what each layer learns to detect',
          icon: Map,
          status: 'complete',
          component: FeatureMaps,
        },
        {
          id: 'pooling',
          name: 'Pooling Layers',
          description: 'Downsampling and translation invariance',
          icon: Minimize2,
          status: 'complete',
          component: Pooling,
        },
        {
          id: 'classification',
          name: 'Classification Head',
          description: 'From features to predictions',
          icon: Target,
          status: 'complete',
          component: ClassificationHead,
        },
      ],
    },
    {
      name: 'Advanced Topics',
      description: 'Training, architectures, and understanding',
      color: '#22c55e',
      modules: [
        {
          id: 'training',
          name: 'Training CNNs',
          description: 'Backpropagation through convolutions',
          icon: GraduationCap,
          status: 'complete',
          component: Training,
        },
        {
          id: 'deeper',
          name: 'Deeper Networks',
          description: 'Skip connections and residual learning',
          icon: GitBranch,
          status: 'complete',
          component: DeeperNetworks,
        },
        {
          id: 'architectures',
          name: 'Famous Architectures',
          description: 'LeNet, AlexNet, VGG, ResNet, and more',
          icon: Building,
          status: 'complete',
          component: FamousArchitectures,
        },
        {
          id: 'interpretability',
          name: 'Interpretability',
          description: 'What do CNNs actually learn?',
          icon: Eye,
          status: 'complete',
          component: Interpretability,
        },
      ],
    },
    {
      name: 'Reference',
      description: 'Interactive overviews and visualizations',
      color: '#f59e0b',
      modules: [
        {
          id: 'overview',
          name: 'CNN Overview',
          description: 'Complete end-to-end CNN visualization',
          icon: Sparkles,
          status: 'complete',
          component: CNNOverview,
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
              Convolutional Neural Networks
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Interactive visualizations for understanding CNNs
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
