import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Knowledge, LearningMetrics } from '@/domain/knowledge/knowledge.model';

interface PlantNodeProps {
    item: Knowledge;
    metrics?: LearningMetrics;
    position: [number, number, number];
    onClick: (item: Knowledge) => void;
    isGap?: boolean;
}

export function PlantNode({ item, metrics, position, onClick, isGap }: PlantNodeProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = React.useState(false);

    // Determine Plant State
    const state = useMemo(() => {
        const confidence = item.confidenceLevel || 0;
        const forgetRate = metrics?.forgetRate || 0;

        if (isGap) return 'gap';
        if (forgetRate > 0.4) return 'withered'; // High forget rate = dying
        if (confidence <= 2) return 'sprout';    // Low confidence = baby
        return 'blooming';                       // High confidence = strong
    }, [item.confidenceLevel, metrics?.forgetRate, isGap]);

    // Visual Traits based on state
    const traits = useMemo(() => {
        switch (state) {
            case 'withered':
                return {
                    color: '#78716c', // Stone grey/brown
                    stemColor: '#57534e',
                    scale: 0.8,
                    bobSpeed: 0.5,
                    particleColor: '#a8a29e'
                };
            case 'gap':
                return {
                    color: '#f43f5e', // Red/Rose
                    stemColor: '#881337',
                    scale: 0.9,
                    bobSpeed: 3, // Pulsing fast
                    particleColor: '#fb7185'
                };
            case 'sprout':
                return {
                    color: '#4ade80', // Green
                    stemColor: '#166534',
                    scale: 0.6,
                    bobSpeed: 2,
                    particleColor: '#86efac'
                };
            case 'blooming':
            default:
                // Generate a unique flower color based on ID
                const hue = parseInt(item.id.slice(-3), 36) % 360;
                return {
                    color: `hsl(${hue}, 70%, 60%)`,
                    stemColor: '#15803d', // Strong green
                    scale: 1.2,
                    bobSpeed: 1,
                    particleColor: `hsl(${hue}, 80%, 80%)`
                };
        }
    }, [state, item.id]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;

        // Gentle wind sway
        groupRef.current.rotation.z = Math.sin(t * traits.bobSpeed) * 0.05;

        // Hover scale effect
        const targetScale = hovered ? traits.scale * 1.2 : traits.scale;
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    });

    return (
        <group position={position} ref={groupRef}>
            <mesh
                onClick={(e) => { e.stopPropagation(); onClick(item); }}
                onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
            >
                {/* Stem */}
                <cylinderGeometry args={[0.05 * traits.scale, 0.08 * traits.scale, 1, 8]} />
                <meshStandardMaterial color={traits.stemColor} roughness={0.8} />
            </mesh>

            {/* Plant Head based on state */}
            <group position={[0, 0.5, 0]}>
                {state === 'gap' && (
                    <mesh position={[0, 0, 0]}>
                        <octahedronGeometry args={[0.3, 0]} />
                        <meshStandardMaterial
                            color={traits.color}
                            wireframe
                            emissive={traits.color}
                            emissiveIntensity={2}
                        />
                    </mesh>
                )}

                {state === 'sprout' && (
                    <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshStandardMaterial color={traits.color} roughness={0.5} />
                    </mesh>
                )}

                {state === 'blooming' && (
                    <group>
                        {/* Flower Center */}
                        <mesh>
                            <sphereGeometry args={[0.25, 16, 16]} />
                            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
                        </mesh>
                        {/* Petals (Simplified as a torus knot or multiple spheres) */}
                        <mesh position={[0, 0, 0]}>
                            <dodecahedronGeometry args={[0.5, 0]} />
                            <meshStandardMaterial color={traits.color} roughness={0.2} metalness={0.1} />
                        </mesh>
                    </group>
                )}

                {state === 'withered' && (
                    <mesh rotation={[0, 0, 0.5]}>
                        <dodecahedronGeometry args={[0.3, 0]} />
                        <meshStandardMaterial color={traits.color} roughness={0.9} />
                    </mesh>
                )}
            </group>

            {/* Label on Hover */}
            {hovered && (
                <Html position={[0, 1.2, 0]} center>
                    <div className="px-2 py-1 bg-black/80 text-white text-xs rounded border border-white/10 backdrop-blur-md whitespace-nowrap">
                        {item.title}
                    </div>
                </Html>
            )}
        </group>
    );
}
