"use client";

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface KnowledgeTreeProps {
    totalRevisions: number;
}

// Procedural Tree Generation
const TREE_COLORS = {
    wood: "#8B4513",
    leaf: ["#4ade80", "#22c55e", "#16a34a", "#15803d"],
    flower: ["#f472b6", "#fb7185", "#fca5a5"]
};

function Branch({ position, rotation, length, thickness, depth, maxDepth }: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const hasLeaf = depth === maxDepth || (depth > 1 && Math.random() > 0.6);
    const hasFlower = depth === maxDepth && Math.random() > 0.8;

    // Sway animation
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            const wind = Math.sin(time * 0.5 + position[1]) * 0.05 * (depth / maxDepth);
            meshRef.current.rotation.z = rotation[2] + wind;
        }
    });

    return (
        <group position={position} rotation={rotation}>
            {/* Branch Segment */}
            <mesh position={[0, length / 2, 0]} castShadow receiveShadow ref={meshRef}>
                <cylinderGeometry args={[thickness * 0.7, thickness, length, 8]} />
                <meshStandardMaterial color={TREE_COLORS.wood} roughness={0.8} />
            </mesh>

            {/* Leaves */}
            {hasLeaf && (
                <group position={[0, length, 0]}>
                    <mesh rotation={[0.5, 0, 0]} scale={depth === maxDepth ? 1.5 : 1}>
                        <sphereGeometry args={[0.3, 8, 8]} />
                        <meshStandardMaterial color={TREE_COLORS.leaf[depth % TREE_COLORS.leaf.length]} />
                    </mesh>
                    {/* Flower */}
                    {hasFlower && (
                        <mesh position={[0, 0.3, 0]} scale={0.5}>
                            <dodecahedronGeometry args={[0.4]} />
                            <meshStandardMaterial color={TREE_COLORS.flower[Math.floor(Math.random() * TREE_COLORS.flower.length)]} emissive={TREE_COLORS.flower[0]} emissiveIntensity={0.5} />
                        </mesh>
                    )}
                </group>
            )}

            {/* Recursive Branches */}
            {depth < maxDepth && (
                <group position={[0, length, 0]}>
                    <Branch
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0.5]}
                        length={length * 0.8}
                        thickness={thickness * 0.7}
                        depth={depth + 1}
                        maxDepth={maxDepth}
                    />
                    <Branch
                        position={[0, 0, 0]}
                        rotation={[0, 0, -0.5]}
                        length={length * 0.8}
                        thickness={thickness * 0.7}
                        depth={depth + 1}
                        maxDepth={maxDepth}
                    />
                    {/* Occasional 3rd branch for fullness */}
                    {Math.random() > 0.5 && (
                        <Branch
                            position={[0, 0, 0]}
                            rotation={[0.5, 0, 0]}
                            length={length * 0.7}
                            thickness={thickness * 0.7}
                            depth={depth + 1}
                            maxDepth={maxDepth}
                        />
                    )}
                </group>
            )}
        </group>
    );
}

function MainTree({ stage }: { stage: number }) {
    // Map stage (1-5) to tree complexity
    const complexity = useMemo(() => {
        if (stage <= 1) return { depth: 1, length: 1.5 }; // Sapling
        if (stage === 2) return { depth: 2, length: 1.8 };
        if (stage === 3) return { depth: 3, length: 2 };
        if (stage === 4) return { depth: 4, length: 2.2 };
        return { depth: 5, length: 2.5 }; // Ancient Tree
    }, [stage]);

    return (
        <group position={[0, -2, 0]}>
            <Branch
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                length={complexity.length}
                thickness={0.4}
                depth={0}
                maxDepth={complexity.depth}
            />
        </group>
    );
}

export function KnowledgeTree({ totalRevisions }: KnowledgeTreeProps) {
    // Determine growth stage
    const stage = useMemo(() => {
        if (totalRevisions < 5) return 1;    // Seedling
        if (totalRevisions < 20) return 2;   // Sapling
        if (totalRevisions < 50) return 3;   // Young Tree
        if (totalRevisions < 100) return 4;  // Mature Tree
        return 5;                            // Ancient Tree
    }, [totalRevisions]);

    const title = useMemo(() => {
        if (stage === 1) return "Seedling";
        if (stage === 2) return "Sapling";
        if (stage === 3) return "Young Tree";
        if (stage === 4) return "Mature Tree";
        return "Ancient Guardian";
    }, [stage]);

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className="relative h-64 w-full overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-b from-sky-50 to-emerald-50 dark:from-sky-950/30 dark:to-emerald-950/30 dark:border-emerald-900/50 shadow-sm transition-all group">
            {/* Header Overlay */}
            <div className="absolute top-4 left-6 z-10">
                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide flex items-center gap-2">
                    🌱 Knowledge Garden
                </h3>
                <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
                    {title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                        Lvl {stage}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {totalRevisions} Revisions
                    </span>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-white/50 dark:bg-black/50 backdrop-blur-md px-2 py-1 rounded-md">
                    Grow by revising daily
                </p>
            </div>

            <Canvas camera={{ position: [0, 2, 8], fov: 45 }} eventSource={containerRef}>
                <ambientLight intensity={0.8} />
                <pointLight position={[5, 10, 5]} intensity={1} color="#fbbf24" /> {/* Sun */}
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#c084fc" /> {/* Fill */}

                {/* Floating particles (Pollen/Magic) */}
                <Sparkles count={30} scale={6} size={2} speed={0.4} opacity={0.5} color={stage > 3 ? "#fbbf24" : "#ffffff"} />

                <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
                    <MainTree stage={stage} />
                </Float>

                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
            </Canvas>
        </div>
    );
}
