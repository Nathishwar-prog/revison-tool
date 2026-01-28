"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, 
    Send, 
    X, 
    Minimize2, 
    Maximize2, 
    Sparkles,
    User,
    Bot,
    Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const StudyBuddy = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ message: userMsg, sessionId })
            });
            const data = await res.json();
            
            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
                if (!sessionId) setSessionId(data.sessionId);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error: " + data.error }]);
            }
        } catch (err) {
            console.error("Chat failed:", err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Failed to connect to the study buddy." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
            >
                <Sparkles className="w-6 h-6" />
                <span className="absolute right-full mr-4 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Ask Study Buddy
                </span>
            </button>
        );
    }

    return (
        <div 
            className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col z-50 transition-all border border-zinc-100 dark:border-zinc-800 overflow-hidden ${isMinimized ? 'h-14' : 'h-[600px] max-h-[calc(100vh-6rem)]'}`}
        >
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">Study Buddy</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded">
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-zinc-50/50 dark:bg-zinc-950/50"
                    >
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                    <Bot className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-900 dark:text-white">Hello! I'm your AI Study Buddy.</p>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[200px]">
                                        Ask me to explain concepts, compare topics, or create a study plan.
                                    </p>
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div 
                                key={i} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-br-none' 
                                            : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-700 rounded-bl-none shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {msg.role === 'user' ? <User className="w-3 h-3 opacity-70" /> : <Bot className="w-3 h-3 text-indigo-500" />}
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                            {msg.role === 'user' ? 'You' : 'Buddy'}
                                        </span>
                                    </div>
                                    <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-bl-none p-4 shadow-sm border border-zinc-100 dark:border-zinc-700">
                                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ask a question..."
                                className="w-full pl-4 pr-12 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-1.5 p-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-50 disabled:bg-zinc-400 transition-all active:scale-90"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-2 text-center italic">
                            Buddy uses your knowledge library as context.
                        </p>
                    </form>
                </>
            )}
        </div>
    );
};
