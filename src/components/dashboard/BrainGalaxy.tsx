"use client";

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, Sparkles, Billboard, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Knowledge } from '@/domain/knowledge/knowledge.model';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Expand, Mic, MicOff, Search, AlertCircle, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

import { VivaVoceModal } from './VivaVoceModal';
interface BrainGalaxyProps {
    knowledge: Knowledge[];
}

// Add type definition for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// Reusable geometry/material for performance
const glowingMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(1, 1, 1),
    transparent: true,
    opacity: 0.5,
    depthWrite: false
});

function KnowledgeNode({ item, position, onClick, isMatched }: { item: Knowledge; position: [number, number, number]; onClick: (item: Knowledge) => void, isMatched: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const randomOffset = useMemo(() => Math.random() * 100, []);

    const { color, glowColor } = useMemo(() => {
        const conf = item.confidenceLevel || 0;
        if (conf <= 2) return { color: new THREE.Color('#f43f5e'), glowColor: '#fb7185' };
        if (conf <= 4) return { color: new THREE.Color('#fbbf24'), glowColor: '#fcd34d' };
        return { color: new THREE.Color('#10b981'), glowColor: '#34d399' };
    }, [item.confidenceLevel]);

    const isWeak = (item.confidenceLevel || 0) <= 2;

    useFrame((state) => {
        if (!meshRef.current || !glowRef.current) return;

        const time = state.clock.elapsedTime + randomOffset;

        meshRef.current.rotation.x += 0.002;
        meshRef.current.rotation.y += 0.002;

        // Scale logic: Hover > Matched > Weak Pulse > Normal
        let targetScale = 1;
        if (hovered) targetScale = 1.6;
        else if (isMatched) targetScale = 1.4;
        else if (isWeak) targetScale = 1 + Math.sin(time * 2) * 0.1;

        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // Glow logic
        let targetGlowScale = 2;
        if (hovered) targetGlowScale = 2.8;
        else if (isMatched) targetGlowScale = 3.5; // Big glow for search results
        else targetGlowScale = 2 + Math.sin(time * 1.5) * 0.2;

        glowRef.current.scale.setScalar(targetGlowScale);
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={position}>
                <mesh
                    ref={meshRef}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(item);
                    }}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        setHovered(true);
                        document.body.style.cursor = 'pointer';
                    }}
                    onPointerOut={() => {
                        setHovered(false);
                        document.body.style.cursor = 'auto';
                    }}
                >
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshStandardMaterial
                        color={isMatched ? new THREE.Color('#ffffff') : color} // Highlight matched nodes white
                        emissive={isMatched ? new THREE.Color('#ffffff') : color}
                        emissiveIntensity={hovered || isMatched ? 0.8 : 0.4}
                        roughness={0.2}
                        metalness={0.8}
                    />
                    {(hovered || isMatched) && (
                        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                            <Text
                                position={[0, 0.6, 0]}
                                fontSize={0.35}
                                color="white"
                                anchorX="center"
                                anchorY="middle"
                                outlineWidth={0.03}
                                outlineColor="#000000"
                                renderOrder={100}
                            >
                                {item.title}
                            </Text>
                        </Billboard>
                    )}
                </mesh>

                <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
                    <mesh ref={glowRef}>
                        <circleGeometry args={[0.35, 32]} />
                        <meshBasicMaterial
                            color={isMatched ? '#ffffff' : glowColor}
                            transparent
                            opacity={isMatched ? 0.4 : 0.2}
                            depthWrite={false}
                        />
                    </mesh>
                </Billboard>
            </group>
        </Float>
    );
}

function Synapses({ nodes }: { nodes: any[] }) {
    const lines = useMemo(() => {
        const connections: any[] = [];
        nodes.forEach((node, i) => {
            const myPos = new THREE.Vector3(...node.position);
            const neighbors = nodes.map((n, idx) => {
                if (i === idx) return { idx, dist: Infinity };
                const nPos = new THREE.Vector3(...n.position);
                return { idx, dist: myPos.distanceTo(nPos), pos: nPos };
            }).sort((a, b) => a.dist - b.dist).slice(0, 3);

            neighbors.forEach(n => {
                if (n.dist < 6) {
                    connections.push({
                        start: node.position,
                        end: [n.pos.x, n.pos.y, n.pos.z],
                        id: `${i}-${n.idx}`
                    });
                }
            });
        });
        return connections;
    }, [nodes]);

    return (
        <group>
            {lines.map(line => (
                <Line
                    key={line.id}
                    points={[line.start, line.end]}
                    color="#818cf8"
                    lineWidth={1.5}
                    transparent
                    opacity={0.3}
                    depthWrite={false}
                />
            ))}
        </group>
    );
}

