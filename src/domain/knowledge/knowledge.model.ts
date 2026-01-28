export interface KnowledgeContent {
  definition: string;
  simpleExplanation: string;
  example: string;
  code: string;
  commonMistakes: string[];
  myConfusion: string;
}

export interface RevisionData {
  lastRevised: string;
  revisionCount: number;
  nextRevision: string;
}

export interface Knowledge {
  id: string;
  title: string;
  type: 'concept' | 'technique' | 'pattern' | 'tool' | 'theory';
  domain: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: KnowledgeContent;
  tags: string[];
  confidenceLevel: number;
  revision: RevisionData;
  createdAt: string;
}

export interface RevisionHistory {
  id: string;
  knowledgeId: string;
  confidenceGiven: number;
  revisedAt: string;
  timeTakenSeconds: number;
}

export interface LearningMetrics {
  knowledgeId: string;
  avgConfidence: number;
  forgetRate: number;
  revisionConsistency: number;
}

export function createKnowledge(data: Partial<Knowledge>): Knowledge {
  const now = new Date().toISOString().split('T')[0];
  
  return {
    id: data.id || `k${Date.now()}`,
    title: data.title || '',
    type: data.type || 'concept',
    domain: data.domain || '',
    technology: data.technology || '',
    difficulty: data.difficulty || 'Intermediate',
    content: {
      definition: data.content?.definition || '',
      simpleExplanation: data.content?.simpleExplanation || '',
      example: data.content?.example || '',
      code: data.content?.code || '',
      commonMistakes: data.content?.commonMistakes || [],
      myConfusion: data.content?.myConfusion || '',
    },
    tags: data.tags || [],
    confidenceLevel: data.confidenceLevel || 3,
    revision: {
      lastRevised: data.revision?.lastRevised || '',
      revisionCount: data.revision?.revisionCount || 0,
      nextRevision: data.revision?.nextRevision || now,
    },
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

export function createRevisionHistory(
  knowledgeId: string,
  confidenceGiven: number,
  timeTakenSeconds: number = 0
): RevisionHistory {
  return {
    id: `r${Date.now()}`,
    knowledgeId,
    confidenceGiven,
    revisedAt: new Date().toISOString().split('T')[0],
    timeTakenSeconds,
  };
}
