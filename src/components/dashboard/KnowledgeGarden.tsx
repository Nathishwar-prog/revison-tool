"use client";

import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Cloud } from '@react-three/drei';
import { Knowledge, LearningMetrics } from '@/domain/knowledge/knowledge.model';
import { PlantNode } from './garden/PlantNode';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KnowledgeGardenProps {
    knowledge: Knowledge[];
    metrics?: LearningMetrics[]; // Optional map of ID -> Metrics
    onNodeSelect: (k: Knowledge) => void;
}

export function KnowledgeGarden({ knowledge, metrics, onNodeSelect }: KnowledgeGardenProps) {
    // Generate positions in a spiral or grid
    const gardenNodes = useMemo(() => {
        return knowledge.map((k, i) => {
            // Phyllotaxis (Spiral) Pattern for natural garden look
            const angle = i * 2.39996; // Golden angle approx
            const radius = 4 * Math.sqrt(i + 1);
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            // Random tiny variation
            const xOff = (Math.random() - 0.5) * 0.5;
            const zOff = (Math.random() - 0.5) * 0.5;

            return {
                ...k,
                position: [x + xOff, 0, z + zOff] as [number, number, number]
            };
        });
    }, [knowledge]);

    if (!knowledge || knowledge.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-3xl border bg-black/60 dark:bg-black/40">
                <p className="text-zinc-500">Plant your first seed by adding knowledge.</p>
            </div>
        );
    }

    return (
        <div className="relative h-[600px] w-full overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-indigo-950 to-emerald-950/40 shadow-2xl group ring-1 ring-white/10">
            {/* Header */}
            <div className="absolute left-6 top-6 z-10 pointer-events-none">
                <h3 className="flex items-center gap-2 text-xl font-bold text-emerald-100 drop-shadow-md">
                    <span className="text-2xl">🌿</span> Knowledge Garden
                </h3>
                <p className="text-xs text-emerald-200/60 mt-1 font-medium tracking-wide max-w-xs">
                    TEND TO YOUR MIND
                </p>
            </div>

            {/* Legend */}
            <div className="absolute right-6 top-6 z-10 flex flex-col gap-2 pointer-events-none">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Sprout (New)
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Blooming (Strong)
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-stone-500"></span> Withered (Review Needed)
                </div>
            </div>

            <Canvas camera={{ position: [0, 8, 15], fov: 45 }} dpr={[1, 2]} shadows>
                <ambientLight intensity={0.2} />
                <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
                <pointLight position={[-10, 5, -10]} intensity={0.5} color="#10b981" />

                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="night" />
                <Cloud opacity={0.3} speed={0.4} width={10} depth={1.5} segments={20} position={[0, 10, -10]} />

                {/* Ground Plane */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                    <circleGeometry args={[50, 64]} />
                    <meshStandardMaterial
                        color="#0f172a"
                        roughness={0.8}
                        metalness={0.2}
                        transparent
                        opacity={0.8}
                    />
                </mesh>

                {/* Plants */}
                <group position={[0, 0, 0]}>
                    {gardenNodes.map((node) => {
                        // Find metrics for this node
                        const metric = metrics?.find(m => m.knowledgeId === node.id);
                        return (
                            <PlantNode
                                key={node.id}
                                item={node}
                                metrics={metric}
                                position={node.position}
                                onClick={onNodeSelect}
                            />
                        );
                    })}
                </group>

                <OrbitControls
                    maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going below ground
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxDistance={30}
                    minDistance={5}
                />
            </Canvas>

            <div className="absolute bottom-4 right-6 z-10 text-[10px] text-emerald-500/40 pointer-events-none font-mono tracking-widest">
                ECOSYSTEM V1.0
            </div>
        </div>
    );
}
