# MINI PROJECT REPORT: Knowledge Garden AI (KnowGrow)

---

## 1. PROJECT BASIC DETAILS

* **Project Title:** Knowledge Garden AI (KnowGrow)
* **Domain:** Educational Technology (EdTech) & Artificial Intelligence
* **Problem Domain:** Cognitive retention challenges, static learning methodologies, and the "Illusion of Competence" in traditional Learning Management Systems.
* **Target Users:** Students, self-taught developers, professionals upskilling, and lifelong learners.
* **Technologies Used:**
  * **Frontend:** Next.js 15, React 19, Tailwind CSS, Three.js (3D visualizations), Framer Motion (micro-interactions).
  * **Backend:** Node.js, Next.js API Routes, Drizzle ORM.
  * **AI Integration:** Gemini-pro (via Vercel AI SDK / OpenRouter).
  * **Database:** PostgreSQL (Neon DB).

---

## 2. ABSTRACT

Traditional Learning Management Systems operate statically, uniformly delivering content without tracking long-term cognitive retention. This often results in accelerated memory decay and the phenomenon known as the "Illusion of Competence," where learners falsely believe they have mastered a topic. This project, **Knowledge Garden AI (KnowGrow)**, proposes a dynamic, metacognitive learning platform acting as a cognitive extension of the user. Powered by a custom Intelligence Engine utilizing the Ebbinghaus Forgetting Curve and Spaced Repetition System (SRS), the platform tracks not only *what* a user learns, but *how well* they retain it. By integrating Generative AI (Gemini-pro) with historical user analytics, KnowGrow dynamically schedules micro-revisions, detects silent failures, and provides highly contextual AI tutoring, resulting in enhanced long-term memory retention and a highly personalized learning trajectory.

---

## 3. INTRODUCTION

### Purpose
To build an adaptive learning platform that serves as a cognitive extension of the learner, prioritizing long-term memory retention and conceptual mastery over simple task completion.

### Problem Statement
Modern digital learning platforms suffer from a significant disconnect between content delivery and knowledge retention. Static LMS environments fail to personalize review schedules, ignore metacognitive behavioral patterns, and do not address the rapid memory decay associated with passive learning.

### Motivation
The project is deeply motivated by cognitive psychology models, specifically the **Ebbinghaus Forgetting Curve**, which dictates exponential memory loss without active recall, and the **Dunning-Kruger Effect**, which highlights the discrepancy between user confidence and actual competence.

### Objectives
* To implement a dynamic Spaced Repetition System (SRS) that individualizes revision schedules.
* To develop an algorithmic Weak Concept Detector that mathematically identifies "Silent Failures."
* To provide an immersive 3D knowledge visualization interface (Cognitive Dashboard).
* To utilize Generative AI to offer highly contextual, customized tutoring based on individual learning histories.

---

## 4. LITERATURE SURVEY

| Researchers / Year | Existing System / Concept | Description | Limitations |
| :--- | :--- | :--- | :--- |
| **Ahn et al., 2012** | Duolingo (Gamified Learning) | Implements gamification to enhance engagement in language learning. | Focuses heavily on gamified streaks rather than deep, complex technical concept mapping. |
| **Elmes, 2006** | Anki (SRS Flashcards) | A highly effective flashcard algorithm based on active recall and spaced repetition. | Purely manual creation; lacks contextual AI explanations or adaptive course structures. |
| **Seaton et al., 2015** | Coursera / edX MOOC Models | High-quality, mass-distributed video courses from top universities. | Static delivery, "one-size-fits-all" pacing, leading to notorious drop-off rates and poor retention. |
| **Graesser et al., 2020** | Intelligent Tutoring Systems (ITS) | Rule-based systems designed to mimic human tutors in providing immediate feedback. | Traditionally rigid, hard to scale across diverse domains without the flexibility of modern Large Language Models (LLMs). |

---

## 5. SYSTEM ANALYSIS

### Existing System
Current systems (e.g., Moodle, Canvas) represent a linear progression model: users watch a video, take a quiz, and receive a single grade.
**Disadvantages:**
* No tracking of knowledge degradation over time.
* Cannot differentiate between learners who barely passed and those who mastered the concept.
* Leaves the "Illusion of Competence" unchecked.
* Offers generic AI features (if any) without incorporating user-specific historical learning data.

