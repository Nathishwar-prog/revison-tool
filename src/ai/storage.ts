export const AI_STORAGE_KEYS = {
  PRIMARY_PROVIDER: 'ai_primary_provider',
  PRIMARY_KEY: 'ai_primary_key',
  FALLBACK_PROVIDER: 'ai_fallback_provider',
  FALLBACK_KEY: 'ai_fallback_key',
} as const;

export interface AIKeyConfig {
  primaryProvider: string;
  primaryKey: string;
  fallbackProvider: string;
  fallbackKey: string;
}

export function getAIKeys(): AIKeyConfig {
  if (typeof window === 'undefined') {
    return {
      primaryProvider: '',
      primaryKey: '',
      fallbackProvider: '',
      fallbackKey: '',
    };
  }

  return {
    primaryProvider: localStorage.getItem(AI_STORAGE_KEYS.PRIMARY_PROVIDER) || '',
    primaryKey: localStorage.getItem(AI_STORAGE_KEYS.PRIMARY_KEY) || '',
    fallbackProvider: localStorage.getItem(AI_STORAGE_KEYS.FALLBACK_PROVIDER) || '',
    fallbackKey: localStorage.getItem(AI_STORAGE_KEYS.FALLBACK_KEY) || '',
  };
}

export function saveAIKeys(openrouterKey: string, geminiKey: string, preferredProvider: 'openrouter' | 'gemini' = 'openrouter'): void {
  if (typeof window === 'undefined') return;

  if (preferredProvider === 'gemini') {
    // Gemini is Primary
    if (geminiKey) {
      localStorage.setItem(AI_STORAGE_KEYS.PRIMARY_PROVIDER, 'gemini');
      localStorage.setItem(AI_STORAGE_KEYS.PRIMARY_KEY, geminiKey);
    } else {
      localStorage.removeItem(AI_STORAGE_KEYS.PRIMARY_PROVIDER);
      localStorage.removeItem(AI_STORAGE_KEYS.PRIMARY_KEY);
    }

    if (openrouterKey) {
      localStorage.setItem(AI_STORAGE_KEYS.FALLBACK_PROVIDER, 'openrouter');
      localStorage.setItem(AI_STORAGE_KEYS.FALLBACK_KEY, openrouterKey);
    } else {
      localStorage.removeItem(AI_STORAGE_KEYS.FALLBACK_PROVIDER);
      localStorage.removeItem(AI_STORAGE_KEYS.FALLBACK_KEY);
    }
  } else {
    // OpenRouter is Primary (Default)
    if (openrouterKey) {
      localStorage.setItem(AI_STORAGE_KEYS.PRIMARY_PROVIDER, 'openrouter');
      localStorage.setItem(AI_STORAGE_KEYS.PRIMARY_KEY, openrouterKey);
    } else {
      localStorage.removeItem(AI_STORAGE_KEYS.PRIMARY_PROVIDER);
      localStorage.removeItem(AI_STORAGE_KEYS.PRIMARY_KEY);
    }

    if (geminiKey) {
      localStorage.setItem(AI_STORAGE_KEYS.FALLBACK_PROVIDER, 'gemini');
      localStorage.setItem(AI_STORAGE_KEYS.FALLBACK_KEY, geminiKey);
    } else {
      localStorage.removeItem(AI_STORAGE_KEYS.FALLBACK_PROVIDER);
      localStorage.removeItem(AI_STORAGE_KEYS.FALLBACK_KEY);
    }
  }
}

export function clearAIKeys(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(AI_STORAGE_KEYS.PRIMARY_PROVIDER);
  localStorage.removeItem(AI_STORAGE_KEYS.PRIMARY_KEY);
  localStorage.removeItem(AI_STORAGE_KEYS.FALLBACK_PROVIDER);
  localStorage.removeItem(AI_STORAGE_KEYS.FALLBACK_KEY);
}

export function hasAIKeys(): boolean {
  const keys = getAIKeys();
  return !!(keys.primaryKey || keys.fallbackKey);
}
