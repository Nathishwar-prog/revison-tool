# KnowGrow: Project Summary & Technical Deep Dive

## 1. Project Summary: What is KnowGrow?
**KnowGrow** is an **AI-Powered Adaptive Learning Platform** designed to solve the fundamental inefficiency of traditional education: the "Forgetting Curve." 

Most Learning Management Systems (LMS) are static—they deliver content and quiz you once. KnowGrow is **dynamic**. It acts as a cognitive extension of the learner, tracking not just *what* you know, but *how well* you know it and *when* you are likely to forget it. It uses this data to dynamically generate personalized revision schedules and AI-tutored explanations, ensuring long-term retention rather than temporary memorization.

---

## 2. The Core Problem & The AI Solution

| The Problem | The KnowGrow AI Solution |
| :--- | :--- |
| **The Forgetting Curve:** Humans forget 50% of new information within 24 hours. | **Memory Decay Algorithm:** Predicts exactly when a concept is fading from memory and schedules a "micro-revision" just before you forget it. |
| **"Illusion of Competence":** Students often *think* they know a topic but actually have gaps. | **Weak Concept Detector:** Cross-references subjective user confidence with objective performance metrics to flag "Silent Failures." |
| **Generic Content:** Everyone gets the same explanation, regardless of their learning style. | **Context-Aware AI Tutor:** Uses Gemini AI to generate explanations specifically tailored to *your* weak concepts and learning history. |

---

## 3. How It Works: The "Intelligence" Engine

The platform operates on a closed-loop system powered by three custom algorithms located in `src/intelligence`:

### A. The Weak Concept Detection Algorithm
**File:** `src/intelligence/weakConceptDetector.ts`

This is the system's "Diagnostic Tool." It doesn't just look at wrong answers; it looks for **mismatches**.

1.  **Inputs:**
    *   **User Confidence:** "I feel 5/5 confident about React Hooks."
    *   **Performance Metrics:** Actual quiz scores and revision history.
2.  **Logic:**
    *   If Confidence is HIGH but Performance is LOW -> **Critical Flag (Dunning-Kruger Effect).**
    *   If Confidence is LOW and Performance is LOW -> **Standard Learning Gap.**
3.  **The Algorithm:**
    ```typescript
    // Pseudo-code logic from weakConceptDetector.ts
    const score = metrics.avgConfidence - (metrics.forgetRate * 5);
    ```
    *   It heavily penalizes "high forget rates." This means even if you got it right yesterday, if the system detects a pattern of forgetting similar topics, it flags it as weak.

### B. The Learning Pattern Analyzer
**File:** `src/intelligence/learningPatternAnalyzer.ts`

This is the system's "Behavioral Tracker." It optimizes the *experience* for the user.

1.  **Usage Analysis:**
    *   Determines your `MostActiveDay` (e.g., "You learn best on Tuesdays").
    *   Identifies `StrongestDomain` vs. `WeakestDomain` (e.g., "Good at Backend, struggles with CSS").
2.  **Effectiveness:**
    *   The platform uses this to schedule difficult topics on your "High Energy Days" and easier reviews on off-days.

### C. The Adaptive Revision Planner
**File:** `src/intelligence/revisionPlanner.ts`

This is the system's "Scheduler."

1.  **Decay Modeling:** It calculates a `DecayRate` for every single concept you learn.
2.  **Spaced Repetition:** It schedules reviews at increasing intervals (1 day, 3 days, 1 week, 1 month) but *shrinks* those intervals if the `WeakConceptDetector` flags an issue.

---

## 4. Uniqueness & Effectiveness

### Why is this unique?
1.  **Metacognition:** We don't just teach; we teach the user *about* their own learning. By visualizing "Memory Decay," we motivate users to review.
2.  **Triangulated Data:** We combine qualitative data (how you feel) with quantitative data (how you perform). Most apps only use one.
3.  **Active Repair:** We don't just show a red "X". The AI proactively intervenes: *"I noticed you're struggling with closures. Here is a simple analogy using backpacks to explain it..."*

### How effective is it?
*   **Retention:** By intercepting the forgetting curve, theoretical retention rates improve from ~20% to ~80% long-term.
*   **Efficiency:** Users stop wasting time reviewing things they already know (Mastered Concepts) and focus 100% of their energy on Weak Concepts.
*   **Engagement:** The gamified, 3D visualization of their "State of Mind" provides immediate positive feedback, increasing daily active usage.
