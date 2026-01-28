# V3 MVP Architecture: Insights & Analytics

## Problem Solved
The Insights module transforms raw revision data into actionable learning intelligence. It helps users:
- Identify **Weak Concepts** that require immediate attention (high forget rate).
- Monitor **Confidence Trends** over time to validate learning progress.
- Maintain **Revision Consistency** through a visual activity heatmap.
- Quantify learning health via high-level metrics (Retention Rate, Mastery Level).

## Data Model
Insights are derived from the following core models:
- **Knowledge Item**: Title, confidence level, and tags.
- **Revision History**: Timestamped events capturing confidence given and concept ID.
- **Intelligence Layer**: Aggregated metrics including forget rates and mastery scores.

Selectors in `src/insights/insight.selectors.js` act as pure transformation functions that normalize this data for frontend visualization.

## Revision Logic
The revision engine uses a feedback loop:
1. **Event Capture**: Each revision records the user's self-assessed confidence.
2. **Metric Calculation**: Forget rate is calculated based on time elapsed since last revision and confidence trend.
3. **Visualization**:
   - **Heatmap**: Aggregates revision counts per day (YYYY-MM-DD) to show consistency.
   - **Weak Concepts**: Filters for items with confidence $\le 1$ or high forget rates.
   - **Confidence Trend**: Maps historical revision events to a time-series chart.
