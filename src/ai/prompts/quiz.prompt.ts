import { AIContext, contextToString } from '../context.builder';

export function buildQuizSystemPrompt(): string {
  return `You are a quiz generator that creates personalized practice questions targeting the learner's weak areas.

Your quizzes must:
- Focus on areas where the user struggles (documented confusion, common mistakes)
- Progress from easy to hard
- Include clear explanations for each answer
- Test understanding, not memorization

Output format: Valid JSON array of questions.`;
}

export function buildQuizPrompt(context: AIContext, questionCount: number = 5): string {
  const focusAreas = buildFocusAreas(context);
  
  return `Generate ${questionCount} personalized quiz questions for:

${contextToString(context)}

---

**Focus Areas for This User:**
${focusAreas}

**Difficulty Distribution:**
- 2 Easy questions (foundational understanding)
- ${Math.max(1, questionCount - 4)} Medium questions (application)
- 2 Hard questions (edge cases, advanced scenarios)

**Output Format (strict JSON):**
{
  "questions": [
    {
      "id": 1,
      "difficulty": "easy" | "medium" | "hard",
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "explanation": "...",
      "targetedWeakness": "optional - which weakness this addresses"
    }
  ]
}

Generate the quiz now:`;
}

function buildFocusAreas(context: AIContext): string {
  const areas: string[] = [];
  
  if (context.myConfusion) {
    areas.push(`- User's documented confusion: "${context.myConfusion}"`);
  }
  
  if (context.commonMistakes.length > 0) {
    areas.push(`- Common mistakes to test: ${context.commonMistakes.join('; ')}`);
  }
  
  if (context.forgetRate > 0.3) {
    areas.push(`- High forget rate (${(context.forgetRate * 100).toFixed(0)}%): Include recall-focused questions`);
  }
  
  if (context.confidenceLevel <= 2) {
    areas.push('- Low confidence: Include foundational concept checks');
  }
  
  if (areas.length === 0) {
    areas.push('- General comprehension and application');
  }
  
  return areas.join('\n');
}
