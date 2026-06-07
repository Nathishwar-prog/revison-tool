"use client";

import React, { useEffect, useRef } from "react";

interface VoiceWaveformProps {
    isSpeaking: boolean;
    isListening: boolean;
}

export function VoiceWaveform({ isSpeaking, isListening }: VoiceWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let t = 0;

        const render = () => {
            // Resize
            canvas.width = canvas.offsetWidth * 2;
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);

            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;
            const centerY = height / 2;

            ctx.clearRect(0, 0, width, height);

            // Animation Parameters
            // If Listening: Gentle, slow undulation.
            // If Speaking: Chaotic, fast, high amplitude.
            // If Idle: Flat line.

            let amplitude = 0;
            let speed = 0.05;
            let color1 = "rgba(74, 222, 128, 0.5)"; // Green
            let color2 = "rgba(56, 189, 248, 0.5)"; // Blue
            let color3 = "rgba(244, 114, 182, 0.5)"; // Pink (Gemini-ish)

            if (isListening) {
                amplitude = 20;
                speed = 0.1;
            } else if (isSpeaking) {
                amplitude = 50;
                speed = 0.2;
            } else {
                amplitude = 5;
            }

            t += speed;

            // Draw 3 overlapping sine waves
            drawWave(ctx, t, centerY, width, amplitude, color1, 1);
            drawWave(ctx, t + 2, centerY, width, amplitude * 0.8, color2, 0.8);
            drawWave(ctx, t + 4, centerY, width, amplitude * 0.6, color3, 1.2);

            animationId = requestAnimationFrame(render);
        };

        const drawWave = (
            ctx: CanvasRenderingContext2D,
            offset: number,
            centerY: number,
            width: number,
            amp: number,
            color: string,
            frequency: number
        ) => {
            ctx.beginPath();
            ctx.moveTo(0, centerY);

            for (let x = 0; x < width; x++) {
                // Sine wave formula: y = A * sin(kx - wt)
                // We dampen it at edges so it looks like a contained voice blob
                const distanceFromCenter = Math.abs(x - width / 2);
                const dampener = Math.max(0, 1 - Math.pow(distanceFromCenter / (width / 2), 2));

                const y =
                    centerY +
                    Math.sin(x * 0.01 * frequency + offset) * amp * dampener * Math.sin(offset * 0.5); // Double sine for "breathing"

                ctx.lineTo(x, y);
            }

            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.stroke();
        };

        render();

        return () => cancelAnimationFrame(animationId);
    }, [isSpeaking, isListening]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-32 opacity-90"
        />
    );
}