// Camera controller to zoom to matched nodes
function CameraController({ matchedPosition, onComplete }: { matchedPosition: [number, number, number] | null, onComplete: () => void }) {
    const { camera, controls } = useThree();
    const targetRef = useRef<THREE.Vector3 | null>(null);
    const startTimeRef = useRef<number>(0);

    useFrame((state) => {
        if (matchedPosition) {
            const targetVec = new THREE.Vector3(...matchedPosition);

            // Initialize animation start
            if (!targetRef.current || !targetRef.current.equals(targetVec)) {
                targetRef.current = targetVec;
                startTimeRef.current = state.clock.elapsedTime;
            }

            // Animate for 2.5 seconds then release control
            if (state.clock.elapsedTime - startTimeRef.current < 2.5) {
                // @ts-ignore
                controls?.target.lerp(targetVec, 0.05);
                const offset = targetVec.clone().add(new THREE.Vector3(0, 2, 6));
                camera.position.lerp(offset, 0.05);
                // @ts-ignore
                controls?.update();
            } else {
                onComplete();
            }
        }
    });
    return null;
}

function Scene({ knowledge, onNodeClick, matchedIds, matchedPosition, onSearchComplete }: { knowledge: Knowledge[], onNodeClick: (k: Knowledge) => void, matchedIds: string[], matchedPosition: [number, number, number] | null, onSearchComplete: () => void }) {
    const nodes = useMemo(() => {
        return knowledge.map((k, i) => {
            const theta = i * 2.39996;
            const radius = 3 * Math.sqrt(i + 1);
            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            const y = (Math.random() - 0.5) * 4;

            return {
                ...k,
                position: [x * 0.5, y, z * 0.5] as [number, number, number]
            };
        });
    }, [knowledge]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={50} scale={12} size={2} speed={0.4} opacity={0.5} color="#c7d2fe" />
            <fog attach="fog" args={['#09090b', 8, 25]} />

            <Synapses nodes={nodes} />

            <CameraController matchedPosition={matchedPosition} onComplete={onSearchComplete} />

            {nodes.map((node) => (
                <KnowledgeNode
                    key={node.id}
                    item={node}
                    position={node.position}
                    onClick={onNodeClick}
                    isMatched={matchedIds.includes(node.id)}
                />
            ))}
        </>
    );
}

