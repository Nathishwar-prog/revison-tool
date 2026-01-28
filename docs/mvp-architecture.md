# MVP Architecture - Spaced Repetition Knowledge Base

## Problem Solved
This application solves the "forgetting curve" problem by implementing a spaced repetition system for lifelong learning. It allows users to store concepts and automatically schedules revisions based on the user's confidence in their understanding.

## Data Model
Each knowledge item follows this structure:
- **Core Info**: `id`, `title`, `description`, `category`, `createdAt`.
- **Confidence**: `confidenceLevel` (1-5 integer).
- **Revision Tracking**: 
  - `lastRevised`: Date of last review.
  - `revisionCount`: Total number of times reviewed.
  - `nextRevision`: Scheduled date for next review.

## Revision Logic
Intervals are determined by the confidence level reported during revision:
- **Confidence 1 (Weak)**: +1 day
- **Confidence 2**: +2 days
- **Confidence 3**: +4 days
- **Confidence 4**: +7 days
- **Confidence 5 (Mastered)**: +14 days
