import { Knowledge } from '@/domain/knowledge/knowledge.model';

export const buildGapHunterSystemPrompt = (): string => {
    return `You are a Knowledge Expert and Mentoring AI.
Your goal is to analyze a student's current knowledge graph and identify "Gaps" - missing concepts that are critical for a holistic understanding of their domains.

Output must be a JSON object:
{
  "gaps": [
    {
      "concept": "Name of missing concept",
      "domain": "Domain (e.g., React, Physics)",
      "reason": "Why this is critical given what they already know",
      "prerequisites": ["List of existing nodes they have that relate to this"]
    }
  ],
  "recommendations": [
    {
      "action": "Brief action item (e.g., 'Learn about useEffect')",
      "priority": "High" | "Medium" | "Low"
    }
  ]
}

Rules:
1. **Contextual**: Only suggest gaps relevant to the domains present in the input. Don't suggest "Cooking" if they are learning "Coding".
2. **Specific**: Suggest concrete concepts (e.g., "Event Loop") rather than broad topics (e.g., "Advanced JS").
3. **Prerequisites**: Link back to what they already know.
`;
};

export const buildGapHunterPrompt = (knowledge: Knowledge[]): string => {
    const context = knowledge.map(k => `- ${k.title} (Domain: ${k.domain}, Confidence: ${k.confidenceLevel}/5)`).join('\n');

    return `Analyze my current knowledge base and find gaps:

${context}

What am I missing to become an expert?`;
};
