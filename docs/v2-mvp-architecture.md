# V2 MVP Architecture

## Problem Solved
Transforms the application into a domain-driven learning system. It decouples UI from business logic, introduces an intelligence layer for pattern detection, and implements an adaptive revision algorithm that adjusts to user performance.

## Data Model
- **Knowledge**: Core learning entity (title, content, category, intervals).
- **RevisionHistory**: Persistent log of revision performance (confidence, timestamp, duration).
- **LearningMetrics**: Computed metrics including average confidence, forget rate, and consistency.

## Revision Logic
**Adaptive Formula:**
`nextInterval = baseInterval × (1 + revisionConsistency) × (1 − forgetRate)`

- **Base Intervals**: Maps confidence (1-5) to initial days (1-14).
- **Consistency**: Extends intervals for steady learners.
- **Forget Rate**: Shrinks intervals for concepts frequently missed.
