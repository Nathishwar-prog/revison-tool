import { useState, useEffect, useRef } from 'react';

export function useAudioVisualizer(active: boolean): number {
    const [volume, setVolume] = useState(0);
    const contextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!active) {
            cleanup();
            setVolume(0);
            return;
        }

        const init = async () => {
            try {
                // IMPORTANT: This might show a second permission prompt or reuse the existing permission
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioContext();
                contextRef.current = ctx;

                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                analyser.smoothingTimeConstant = 0.8;
                analyserRef.current = analyser;

                const source = ctx.createMediaStreamSource(stream);
                source.connect(analyser);
                sourceRef.current = source;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const tick = () => {
                    if (!active) return;
                    analyser.getByteFrequencyData(dataArray);

                    // distinct approach: get average volume
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    const avg = sum / dataArray.length;

                    // Normalize: avg is 0-255. 
                    // Speech is often low amplitude, so we boost it.
                    // Scale 0-1
                    const val = Math.min((avg / 255) * 3, 1);

                    setVolume(val);
                    rafRef.current = requestAnimationFrame(tick);
                };

                tick();

            } catch (error) {
                console.error("Audio visualizer initialization failed (likely permission conflict):", error);
                setVolume(0);
            }
        };

        init();

        return cleanup;
    }, [active]);

    const cleanup = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (sourceRef.current) sourceRef.current.disconnect();
        if (analyserRef.current) analyserRef.current.disconnect();
        if (contextRef.current && contextRef.current.state !== 'closed') contextRef.current.close();
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

        contextRef.current = null;
        analyserRef.current = null;
        streamRef.current = null;
    };

    return volume;
}
