'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookOpen, FileText, Wand2, Layers, PlayCircle, Command, Zap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { GenerationCinema } from '@/components/courses/GenerationCinema';

interface Lesson {
    title: string;
    content: string;
    durationSeconds: number;
}

interface Module {
    title: string;
    description: string;
    lessons: Lesson[];
}

interface CourseStructure {
    title: string;
    description: string;
    modules: Module[];
}

export default function CourseImportPage() {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [course, setCourse] = useState<CourseStructure | null>(null);

    const handleGenerate = async () => {
        if (!content.trim()) {
            toast.error('Please enter some content to generate a course.');
            return;
        }

        setIsLoading(true);
        setCourse(null);

        try {
            const response = await fetch('/api/courses/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate course');
            }

            setCourse(data.course);
            toast.success('Course structure generated successfully!');
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 space-y-8 max-w-5xl">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Docs to Course Engine
                </h1>
                <p className="text-muted-foreground text-lg">
                    Transform your messy notes, documentation, or transcripts into a structured learning path using AI.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                {/* Input Section - Magic Studio */}
                <div className="space-y-6 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <Card className="relative border-0 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                        {/* Interactive Header */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-3 text-white">
                                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                        <Sparkles className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <span className="tracking-tight">Knowledge Studio</span>
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-white/5 border-white/10 text-xs font-mono text-zinc-400">
                                        <Command className="w-3 h-3 mr-1" /> RAW
                                    </Badge>
                                </div>
                            </div>
                            <CardDescription className="text-zinc-400 ml-1">
                                Paste your raw chaos. We'll find the order.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="relative group/input">
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-sm opacity-0 group-hover/input:opacity-100 transition duration-500" />
                                <Textarea
                                    placeholder="// Paste your notes, articles, or transcripts here...
// The AI will analyze structure, extract concepts, and build a graph.

# React Hooks Guide
Hooks are functions that let you use state..."
                                    className="relative bg-zinc-950/50 border-white/10 min-h-[400px] font-mono text-sm leading-relaxed resize-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 text-zinc-300 placeholder:text-zinc-700 p-6 rounded-xl transition-all selection:bg-blue-500/30"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                {/* Decorator elements for 'code editor' feel */}
                                <div className="absolute top-4 right-4 text-[10px] text-zinc-700 font-mono pointer-events-none select-none">
                                    TXT_MODE
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className={`
                                    w-full h-14 text-lg font-medium tracking-wide transition-all duration-300 relative overflow-hidden
                                    ${isLoading
                                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                                        : 'bg-white text-black hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white/20'
                                    }
                                `}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="h-4 w-4 bg-blue-500 rounded-full animate-ping" />
                                        <span>ESTABLISHING NEURAL LINK...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <Zap className="h-5 w-5 fill-current" />
                                        <span>INITIATE SEQUENCE</span>
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Output Section */}
                <div className="space-y-6">
                    <Card className={`border-2 shadow-lg h-full transition-all duration-500 ${course ? 'border-primary/20 bg-primary/5' : 'border-dashed border-muted bg-muted/20 opacity-70'}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-primary" />
                                Course Preview
                            </CardTitle>
                            <CardDescription>
                                {course ? 'Here is your structured learning path.' : 'Generated structure will appear here.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!course && !isLoading && (
                                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-4">
                                    <BookOpen className="h-16 w-16 opacity-20" />
                                    <p>Waiting for input...</p>
                                </div>
                            )}

                            {isLoading && (
                                <GenerationCinema />
                            )}

                            {course && (
                                <ScrollArea className="h-[500px] pr-4">
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-primary">{course.title}</h2>
                                            <p className="text-muted-foreground mt-2">{course.description}</p>
                                        </div>

                                        <div className="space-y-4">
                                            {course.modules.map((mod, i) => (
                                                <Card key={i} className="bg-card/50 backdrop-blur border-primary/10 overflow-hidden">
                                                    <div className="bg-primary/10 p-3 border-b border-primary/10 flex items-center justify-between">
                                                        <h3 className="font-semibold flex items-center gap-2">
                                                            <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center p-0">
                                                                {i + 1}
                                                            </Badge>
                                                            {mod.title}
                                                        </h3>
                                                        <Badge variant="outline" className="text-xs">{mod.lessons.length} Lessons</Badge>
                                                    </div>
                                                    <CardContent className="p-4 space-y-3">
                                                        <p className="text-sm text-muted-foreground italic mb-2">{mod.description}</p>
                                                        <div className="space-y-2">
                                                            {mod.lessons.map((lesson, j) => (
                                                                <div key={j} className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/5 transition-colors group cursor-default">
                                                                    <PlayCircle className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                                                                    <div className="flex-1">
                                                                        <div className="text-sm font-medium">{lesson.title}</div>
                                                                        <div className="text-xs text-muted-foreground line-clamp-1 opacity-70">
                                                                            {Math.floor(lesson.durationSeconds / 60)} min read
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
