import {
  Image, Grid3X3, Brain, Layers, Palette, Map, Minimize2,
  Target, GraduationCap, GitBranch, Building, Eye, Sparkles
} from 'lucide-react';
import { AppShell, CourseHub } from '../shared/components';

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

export function CourseContent({ onBack }) {
  return (
    <CourseHub
      title="CNN Visualizations"
      subtitle="Interactive educational artifacts for understanding Convolutional Neural Networks"
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
