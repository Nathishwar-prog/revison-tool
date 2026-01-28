import { AIContext } from "./context.builder";

export function buildChatSystemPrompt(): string {
    return `
You are the KnowGrow Study Buddy, an expert learning assistant. 
Your goal is to help users master the knowledge in their library.

Guidelines:
1. Use the provided user knowledge context to answer questions specifically about what they are learning.
2. If comparing concepts, highlight similarities and differences based on their stored definitions.
3. Suggest revision strategies or simplified explanations when they are struggling.
4. Keep responses encouraging, structured, and focused on long-term retention.
5. If they ask about something not in their library, you can answer but try to connect it to their existing knowledge.
6. Use Markdown for formatting (bold, lists, code blocks).
`.trim();
}

export function buildChatUserPrompt(
    message: string,
    allKnowledge: any[],
    history: any[]
): string {
    const knowledgeContext = allKnowledge.map(k => `
- ${k.title} (${k.technology}): ${k.content.definition.slice(0, 150)}...
    `).join('\n');

    return `
**Context (User Library):**
${knowledgeContext}

**User Message:**
${message}
`.trim();
}
