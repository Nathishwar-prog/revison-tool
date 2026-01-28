
// import { QuizContext } from "../context.builder";


export function buildTopicQuizSystemPrompt(): string {
  return `You are an expert tutor creating a "Pop Quiz" to test the user's understanding of specific weak topics.
Your goal is to identifying gaps in their knowledge through challenging but fair multiple-choice questions.

Output Rules:
- Return ONLY valid JSON.
- No markdown formatting (like \`\`\`json).
- The JSON structure must be:
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": number (0-3),
      "explanation": "string (why the correct answer is right)"
    }
  ]
}`;
}

export function buildTopicQuizPrompt(topics: string[], count: number = 5): string {
  return `Create a ${count}-question multiple-choice quiz focusing on these topics:
${topics.map(t => `- ${t}`).join('\n')}

- Questions should test understanding, not just memorization.
- Difficulty: Intermediate to Advanced.
- Ensure only one correct answer per question.
`;
}
