import { NextResponse } from "next/server";
import { AIService } from "@/ai/ai.service";
import { db } from "@/lib/db";
import { chatSessions, chatMessages } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message, sessionId } = await request.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        let currentSessionId = sessionId;

        // If no session, create one
        if (!currentSessionId) {
            const [newSession] = await db.insert(chatSessions).values({
                userId: user.id,
                title: message.slice(0, 50) + "..."
            }).returning();
            currentSessionId = newSession.id;
        }

        // Store user message
        await db.insert(chatMessages).values({
            sessionId: currentSessionId,
            role: 'user',
            content: message
        });

        // Get AI response
        const aiResponse = await AIService.studyBuddyChat(message);

        if (aiResponse.success) {
            // Store AI response
            await db.insert(chatMessages).values({
                sessionId: currentSessionId,
                role: 'assistant',
                content: aiResponse.content
            });
        }

        return NextResponse.json({
            sessionId: currentSessionId,
            response: aiResponse.content,
            success: aiResponse.success,
            error: aiResponse.error
        });
    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            // Return all sessions for user
            const sessions = await db.query.chatSessions.findMany({
                where: eq(chatSessions.userId, user.id),
                orderBy: [asc(chatSessions.createdAt)]
            });
            return NextResponse.json(sessions);
        }

        // Return messages for session
        const messages = await db.query.chatMessages.findMany({
            where: eq(chatMessages.sessionId, sessionId),
            orderBy: [asc(chatMessages.createdAt)]
        });

        return NextResponse.json(messages);
    } catch (error: any) {
        console.error("Chat GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
