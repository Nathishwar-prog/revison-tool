# V4 MVP Architecture: AI Personalization Layer

## Problem Solved

Users lack personalized guidance on **what to learn**, **why they struggle**, and **how to improve**. V4 adds an AI layer that analyzes knowledge content, confidence trends, forget rates, and revision history to provide context-aware, actionable learning suggestions—without mutating any domain data.

## Data Model

### AI Context (Read-Only Input)
```
AIContext {
  title: string
  definition: string
  simpleExplanation: string
  commonMistakes: string
  myConfusion: string
  confidenceLevel: number (1-5)
  forgetRate: number (0-1)
  revisionCount: number
  lastRevisedDate: string | null
}
```

### AI Features
| Feature | Input | Output |
|---------|-------|--------|
| Smart Summary | Knowledge + confidence | Depth-adapted summary |
| Quiz Generator | Knowledge + mistakes | 5-10 mixed-difficulty questions |
| Explain Weakness | Forget rate + confusion | Why struggling + what to focus |
| Daily Plan | Due revisions + weak concepts | Actionable learning schedule |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer                           │
│  [Ask AI Button] → [AskAIModal] → [Read-Only Display]   │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              Personalization Engine                      │
│  personalization.engine.ts + ai.selectors.ts            │
│  - Orchestrates AI features                             │
│  - Selects knowledge for AI context                     │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   AI Service                            │
│  ai.service.ts                                          │
│  - Centralized AI calls                                 │
│  - Provider abstraction (OpenAI/mock)                   │
│  - Graceful fallback on failure                         │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                Context Builder                          │
│  context.builder.ts                                     │
│  - Transforms Knowledge → AIContext                     │
│  - Strips internal IDs, UI state                        │
│  - Sanitizes for prompt injection                       │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   Prompts                               │
│  summary.prompt.ts | quiz.prompt.ts                     │
│  explainWeak.prompt.ts | dailyPlan.prompt.ts            │
└─────────────────────────────────────────────────────────┘
```

## Safety Guarantees

| Rule | Enforcement |
|------|-------------|
| AI is READ-ONLY | No write methods in AI service |
| No domain mutation | Context builder creates copies |
| No repository access | AI layer has no repo imports |
| Suggestions only | UI displays text, no action buttons |
| Graceful degradation | Try-catch with fallback messages |

## File Structure

```
src/
├─ ai/
│   ├─ ai.service.ts
│   ├─ context.builder.ts
│   └─ prompts/
│       ├─ summary.prompt.ts
│       ├─ quiz.prompt.ts
│       ├─ explainWeak.prompt.ts
│       └─ dailyPlan.prompt.ts
├─ personalization/
│   ├─ personalization.engine.ts
│   └─ ai.selectors.ts
└─ components/
    └─ AskAIModal.tsx
```
