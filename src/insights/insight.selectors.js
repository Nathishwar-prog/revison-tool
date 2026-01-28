export function getConfidenceTrendData(history, knowledge, knowledgeId) {
  const knowledgeMap = new Map(knowledge.map(k => [k.id, k]));
  
  let filteredHistory = history;
  if (knowledgeId) {
    filteredHistory = history.filter(h => h.knowledgeId === knowledgeId);
  }

  const sortedHistory = [...filteredHistory].sort(
    (a, b) => new Date(a.revisedAt).getTime() - new Date(b.revisedAt).getTime()
  );

  return sortedHistory.map(h => ({
    date: h.revisedAt,
    confidence: h.confidenceGiven,
    conceptTitle: knowledgeMap.get(h.knowledgeId)?.title,
  }));
}

export function getWeakConceptsBarData(weakConcepts) {
  return weakConcepts
    .map(wc => ({
      id: wc.knowledge.id,
      title: wc.knowledge.title.length > 25 
        ? wc.knowledge.title.substring(0, 22) + '...' 
        : wc.knowledge.title,
      confidence: wc.knowledge.confidenceLevel,
      forgetRate: Math.round(wc.metrics.forgetRate * 100),
      severity: (wc.metrics.forgetRate > 0.6 || wc.knowledge.confidenceLevel <= 1 
        ? 'critical' 
        : 'moderate'),
    }))
    .sort((a, b) => b.forgetRate - a.forgetRate)
    .slice(0, 10);
}

export function getRevisionHeatmapData(history, weeks = 12) {
  const data = {};
  const today = new Date();
  
  // Initialize zero-filled range for the last N weeks
  // We cover 12 full weeks plus the current partial week
  const totalDays = (weeks * 7) + today.getDay() + 1;
  
    for (let i = 0; i < totalDays; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      data[key] = 0;
    }

    if (history && Array.isArray(history)) {
      for (const h of history) {
        if (!h.revisedAt) continue;
        const d = new Date(h.revisedAt);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (data[key] !== undefined) {
            data[key]++;
          }
        }
      }
    }
  
  return data;
}