### Proposed System (Knowledge Garden)
KnowGrow introduces a continuous "Course + Quiz + Doubt solving" loop managed by an algorithmic Intelligence Engine. 
**Advantages:**
* **Dynamic Scheduling:** Continuously adapts the revision planner based on daily calculation of memory decay.
* **Silent Failure Detection:** Cross-references subjective user-reported confidence with mathematically extracted forget rates.
* **Data-Injected AI:** AI tutors do not give generic answers; they formulate explanations based on the user's previously logged weaknesses and strengths.

---

## 6. SYSTEM REQUIREMENTS

### Hardware Requirements
* **Processor:** Minimum Intel Core i5 / AMD Ryzen 5 or equivalent.
* **RAM:** 8 GB Minimum (16 GB Recommended for development).
* **Storage:** 20 GB available SSD space.
* **Internet:** Broadband connection for API queries and PostgreSQL syncing.

### Software Requirements
* **Operating System:** Windows 10/11, macOS, or Linux.
* **Runtime:** Node.js (v18+) and npm/pnpm.
* **Web Browser:** Modern browser matching ES6 standards (Chrome, Edge, Firefox, Safari).
* **Database:** PostgreSQL (Cloud-hosted via Neon DB).
* **API Keys:** Google Gemini / OpenRouter API Key.

---

## 7. SYSTEM DESIGN

### System Architecture
KnowGrow operates on a modern Client-Server App architecture augmented by an AI Middleware layer. The Next.js client renders complex 3D visualizations and captures micro-interactions (time taken, confidence scores). This data routes to backend API endpoints, which write to the PostgreSQL database via Drizzle ORM. The Intelligence Engine routinely analyzes this data, structuring customized AI prompts which are piped through the Vercel AI SDK to Gemini-pro.

### Modules
1. **AI Brain (Intelligence Engine):** Houses the Memory Decay and Weak Concept Detection mathematical models.
2. **LMS Core:** Manages Course, Module, and Lesson hierarchies.
3. **Recommendation Engine:** The Adaptive Revision Planner matrix.
4. **Insights Dashboard:** The user-facing metacognitive reflection interface.
5. **Generative AI Suite:** Contains Context Builders, Quiz Generators, and the Virtual Tutor.

### Data Flow
`User Quiz Input` ➔ `Log Confidence & Time` ➔ `Database (revisionHistory)` ➔ `Memory Decay Algo` ➔ `Update UserKnowledgeState` ➔ `Context Builder` ➔ `Gemini LLM` ➔ `Personalized UI Response`

### User Interaction Flow
User logs in ➔ Views 3D Dashboard highlighting cognitive status ➔ AI Planner suggests daily Critical/High tasks ➔ User takes a targeted quiz or course ➔ User provides subjective "Confidence" rating ➔ System recalculates Forget Rate and schedules next session.

---

## 8. SYSTEM IMPLEMENTATION

### List of Modules & Detailed Description

*   **AI Brain (Spaced Repetition & Models):**
    *   Evaluates knowledge retention dynamically using the `forgetRate` parameter (calculated from drops in confidence between revisions).
    *   Employs the **Learning Pattern Analyzer** to extract meta-behavioral data (e.g., active days, domain strengths).
*   **Course Generator:**
    *   Takes raw syllabus strings and utilizes generative AI to output heavily structured JSON-based course hierarchies.
*   **Quiz Engine:**
    *   Context-aware dynamic generation. Uses `WeakConcepts` metadata to specifically target areas the user struggles with.
*   **Recommendation System (Revision Planner):**
    *   Sorts daily tasks into a Priority Matrix: `Critical` (>7 days overdue + Weak), `High` (>7 days overdue OR Weak), `Medium` (>0 days overdue), and `Low` (Scheduled for today).
*   **Insights Dashboard:**
    *   Utilizes Three.js to render a 3D visualization of the user's "Knowledge Graph," providing an explicit psychological feedback loop to help users understand their learning state.

---

## 9. SOFTWARE DESCRIPTION

### Overview
KnowGrow is engineered as an immersive, highly interactive web application. The frontend completely replaces sluggish top-navigation with a responsive, Apple-style animated dock. 

### Key Features
*   **Viva Voce Voice Examiner:** A conversational AI interface capable of conducting oral examinations to test conceptual depth.
*   **Personalized Summarizer:** Generates study notes purposefully tailored to emphasize historical weak points.
*   **Explain My Weakness:** AI acts as a targeted tutor, using analogies mapped to the user’s "strongest domains."

