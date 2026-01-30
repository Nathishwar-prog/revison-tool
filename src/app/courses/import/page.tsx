'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BookOpen, FileText, Wand2, Layers, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

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
                <div className="space-y-6">
                    <Card className="border-2 border-primary/10 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Input Content
                            </CardTitle>
                            <CardDescription>
                                Paste your raw text, article content, or notes here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="# My React Notes...
                                
React is a JavaScript library for building user interfaces.
Components are the building blocks.
State is how data changes over time..."
                                className="min-h-[400px] font-mono text-sm resize-none focus-visible:ring-primary/20"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing & Structuring...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-2 h-5 w-5" />
                                        Generate Course Structure
                                    </>
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
                                <div className="h-[400px] flex flex-col items-center justify-center text-primary gap-4 animate-pulse">
                                    <Loader2 className="h-12 w-12 animate-spin" />
                                    <p>AI is designing your curriculum...</p>
                                </div>
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
