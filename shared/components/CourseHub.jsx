import { useState } from 'react';
import { ArrowLeft, Play, ChevronRight, Lock, CheckCircle } from 'lucide-react';

export default function CourseHub({ title, subtitle, gradientColors, tiers, onBack }) {
  const [activeModule, setActiveModule] = useState(null);

  // If a module is active, render it with a back button
  if (activeModule) {
    const module = tiers
      .flatMap((t) => t.modules)
      .find((m) => m.id === activeModule);

    if (module?.component) {
      const ModuleComponent = module.component;
      return (
        <div className="relative">
          {/* Back button - positioned to not overlap with AppShell home button */}
          <button
            onClick={() => setActiveModule(null)}
            className="fixed top-4 left-20 z-50 px-4 py-2 bg-slate-800/90 backdrop-blur rounded-lg
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

  // Calculate progress
  const totalModules = tiers.flatMap(t => t.modules).length;
  const completedModules = tiers.flatMap(t => t.modules).filter(m => m.status === 'complete').length;
  const progressPercent = (completedModules / totalModules) * 100;

  // Build gradient style for title
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${gradientColors.join(', ')})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span style={gradientStyle}>
              {title}
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {subtitle}
          </p>

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Progress</span>
              <span>{completedModules}/{totalModules} modules</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full progress-gradient transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
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
            <span className="text-slate-400">{totalModules} interactive visualizations • {completedModules} complete</span>
          </p>
        </div>
      </div>
    </div>
  );
}
