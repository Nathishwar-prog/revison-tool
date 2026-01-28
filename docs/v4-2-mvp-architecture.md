# V4.2 MVP Architecture

## Problem it Solves
The Personal Knowledge Store addresses the "forgetting curve" by providing a centralized repository for structured learning. It eliminates scattered notes and provides a systematic way to retain complex information through scheduled, active recall.

## Data Model
The core entity is the **Knowledge** object:
- **Identity**: ID, Title, Type (concept, technique, etc.), Domain, Technology.
- **Content**: Structured fields for definition, simple explanation, examples, code snippets, and common mistakes.
- **Metadata**: Difficulty level, tags, and creation timestamp.
- **Intelligence State**: 
    - `confidenceLevel`: User-reported mastery (1-5).
    - `revision`: Tracking last revision, total count, and next due date.
- **Analytics**: `RevisionHistory` and `LearningMetrics` (forget rate, consistency).

## Revision Logic
Uses an **Adaptive Spaced Repetition** engine:
1. **Base Interval**: Determined by the `confidenceLevel` provided during the latest review.
2. **Adaptive Adjustment**: After initial revisions, the engine factors in:
    - **Revision Consistency**: Increases intervals for steady learners.
    - **Forget Rate**: Shortens intervals if the user frequently reports low confidence.
3. **Calculation**: `NextDate = Today + (BaseInterval * ConsistencyFactor * ForgetFactor)`.
