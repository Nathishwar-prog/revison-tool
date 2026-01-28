"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Send, Volume2, BookOpen, GraduationCap, AudioWaveform, Sparkles } from 'lucide-react';
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
    isCorrect?: boolean;
    feedback?: string;
}

// --- Visual Components ---

const AIOru = ({ status }: { status: string }) => {
    // Orb Animation Variants
    const variants = {
        idle: { scale: 1, opacity: 0.8, filter: "blur(0px)" },
        listening: { scale: [1, 1.1, 1], opacity: 1, filter: "blur(2px)", transition: { repeat: Infinity, duration: 1.5 } },
        processing: { rotate: 360, scale: [1, 0.8, 1.2, 1], filter: "blur(5px)", transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
        speaking: { scale: [1, 1.2, 0.9, 1.3, 1], filter: "blur(4px)", transition: { repeat: Infinity, duration: 0.8 } }
    };

    return (
        <div className="relative flex items-center justify-center w-32 h-32 mb-8">
            {/* Core Orb */}
            <motion.div
                variants={variants}
                animate={status}
                className={`relative z-10 w-24 h-24 rounded-full shadow-[0_0_60px_rgba(79,70,229,0.6)] ${status === 'listening' ? 'bg-gradient-to-r from-rose-500 to-orange-500' :
                        status === 'processing' ? 'bg-gradient-to-br from-violet-600 to-indigo-600' :
                            'bg-gradient-to-tr from-cyan-500 to-blue-600'
                    }`}
            >
                <div className="absolute inset-0 rounded-full mix-blend-overlay opacity-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </motion.div>

            {/* Outer Rings - Only visible when active */}
            {status !== 'idle' && (
                <>
                    <motion.div
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 rounded-full border border-white/20"
                    />
                    <motion.div
                        animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                        className="absolute inset-0 rounded-full border border-white/10"
                    />
                </>
            )}
        </div>
    );
};

export function VivaVoceModal({ knowledge, isOpen, onClose }: VivaVoceModalProps) {
    const [status, setStatus] = useState<'intro' | 'listening' | 'processing' | 'speaking' | 'idle'>('intro');
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState<string>("");

    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        const greeting = `Hello! I'm Professor KnowGrow. Let's explore "${knowledge.title}". Ready?`;
        setMessages([{ role: 'ai', content: greeting }]);
        speak(greeting);

        const response = await AIService.startVivaVoce(knowledge.id);
        if (response.success) {
            const question = response.content;
            setCurrentQuestion(question);
            setMessages(prev => [...prev, { role: 'ai', content: question }]);
            speak(question, () => setStatus('idle'));
        } else {
            toast.error("Professor connection failed.");
            setStatus('idle');
        }
    };

    const speak = (text: string, onEnd?: () => void) => {
        if (typeof window === 'undefined') return;
        stopSpeaking();
        setStatus('speaking');

        const utterance = new SpeechSynthesisUtterance(text);
        // Tune for a more natural pace
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        // Try to find a good deep voice
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
            if (onEnd) onEnd();
            else setStatus('idle');
        };

        window.speechSynthesis.speak(utterance);
        synthRef.current = window.speechSynthesis;
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Browser doesn't support voice input.");
            return;
        }

        stopSpeaking();
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

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
            if (currentTranscript.trim()) submitAnswer(currentTranscript);
            else setStatus('idle');
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

    const submitAnswer = async (answer: string) => {
        if (!answer.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: answer }]);
        setCurrentTranscript("");
        setStatus('processing');

        const response = await AIService.evaluateVivaVoce(knowledge.id, currentQuestion, answer);

        if (response.success) {
            try {
                const jsonStr = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
                const evaluation = JSON.parse(jsonStr);

                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: evaluation.feedback,
                    isCorrect: evaluation.correct
                }]);

                speak(evaluation.feedback, () => {
                    if (evaluation.followUp) {
                        setMessages(prev => [...prev, { role: 'ai', content: evaluation.followUp }]);
                        setCurrentQuestion(evaluation.followUp);
                        speak(evaluation.followUp, () => setStatus('idle'));
                    } else {
                        setStatus('idle');
                    }
                });
            } catch (e) {
                const errorMsg = "I couldn't quite evaluate that. Let's move on.";
                setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
                speak(errorMsg);
                setStatus('idle');
            }
        } else {
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
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
            >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-black/0 to-black/0 pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="relative w-full max-w-4xl h-[85vh] bg-zinc-950/80 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
                >
                    {/* LEFT SIDE: Avatar & Status */}
                    <div className="md:w-1/3 bg-black/40 border-b md:border-b-0 md:border-r border-white/5 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        {/* Ambient Background Glow */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full transition-all duration-1000 ${status === 'listening' ? 'bg-rose-500/20' : ''}`} />

                        <AIOru status={status} />

                        <div className="relative z-10 space-y-2">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Professor KnowGrow</h2>
                            <p className="text-xs font-medium text-indigo-300 uppercase tracking-widest">{status === 'idle' ? 'Ready' : status}</p>
                        </div>

                        <div className="mt-8 relative z-10">
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-[200px]">
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Current Topic</p>
                                <p className="text-sm font-semibold text-white line-clamp-2">{knowledge.title}</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Chat & Interaction */}
                    <div className="flex-1 flex flex-col bg-zinc-900/20 backdrop-blur-sm">
                        {/* Header Actions */}
                        <div className="flex justify-end p-6">
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto px-6 md:px-10 space-y-6 scrollbar-hide">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: msg.role === 'ai' ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-3xl p-5 md:p-6 text-sm md:text-base leading-relaxed shadow-lg ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm'
                                            : 'bg-zinc-800/80 border border-white/5 text-zinc-200 rounded-tl-sm'
                                        }`}>
                                        <p>{msg.content}</p>

                                        {/* Evaluation Result */}
                                        {msg.isCorrect !== undefined && (
                                            <div className={`mt-3 pt-3 border-t ${msg.isCorrect ? 'border-emerald-500/30' : 'border-rose-500/30'} flex items-center gap-2`}>
                                                <div className={`p-1 rounded-full ${msg.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                    {msg.isCorrect ? <Sparkles className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                                                </div>
                                                <span className={`text-xs font-bold uppercase tracking-wider ${msg.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {msg.isCorrect ? 'Excellent logic' : 'Keep trying'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Listening Transcript Ghost Bubble */}
                            <AnimatePresence>
                                {status === 'listening' && currentTranscript && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex justify-end"
                                    >
                                        <div className="max-w-[85%] rounded-3xl rounded-tr-sm p-6 bg-white/5 border border-white/10 text-zinc-400 italic">
                                            {currentTranscript}...
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 md:p-8 bg-gradient-to-t from-black/40 to-transparent">
                            <div className="relative flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleListening}
                                    className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${status === 'listening'
                                            ? 'bg-rose-600 text-white shadow-rose-600/30'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30'
                                        }`}
                                >
                                    {status === 'listening' ? <AudioWaveform className="w-8 h-8 animate-pulse" /> : <Mic className="w-8 h-8" />}
                                </motion.button>

                                <form
                                    onSubmit={(e) => { e.preventDefault(); submitAnswer(currentTranscript); }}
                                    className="flex-1 relative"
                                >
                                    <input
                                        type="text"
                                        value={currentTranscript}
                                        onChange={(e) => setCurrentTranscript(e.target.value)}
                                        placeholder={status === 'listening' ? "Listening to your brilliant answer..." : "Type your answer..."}
                                        className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 pl-6 pr-14 text-white placeholder:text-zinc-600 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all shadow-inner"
                                        disabled={status === 'processing' || status === 'speaking'}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!currentTranscript.trim() || status === 'processing'}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-zinc-400 hover:text-white transition-colors disabled:opacity-0"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                            <div className="text-center mt-4">
                                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                    <Volume2 className="w-3 h-3" /> Voice Output Active
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
