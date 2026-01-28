"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useKnowledge } from '@/hooks/useKnowledge';
import { KnowledgeForm } from '@/components/KnowledgeForm';
import { api } from '@/services/api';
import { LoadingState } from '@/components/LoadingState';

export default function EditKnowledge({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { updateEntry } = useKnowledge(false);
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await api.getKnowledgeById(id);
        setItem(data);
      } catch (err) {
        alert('Failed to fetch item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (data: any) => {
    await updateEntry(id, data);
    router.push(`/knowledge/${id}`);
  };

  if (loading) return <LoadingState />;
  if (!item) return <div className="p-8 text-center">Not found</div>;

  return <KnowledgeForm initialData={item} onSubmit={handleSubmit} title="Edit Knowledge" />;
}
