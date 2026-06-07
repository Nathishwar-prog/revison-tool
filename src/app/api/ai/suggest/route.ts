import { NextResponse } from "next/server";
import { AIService } from "@/ai/ai.service";
import { getUser } from "@/lib/getUser";
import { db } from "@/lib/db";
import { knowledge } from "@/lib/schema";

function cleanAndParseJSON(jsonStr: string) {
    let cleaned = jsonStr.trim();
    // Remove markdown code blocks if the LLM included them
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { action, title, definition, userAnswer } = await request.json();

        if (action === "suggest-card") {
            if (!title || !title.trim()) {
                return NextResponse.json({ error: "Title is required" }, { status: 400 });
            }

            const aiResponse = await AIService.suggestCardDetails(title);

            if (!aiResponse.success) {
                return NextResponse.json({ error: aiResponse.error || "AI Generation failed" }, { status: 500 });
            }

            try {
                const parsedData = cleanAndParseJSON(aiResponse.content);
                return NextResponse.json({ success: true, data: parsedData });
            } catch (parseError) {
                console.error("Failed to parse AI JSON response:", aiResponse.content, parseError);
                return NextResponse.json({
                    error: "Failed to parse AI response into a valid card structure. Try again.",
                    rawContent: aiResponse.content
                }, { status: 500 });
            }
        }

        if (action === "simplify-definition") {
            if (!definition || !definition.trim()) {
                return NextResponse.json({ error: "Definition is required" }, { status: 400 });
            }

            const aiResponse = await AIService.simplifyDefinition(definition);

            if (!aiResponse.success) {
                return NextResponse.json({ error: aiResponse.error || "AI Simplification failed" }, { status: 500 });
            }

            return NextResponse.json({ success: true, simplified: aiResponse.content.trim() });
        }

        if (action === "evaluate-recall") {
            if (!definition || !definition.trim()) {
                return NextResponse.json({ error: "Definition is required" }, { status: 400 });
            }
            if (!userAnswer || !userAnswer.trim()) {
                return NextResponse.json({ error: "Answer is required" }, { status: 400 });
            }

            const aiResponse = await AIService.evaluateRecall(definition, userAnswer);

            if (!aiResponse.success) {
                return NextResponse.json({ error: aiResponse.error || "AI Evaluation failed" }, { status: 500 });
            }

            try {
                const parsedData = cleanAndParseJSON(aiResponse.content);
                return NextResponse.json({ success: true, evaluation: parsedData });
            } catch (parseError) {
                console.error("Failed to parse AI evaluation JSON response:", aiResponse.content, parseError);
                return NextResponse.json({
                    error: "Failed to parse AI evaluation response. Try again.",
                    rawContent: aiResponse.content
                }, { status: 500 });
            }
        }

        if (action === "voice-note-to-card") {
            if (!userAnswer || !userAnswer.trim()) {
                return NextResponse.json({ error: "Voice transcription content is required" }, { status: 400 });
            }

            const aiResponse = await AIService.suggestCardFromVoiceNote(userAnswer);

            if (!aiResponse.success) {
                return NextResponse.json({ error: aiResponse.error || "AI Generation failed" }, { status: 500 });
            }

            try {
                const parsedData = cleanAndParseJSON(aiResponse.content);
                
                const title = parsedData.title || "Untitled Card";
                const domain = parsedData.domain || "General";
                const technology = parsedData.technology || "General";
                const difficulty = ["Beginner", "Intermediate", "Advanced"].includes(parsedData.difficulty) 
                    ? parsedData.difficulty 
                    : "Intermediate";
                const type = ["concept", "pattern", "tool", "theory"].includes(parsedData.type)
                    ? parsedData.type
                    : "concept";
                const tags = Array.isArray(parsedData.tags) ? parsedData.tags : [];
                
                const content = {
                    definition: parsedData.content?.definition || parsedData.definition || "No definition provided.",
                    simpleExplanation: parsedData.content?.simpleExplanation || parsedData.simpleExplanation || "No explanation provided.",
                    example: parsedData.content?.example || parsedData.example || "",
                    code: parsedData.content?.code || parsedData.code || "",
                    commonMistakes: Array.isArray(parsedData.content?.commonMistakes) ? parsedData.content.commonMistakes : (Array.isArray(parsedData.commonMistakes) ? parsedData.commonMistakes : []),
                    myConfusion: parsedData.content?.myConfusion || parsedData.myConfusion || "",
                };

                const today = new Date().toISOString().split('T')[0];
                const initialRevision = {
                    lastRevised: null,
                    revisionCount: 0,
                    nextRevision: today,
                };

                const [newEntry] = await db.insert(knowledge).values({
                    id: `k${Date.now()}`,
                    userId: user.id,
                    title,
                    domain,
                    technology,
                    difficulty,
                    type,
                    tags,
                    content,
                    confidenceLevel: 3,
                    revision: initialRevision,
                }).returning();

                return NextResponse.json({ success: true, data: newEntry });
            } catch (parseError) {
                console.error("Failed to parse/save voice note card:", aiResponse.content, parseError);
                return NextResponse.json({
                    error: "Failed to format voice note into card structure. Try again.",
                    rawContent: aiResponse.content
                }, { status: 500 });
            }
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("Suggest API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
