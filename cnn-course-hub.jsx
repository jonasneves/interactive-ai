import React, { useState } from 'react';
import {
  BookOpen, Play, Lock, CheckCircle, ChevronRight,
  Layers, Zap, Grid, Brain, BarChart3, Eye, Settings,
  Cpu, Sparkles, Target, TrendingUp, Award, Clock,
  ArrowRight, Star, Info
} from 'lucide-react';

const CNNCourseHub = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [progress, setProgress] = useState({
    overview: 'completed',
    level1: 'locked',
    level2: 'locked',
    level3: 'locked',
    level4: 'available',
    level5: 'available',
    level6: 'locked',
    level7: 'locked',
    level8: 'locked',
    level9: 'locked',
    level10: 'locked',
    level11: 'locked',
    level12: 'locked',
  });

  const tiers = [
    {
      name: 'Prerequisites',
      color: 'blue',
      description: 'Foundation concepts before diving into CNNs',
      levels: [
        {
          id: 'level1',
          number: 1,
          title: 'Pixels & Images',
          description: 'How computers see images as numbers',
          duration: '10 min',
          icon: Grid,
          details: 'Learn how digital images are represented as matrices of numbers. Understand RGB channels, grayscale conversion, and pixel coordinates.',
          tools: ['Interactive image → number converter', 'RGB channel explorer', 'Resolution comparison'],
        },
        {
          id: 'level2',
          number: 2,
          title: 'Dot Products & Matrix Math',
          description: 'The mathematics behind neural networks',
          duration: '15 min',
          icon: Zap,
          details: 'Master the fundamental operations: dot products, matrix multiplication, and element-wise operations that power all neural networks.',
          tools: ['Visual dot product calculator', 'Matrix multiplication animator', 'Interactive examples'],
        },
        {
          id: 'level3',
          number: 3,
          title: 'Basic Neural Network',
          description: 'Single neurons and simple networks',
          duration: '20 min',
          icon: Brain,
          details: 'Build intuition for how individual neurons work: inputs, weights, bias, and activation functions. See how they combine into networks.',
          tools: ['Single neuron playground', 'MLP forward pass visualizer', 'Activation function explorer'],
        },
      ],
    },
    {
      name: 'CNN Core Concepts',
      color: 'violet',
      description: 'The essential building blocks of convolutional networks',
      levels: [
        {
          id: 'level4',
          number: 4,
          title: 'What is Convolution?',
          description: 'The fundamental operation explained',
          duration: '15 min',
          icon: Layers,
          details: 'Deep dive into convolution: from 1D signals to 2D images. Understand the sliding window concept and element-wise multiplication.',
          tools: ['1D signal convolution', '2D image convolution', 'Interactive kernel slider'],
          status: 'available',
        },
        {
          id: 'level5',
          number: 5,
          title: 'Kernels as Feature Detectors',
          description: 'How different filters find different patterns',
          duration: '15 min',
          icon: Eye,
          details: 'Explore a gallery of kernels: edge detection, blur, sharpen, emboss. Draw your own images and see what each kernel detects.',
          tools: ['Kernel gallery', 'Custom kernel editor', 'Drawing canvas', 'Side-by-side comparison'],
          status: 'available',
        },
        {
          id: 'level6',
          number: 6,
          title: 'Building Feature Maps',
          description: 'Multiple kernels, multiple perspectives',
          duration: '15 min',
          icon: Layers,
          details: 'See how applying multiple kernels to the same image creates a stack of feature maps, each capturing different aspects of the input.',
          tools: ['Multi-filter visualizer', 'Feature map stacker', 'Channel dimension explorer'],
        },
        {
          id: 'level7',
          number: 7,
          title: 'Pooling: Why Downsample?',
          description: 'Reducing dimensions while keeping important info',
          duration: '10 min',
          icon: BarChart3,
          details: 'Understand max pooling and average pooling. Learn why downsampling helps: translation invariance, parameter reduction, and computational efficiency.',
          tools: ['Pooling operation visualizer', 'With/without pooling comparison', 'Translation invariance demo'],
        },
        {
          id: 'level8',
          number: 8,
          title: 'Classification Head',
          description: 'From spatial features to class probabilities',
          duration: '10 min',
          icon: Target,
          details: 'Follow the journey from 2D feature maps through flattening, dense layers, and softmax to produce final class predictions.',
          tools: ['Flatten visualizer', 'Dense layer explorer', 'Softmax probability viewer'],
        },
      ],
    },
    {
      name: 'Training & Advanced',
      color: 'emerald',
      description: 'How CNNs learn and scale to real problems',
      levels: [
        {
          id: 'level9',
          number: 9,
          title: 'Training a CNN',
          description: 'Forward pass, loss, and backpropagation',
          duration: '25 min',
          icon: TrendingUp,
          details: 'Watch a complete training loop: forward pass computes predictions, loss measures error, backpropagation computes gradients, and weights update.',
          tools: ['Training loop animator', 'Loss landscape visualization', 'Gradient flow visualizer', 'Weight update tracker'],
        },
        {
          id: 'level10',
          number: 10,
          title: 'Deeper Networks',
          description: 'Stacking layers for hierarchical features',
          duration: '20 min',
          icon: Layers,
          details: 'See how stacking multiple convolutional layers creates a hierarchy: edges → textures → parts → objects. Understand receptive fields.',
          tools: ['Layer-by-layer feature viewer', 'Receptive field calculator', 'Hierarchical feature demo'],
        },
        {
          id: 'level11',
          number: 11,
          title: 'Famous Architectures',
          description: 'LeNet to ResNet: A journey through history',
          duration: '25 min',
          icon: Award,
          details: 'Explore landmark CNN architectures: LeNet, AlexNet, VGG, GoogLeNet, ResNet. Understand innovations like skip connections and inception modules.',
          tools: ['Architecture explorer', 'Interactive model diagrams', 'Parameter counter', 'Skip connection visualizer'],
        },
        {
          id: 'level12',
          number: 12,
          title: 'What CNNs Actually Learn',
          description: 'Interpretability and visualization techniques',
          duration: '20 min',
          icon: Sparkles,
          details: 'Peek inside trained networks: activation maximization, saliency maps, GradCAM. Understand what each layer has learned to detect.',
          tools: ['Activation maximization', 'GradCAM visualizer', 'Saliency map generator', 'Feature visualization gallery'],
        },
      ],
    },
  ];

  const overviewModule = {
    id: 'overview',
    title: 'CNN Overview',
    description: 'See the complete picture: how all components connect',
    duration: '5 min',
    icon: BookOpen,
    status: 'completed',
    details: 'Interactive end-to-end visualization showing how an image flows through a CNN: input → convolution → pooling → classification. This is your "map" to return to as you learn each component.',
    tools: ['Full pipeline animation', 'Step-by-step walkthrough', 'Interactive kernel selection', 'Draw your own input'],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'available': return 'bg-violet-500';
      case 'in_progress': return 'bg-yellow-500';
      default: return 'bg-slate-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} className="text-emerald-400" />;
      case 'available': return <Play size={20} className="text-violet-400" />;
      case 'in_progress': return <Clock size={20} className="text-yellow-400" />;
      default: return <Lock size={20} className="text-slate-500" />;
    }
  };

  const getTierColor = (color) => {
    const colors = {
      blue: 'from-blue-500/20 to-transparent border-blue-500/30',
      violet: 'from-violet-500/20 to-transparent border-violet-500/30',
      emerald: 'from-emerald-500/20 to-transparent border-emerald-500/30',
    };
    return colors[color] || colors.blue;
  };

  const getTierAccent = (color) => {
    const accents = {
      blue: 'text-blue-400',
      violet: 'text-violet-400',
      emerald: 'text-emerald-400',
    };
    return accents[color] || accents.blue;
  };

  const completedCount = Object.values(progress).filter(s => s === 'completed').length;
  const totalCount = Object.keys(progress).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-emerald-500/20 rounded-full mb-4">
            <Cpu size={20} className="text-violet-400" />
            <span className="text-sm text-gray-300">Interactive Learning Experience</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            Convolutional Neural Networks
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Master CNNs through interactive visualizations. No prerequisites required—start from pixels and build up to modern architectures.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 mb-8 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Your Progress</h2>
              <p className="text-gray-400">{completedCount} of {totalCount} modules completed</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-violet-400">{progressPercent}%</div>
              <p className="text-gray-500 text-sm">Course completion</p>
            </div>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Prerequisites</span>
            <span>Core Concepts</span>
            <span>Advanced</span>
          </div>
        </div>

        {/* Overview Module (Special) */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedLevel(selectedLevel === 'overview' ? null : 'overview')}
            className={`w-full bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-emerald-500/10 backdrop-blur rounded-2xl p-6 border transition-all ${
              selectedLevel === 'overview'
                ? 'border-violet-500 shadow-lg shadow-violet-500/20'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <BookOpen size={28} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">{overviewModule.title}</h3>
                    <span className="px-2 py-1 bg-emerald-500/20 rounded text-xs text-emerald-400">Start Here</span>
                  </div>
                  <p className="text-gray-400">{overviewModule.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock size={16} />
                  {overviewModule.duration}
                </span>
                {getStatusIcon(progress.overview)}
              </div>
            </div>
          </button>

          {/* Expanded details */}
          {selectedLevel === 'overview' && (
            <div className="mt-4 bg-slate-800/60 rounded-xl p-6 border border-slate-700 animate-fadeIn">
              <p className="text-gray-300 mb-4">{overviewModule.details}</p>
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">INTERACTIVE TOOLS</h4>
                <div className="flex flex-wrap gap-2">
                  {overviewModule.tools.map((tool, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-700 rounded-full text-sm text-gray-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href="./cnn-overview.jsx"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-violet-500/20"
              >
                <Play size={18} />
                Launch Overview
                <ArrowRight size={18} />
              </a>
            </div>
          )}
        </div>

        {/* Course Tiers */}
        {tiers.map((tier, tierIdx) => (
          <div key={tier.name} className="mb-8">
            <div className={`bg-gradient-to-r ${getTierColor(tier.color)} rounded-2xl p-6 border`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${getTierAccent(tier.color)}`}>{tier.name}</h2>
                  <p className="text-gray-400">{tier.description}</p>
                </div>
                <div className={`px-4 py-2 rounded-full ${tier.color === 'blue' ? 'bg-blue-500/20' : tier.color === 'violet' ? 'bg-violet-500/20' : 'bg-emerald-500/20'}`}>
                  <span className={getTierAccent(tier.color)}>
                    {tier.levels.filter(l => progress[l.id] === 'completed').length} / {tier.levels.length} complete
                  </span>
                </div>
              </div>

              <div className="grid gap-4">
                {tier.levels.map((level) => {
                  const status = level.status || progress[level.id];
                  const isSelected = selectedLevel === level.id;
                  const Icon = level.icon;

                  return (
                    <div key={level.id}>
                      <button
                        onClick={() => setSelectedLevel(isSelected ? null : level.id)}
                        disabled={status === 'locked'}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          status === 'locked'
                            ? 'bg-slate-800/30 cursor-not-allowed'
                            : isSelected
                              ? 'bg-slate-800/80 border border-violet-500 shadow-lg shadow-violet-500/10'
                              : 'bg-slate-800/50 hover:bg-slate-800/70 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              status === 'locked' ? 'bg-slate-700' : `${getStatusColor(status)}/20`
                            }`}>
                              <Icon size={24} className={status === 'locked' ? 'text-slate-500' : getTierAccent(tier.color)} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">Level {level.number}</span>
                                {status === 'available' && (
                                  <span className="px-2 py-0.5 bg-violet-500/20 rounded text-xs text-violet-400">Ready</span>
                                )}
                              </div>
                              <h3 className={`text-lg font-semibold ${status === 'locked' ? 'text-gray-500' : 'text-white'}`}>
                                {level.title}
                              </h3>
                              <p className={`text-sm ${status === 'locked' ? 'text-gray-600' : 'text-gray-400'}`}>
                                {level.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500 flex items-center gap-1 text-sm">
                              <Clock size={14} />
                              {level.duration}
                            </span>
                            {getStatusIcon(status)}
                          </div>
                        </div>
                      </button>

                      {/* Expanded level details */}
                      {isSelected && status !== 'locked' && (
                        <div className="mt-2 ml-16 p-4 bg-slate-800/40 rounded-lg border border-slate-700 animate-fadeIn">
                          <p className="text-gray-300 mb-4">{level.details}</p>
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">INTERACTIVE TOOLS</h4>
                            <div className="flex flex-wrap gap-2">
                              {level.tools.map((tool, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                          <a
                            href={`./level-${level.number}-${level.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jsx`}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                              status === 'completed'
                                ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                            }`}
                          >
                            {status === 'completed' ? (
                              <>
                                <Eye size={16} />
                                Review
                              </>
                            ) : (
                              <>
                                <Play size={16} />
                                Start Level
                              </>
                            )}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Learning Path Visualization */}
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Star className="text-yellow-400" />
            Learning Path
          </h2>
          <div className="relative">
            {/* Path line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-violet-500 to-emerald-500" />

            {/* Milestones */}
            <div className="space-y-8 relative">
              {[
                { title: 'Foundation', desc: 'Understand images and basic math', color: 'blue', levels: '1-3' },
                { title: 'Core CNN', desc: 'Master convolution, kernels, and pooling', color: 'violet', levels: '4-8' },
                { title: 'Training', desc: 'Learn how networks learn', color: 'emerald', levels: '9-10' },
                { title: 'Expert', desc: 'Explore architectures and interpretability', color: 'yellow', levels: '11-12' },
              ].map((milestone, idx) => (
                <div key={milestone.title} className="flex items-center gap-6 pl-2">
                  <div className={`w-8 h-8 rounded-full bg-${milestone.color}-500 flex items-center justify-center z-10 shadow-lg shadow-${milestone.color}-500/30`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-${milestone.color}-400`}>{milestone.title}</h3>
                    <p className="text-sm text-gray-400">{milestone.desc}</p>
                    <span className="text-xs text-gray-500">Levels {milestone.levels}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <button className="p-4 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all text-left">
            <Settings size={24} className="text-blue-400 mb-2" />
            <h3 className="font-semibold">Settings</h3>
            <p className="text-sm text-gray-400">Adjust speed, colors, accessibility</p>
          </button>
          <button className="p-4 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 hover:border-violet-500/50 transition-all text-left">
            <Info size={24} className="text-violet-400 mb-2" />
            <h3 className="font-semibold">About</h3>
            <p className="text-sm text-gray-400">Course info and credits</p>
          </button>
          <button className="p-4 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all text-left">
            <BookOpen size={24} className="text-emerald-400 mb-2" />
            <h3 className="font-semibold">Resources</h3>
            <p className="text-sm text-gray-400">Papers, code, further reading</p>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Built for visual learners • No math prerequisites required</p>
          <p className="mt-1">Inspired by 3Blue1Brown, Distill.pub, and CNN Explainer</p>
        </div>
      </div>

      {/* CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CNNCourseHub;
