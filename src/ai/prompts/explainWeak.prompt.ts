import { AIContext, contextToString } from '../context.builder';

export function buildExplainWeakSystemPrompt(): string {
  return `You are a learning coach that helps users understand WHY they struggle with certain concepts and provides actionable strategies to overcome their weaknesses.

Your explanations must:
- Be empathetic and encouraging
- Identify root causes of confusion
- Provide specific, actionable steps
- Include concrete examples and analogies

Output format: Structured text with clear sections.`;
}

export function buildExplainWeakPrompt(context: AIContext): string {
  return `Analyze why this user might be struggling and provide personalized guidance:

${contextToString(context)}

---

**Analysis Request:**

Based on the learning metrics and documented information:

1. **Why You Might Be Struggling:**
   - Analyze the forget rate: ${(context.forgetRate * 100).toFixed(0)}%
   - Consider the confidence level: ${context.confidenceLevel}/5
   - Review documented confusion: "${context.myConfusion || 'None documented'}"
   - Consider common mistakes: ${context.commonMistakes.join(', ') || 'None documented'}

2. **What to Focus On:**
   - Identify the most critical gaps
   - Prioritize what will have the biggest impact

3. **Concrete Action Steps:**
   - Provide 3-5 specific things the user can do
   - Include practice exercises or thought experiments

4. **Memory Anchors:**
   - Suggest mnemonics or analogies
   - Connect to concepts they might already know

Provide your personalized analysis now:`;
}
