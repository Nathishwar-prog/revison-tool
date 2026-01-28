import { Knowledge } from '@/domain/knowledge/knowledge.model';

export function buildQuizPrompt(knowledge: Knowledge, questionCount: number = 3): string {
  return `Generate ${questionCount} quiz questions to test understanding of the following concept:

Title: ${knowledge.title}
Domain: ${knowledge.domain}
Technology: ${knowledge.technology}
Difficulty: ${knowledge.difficulty}

Definition: ${knowledge.content.definition}

Code Example: ${knowledge.content.code || 'N/A'}

Common Mistakes to Avoid:
${knowledge.content.commonMistakes.map(m => `- ${m}`).join('\n')}

Generate questions in the following JSON format:
{
  "questions": [
    {
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "..."
    }
  ]
}

Include a mix of conceptual and practical questions appropriate for the ${knowledge.difficulty} level.`;
}

export function buildQuizSystemPrompt(): string {
  return `You are a technical quiz generator. Create challenging but fair questions that test true understanding, not just memorization. Each question should have one clearly correct answer. Explanations should help reinforce learning.`;
}
