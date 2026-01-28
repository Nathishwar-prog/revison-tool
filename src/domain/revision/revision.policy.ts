import { AppConfig } from '@/config/app.config';

export interface RevisionPolicy {
  getBaseInterval(confidenceLevel: number): number;
  shouldApplyAdaptive(revisionCount: number): boolean;
}

export const defaultRevisionPolicy: RevisionPolicy = {
  getBaseInterval(confidenceLevel: number): number {
    const intervals = AppConfig.revision.baseIntervals;
    return intervals[confidenceLevel] || intervals[3];
  },

  shouldApplyAdaptive(revisionCount: number): boolean {
    return revisionCount >= AppConfig.intelligence.minRevisionsForMetrics;
  },
};

export function clampInterval(interval: number): number {
  const { minInterval, maxInterval } = AppConfig.revision;
  return Math.max(minInterval, Math.min(maxInterval, Math.round(interval)));
}
