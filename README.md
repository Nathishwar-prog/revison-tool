# KnowGrow - AI-Powered Adaptive Learning Platform

> **Hackathon Submission**: Intelligent, Personalized, and Visual Learning.

KnowGrow is a next-generation Learning Management System (LMS) that uses advanced AI to adapt to your unique learning patterns. It doesn't just track *what* you learn, but *how* you learn, using a custom Memory Decay Algorithm to predict and prevent knowledge gaps.

![Project Status](https://img.shields.io/badge/Status-Review_Ready-success)
![Tech](https://img.shields.io/badge/Tech-Next.js_15_|_Gemini_AI_|_Tailwind-blue)

## 🚀 Key Features

-   **🧠 AI Weak Concept Detector**: Automatically identifies gaps in your knowledge by analyzing confidence levels vs. actual performance.
-   **📉 Memory Decay Prediction**: A custom algorithm that calculates optimized review times to counter the "Forgetting Curve".
-   **🎓 Adaptive Learning Paths**: Real-time course adjustment based on your `LearningPatternAnalyzer` results.
-   **📊 Visual Intelligence**: Interactive charts and 3D dashboards powered by Three.js to visualize your knowledge graph.
-   **💬 Context-Aware AI Tutor**: "Ask AI" feature that knows your entire learning history and specific weak points.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15, React 19, TailwindCSS, Framer Motion
-   **AI & Intelligence**: Gemini Pro (via Vercel AI SDK), Custom logic in `src/intelligence`
-   **3D & Visualization**: Three.js, React Three Fiber, Recharts
-   **Database**: SQLite/PostgreSQL (via Drizzle ORM)
-   **Auth**: Better Auth

## 📂 Project Structure

-   `src/ai`: Core AI Service and Prompt Engineering.
-   `src/intelligence`: **The "Secret Sauce"**. Contains the custom algorithms:
    -   `weakConceptDetector.ts`: Logic for finding knowledge gaps.
    -   `learningPatternAnalyzer.ts`: Meta-analysis of user behavior.
    -   `revisionPlanner.ts`: Spaced repetition scheduler.
-   `src/components/insights`: Visualizations for the AI data.

## 🏃 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Review & Demo

For a step-by-step guide on how to present this project, please see [DEMO_WALKTHROUGH.md](./DEMO_WALKTHROUGH.md).

## 🧩 Algorithms

### Weak Concept Detection
Located in `src/intelligence/weakConceptDetector.ts`, this algorithm triangulates "Low Confidence" and "High Forget Rate" to prioritize concepts that need immediate attention.

### Learning Pattern Analysis
Located in `src/intelligence/learningPatternAnalyzer.ts`, this module extracts meta-data such as your "Most Active Day" and "Strongest Domain" to tailor the UI to your habits.
