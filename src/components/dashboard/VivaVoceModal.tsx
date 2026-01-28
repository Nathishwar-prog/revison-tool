"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Send, Volume2, BookOpen, GraduationCap } from 'lucide-react';
import { Knowledge } from '@/domain/knowledge/knowledge.model';
import { AIService } from '@/ai/ai.service';
import { toast } from 'sonner';

interface VivaVoceModalProps {
    knowledge: Knowledge;
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    role: 'ai' | 'user';
    content: string;
    isCorrect?: boolean; // For user messages evaluated by AI
    feedback?: string;   // Feedback on the answer
}

export function VivaVoceModal({ knowledge, isOpen, onClose }: VivaVoceModalProps) {
    const [status, setStatus] = useState<'intro' | 'listening' | 'processing' | 'speaking' | 'idle'>('intro');
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState<string>("");

    // Voice Refs
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Initial Start
    useEffect(() => {
        if (isOpen && knowledge) {
            startSession();
        }
        return () => {
            stopSpeaking();
            stopListening();
        };
    }, [isOpen, knowledge]);

    const startSession = async () => {
        setStatus('processing');
        setMessages([{ role: 'ai', content: `Hello! I see you've studied "${knowledge.title}". I'm Professor KnowGrow. Let's test your understanding.` }]);

        // Initial Greeting Speak
        speak(`Hello! I see you've studied "${knowledge.title}". I'm Professor KnowGrow. Let's test your understanding.`);

        // Fetch First Question
        const response = await AIService.startVivaVoce(knowledge.id);
        if (response.success) {
            const question = response.content;
            setCurrentQuestion(question);
            setMessages(prev => [...prev, { role: 'ai', content: question }]);
            speak(question, () => setStatus('idle'));
        } else {
            toast.error("Failed to start session");
            setStatus('idle');
        }
    };

    // --- Speech Synthesis (AI Speaking) ---
    const speak = (text: string, onEnd?: () => void) => {
        if (typeof window === 'undefined') return;

        stopSpeaking(); // Stop any previous speech
        setStatus('speaking');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to pick a "Professor" voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google UK English Male") || v.name.includes("Daniel"));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
            if (onEnd) onEnd();
            else setStatus('idle'); // Default return to idle
        };

        window.speechSynthesis.speak(utterance);
        synthRef.current = window.speechSynthesis;
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };

    // --- Speech Recognition (User Speaking) ---
    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Voice input not supported in this browser.");
            return;
        }

        stopSpeaking(); // Ensure AI isn't talking over user

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setStatus('listening');

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0].transcript)
                .join('');
            setCurrentTranscript(transcript);
        };

        recognition.onend = () => {
            // Check if we captured anything final
            if (currentTranscript.trim().length > 0) {
                // Auto-submit if silence detected? Or wait for user?
                // For now, let's keep it manual stop or rely on user pressing send/stop for confirmation
                // Actually, standard behavior is onEnd we have the final result.
                // Let's NOT auto-submit to verify accuracy, or maybe auto-submit for fluid convo?
                // Let's auto-submit for fluidity of "Viva"
                submitAnswer(currentTranscript);
            } else {
                setStatus('idle');
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setStatus('idle');
    };

    const toggleListening = () => {
        if (status === 'listening') stopListening();
        else startListening();
    };

    // --- Interaction Logic ---
    const submitAnswer = async (answer: string) => {
        if (!answer.trim()) return;

        // 1. Add User Answer to UI
        const userMsg: Message = { role: 'user', content: answer };
        setMessages(prev => [...prev, userMsg]);
        setCurrentTranscript("");
        setStatus('processing');

        // 2. Send to AI for Evaluation
        const response = await AIService.evaluateVivaVoce(knowledge.id, currentQuestion, answer);

        if (response.success) {
            try {
                // Parse JSON response
                // The AI might return markdown json block, clean it
                const jsonStr = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
                const evaluation = JSON.parse(jsonStr);

                // 3. Add AI Feedback
                const feedbackMsg: Message = {
                    role: 'ai',
                    content: evaluation.feedback,
                    isCorrect: evaluation.correct
                };
                setMessages(prev => [...prev, feedbackMsg]);

                // Speak Feedback
                speak(evaluation.feedback, () => {
                    // 4. If there is a follow-up, ask it
                    if (evaluation.followUp) {
                        const followUpMsg: Message = { role: 'ai', content: evaluation.followUp };
                        setMessages(prev => [...prev, followUpMsg]);
                        setCurrentQuestion(evaluation.followUp);
                        speak(evaluation.followUp, () => setStatus('idle'));
                    } else {
                        setStatus('idle');
                    }
                });

            } catch (e) {
                console.error("Failed to parse evaluation", e);
                const errorMsg = "I had trouble evaluating that accurately. Let's try another question.";
                setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
                speak(errorMsg);
                setStatus('idle');
            }
        } else {
            toast.error("Professor lost connection...");
            setStatus('idle');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    initial={{ y: 50, scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-950/50">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${status === 'speaking' ? 'bg-indigo-500 animate-pulse' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Viva Voce</h3>
                                <p className="text-xs text-zinc-400 font-medium tracking-wide">
                                    TOPIC: <span className="text-white">{knowledge.title}</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                        <GraduationCap className="h-4 w-4 text-indigo-400" />
                                    </div>
                                )}

                                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-zinc-800 text-white rounded-tr-none'
                                        : 'bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                    {/* Evaluation Badge */}
                                    {msg.role === 'ai' && msg.isCorrect !== undefined && (
                                        <div className={`mt-3 pt-3 border-t ${msg.isCorrect ? 'border-emerald-500/20' : 'border-rose-500/20'} flex items-center gap-2`}>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${msg.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {msg.isCorrect ? '✓ Correct' : '✗ Needs Improvement'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Live Transcript Bubble */}
                        {status === 'listening' && currentTranscript && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-end gap-4"
                            >
                                <div className="max-w-[80%] rounded-2xl p-4 bg-zinc-800/50 text-zinc-400 italic text-sm border border-dashed border-zinc-700">
                                    "{currentTranscript}..."
                                </div>
                            </motion.div>
                        )}

                        {status === 'processing' && (
                            <div className="flex items-center gap-2 text-xs text-zinc-500 ml-12">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75" />
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150" />
                                Professor is thinking...
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="p-6 border-t border-white/5 bg-zinc-900/50 backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleListening}
                                className={`p-4 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg ${status === 'listening'
                                        ? 'bg-rose-500 text-white shadow-rose-500/20 scale-110 animate-pulse'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 shadow-indigo-600/20'
                                    }`}
                            >
                                {status === 'listening' ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                            </button>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitAnswer(currentTranscript);
                                }}
                                className="flex-1 flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={currentTranscript}
                                    onChange={(e) => setCurrentTranscript(e.target.value)}
                                    placeholder={status === 'listening' ? "Listening..." : "Type your answer or speak..."}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600"
                                    disabled={status === 'processing' || status === 'speaking'}
                                />
                                <button
                                    type="submit"
                                    disabled={!currentTranscript.trim() || status === 'processing'}
                                    className="p-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                        <div className="text-center mt-3">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                                AI Socratic Tutor Active • Audio Enabled
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
