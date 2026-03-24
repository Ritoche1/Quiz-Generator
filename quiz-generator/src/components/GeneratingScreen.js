'use client';
import { useEffect, useState, useMemo } from 'react';

const STEPS = [
  { label: 'Analyzing topic...', icon: 'search' },
  { label: 'Crafting questions...', icon: 'edit' },
  { label: 'Generating answers...', icon: 'sparkle' },
  { label: 'Polishing your quiz...', icon: 'check' },
];

const TIPS = [
  'Did you know? The average person forgets 50% of new information within an hour.',
  'Quizzes are one of the most effective study techniques according to research.',
  'Spaced repetition combined with quizzes can boost retention by up to 150%.',
  'Teaching others is the best way to learn. Share your quiz with friends!',
];

const StepIcon = ({ type, done, active }) => {
  if (done) {
    return (
      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
        <svg className="w-4 h-4 text-white check-anim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (active) {
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center generating-pulse">
        <div className="w-3 h-3 rounded-full bg-indigo-600 spin-slow" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-gray-300" />
    </div>
  );
};

export default function GeneratingScreen({ onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 3500);
    return () => clearInterval(stepTimer);
  }, []);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(tipTimer);
  }, []);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Generate particle positions once
  const particles = useMemo(() =>
    Array.from({ length: 20 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      size: `${4 + Math.random() * 6}px`,
      opacity: 0.1 + Math.random() * 0.3,
    })),
  []);

  return (
    <div className="fixed inset-0 z-50 generating-gradient-bg flex items-center justify-center">
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              background: 'rgba(255,255,255,0.6)',
            }}
          />
        ))}
      </div>

      <div className="relative bg-white/95 backdrop-blur-sm max-w-lg w-full mx-4 p-8 sm:p-10 rounded-2xl shadow-2xl">
        {/* Brain icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-4 generating-pulse">
            <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Generating your quiz</h2>
          <p className="text-gray-500 mt-1 text-sm">Powered by Mistral AI</p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <StepIcon type={step.icon} done={i < currentStep} active={i === currentStep} />
              <span className={`text-sm font-medium ${
                i < currentStep ? 'text-emerald-600' :
                i === currentStep ? 'text-gray-900' :
                'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Rotating tips */}
        <div className="text-center mb-6 min-h-[40px]">
          <p className="text-xs text-gray-400 italic animate-fade-up" key={tipIndex}>
            {TIPS[tipIndex]}
          </p>
        </div>

        {/* Cancel button */}
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
