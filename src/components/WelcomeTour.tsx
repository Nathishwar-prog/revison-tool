"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  PlusCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  icon: React.ElementType;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: 'dashboard',
    title: 'Welcome to KnowGrow!',
    description: 'Your personal AI-powered learning companion. Track your progress, master new concepts, and build lasting knowledge with spaced repetition.',
    icon: Sparkles,
    position: 'bottom',
  },
  {
    target: 'add-knowledge',
    title: 'Add Your Knowledge',
    description: 'Start by adding concepts you want to learn. Include definitions, code examples, and key points. The AI will help you create effective flashcards.',
    icon: PlusCircle,
    position: 'bottom',
  },
  {
    target: 'revision',
    title: 'Spaced Repetition',
    description: 'Review your concepts using scientifically-proven spaced repetition. Rate your confidence and the system will optimize your learning schedule.',
    icon: GraduationCap,
    position: 'bottom',
  },
  {
    target: 'insights',
    title: 'Track Your Progress',
    description: 'Visualize your learning journey with detailed analytics, identify weak areas, and watch your knowledge grow over time.',
    icon: BarChart3,
    position: 'bottom',
  },
  {
    target: 'library',
    title: 'Your Knowledge Library',
    description: 'All your concepts are organized in one place. Search, filter, and manage your personal knowledge base effortlessly.',
    icon: BookOpen,
    position: 'bottom',
  },
];

export function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('knowgrow_tour_completed');
    if (!seen) {
      setHasSeenTour(false);
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('knowgrow_tour_completed', 'true');
    setIsOpen(false);
  };

  const handleComplete = () => {
    localStorage.setItem('knowgrow_tour_completed', 'true');
    setIsOpen(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  if (hasSeenTour && !isOpen) {
    return (
      <button
        onClick={handleRestart}
        className="fixed bottom-24 right-4 md:bottom-4 z-40 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110"
        title="Restart tour"
      >
        <Sparkles className="h-5 w-5" />
      </button>
    );
  }

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkip}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30"
                  >
                    <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </motion.div>
                  <button
                    onClick={handleSkip}
                    className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="h-5 w-5 text-zinc-400" />
                  </button>
                </div>

                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                    {step.title}
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                <div className="flex items-center justify-center gap-2 mt-8 mb-6">
                  {tourSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'w-6 bg-indigo-600'
                          : index < currentStep
                          ? 'bg-indigo-400'
                          : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                      currentStep === 0
                        ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Get Started
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
