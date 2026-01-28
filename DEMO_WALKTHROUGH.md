# KnowGrow Agentic Learning Platform - Demo Walkthrough

## 1. Introduction (1 Minute)
**Script:**
"Good morning/afternoon. Today I am presenting **KnowGrow**, an intelligent learning platform that doesn't just deliver content, but actively adapts to how you learn. Unlike traditional LMS which are static, KnowGrow detects your weak concepts and predicts memory decay to ensure you actually *retain* what you learn."

**Key Highlight:**
- **Goal:** Solve the "Forgetting Curve" in education.
- **Tech Stack:** Next.js 15, Gemini AI, TailwindCSS, Three.js (for immersive UI).

---

## 2. The "Start to End" Workflow Demo (4 Minutes)

### Step 1: Immersion (Landing Page)
*Action: Open the Home Page.*
- **Showcase:** The "Floating Island" Navbar and 3D Globe visualization.
- **Talking Point:** "We focused on a premium, immersive design to keep learners engaged from the start. The UI feels 'alive' with micro-interactions."

### Step 2: Onboarding & Dashboard
*Action: Click 'Login' / 'Get Started' -> Navigate to Dashboard.*
- **Showcase:** The Dashboard layout.
- **Talking Point:** "This is the control center. It's not just a list of courses. It's a real-time view of my cognitive state."

### Step 3: AI-Driven Learning (The Core Loop)
*Action: Click on a Topic/Course -> 'Start Learning'.*
- **Showcase:** The Learning Interface.
- **Action:** Simulate answering a question or marking a concept as "Confusing".
- **Talking Point:** "As I interact, the system records everything. Not just 'Pass/Fail', but confidence levels and time taken."

### Step 4: Visualizing Intelligence (The "New Feature")
*Action: Navigate to 'Insights' / 'AI Brain' tab.*
- **Showcase:** The `AILearningInsights` component (Weak Concepts panel, Charts).
- **Talking Point:** "This is where the magic happens. Our algorithm visualizes my 'Knowledge Graph'. It highlights exactly what I'm about to forget."

### Step 5: Adaptive Correction
*Action: Click 'Resolve Weak Concepts' or 'Ask AI'.*
- **Showcase:** The AI Chat/Explanation interface.
- **Talking Point:** "The system doesn't just flag errors; it actively repairs them. I can ask the AI to explain *specifically* the parts I didn't understand, using the context of my previous mistakes."

---

## 3. Uniqueness & New Features

1.  **Memory Decay Algorithm:**
    -   *Standard feature:* "Review this."
    -   *Our Uniqueness:* "Review this *today* because our decay model predicts you will forget it by tomorrow."
2.  **Weak Concept Detection:**
    -   Automatically triangulates low confidence + high error rates to pinpoint "Concept Gaps" rather than just "Wrong Answers".
3.  **Visual Intelligence:**
    -   3D Data representation of your knowledge state (Three.js integration).

---

## 4. Deep Dive: The Algorithm (Technical Review)
*Open VS Code and show `src/intelligence/weakConceptDetector.ts`*

**Explanation for Reviewers:**
"We built a custom intelligence engine, not just a wrapper around OpenAI. Here is the `detectWeakConcepts` algorithm:"

```typescript
// src/intelligence/weakConceptDetector.ts

export function detectWeakConcepts(knowledge: Knowledge[], history: RevisionHistory[]) {
  // ...
  // CORE LOGIC:
  // We combine TWO independent signals:
  // 1. User Confidence (Self-reported)
  // 2. Memory Decay Rate (Calculated from historical performance)

  const scoreA = a.metrics.avgConfidence - a.metrics.forgetRate * 5;
  // We penalize the score heavily based on forget rate.
  // This prioritizes "Silent Failures" -> things you THINK you know but are forgetting.
}
```

*Show `src/intelligence/learningPatternAnalyzer.ts`*
"We also analyze *meta-patterns*—like knowing which day of the week you learn best (`mostActiveDay`) and your preferred difficulty level."

---

## 5. Conclusion
"KnowGrow transforms learning from a passive activity into an active, AI-guided conversation. It knows what you don't navigate, and helps you fix it before you even realize you're struggling."
