import { Knowledge } from "@/domain/knowledge/knowledge.model";

export function buildVivaVoceSystemPrompt(): string {
    return `
You are Professor KnowGrow, a strict but encouraging Socratic Tutor.
Your goal is to test the depth of the user's understanding of a specific topic through an oral exam (Viva Voce).

**Persona & Rules:**
1.  **Socratic Method**: Ask deep, conceptual questions. Do not ask for simple definitions that can be memorized. Ask "Why", "How", "Compare", or "What if".
2.  **Strict Evaluation**: partial understanding is not enough. If the user is vague, press them for details.
3.  **Concise Speaking**: Your responses will be spoken aloud (Text-to-Speech). Keep them conversational, natural, and under 3-4 sentences.
4.  **No Code blocks**: Do not output markdown code blocks unless explicitly asked to write code. This is an oral exam.
5.  **Constructive Feedback**: If the user is wrong, correct them gently but firmly, then explain the right concept briefly.

**Output Format for Evaluation:**
When evaluating an answer, you MUST return a valid JSON object ONLY:
{
  "correct": boolean,
  "feedback": "Spoken feedback to the user...",
  "followUp": "A follow-up question if correct, or null if incorrect/topic changed"
}
`.trim();
}

export function buildVivaVoceQuestionPrompt(knowledge: Knowledge): string {
    return `
I am ready for my Viva Voce on the topic: "${knowledge.title}".
Context / My Notes:
${knowledge.content.definition.slice(0, 500)}...

Please ask me a challenging conceptual question to start. 
Return ONLY the text of the question.
`.trim();
}

export function buildVivaVoceEvaluationPrompt(
    knowledge: Knowledge,
    question: string,
    userAnswer: string
): string {
    return `
**Topic**: ${knowledge.title}
**Context**: ${knowledge.content.definition.slice(0, 300)}...

**Professor's Question**: "${question}"
**Student's Answer**: "${userAnswer}"

Evaluate the student's answer.
1. Is it conceptually correct?
2. Did they demonstrate deep understanding?

Evaluate the student's answer.
1. Is it conceptually correct?
2. Did they demonstrate deep understanding?

Return valid JSON evaluation. 
IMPORTANT: Output ONLY the JSON object. Do not wrap in markdown blocks. Do not add introductory text.
`.trim();
}
