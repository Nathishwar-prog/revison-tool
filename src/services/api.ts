import { AuthAdapter } from '@/data/adapters/auth.adapter';
import { KnowledgeRepo } from '@/data/repositories/knowledge.repo';
import { RevisionRepo } from '@/data/repositories/revision.repo';
import { AiSettingsRepo } from '@/data/repositories/aiSettings.repo';

export const api = {
  // Auth
  login: AuthAdapter.login,
  register: AuthAdapter.register,
  getMe: AuthAdapter.me,
  logout: AuthAdapter.logout,

  // Knowledge
  getKnowledge: KnowledgeRepo.getAll,
  getKnowledgeById: KnowledgeRepo.getById,
  createKnowledge: KnowledgeRepo.create,
  updateKnowledge: KnowledgeRepo.update,
  deleteKnowledge: KnowledgeRepo.remove,

  // Revision
  getRevisionHistory: RevisionRepo.getHistory,
  createRevision: RevisionRepo.addRevision,

  // AI Settings
  getAiSettings: AiSettingsRepo.getSettings,
  updateAiSettings: AiSettingsRepo.saveSettings,
};
