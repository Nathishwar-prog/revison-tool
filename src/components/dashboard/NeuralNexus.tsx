"use client";

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Stars, Line, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Knowledge } from '@/domain/knowledge/knowledge.model';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface GraphNode extends Knowledge {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    color: string;
}

interface GraphLink {
    source: string;
    target: string;
    strength: number; // 0 to 1
}

interface NeuralNexusProps {
    knowledge: Knowledge[];
}

// --- Physics Constants ---
const REPULSION = 50.0;
const SPRING_LENGTH = 5.0;
const SPRING_STRENGTH = 0.05;
const CENTERING = 0.005;
const DAMPING = 0.95; // Velocity decay

// --- Helper: Generate Graph Data ---
function generateGraphData(knowledge: Knowledge[]) {
    // 1. Initialize Nodes with random positions
    const nodes: GraphNode[] = knowledge.map(k => ({
        ...k,
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        vz: 0,
        color: k.confidenceLevel <= 2 ? '#f43f5e' : (k.confidenceLevel >= 4 ? '#10b981' : '#fbbf24')
    }));

    // 2. Generate Links based on relationships
    const links: GraphLink[] = [];

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            let strength = 0;

            // Link by Domain
            if (a.domain && b.domain && a.domain === b.domain) strength += 0.3;
            // Link by Technology
            if (a.technology && b.technology && a.technology === b.technology) strength += 0.4;
            // Link by Tags (Intersection)
            const sharedTags = a.tags.filter(t => b.tags.includes(t));
            if (sharedTags.length > 0) strength += 0.5;

            if (strength > 0) {
                links.push({
                    source: a.id,
                    target: b.id,
                    strength: Math.min(strength, 1) // Cap at 1
                });
            }
        }
    }

    return { nodes, links };
}

// --- 3D Components ---

function Simulation({ nodes, links, onNodeClick, hoveredNodeId }: { nodes: GraphNode[], links: GraphLink[], onNodeClick: (n: GraphNode) => void, hoveredNodeId: string | null }) {
    const linesRef = useRef<any>(null);
    const nodesRef = useRef<THREE.Group>(null);

    // We use a ref to store mutable node positions for performance
    // React state would trigger too many re-renders for 60fps physics
    const physicsNodes = useRef(nodes);

    useFrame(() => {
        const nodeList = physicsNodes.current;

        // Apply Forces
        for (let i = 0; i < nodeList.length; i++) {
            const node = nodeList[i];
            let fx = 0, fy = 0, fz = 0;

            // 1. Repulsion (Push apart)
            for (let j = 0; j < nodeList.length; j++) {
                if (i === j) continue;
                const other = nodeList[j];
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const dz = node.z - other.z;
                const distSq = dx * dx + dy * dy + dz * dz + 0.1; // Avoid div by zero
                const dist = Math.sqrt(distSq);

                const force = REPULSION / distSq;
                fx += (dx / dist) * force;
                fy += (dy / dist) * force;
                fz += (dz / dist) * force;
            }

            // 2. Attraction (Springs)
            // Note: This O(N*L) loop is naive but fine for <100 nodes. 
            // Optimally we'd index links by node ID.
            links.forEach(link => {
                if (link.source === node.id || link.target === node.id) {
                    const otherId = link.source === node.id ? link.target : link.source;
                    const other = nodeList.find(n => n.id === otherId);
                    if (other) {
                        const dx = other.x - node.x;
                        const dy = other.y - node.y;
                        const dz = other.z - node.z;
                        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                        const displacement = dist - SPRING_LENGTH;
                        const force = displacement * SPRING_STRENGTH * link.strength;

                        fx += (dx / dist) * force;
                        fy += (dy / dist) * force;
                        fz += (dz / dist) * force;
                    }
                }
            });

            // 3. Centering (Gravity)
            fx -= node.x * CENTERING;
            fy -= node.y * CENTERING;
            fz -= node.z * CENTERING;

            // Update Velocity
            node.vx = (node.vx + fx * 0.01) * DAMPING;
            node.vy = (node.vy + fy * 0.01) * DAMPING;
            node.vz = (node.vz + fz * 0.01) * DAMPING;

            // Update Position
            node.x += node.vx;
            node.y += node.vy;
            node.z += node.vz;
        }

        // Apply visual updates
        if (nodesRef.current) {
            nodesRef.current.children.forEach((child, i) => {
                const node = nodeList[i];
                child.position.set(node.x, node.y, node.z);
            });
        }
    });

    // Compute Lines (Expensive, maybe memoize or update less frequently if slow)
    // For R3F, we need to return the visual structure
    // Since positions change every frame, we rely on the line component to update logic or 
    // simply render based on the initial 'nodes' object structure 
    // Wait, useFrame updates the MUTABLE physicsNodes locations.
    // The Lines need to track these positions. 

    // Simplified: Just update lines in the same loop or use a custom line component that reads refs.
    // For this prototype, we will just render lines statically connected to node objects, 
    // and let React/Three update them if we pass the *same* object references? 
    // No, primitives need array of points.

    // Better approach: Static lines that connect to node refs? 
    // We will stick to the nodes rendering for now. Render lines as a separate optimization later if needed.
    // Actually, let's just draw lines between current positions. React cycle won't update these fast enough.
    // We need a specific "Lines" component that updates its geometry in useFrame.

    return (
        <>
            <group ref={nodesRef}>
                {physicsNodes.current.map((node) => (
                    <NodeMesh
                        key={node.id}
                        node={node}
                        onClick={onNodeClick}
                        isDimmed={hoveredNodeId !== null && hoveredNodeId !== node.id} // TODO: Check neighbors
                    />
                ))}
            </group>
            <LiveLines nodes={physicsNodes.current} links={links} />
        </>
    );
}

