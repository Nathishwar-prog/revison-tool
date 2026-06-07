
const VOICE_API_URL = "http://localhost:8000"; // Local Python Service

export interface VoiceRequest {
    text: string;
    emotion?: "neutral" | "calm" | "happy" | "serious" | "motivating" | "mentor";
    personality?: "tutor" | "mentor" | "friend" | "teacher" | "coach";
    speed?: "slow" | "normal" | "fast";
    tone?: "warm" | "neutral" | "soft";
}

export class VoiceService {
    /**
     * Synthesizes speech using the Viva Voce Engine (Local Python Service).
     * Returns an Audio object ready to play.
     */
    static async speak(params: VoiceRequest): Promise<HTMLAudioElement | null> {
        try {
            // Latency Optimization: Strict 3s timeout. If Python is slow, use browser.
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${VOICE_API_URL}/voice/viva-voce`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                return null;
            }

            // Get audio blob
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            // Clean up URL when audio finishes
            audio.onended = () => {
                URL.revokeObjectURL(url);
            };

            return audio;
        } catch (error) {
            // If aborted or failed, return null to trigger fallback
            return null;
        }
    }

    /**
     * Fallback to browser's built-in synthesis if the engine is offline.
     */
    static browserSpeak(text: string, onEnd?: () => void) {
        if (typeof window === 'undefined') return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        // Priority: "Natural" (Edge/Windows), "Google", "Samantha" (Mac)
        const preferredVoice = voices.find(v =>
            (v.lang.startsWith('en') || v.name.includes('English') || v.name.includes('US')) &&
            (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
            if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
        return utterance;
    }
}
