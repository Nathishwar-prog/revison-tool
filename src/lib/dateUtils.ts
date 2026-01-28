export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export { isDue } from '@/domain/revision/revision.engine';

export const getTodayStr = (): string => {
  return new Date().toISOString().split('T')[0];
};