### AI Model Explanation
The platform integrates **Gemini Pro**. Crucially, it does not use zero-shot generic prompts. Through specific context builders (`src/ai/context.builder.ts`), the system continuously injects parameters like `avgConfidence` and `forgetRate` into system prompts, transforming a standard LLM into a highly contextualized personal mentor.

### Advantages
* Bridges the gap between passive consumption and active recall.
* Gamified micro-interactions (via Framer Motion) incentivize consistent studying.
* Prevents wasted study time through surgical, data-driven revision targeting.

---

## 10. TESTING

### Aim of Testing
To validate the mathematical accuracy of the memory decay algorithms, ensure seamless integration with the generative AI pipelines, and guarantee UI/UX responsivenes during heavy Three.js rendering.

### Types of Testing
*   **Unit Testing:** To verify the bounded outputs of the `forgetRate` and `revisionConsistency` mathematical formulas.
*   **Integration Testing:** To validate structured JSON output tracking via the Vercel AI SDK.
*   **UI/UX Testing:** Browser compatibility checks for Framer Motion micro-interactions and WebGL features.

### Test Cases

| Test Case ID | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **TC_01** | User logs lower confidence than previous session. | System correctly increases the `forgetRate` variable. | Pass |
| **TC_02** | User repeatedly accesses "Explain My Weakness". | AI response incorporates data from `strongestDomain`. | Pass |
| **TC_03** | Auto-generating course from string input. | Generates valid, structured JSON without hallucination. | Pass |
| **TC_04** | A concept surpasses `highForgetRateThreshold`. | Entity is dynamically shifted to `Critical` priority. | Pass |
| **TC_05** | Three.js Dashboard Load. | Renders 3D sphere at 60fps on standard hardware. | Pass |

---

## 11. CONCLUSION

The Knowledge Garden AI (KnowGrow) effectively solves the ubiquitous problem of long-term memory decay in digital education. By synthesizing the mathematical realities of cognitive psychology with advanced Generative AI and modern web architecture, KnowGrow transforms passive studying into active, guided mastery. Its dynamic Intelligence Engine accurately detects the illusion of competence and surgically curates personal revision paths, proving that the future of e-learning lies in personalization and continuous metacognitive feedback.

---

## 12. FUTURE ENHANCEMENTS

*   **Real-time Voice Tutor Evolution:** Expanding the `voice.service.ts` into a fully conversational, interruptible real-time tutor.
*   **Cross-platform Mobile App:** Porting the core logic to React Native for ubiquitous spaced repetition access.
*   **Biometric Attention Tracking:** Employing webcam integrations (with privacy compliance) to gauge user focus levels, adjusting AI challenge difficulty dynamically.
*   **Collaborative Graphing:** Allowing users to connect their "Knowledge Gardens" to see overlapping competencies within developer communities.

---

## 13. APPENDIX

### High-Level Code Structure
*   `/src/intelligence/`: Contains the backbone mathematical models (`memoryDecay.model.ts`, `weakConceptDetector.ts`, `revisionPlanner.ts`).
*   `/src/ai/`: Manages LLM orchestration, specifically `context.builder.ts` for prompt injection.
*   `/src/components/ui/`: Contains customized front-end elements like `aurora-background.tsx`.

### UI Screens Description
*   **Landing Interface:** Immersive 3D globe visualization representing expanding knowledge.
*   **Insights Dashboard:** priority matrix view that sorts immediate educational tasks by criticality.
*   **Tutor Interface:** Chat-style UI where AI provides analogies based on historically logged domain strengths.

---

## 14. REFERENCES

1. Ebbinghaus, H. (1885). *Memory: A Contribution to Experimental Psychology*.
2. Kruger, J., & Dunning, D. (1999). Unskilled and Unaware of It: How Difficulties in Recognizing One's Own Incompetence Lead to Inflated Self-Assessments. *Journal of Personality and Social Psychology*.
3. Roediger III, H. L., & Karpicke, J. D. (2006). Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention. *Psychological Science*.
4. Brown, P. C., Roediger III, H. L., & McDaniel, M. A. (2014). *Make It Stick: The Science of Successful Learning*. Harvard University Press.
5. Zawacki-Richter, O., et al. (2019). Systematic review of research on artificial intelligence applications in higher education – where are the educators?. *International Journal of Educational Technology in Higher Education*.
6. Vercel Documentation. *AI SDK & Next.js App Router Architecture Guide* (2024).

---