export function BrainGalaxy({ knowledge }: BrainGalaxyProps) {
    const [selectedNode, setSelectedNode] = useState<Knowledge | null>(null);
    const [vivaNode, setVivaNode] = useState<Knowledge | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [showTranscript, setShowTranscript] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [matchedIds, setMatchedIds] = useState<string[]>([]);
    const [matchedPosition, setMatchedPosition] = useState<[number, number, number] | null>(null);

    // Simplified matching for demo
    const nodesWithPos = useMemo(() => {
        return knowledge.map((k, i) => {
            const theta = i * 2.39996;
            const radius = 3 * Math.sqrt(i + 1);
            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            const y = (Math.random() - 0.5) * 4;
            return { ...k, generatedPosition: [x * 0.5, y, z * 0.5] as [number, number, number] };
        });
    }, [knowledge]);

    // Use state instead of ref to ensure re-render when element is available for Canvas
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const recognitionRef = useRef<any>(null);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Voice search not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setErrorMsg("");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTranscript(transcript);
            setShowTranscript(true);
            handleVoiceCommand(transcript);

            // Hide transcript after delay
            setTimeout(() => setShowTranscript(false), 3000);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setErrorMsg("Could not hear you. Try again.");
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    };

    const handleVoiceCommand = (text: string) => {
        const cleanText = text.toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
            .replace("show me", "")
            .replace("find", "")
            .replace("search for", "")
            .trim();

        if (!cleanText) return;

        const matches = nodesWithPos.filter(n => n.title.toLowerCase().includes(cleanText) || n.domain?.toLowerCase().includes(cleanText));

        if (matches.length > 0) {
            const ids = matches.map(m => m.id);
            setMatchedIds(ids);
            setMatchedPosition(matches[0].generatedPosition);
            toast.success(`Found matches for "${cleanText}"`);
        } else {
            setMatchedIds([]);
            setMatchedPosition(null);
            toast.warning(`No knowledge found for "${cleanText}"`);
        }
    };

    if (!knowledge || knowledge.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-3xl border bg-black/60 dark:bg-black/40">
                <p className="text-zinc-500">Spark your galaxy by adding knowledge.</p>
            </div>
        );
    }

    return (
        <div ref={setContainer} className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-indigo-500/20 bg-black/80 shadow-2xl group ring-1 ring-white/10">
            {/* ... */}
            {/* Deep Space Gradient Overlay for 'Real Galaxy' feel */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black/0 to-rose-900/10 pointer-events-none" />

            {/* Header & Controls */}
            <div className="absolute left-6 top-6 z-10 pointer-events-none">
                <h3 className="flex items-center gap-2 text-xl font-bold text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]">
                    <span className="text-2xl">🌌</span> Brain Galaxy
                </h3>
                <p className="text-xs text-indigo-200/80 max-w-xs mt-1 font-medium tracking-wide">
                    NAVIGATE YOUR MIND
                </p>
            </div>

            <div className="absolute right-6 top-6 z-20 flex gap-2">
                <button
                    onClick={toggleListening}
                    disabled={isListening}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 backdrop-blur-md border shadow-lg ${isListening
                        ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-rose-500/50'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105'
                        }`}
                >
                    {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    {isListening ? 'Listening...' : 'Voice Search'}
                </button>
            </div>

            {errorMsg && (
                <div className="absolute top-20 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-md text-red-200 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    {errorMsg}
                </div>
            )}

            {/* Only render Canvas if container is ready */}
            {container && (
                <Canvas camera={{ position: [0, 5, 12], fov: 50 }} dpr={[1, 2]} eventSource={container}>
                    <Scene
                        knowledge={knowledge}
                        onNodeClick={setSelectedNode}
                        matchedIds={matchedIds}
                        matchedPosition={matchedPosition}
                        onSearchComplete={() => setMatchedPosition(null)}
                    />
                    <OrbitControls
                        enablePan={false}
                        autoRotate={!matchedPosition && !selectedNode}
                        autoRotateSpeed={0.3}
                        maxDistance={25}
                        minDistance={4}
                        makeDefault
                    />
                </Canvas>
            )}

            {/* Selected Node Details Overlay - Darker Glass */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-6 left-6 right-6 z-20 rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 flex items-center gap-3">
                                    {selectedNode.title}
                                    {matchedIds.includes(selectedNode.id) && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-lg shadow-indigo-500/40">Matched</span>}
                                </h4>
                                <div className="flex gap-2 text-xs text-zinc-400 mt-3">
                                    <span className="rounded-full bg-white/5 px-3 py-1 text-zinc-300 border border-white/10 uppercase tracking-widest font-semibold text-[10px]">
                                        {selectedNode.domain || 'General'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full border uppercase tracking-widest font-semibold text-[10px] ${selectedNode.confidenceLevel <= 2 ? "bg-rose-950/50 border-rose-500/30 text-rose-400" : "bg-emerald-950/50 border-emerald-500/30 text-emerald-400"}`}>
                                        Confidence: {selectedNode.confidenceLevel}/5
                                    </span>
                                </div>
                                {selectedNode.content?.summary && (
                                    <p className="mt-4 text-sm text-zinc-300 leading-relaxed line-clamp-2 max-w-3xl border-l-2 border-indigo-500 pl-3">
                                        {selectedNode.content.summary}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="rounded-full p-2 bg-white/5 text-zinc-400 hover:bg-white/20 hover:text-white transition-all hover:rotate-90"
                            >
                                <Expand className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setVivaNode(selectedNode)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                            >
                                <GraduationCap className="h-4 w-4" />
                                Start Viva Voce
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Viva Voce Modal */}
            {vivaNode && (
                <VivaVoceModal
                    knowledge={vivaNode}
                    isOpen={!!vivaNode}
                    onClose={() => setVivaNode(null)}
                />
            )}

            {showTranscript && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 px-8 py-3 rounded-full bg-black/80 backdrop-blur-xl text-white border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 text-lg font-medium tracking-wide">
                    <p>"{transcript}"</p>
                </div>
            )}

            <div className="absolute bottom-4 right-6 z-10 text-[10px] text-zinc-500 pointer-events-none opacity-40 font-mono tracking-widest">
                INTERACTIVE SYSTEM V2.0
            </div>
        </div>
    );
}
