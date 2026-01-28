"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AiSettingsModal } from '@/components/AiSettingsModal';
import { Bot, Check } from 'lucide-react';
import { hasAIKeys } from '@/ai/storage';

export function AiSettingsButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(hasAIKeys());
  }, [modalOpen]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setModalOpen(true)}
        className="relative"
        title="AI Settings"
      >
        <Bot className="h-5 w-5" />
        {isConfigured && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500">
            <Check className="h-2 w-2 text-white" />
          </span>
        )}
      </Button>
      <AiSettingsModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
