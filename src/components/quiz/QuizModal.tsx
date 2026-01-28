"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Brain, Trophy, Loader2, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    topics: string[];
}

export function QuizModal({ isOpen, onClose, topics }: QuizModalProps) {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        if (isOpen && topics.length > 0) {
            generateQuiz();
        } else {
            // Reset state on close
            setQuestions([]);
            setCurrentIndex(0);
            setScore(0);
            setShowResult(false);
            setLoading(true);
        }
    }, [isOpen, topics]);

    const generateQuiz = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topics })
            });
            const data = await res.json();
            if (data.questions) {
                setQuestions(data.questions);
            }
        } catch (error) {
            console.error("Failed to generate quiz", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);

        if (index === questions[currentIndex].correctAnswer) {
            setScore(prev => prev + 1);
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.8 },
                colors: ['#34D399', '#10B981']
            });
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
            if (score > questions.length / 2) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="relative w-full max-w-2xl bg-[#0f1115] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl">
                                <Brain className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">AI Challenge</h3>
                                <p className="text-sm text-slate-400">Testing your weak areas</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                <p className="text-slate-400 animate-pulse">Consulting the AI Neural Net...</p>
                            </div>
                        ) : showResult ? (
                            <div className="text-center py-8 space-y-6">
                                <div className="inline-flex p-4 rounded-full bg-yellow-500/20 mb-4">
                                    <Trophy className="w-16 h-16 text-yellow-400" />
                                </div>
                                <h2 className="text-3xl font-black text-white">
                                    {score === questions.length ? 'Perfect Score!' : 'Quiz Complete!'}
                                </h2>
                                <p className="text-xl text-slate-300">
                                    You scored <span className="text-emerald-400 font-bold">{score}</span> / {questions.length}
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                                >
                                    Done
                                </button>
                            </div>
                        ) : questions.length > 0 ? (
                            <div className="space-y-6">
                                {/* Progress Bar */}
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full transition-all duration-500"
                                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                        Question {currentIndex + 1} of {questions.length}
                                    </span>
                                    <h3 className="text-xl font-medium text-white leading-relaxed">
                                        {questions[currentIndex].question}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {questions[currentIndex].options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            disabled={isAnswered}
                                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group
                                                ${isAnswered
                                                    ? idx === questions[currentIndex].correctAnswer
                                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                                                        : idx === selectedOption
                                                            ? 'bg-rose-500/20 border-rose-500/50 text-white'
                                                            : 'bg-white/5 border-white/5 text-slate-400 opacity-50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200'
                                                }
                                            `}
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                                                    ${isAnswered && idx === questions[currentIndex].correctAnswer ? 'bg-emerald-500 text-white' : 'bg-white/10'}
                                                `}>
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                {option}
                                            </span>
                                            {isAnswered && idx === questions[currentIndex].correctAnswer && (
                                                <Check className="w-5 h-5 text-emerald-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {isAnswered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/30"
                                    >
                                        <p className="text-sm text-indigo-200">
                                            <span className="font-bold">Explanation:</span> {questions[currentIndex].explanation}
                                        </p>
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={nextQuestion}
                                                className="flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                                            >
                                                {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-red-400">Failed to load quiz. Please try again.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
