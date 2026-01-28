import { Knowledge } from '@/domain/knowledge/knowledge.model';

export function buildSummarizerPrompt(knowledge: Knowledge): string {
  return `Summarize the following technical concept in 2-3 sentences for quick review:

Title: ${knowledge.title}
Domain: ${knowledge.domain}
Technology: ${knowledge.technology}

Definition: ${knowledge.content.definition}

Simple Explanation: ${knowledge.content.simpleExplanation}

Provide a concise summary that captures the essence of this concept for someone doing a quick revision.`;
}

export function buildSummarizerSystemPrompt(): string {
  return `You are a technical educator assistant. Your role is to provide clear, concise summaries of technical concepts. Keep summaries brief but accurate, focusing on the key points that help with retention and recall.`;
}
