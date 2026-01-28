"use client";

import { useRouter } from 'next/navigation';
import { useKnowledge } from '@/hooks/useKnowledge';
import { KnowledgeForm } from '@/components/KnowledgeForm';

export default function AddKnowledge() {
  const router = useRouter();
  const { addEntry } = useKnowledge(false);

  const handleSubmit = async (data: any) => {
    const newEntry = await addEntry(data);
    router.push(`/knowledge/${newEntry.id}`);
  };

  return <KnowledgeForm onSubmit={handleSubmit} title="Add New Knowledge" />;
}
