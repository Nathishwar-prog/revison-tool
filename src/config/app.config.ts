export const AppConfig = {
  revision: {
    baseIntervals: {
      1: 1,
      2: 2,
      3: 4,
      4: 7,
      5: 14,
    } as Record<number, number>,
    
    minInterval: 1,
    maxInterval: 90,
    
    adaptiveWeights: {
      consistencyBoost: 1.0,
      forgetPenalty: 1.0,
    },
  },
  
  intelligence: {
    weakConceptThreshold: 2,
    highForgetRateThreshold: 0.5,
    minRevisionsForMetrics: 2,
  },
  
  storage: {
    type: 'api' as 'api' | 'localStorage',
    apiBasePath: '/api',
  },
} as const;
