import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

const BackpropFlowViz = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [step, setStep] = useState(0);
  const [epoch, setEpoch] = useState(0);
  
  // Network state
  const [w1, setW1] = useState(1.5);
  const [w2, setW2] = useState(1.2);
  const [b, setB] = useState(-0.8);
  
  // Current sample
  const [sampleIdx, setSampleIdx] = useState(0);
  const trainingData = [
    [0.3, 0.2, 0],  // benign
    [0.9, 0.8, 1],  // malignant
    [0.2, 0.3, 0],  // benign
    [0.8, 0.9, 1],  // malignant
  ];
  
  const lr = 0.3;
  const [x1, x2, target] = trainingData[sampleIdx];
  
  // Forward calculations
  const z = x1 * w1 + x2 * w2 + b;
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  const y = sigmoid(z);
  const error = target - y;
  const loss = 0.5 * error * error;
  
  // Backward calculations
  const dE_dy = -error;
  const dy_dz = y * (1 - y); // sigmoid derivative
  const dE_dz = dE_dy * dy_dz;
  const dE_dw1 = dE_dz * x1;
  const dE_dw2 = dE_dz * x2;
  const dE_db = dE_dz;
  
  const steps = [
    { name: 'Forward: Input', phase: 'forward', highlight: ['x1', 'x2'] },
    { name: 'Forward: Weighted Sum', phase: 'forward', highlight: ['w1', 'w2', 'b', 'z'] },
    { name: 'Forward: Activation', phase: 'forward', highlight: ['z', 'sigmoid', 'y'] },
    { name: 'Calculate Error', phase: 'error', highlight: ['y', 'target', 'error'] },
    { name: 'Backward: ∂E/∂y', phase: 'backward', highlight: ['error', 'dE_dy'] },
    { name: 'Backward: ∂y/∂z', phase: 'backward', highlight: ['y', 'dy_dz'] },
    { name: 'Backward: ∂E/∂z', phase: 'backward', highlight: ['dE_dy', 'dy_dz', 'dE_dz'] },
    { name: 'Backward: ∂E/∂w₁', phase: 'backward', highlight: ['dE_dz', 'x1', 'dE_dw1'] },
    { name: 'Backward: ∂E/∂w₂', phase: 'backward', highlight: ['dE_dz', 'x2', 'dE_dw2'] },
    { name: 'Backward: ∂E/∂b', phase: 'backward', highlight: ['dE_dz', 'dE_db'] },
    { name: 'Update Weights', phase: 'update', highlight: ['w1', 'w2', 'b', 'dE_dw1', 'dE_dw2', 'dE_db'] },
  ];
  
  const currentStep = steps[step];
  const isHighlighted = (id) => currentStep.highlight.includes(id);
  
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= steps.length - 1) {
            // Apply weight updates
            setW1(w => w - lr * dE_dw1);
            setW2(w => w - lr * dE_dw2);
            setB(b => b - lr * dE_db);
            
            // Move to next sample
            setSampleIdx(idx => {
              const next = (idx + 1) % trainingData.length;
              if (next === 0) setEpoch(e => e + 1);
              return next;
            });
            
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, speed, step, dE_dw1, dE_dw2, dE_db]);
  
  const reset = () => {
    setIsRunning(false);
    setStep(0);
    setEpoch(0);
    setSampleIdx(0);
    setW1(1.5);
    setW2(1.2);
    setB(-0.8);
  };
  
  const nextStep = () => {
    if (step >= steps.length - 1) {
      setW1(w => w - lr * dE_dw1);
      setW2(w => w - lr * dE_dw2);
      setB(b => b - lr * dE_db);
      setSampleIdx(idx => {
        const next = (idx + 1) % trainingData.length;
        if (next === 0) setEpoch(e => e + 1);
        return next;
      });
      setStep(0);
    } else {
      setStep(s => s + 1);
    }
  };
  
  const getPhaseColor = (phase) => {
    if (phase === 'forward') return 'bg-blue-500';
    if (phase === 'error') return 'bg-yellow-500';
    if (phase === 'backward') return 'bg-red-500';
    if (phase === 'update') return 'bg-green-500';
    return 'bg-gray-500';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Backpropagation Flow</h1>
        <p className="text-gray-300 mb-6">Step-by-step gradient flow through the network</p>
        
        {/* Controls */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
            </button>
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 flex items-center gap-2"
            >
              <SkipForward size={16} /> Next Step
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm mr-2">Speed: {speed}x</label>
              <input
                type="range"
                min="1"
                max="5"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-32"
              />
            </div>
            <div className="text-sm">
              Epoch: <span className="font-bold">{epoch}</span> | 
              Sample: <span className="font-bold">{sampleIdx + 1}/4</span>
            </div>
          </div>
        </div>
        
        {/* Step Progress */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Current Step: {currentStep.name}</h2>
            <span className={`px-3 py-1 rounded text-sm font-semibold ${getPhaseColor(currentStep.phase)}`}>
              {currentStep.phase.toUpperCase()}
            </span>
          </div>
          <div className="flex gap-1">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 rounded ${
                  idx === step ? getPhaseColor(s.phase) : 'bg-slate-700'
                } ${idx < step ? 'opacity-50' : ''}`}
              />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Network Diagram */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Network Architecture</h2>
            
            <svg viewBox="0 0 500 450" className="w-full">
              {/* Input Layer */}
              <circle 
                cx="80" cy="120" r="35" 
                fill={isHighlighted('x1') ? '#3b82f6' : '#475569'} 
                stroke="#94a3b8" strokeWidth="2"
                className="transition-all duration-300"
              />
              <text x="80" y="125" textAnchor="middle" fill="white" className="text-sm font-bold">x₁</text>
              <text x="80" y="170" textAnchor="middle" fill="#94a3b8" className="text-xs">{x1}</text>
              
              <circle 
                cx="80" cy="240" r="35" 
                fill={isHighlighted('x2') ? '#3b82f6' : '#475569'}
                stroke="#94a3b8" strokeWidth="2"
                className="transition-all duration-300"
              />
              <text x="80" y="245" textAnchor="middle" fill="white" className="text-sm font-bold">x₂</text>
              <text x="80" y="290" textAnchor="middle" fill="#94a3b8" className="text-xs">{x2}</text>
              
              {/* Weights */}
              <line x1="115" y1="120" x2="205" y2="180" stroke={isHighlighted('w1') ? '#3b82f6' : '#64748b'} strokeWidth="3" />
              <text x="140" y="140" fill={isHighlighted('w1') ? '#3b82f6' : '#94a3b8'} className="text-xs font-bold">
                w₁={w1.toFixed(3)}
              </text>
              
              <line x1="115" y1="240" x2="205" y2="180" stroke={isHighlighted('w2') ? '#3b82f6' : '#64748b'} strokeWidth="3" />
              <text x="140" y="240" fill={isHighlighted('w2') ? '#3b82f6' : '#94a3b8'} className="text-xs font-bold">
                w₂={w2.toFixed(3)}
              </text>
              
              {/* Hidden/Sum */}
              <circle 
                cx="240" cy="180" r="40" 
                fill={isHighlighted('z') ? '#f59e0b' : '#475569'}
                stroke="#94a3b8" strokeWidth="2"
                className="transition-all duration-300"
              />
              <text x="240" y="180" textAnchor="middle" fill="white" className="text-xl">Σ</text>
              <text x="240" y="200" textAnchor="middle" fill="#94a3b8" className="text-xs">z={z.toFixed(3)}</text>
              
              {/* Bias */}
              <circle 
                cx="240" cy="280" r="25" 
                fill={isHighlighted('b') ? '#22c55e' : '#475569'}
                stroke="#94a3b8" strokeWidth="2"
                className="transition-all duration-300"
              />
              <text x="240" y="285" textAnchor="middle" fill="white" className="text-xs font-bold">b</text>
              <text x="240" y="320" textAnchor="middle" fill="#94a3b8" className="text-xs">{b.toFixed(3)}</text>
              <line x1="240" y1="255" x2="240" y2="220" stroke={isHighlighted('b') ? '#22c55e' : '#64748b'} strokeWidth="3" />
              
              {/* Activation */}
              <circle 
                cx="380" cy="180" r="40" 
                fill={isHighlighted('sigmoid') || isHighlighted('y') ? '#8b5cf6' : '#475569'}
                stroke="#94a3b8" strokeWidth="2"
                className="transition-all duration-300"
              />
              <text x="380" y="180" textAnchor="middle" fill="white" className="text-sm">σ(z)</text>
              <text x="380" y="200" textAnchor="middle" fill="#94a3b8" className="text-xs">ŷ={y.toFixed(3)}</text>
              <line x1="280" y1="180" x2="340" y2="180" stroke={isHighlighted('z') || isHighlighted('sigmoid') ? '#f59e0b' : '#64748b'} strokeWidth="3" />
              
              {/* Target & Error */}
              <rect 
                x="340" y="280" width="80" height="50" rx="5" 
                fill={isHighlighted('target') ? '#ef4444' : '#475569'}
                stroke="#94a3b8" strokeWidth="2"
                className="transition-all duration-300"
              />
              <text x="380" y="300" textAnchor="middle" fill="white" className="text-xs">Target</text>
              <text x="380" y="320" textAnchor="middle" fill="#94a3b8" className="text-sm font-bold">{target}</text>
              
              {/* Error annotation */}
              {isHighlighted('error') && (
                <>
                  <line x1="380" y1="220" x2="380" y2="280" stroke="#ef4444" strokeWidth="3" strokeDasharray="5,5" />
                  <text x="430" y="250" fill="#ef4444" className="text-xs font-bold">E={error.toFixed(3)}</text>
                </>
              )}
              
              {/* Gradient Flow Arrows (shown during backprop) */}
              {currentStep.phase === 'backward' && (
                <>
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
                    </marker>
                  </defs>
                  
                  {step >= 7 && (
                    <line x1="340" y1="180" x2="280" y2="180" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  )}
                  {step >= 8 && (
                    <>
                      <line x1="205" y1="180" x2="115" y2="120" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      <line x1="205" y1="180" x2="115" y2="240" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      <line x1="240" y1="220" x2="240" y2="255" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    </>
                  )}
                </>
              )}
            </svg>
          </div>
          
          {/* Right: Calculations */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Calculations</h2>
            
            <div className="space-y-3 font-mono text-sm">
              {/* Forward Pass */}
              <div className={`p-3 rounded ${currentStep.phase === 'forward' ? 'bg-blue-900/50 border border-blue-500' : 'bg-slate-700/30'}`}>
                <div className="text-blue-400 font-bold mb-2">FORWARD PASS</div>
                <div className={isHighlighted('z') ? 'text-blue-300 font-bold' : 'text-gray-400'}>
                  z = x₁w₁ + x₂w₂ + b
                </div>
                <div className={isHighlighted('z') ? 'text-blue-300 font-bold' : 'text-gray-400'}>
                  z = {x1}×{w1.toFixed(3)} + {x2}×{w2.toFixed(3)} + {b.toFixed(3)}
                </div>
                <div className={isHighlighted('z') ? 'text-blue-300 font-bold' : 'text-gray-400'}>
                  z = {z.toFixed(3)}
                </div>
                
                <div className={`mt-2 ${isHighlighted('y') || isHighlighted('sigmoid') ? 'text-purple-300 font-bold' : 'text-gray-400'}`}>
                  ŷ = σ(z) = 1/(1+e⁻ᶻ)
                </div>
                <div className={isHighlighted('y') || isHighlighted('sigmoid') ? 'text-purple-300 font-bold' : 'text-gray-400'}>
                  ŷ = {y.toFixed(3)}
                </div>
              </div>
              
              {/* Error */}
              <div className={`p-3 rounded ${currentStep.phase === 'error' ? 'bg-yellow-900/50 border border-yellow-500' : 'bg-slate-700/30'}`}>
                <div className="text-yellow-400 font-bold mb-2">ERROR</div>
                <div className={isHighlighted('error') ? 'text-yellow-300 font-bold' : 'text-gray-400'}>
                  E = t - ŷ = {target} - {y.toFixed(3)}
                </div>
                <div className={isHighlighted('error') ? 'text-yellow-300 font-bold' : 'text-gray-400'}>
                  E = {error.toFixed(3)}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Loss = ½E² = {loss.toFixed(4)}
                </div>
              </div>
              
              {/* Backward Pass */}
              <div className={`p-3 rounded ${currentStep.phase === 'backward' ? 'bg-red-900/50 border border-red-500' : 'bg-slate-700/30'}`}>
                <div className="text-red-400 font-bold mb-2">BACKWARD PASS (Chain Rule)</div>
                
                <div className={isHighlighted('dE_dy') ? 'text-red-300 font-bold' : 'text-gray-400'}>
                  ∂E/∂ŷ = -(t - ŷ) = {dE_dy.toFixed(3)}
                </div>
                
                <div className={`mt-2 ${isHighlighted('dy_dz') ? 'text-red-300 font-bold' : 'text-gray-400'}`}>
                  ∂ŷ/∂z = ŷ(1-ŷ) = {dy_dz.toFixed(3)}
                </div>
                
                <div className={`mt-2 ${isHighlighted('dE_dz') ? 'text-red-300 font-bold' : 'text-gray-400'}`}>
                  ∂E/∂z = (∂E/∂ŷ)(∂ŷ/∂z)
                </div>
                <div className={isHighlighted('dE_dz') ? 'text-red-300 font-bold' : 'text-gray-400'}>
                  ∂E/∂z = {dE_dy.toFixed(3)}×{dy_dz.toFixed(3)} = {dE_dz.toFixed(3)}
                </div>
                
                <div className="border-t border-gray-600 my-2"></div>
                
                <div className={isHighlighted('dE_dw1') ? 'text-red-300 font-bold' : 'text-gray-400'}>
                  ∂E/∂w₁ = (∂E/∂z)x₁ = {dE_dz.toFixed(3)}×{x1} = {dE_dw1.toFixed(3)}
                </div>
                
                <div className={`mt-1 ${isHighlighted('dE_dw2') ? 'text-red-300 font-bold' : 'text-gray-400'}`}>
                  ∂E/∂w₂ = (∂E/∂z)x₂ = {dE_dz.toFixed(3)}×{x2} = {dE_dw2.toFixed(3)}
                </div>
                
                <div className={`mt-1 ${isHighlighted('dE_db') ? 'text-red-300 font-bold' : 'text-gray-400'}`}>
                  ∂E/∂b = ∂E/∂z = {dE_db.toFixed(3)}
                </div>
              </div>
              
              {/* Weight Update */}
              <div className={`p-3 rounded ${currentStep.phase === 'update' ? 'bg-green-900/50 border border-green-500' : 'bg-slate-700/30'}`}>
                <div className="text-green-400 font-bold mb-2">WEIGHT UPDATE (η={lr})</div>
                
                <div className={step === 10 ? 'text-green-300 font-bold' : 'text-gray-400'}>
                  w₁ᵑᵉʷ = w₁ - η(∂E/∂w₁)
                </div>
                <div className={step === 10 ? 'text-green-300 font-bold' : 'text-gray-400'}>
                  w₁ᵑᵉʷ = {w1.toFixed(3)} - {lr}×{dE_dw1.toFixed(3)} = {(w1 - lr * dE_dw1).toFixed(3)}
                </div>
                
                <div className={`mt-2 ${step === 10 ? 'text-green-300 font-bold' : 'text-gray-400'}`}>
                  w₂ᵑᵉʷ = {w2.toFixed(3)} - {lr}×{dE_dw2.toFixed(3)} = {(w2 - lr * dE_dw2).toFixed(3)}
                </div>
                
                <div className={`mt-2 ${step === 10 ? 'text-green-300 font-bold' : 'text-gray-400'}`}>
                  bᵑᵉʷ = {b.toFixed(3)} - {lr}×{dE_db.toFixed(3)} = {(b - lr * dE_db).toFixed(3)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 bg-slate-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Legend</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Forward Pass</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Error Calculation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Backward Pass</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Weight Update</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackpropFlowViz;