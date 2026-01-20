import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import CNNCourseHub from './cnn-course-hub';
import CNNFlowViz from './cnn-overview';
import ConvolutionDeepDive from './level-4-convolution';
import KernelGallery from './level-5-kernel-gallery';

const App = () => {
  const [currentView, setCurrentView] = useState('hub');

  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const BackButton = () => (
    <button
      onClick={() => navigateTo('hub')}
      className="fixed top-4 left-4 z-50 px-4 py-2 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-all flex items-center gap-2 shadow-lg"
    >
      <ArrowLeft size={18} />
      <span>Back to Course</span>
    </button>
  );

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <>
            <BackButton />
            <CNNFlowViz />
          </>
        );
      case 'level4':
        return (
          <>
            <BackButton />
            <ConvolutionDeepDive />
          </>
        );
      case 'level5':
        return (
          <>
            <BackButton />
            <KernelGallery />
          </>
        );
      case 'hub':
      default:
        return <CNNCourseHub onNavigate={navigateTo} />;
    }
  };

  return renderView();
};

export default App;
