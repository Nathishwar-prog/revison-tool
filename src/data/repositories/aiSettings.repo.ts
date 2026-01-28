import { ApiAdapter } from '../adapters/api.adapter';

export const AiSettingsRepo = {
    async getSettings() {
        try {
            return await ApiAdapter.get('/ai/settings');
        } catch (e) {
            console.warn("Using default AI settings (mock fallback)");
            return { primaryProvider: 'openai', fallbackProvider: 'anthropic' };
        }
    },

    async saveSettings(data: any) {
        try {
            return await ApiAdapter.put('/ai/settings', data);
        } catch (e) {
            console.warn("AI settings saved locally only (mock)");
            return data;
        }
    }
};
