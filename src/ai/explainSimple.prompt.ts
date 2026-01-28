import { Knowledge } from '@/domain/knowledge/knowledge.model';

export function buildExplainSimplePrompt(knowledge: Knowledge): string {
  return `Explain the following technical concept as if explaining to a complete beginner with no technical background:

Title: ${knowledge.title}
Technology: ${knowledge.technology}

Technical Definition: ${knowledge.content.definition}

Current Simple Explanation: ${knowledge.content.simpleExplanation}

Provide an even simpler explanation using:
1. Everyday analogies
2. No technical jargon
3. Real-world examples
4. Step-by-step breakdown if applicable

Make it memorable and easy to understand for someone who has never programmed before.`;
}

export function buildExplainSimpleSystemPrompt(): string {
  return `You are a patient teacher who excels at explaining complex technical concepts in simple terms. Use analogies, stories, and everyday examples. Avoid jargon completely. Your goal is to make the concept click for someone with zero technical background.`;
}
