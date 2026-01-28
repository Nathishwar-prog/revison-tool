import { AIContext, contextToString } from '../context.builder';

export function buildSummarySystemPrompt(): string {
  return `You are a personalized learning assistant that creates adaptive summaries based on the learner's current understanding.

Your summaries must:
- Adapt depth based on confidence level
- Highlight areas where the user has documented confusion
- Reinforce concepts the user tends to forget
- Be actionable and memorable

Output format: Plain text paragraphs, no markdown headers.`;
}

export function buildSummaryPrompt(context: AIContext): string {
  const depth = getDepthInstruction(context.confidenceLevel);
  
  return `Generate a personalized summary for the following concept:

${contextToString(context)}

---

**Summary Requirements:**
${depth}

${context.myConfusion ? `**Address this specific confusion:** "${context.myConfusion}"` : ''}

${context.forgetRate > 0.3 ? `**Note:** This user has a high forget rate (${(context.forgetRate * 100).toFixed(0)}%) for this concept. Include memory anchors and mnemonics.` : ''}

${context.commonMistakes.length > 0 ? `**Warn about these common pitfalls:** ${context.commonMistakes.join(', ')}` : ''}

Provide the summary now:`;
}

function getDepthInstruction(confidenceLevel: number): string {
  if (confidenceLevel <= 2) {
    return `- DETAILED summary required (user has low confidence)
- Break down into fundamental components
- Use simple analogies and real-world comparisons
- Include step-by-step explanations
- Provide concrete examples`;
  }
  
  if (confidenceLevel === 3) {
    return `- BALANCED summary required (user has moderate confidence)
- Cover key concepts with moderate depth
- Include 1-2 practical examples
- Connect to related concepts`;
  }
  
  return `- CONCISE summary required (user has high confidence)
- Focus on key takeaways and edge cases
- Highlight advanced nuances
- Keep it brief and efficient for quick review`;
}
