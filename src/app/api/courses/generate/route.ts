import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/ai/ai.service';
import { courses, courseModules, courseLessons } from '@/lib/schema';
// import { db } from '@/lib/db'; // Assuming db is exported from here
// We need to verify where 'db' is. I'll search for it later. For now, I'll mock the DB save or just return JSON.
// The task is to just return the structure first.

export const maxDuration = 60; // Allow longer timeout for generation

export async function POST(req: NextRequest) {
    try {
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const aiResponse = await AIService.generateCourseStructure(content);

        if (!aiResponse.success) {
            return NextResponse.json({ error: aiResponse.error }, { status: 500 });
        }

        // Parse the JSON
        let courseData;
        try {
            courseData = JSON.parse(aiResponse.content);
        } catch (e) {
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        return NextResponse.json({ course: courseData });

    } catch (error) {
        console.error('Course generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

    }
}