function LiveLines({ nodes, links }: { nodes: GraphNode[], links: GraphLink[] }) {
    const ref = useRef<any>(null);

    // We need to construct a single BufferGeometry for all lines for performance
    // OR just use <Line> for each. <Line> is heavy. 
    // Let's use simple THREE.LineSegments with a BufferGeometry that we update.

    const geometry = useMemo(() => new THREE.BufferGeometry(), []);
    const positions = useMemo(() => new Float32Array(links.length * 6), [links]); // 2 points * 3 coords

    useFrame(() => {
        if (!ref.current) return;

        let ptr = 0;
        links.forEach(link => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            if (source && target) {
                positions[ptr++] = source.x;
                positions[ptr++] = source.y;
                positions[ptr++] = source.z;
                positions[ptr++] = target.x;
                positions[ptr++] = target.y;
                positions[ptr++] = target.z;
            }
        });

        const attr = ref.current.geometry.attributes.position;
        if (attr) {
            attr.array.set(positions);
            attr.needsUpdate = true;
        } else {
            ref.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        }
    });

    return (
        <lineSegments ref={ref}>
            <bufferGeometry />
            <lineBasicMaterial color="#6366f1" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
    );
}

function NodeMesh({ node, onClick, isDimmed }: { node: GraphNode, onClick: (n: GraphNode) => void, isDimmed: boolean }) {
    const [hovered, setHovered] = useState(false);

    return (
        <group>
            <mesh
                onClick={(e) => { e.stopPropagation(); onClick(node); }}
                onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
            >
                <sphereGeometry args={[isDimmed ? 0.3 : 0.4, 32, 32]} />
                <meshPhysicalMaterial
                    color={node.color}
                    emissive={node.color}
                    emissiveIntensity={hovered ? 0.8 : 0.2}
                    transparent
                    opacity={isDimmed ? 0.2 : 0.9}
                    roughness={0.2}
                    metalness={0.8}
                    clearcoat={1}
                />
            </mesh>
            {/* Label */}
            {(hovered || !isDimmed) && (
                <Billboard>
                    <Text
                        position={[0, 0.6, 0]}
                        fontSize={0.3}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.02}
                        outlineColor="#000000"
                    >
                        {node.title}
                    </Text>
                </Billboard>
            )}
        </group>
    );
}

export function NeuralNexus({ knowledge }: NeuralNexusProps) {
    const { nodes, links } = useMemo(() => generateGraphData(knowledge), [knowledge]);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

    return (
        <div className="relative h-[600px] w-full overflow-hidden rounded-3xl border border-indigo-500/20 bg-black/90 shadow-2xl">
            {/* Overlay UI */}
            <div className="absolute left-6 top-6 z-10 pointer-events-none">
                <h3 className="flex items-center gap-2 text-xl font-bold text-indigo-100 drop-shadow-md">
                    <span className="text-2xl">🕸️</span> Neural Nexus
                </h3>
            </div>

            <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} count={1000} factor={4} fade />

                <Simulation
                    nodes={nodes}
                    links={links}
                    onNodeClick={setSelectedNode}
                    hoveredNodeId={selectedNode?.id || null}
                />

                <OrbitControls enablePan={true} maxDistance={40} minDistance={5} autoRotate={!selectedNode} autoRotateSpeed={0.5} />
            </Canvas>

            {/* Selected Details */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-6 left-6 right-6 z-20 p-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-xl font-bold text-white">{selectedNode.title}</h4>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">
                                        {selectedNode.domain}
                                    </span>
                                    <span className="text-xs bg-white/10 text-zinc-400 px-2 py-1 rounded">
                                        {selectedNode.type}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="text-zinc-500 hover:text-white">Close</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
