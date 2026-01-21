import React, { useState } from 'react';
import {
  ChevronRight, Lightbulb, Check, Sparkles, Layers,
  Cpu, Zap, Award, Clock
} from 'lucide-react';

const FamousArchitectures = () => {
  const [eli5Mode, setEli5Mode] = useState(false);
  const [selectedArch, setSelectedArch] = useState('resnet');
  const [quizAnswers, setQuizAnswers] = useState({});

  const architectures = {
    lenet: {
      name: 'LeNet-5',
      year: 1998,
      authors: 'Yann LeCun et al.',
      task: 'Digit recognition',
      innovation: 'First successful CNN',
      layers: 7,
      params: '60K',
      structure: ['Conv 5×5', 'Pool', 'Conv 5×5', 'Pool', 'FC', 'FC', 'Output'],
      description: eli5Mode
        ? "The grandparent of all CNNs! LeNet was the first to show that neural networks could read handwritten digits. It introduced the basic conv→pool→fc pattern we still use today."
        : "LeNet-5 pioneered convolutional neural networks for document recognition. It established the fundamental architecture: stacked convolutions with pooling followed by fully connected layers. Despite its simplicity, it achieved 99.2% accuracy on MNIST.",
      color: 'blue'
    },
    alexnet: {
      name: 'AlexNet',
      year: 2012,
      authors: 'Krizhevsky, Sutskever, Hinton',
      task: 'ImageNet classification',
      innovation: 'GPU training, ReLU, Dropout',
      layers: 8,
      params: '62M',
      structure: ['Conv 11×11', 'Pool', 'Conv 5×5', 'Pool', 'Conv 3×3', 'Conv 3×3', 'Conv 3×3', 'Pool', 'FC', 'FC', 'FC'],
      description: eli5Mode
        ? "AlexNet started the deep learning revolution! It was the first to use graphics cards (GPUs) to train a big CNN and crushed the competition in 2012. It showed the world that deep learning WORKS."
        : "AlexNet won ImageNet 2012 by a huge margin (16.4% vs 26.2% error), triggering the deep learning boom. Key innovations: ReLU activation, dropout regularization, data augmentation, and efficient GPU training using two GTX 580s.",
      color: 'violet'
    },
    vgg: {
      name: 'VGG-16/19',
      year: 2014,
      authors: 'Simonyan & Zisserman',
      task: 'ImageNet classification',
      innovation: 'Simplicity, 3×3 convolutions only',
      layers: '16-19',
      params: '138M',
      structure: ['2× Conv 3×3', 'Pool', '2× Conv 3×3', 'Pool', '3× Conv 3×3', 'Pool', '3× Conv 3×3', 'Pool', '3× Conv 3×3', 'Pool', 'FC', 'FC', 'FC'],
      description: eli5Mode
        ? "VGG showed that using tiny 3×3 filters over and over is better than big filters! It's very simple and regular - just stack the same blocks. It's still used today for feature extraction."
        : "VGG demonstrated that network depth matters and small 3×3 filters are sufficient. Two 3×3 layers have the same receptive field as one 5×5 but fewer parameters and more non-linearity. Despite 138M parameters, its simplicity made it a popular feature extractor.",
      color: 'emerald'
    },
    googlenet: {
      name: 'GoogLeNet/Inception',
      year: 2014,
      authors: 'Szegedy et al. (Google)',
      task: 'ImageNet classification',
      innovation: 'Inception modules, 1×1 convolutions',
      layers: 22,
      params: '6.8M',
      structure: ['Conv', 'Pool', 'Inception', 'Inception', 'Pool', 'Inception×5', 'Pool', 'Inception×2', 'GAP', 'FC'],
      description: eli5Mode
        ? "GoogLeNet asked: why choose one filter size when you can try ALL of them? Its Inception modules look at 1×1, 3×3, and 5×5 at the same time. Very clever and efficient!"
        : "GoogLeNet introduced Inception modules that apply multiple filter sizes in parallel, letting the network learn which scale is most relevant. 1×1 convolutions reduce dimensionality before expensive operations. Only 6.8M params vs VGG's 138M while achieving similar accuracy.",
      color: 'amber'
    },
    resnet: {
      name: 'ResNet',
      year: 2015,
      authors: 'He et al. (Microsoft)',
      task: 'ImageNet classification',
      innovation: 'Skip connections, very deep networks',
      layers: '18-152+',
      params: '25-60M',
      structure: ['Conv 7×7', 'Pool', 'Residual Block×N', 'Pool', 'Residual Block×N', 'Pool', 'Residual Block×N', 'Pool', 'Residual Block×N', 'GAP', 'FC'],
      description: eli5Mode
        ? "ResNet's big idea: add shortcuts! Instead of making each layer learn everything, let them just learn what's DIFFERENT from the input. This let them train networks with 152 layers - crazy deep!"
        : "ResNet revolutionized deep learning with residual connections (y = F(x) + x). By learning residuals instead of direct mappings, gradients flow easily through skip connections. Enabled training of 152+ layer networks, winning ImageNet 2015 with 3.57% error.",
      color: 'rose'
    },
    efficientnet: {
      name: 'EfficientNet',
      year: 2019,
      authors: 'Tan & Le (Google)',
      task: 'ImageNet classification',
      innovation: 'Compound scaling, NAS-designed',
      layers: 'Variable',
      params: '5-66M',
      structure: ['Conv', 'MBConv×N', 'MBConv×N', '...', 'Conv', 'GAP', 'FC'],
      description: eli5Mode
        ? "EfficientNet figured out the best way to make networks bigger! Instead of just making them deeper OR wider, it scales depth, width, and resolution together in just the right amounts."
        : "EfficientNet uses compound scaling to balance network depth, width, and input resolution. The base architecture was found via Neural Architecture Search (NAS). EfficientNet-B7 achieved 84.3% top-1 accuracy with 8.4× fewer parameters than previous SOTA.",
      color: 'cyan'
    }
  };

  const arch = architectures[selectedArch];

  // Architecture comparison chart
  const ComparisonChart = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-slate-700">
            <th className="pb-2 pr-4">Architecture</th>
            <th className="pb-2 pr-4">Year</th>
            <th className="pb-2 pr-4">Depth</th>
            <th className="pb-2 pr-4">Params</th>
            <th className="pb-2 pr-4">Top-5 Error</th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: 'LeNet-5', year: 1998, depth: 7, params: '60K', error: 'N/A' },
            { name: 'AlexNet', year: 2012, depth: 8, params: '62M', error: '16.4%' },
            { name: 'VGG-16', year: 2014, depth: 16, params: '138M', error: '7.3%' },
            { name: 'GoogLeNet', year: 2014, depth: 22, params: '6.8M', error: '6.7%' },
            { name: 'ResNet-152', year: 2015, depth: 152, params: '60M', error: '3.6%' },
            { name: 'EfficientNet-B7', year: 2019, depth: '~66', params: '66M', error: '2.9%' },
          ].map((row, i) => (
            <tr key={row.name} className={i % 2 === 0 ? 'bg-slate-800/50' : ''}>
              <td className="py-2 pr-4 text-slate-300">{row.name}</td>
              <td className="py-2 pr-4 text-slate-400">{row.year}</td>
              <td className="py-2 pr-4 text-slate-400">{row.depth}</td>
              <td className="py-2 pr-4 text-slate-400">{row.params}</td>
              <td className="py-2 pr-4 text-emerald-300">{row.error}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Simple architecture diagram
  const ArchDiagram = ({ structure, color }) => (
    <div className="flex items-center gap-1 overflow-x-auto py-4">
      {structure.map((block, i) => (
        <React.Fragment key={i}>
          <div
            className={`px-2 py-1 rounded text-xs whitespace-nowrap bg-${color}-500/30 text-${color}-300 border border-${color}-500/50`}
            style={{
              backgroundColor: `rgb(var(--${color}-500) / 0.3)`,
              color: `rgb(var(--${color}-300))`
            }}
          >
            {block}
          </div>
          {i < structure.length - 1 && (
            <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full">
                Level 11
              </span>
              <span className="text-slate-400">Advanced</span>
            </div>
            <h1 className="text-3xl font-bold">Famous Architectures</h1>
            <p className="text-slate-400 mt-1">The CNNs that shaped deep learning history</p>
          </div>

          <button
            onClick={() => setEli5Mode(!eli5Mode)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              eli5Mode
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Lightbulb size={18} />
            {eli5Mode ? 'ELI5 Mode ON' : 'ELI5 Mode'}
          </button>
        </div>

        {/* Architecture selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(architectures).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedArch(key)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedArch === key
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {value.name}
            </button>
          ))}
        </div>

        {/* Selected Architecture Details */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{arch.name}</h2>
              <p className="text-slate-400">{arch.authors} ({arch.year})</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <Layers size={24} className="mx-auto text-blue-400 mb-1" />
                <p className="text-xs text-slate-400">Layers</p>
                <p className="font-semibold">{arch.layers}</p>
              </div>
              <div className="text-center">
                <Cpu size={24} className="mx-auto text-violet-400 mb-1" />
                <p className="text-xs text-slate-400">Params</p>
                <p className="font-semibold">{arch.params}</p>
              </div>
              <div className="text-center">
                <Award size={24} className="mx-auto text-amber-400 mb-1" />
                <p className="text-xs text-slate-400">Task</p>
                <p className="font-semibold text-sm">{arch.task}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm text-slate-400 mb-2 flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              Key Innovation
            </h3>
            <p className="text-lg text-emerald-300">{arch.innovation}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm text-slate-400 mb-2">Architecture Flow</h3>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <div className="flex items-center gap-1 min-w-max">
                {arch.structure.map((block, i) => (
                  <React.Fragment key={i}>
                    <div className="px-2 py-1 rounded text-xs whitespace-nowrap bg-emerald-500/30 text-emerald-300 border border-emerald-500/50">
                      {block}
                    </div>
                    {i < arch.structure.length - 1 && (
                      <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-slate-400 mb-2">About</h3>
            <p className="text-slate-300 leading-relaxed">{arch.description}</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700">
          <h3 className="font-semibold mb-4">Architecture Comparison</h3>
          <ComparisonChart />
        </div>

        {/* Timeline */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-slate-700">
          <h3 className="font-semibold mb-4">Evolution Timeline</h3>
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-700" />
            <div className="flex justify-between relative">
              {[
                { year: '1998', name: 'LeNet', color: 'blue' },
                { year: '2012', name: 'AlexNet', color: 'violet' },
                { year: '2014', name: 'VGG/GoogLeNet', color: 'emerald' },
                { year: '2015', name: 'ResNet', color: 'rose' },
                { year: '2019', name: 'EfficientNet', color: 'cyan' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className={`w-4 h-4 rounded-full bg-${item.color}-500 mx-auto mb-2 relative z-10`}
                       style={{ backgroundColor: `var(--${item.color}-500, #10b981)` }} />
                  <p className="text-xs text-slate-400">{item.year}</p>
                  <p className="text-sm text-slate-300">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Error rate dropped from <span className="text-red-300">~26%</span> (2011) to{' '}
              <span className="text-emerald-300">~2.9%</span> (2019) - surpassing human level (~5%)!
            </p>
          </div>
        </div>

        {/* Quiz */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-400" />
            Quick Quiz
          </h3>

          <div className="space-y-6">
            <div>
              <p className="text-slate-300 mb-3">
                Which architecture introduced skip/residual connections?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['VGG', 'ResNet', 'AlexNet'].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({...quizAnswers, q1: ans})}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      quizAnswers.q1 === undefined
                        ? 'border-slate-600 hover:border-slate-500'
                        : ans === 'ResNet'
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : quizAnswers.q1 === ans
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-slate-600 opacity-50'
                    }`}
                    disabled={quizAnswers.q1 !== undefined}
                  >
                    {ans}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-slate-300 mb-3">
                Which architecture has the MOST parameters?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['GoogLeNet (6.8M)', 'VGG-16 (138M)', 'ResNet-50 (25M)'].map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswers({...quizAnswers, q2: ans})}
                    className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                      quizAnswers.q2 === undefined
                        ? 'border-slate-600 hover:border-slate-500'
                        : ans.includes('VGG')
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : quizAnswers.q2 === ans
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-slate-600 opacity-50'
                    }`}
                    disabled={quizAnswers.q2 !== undefined}
                  >
                    {ans}
                  </button>
                ))}
              </div>
              {quizAnswers.q2 && (
                <p className="text-sm text-slate-400 mt-2">
                  VGG's FC layers contain most of its 138M parameters - that's why modern networks use GAP!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <h3 className="font-semibold mb-3 text-emerald-300">Key Takeaways</h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>LeNet (1998) established the conv→pool→fc pattern still used today</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>AlexNet (2012) proved deep learning works at scale with GPU training</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>VGG showed 3×3 convs are sufficient; GoogLeNet showed multi-scale works</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>ResNet's skip connections enabled training of very deep networks (152+ layers)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
              <span>EfficientNet showed how to scale networks optimally for best accuracy/efficiency</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FamousArchitectures;
