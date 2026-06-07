import React from "react";

interface VoiceCircleProps {
    size?: number;
    text?: string;
    level?: number; // 0 to 1
}

export const VoiceActivityCircle: React.FC<VoiceCircleProps> = ({ size = 220, text = "Generating", level = 0 }) => {
    const letters = text.split("");

    // Outer ring scale based on audio level (Apple/Siri style breath)
    // Level is 0-1. Scale goes from 1.0 to 1.4
    const ringScale = 1 + (level * 0.4);

    // Core circle remains stable or pulses very gently
    const coreScale = 1 + (level * 0.05);

    return (
        <div className="relative flex items-center justify-center w-full h-full">
            {/* Outer Ripple Ring - The "Waveform" */}
            <div
                className="absolute rounded-full border border-cyan-400/30 bg-cyan-400/5 blur-md transition-transform duration-75 ease-out"
                style={{
                    width: size,
                    height: size,
                    transform: `scale(${ringScale})`
                }}
            />
            {/* Secondary Ripple Ring (Lagging/Echo) */}
            <div
                className="absolute rounded-full border border-indigo-500/20 transition-transform duration-200 ease-out"
                style={{
                    width: size,
                    height: size,
                    transform: `scale(${ringScale * 0.9})`
                }}
            />

            <div
                className="relative flex items-center justify-center font-inter select-none transition-transform duration-300"
                style={{ width: size, height: size, transform: `scale(${coreScale})` }}
            >
                {letters.map((letter, index) => (
                    <span
                        key={index}
                        className="inline-block text-white dark:text-gray-100 opacity-40 animate-loaderLetter font-medium tracking-widest text-lg"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {letter}
                    </span>
                ))}

                <div
                    className="absolute inset-0 rounded-full animate-loaderCircle"
                ></div>
            </div>

            <style jsx>{`
        @keyframes loaderCircle {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 6px 12px 0 #38bdf8 inset,
              0 12px 18px 0 #005dff inset,
              0 36px 36px 0 #1e40af inset,
              0 0 3px 1.2px rgba(56, 189, 248, 0.3),
              0 0 6px 1.8px rgba(0, 93, 255, 0.2);
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 6px 12px 0 #60a5fa inset,
              0 12px 6px 0 #0284c7 inset,
              0 24px 36px 0 #005dff inset,
              0 0 3px 1.2px rgba(56, 189, 248, 0.3),
              0 0 6px 1.8px rgba(0, 93, 255, 0.2);
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 6px 12px 0 #4dc8fd inset,
              0 12px 18px 0 #005dff inset,
              0 36px 36px 0 #1e40af inset,
              0 0 3px 1.2px rgba(56, 189, 248, 0.3),
              0 0 6px 1.8px rgba(0, 93, 255, 0.2);
          }
        }

        @keyframes loaderLetter {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
            color: rgba(255, 255, 255, 0.5);
            text-shadow: 0 0 0px rgba(56, 189, 248, 0);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
            color: rgba(255, 255, 255, 1);
            text-shadow: 0 0 15px rgba(56, 189, 248, 0.9), 0 0 5px rgba(255, 255, 255, 0.8);
          }
        }

        .animate-loaderCircle {
          animation: loaderCircle 8s linear infinite;
        }

        .animate-loaderLetter {
            /* Slower, gentler pulse */
          animation: loaderLetter 3s ease-in-out infinite;
        }
       
        /* Dark Mode overrides if needed, but the default colors above are already tuned for dark/glow */
      `}</style>
        </div>
    );
};
