"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

export const useKnowledge = (enabled: boolean = true) => {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledge = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await api.getKnowledge();
      setKnowledge(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  const addEntry = async (data: any) => {
    const newEntry = await api.createKnowledge(data);
    setKnowledge((prev) => [...prev, newEntry]);
    return newEntry;
  };

  const updateEntry = async (id: string, data: any) => {
    const updated = await api.updateKnowledge(id, data);
    setKnowledge((prev) => prev.map((k) => (k.id === id ? updated : k)));
    return updated;
  };

  const deleteEntry = async (id: string) => {
    await api.deleteKnowledge(id);
    setKnowledge((prev) => prev.filter((k) => k.id !== id));
  };

  return {
    knowledge,
    loading,
    error,
    refresh: fetchKnowledge,
    addEntry,
    updateEntry,
    deleteEntry,
  };
};
