"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mic, MicOff, Sparkles, Loader2, CheckCircle, 
  Eye, Edit3, Plus, ArrowRight, BookOpen, Layers, Terminal 
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ApiAdapter } from '@/data/adapters/api.adapter';


interface VoiceIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VoiceIngestionModal({ isOpen, onClose, onSuccess }: VoiceIngestionModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdCard, setCreatedCard] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll transcript textarea to bottom as text stream comes in
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollTop = transcriptEndRef.current.scrollHeight;
    }
  }, [transcript]);

  // Clean up recording on unmount or close
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recording is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsRecording(true);
      toast.success("Voice capture active. Speak now...");
    };

    rec.onresult = (event: any) => {
      const current = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setTranscript(current);
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech') {
        toast.error(`Recording error: ${event.error}`);
        setIsRecording(false);
      }
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleIngest = async () => {
    if (!transcript.trim()) {
      toast.error("Please record or type some text first.");
      return;
    }

    stopRecording();
    setIsLoading(true);

    try {
      const result = await ApiAdapter.post('/ai/suggest', {
        action: 'voice-note-to-card',
        userAnswer: transcript
      });

      setCreatedCard(result.data);
      toast.success("Draft card created and saved directly to your Garden!");
      onSuccess(); // Refresh the list in the dashboard
    } catch (error: any) {
      console.error("Voice ingestion error:", error);
      toast.error(error.message || "An error occurred while generating the card.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCreatedCard(null);
    setTranscript("");
    setIsRecording(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-8"
      >
        {/* Background glow animation */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black/0 to-black/0 pointer-events-none" />

        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Voice Ingestion</h2>
                <p className="text-xs text-zinc-500">Narrate what you learned to instantly spawn cards</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Wrapper */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* STAGE 1: Record & Transcript Input */}
            {!isLoading && !createdCard && (
              <div className="space-y-6">
                
                {/* Visual Mic Ripple / Pulsing Area */}
                <div className="flex flex-col items-center justify-center py-6 relative">
                  
                  {/* Ripple Rings */}
                  <div className="absolute w-40 h-40 flex items-center justify-center pointer-events-none">
                    <AnimatePresence>
                      {isRecording && (
                        <>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0.5 }}
                            animate={{ scale: 1.8, opacity: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full bg-indigo-500/20 border border-indigo-500/40"
                          />
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0.6 }}
                            animate={{ scale: 1.4, opacity: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full bg-indigo-500/15 border border-indigo-500/30"
                          />
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Pulsing Mic Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleRecording}
                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl border ${
                      isRecording 
                        ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30 scale-105' 
                        : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 hover:border-indigo-400 shadow-indigo-600/30'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-10 h-10 animate-pulse" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                  </motion.button>

                  <span className="mt-4 text-xs font-mono uppercase tracking-widest text-zinc-500 animate-pulse">
                    {isRecording ? "Recording active • Click to pause" : "Click to start recording"}
                  </span>
                </div>

                {/* Live Edit Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Transcribed learning note
                  </label>
                  <textarea
                    ref={transcriptEndRef}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Start recording to see live transcription, or type your learning note here directly..."
                    className="w-full h-36 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none font-medium leading-relaxed shadow-inner"
                  />
                </div>

                {/* Process Button */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    disabled={!transcript}
                    className="px-5 py-2.5 rounded-xl border border-zinc-800 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-50 transition-all"
                  >
                    Clear Note
                  </button>
                  <button
                    onClick={handleIngest}
                    disabled={!transcript.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Ingest Card
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2: AI Generating Loader */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="relative flex items-center justify-center w-20 h-20">
                  <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-75" />
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
                <div className="text-center space-y-2 max-w-sm">
                  <h3 className="text-lg font-bold text-white">Structuring Card Details</h3>
                  <p className="text-sm text-zinc-500">
                    AI is analyzing your spoken text to generate the title, definition, simple analogies, examples, code, and common mistakes...
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 3: Success and Structured Preview */}
            {createdCard && (
              <div className="space-y-6">
                {/* Success Banner */}
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Successfully Ingested</p>
                    <p className="text-xs text-emerald-500/80">
                      The concept has been formatted and added directly into your Knowledge Garden database!
                    </p>
                  </div>
                </div>

                {/* Structured Card Preview */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-xl">
                  {/* Card Title & Meta Badges */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-zinc-800 text-zinc-400">
                        {createdCard.type || "concept"}
                      </span>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {createdCard.difficulty || "Intermediate"}
                      </span>
                      {createdCard.domain && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {createdCard.domain}
                        </span>
                      )}
                      {createdCard.technology && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {createdCard.technology}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {createdCard.title}
                    </h3>
                  </div>

                  {/* Definition */}
                  <div className="space-y-2 border-t border-zinc-900 pt-4">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Definition
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                      {createdCard.content?.definition}
                    </p>
                  </div>

                  {/* Simple Explanation / ELI5 */}
                  <div className="space-y-2 border-t border-zinc-900 pt-4">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> ELI5 (Explain Like I'm Five)
                    </h4>
                    <p className="text-sm text-zinc-400 leading-relaxed italic">
                      "{createdCard.content?.simpleExplanation}"
                    </p>
                  </div>

                  {/* Code Snippet (Optional) */}
                  {createdCard.content?.code && (
                    <div className="space-y-2 border-t border-zinc-900 pt-4">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                        <Terminal className="w-3.5 h-3.5" /> Syntax / Demonstration
                      </h4>
                      <pre className="bg-black/60 border border-zinc-900 rounded-xl p-4 text-xs text-zinc-300 font-mono overflow-x-auto leading-relaxed max-w-full">
                        <code>{createdCard.content.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Tags */}
                  {createdCard.tags && createdCard.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-t border-zinc-900 pt-4">
                      {createdCard.tags.map((t: string) => (
                        <span key={t} className="text-xs text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-900 font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-800 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all order-3 sm:order-1"
                  >
                    <Plus className="w-4 h-4" />
                    Record Another
                  </button>
                  <Link
                    href={`/knowledge/${createdCard.id}/edit`}
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-800 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all order-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit card
                  </Link>
                  <Link
                    href={`/knowledge/${createdCard.id}`}
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all order-1 sm:order-3"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
