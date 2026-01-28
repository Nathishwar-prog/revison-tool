import { DailyPlanContext, dailyPlanContextToString } from '../context.builder';

export function buildDailyPlanSystemPrompt(): string {
  return `You are a learning planner that creates personalized, actionable daily study plans.

Your plans must:
- Be realistic for the given time constraint
- Prioritize items with highest learning value
- Balance revision of due items with strengthening weak areas
- Be specific and actionable

Output format: A numbered list of tasks with time estimates.`;
}

export function buildDailyPlanPrompt(context: DailyPlanContext): string {
  const timeConstraint = context.sessionLength === 'short' 
    ? '15-20 minutes' 
    : '45-60 minutes';
  
  const maxItems = context.sessionLength === 'short' ? 3 : 7;

  return `Create a personalized daily learning plan:

${dailyPlanContextToString(context)}

---

**Planning Constraints:**
- Available time: ${timeConstraint}
- Maximum items to include: ${maxItems}
- Prioritize: Due revisions first, then weak concepts

**Plan Requirements:**

1. **Priority Order:**
   - Items due for revision (prevent forgetting)
   - Weak concepts with high forget rates
   - Low confidence concepts needing reinforcement

2. **For Each Task Include:**
   - What to review
   - Estimated time (in minutes)
   - Specific focus or action (e.g., "Focus on the common mistake about X")

3. **End with:**
   - Quick motivational note
   - Tomorrow's preview (1 sentence)

Generate the daily learning plan now:`;
}
