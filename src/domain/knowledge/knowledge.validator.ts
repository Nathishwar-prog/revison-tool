import { Knowledge } from './knowledge.model';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateKnowledge(data: Partial<Knowledge>): ValidationResult {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('Title is required');
  }

  if (!data.domain?.trim()) {
    errors.push('Domain is required');
  }

  if (!data.technology?.trim()) {
    errors.push('Technology is required');
  }

  if (!data.content?.definition?.trim()) {
    errors.push('Definition is required');
  }

  if (!data.content?.simpleExplanation?.trim()) {
    errors.push('Simple explanation is required');
  }

  if (data.confidenceLevel !== undefined) {
    if (data.confidenceLevel < 1 || data.confidenceLevel > 5) {
      errors.push('Confidence level must be between 1 and 5');
    }
  }

  const validTypes = ['concept', 'technique', 'pattern', 'tool', 'theory'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push('Invalid knowledge type');
  }

  const validDifficulties = ['Beginner', 'Intermediate', 'Advanced'];
  if (data.difficulty && !validDifficulties.includes(data.difficulty)) {
    errors.push('Invalid difficulty level');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateConfidenceLevel(level: number): boolean {
  return Number.isInteger(level) && level >= 1 && level <= 5;
}

export function sanitizeKnowledgeInput(data: Partial<Knowledge>): Partial<Knowledge> {
  return {
    ...data,
    title: data.title?.trim(),
    domain: data.domain?.trim(),
    technology: data.technology?.trim(),
    content: data.content ? {
      definition: data.content.definition?.trim() || '',
      simpleExplanation: data.content.simpleExplanation?.trim() || '',
      example: data.content.example?.trim() || '',
      code: data.content.code?.trim() || '',
      commonMistakes: data.content.commonMistakes?.filter(m => m.trim()) || [],
      myConfusion: data.content.myConfusion?.trim() || '',
    } : undefined,
    tags: data.tags?.filter(t => t.trim()).map(t => t.trim().toLowerCase()) || [],
  };
}
