import { Float } from '@react-three/drei';
import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TechItem {
  name: string;
  color: string;
  position: [number, number, number];
}

const TECH_ITEMS: TechItem[] = [
  { name: 'React', color: '#61dafb', position: [-3, 1, 0] },
  { name: 'TypeScript', color: '#3178c6', position: [-1.5, 1.5, 0] },
  { name: 'Node.js', color: '#339933', position: [0, 1, 0] },
  { name: 'Three.js', color: '#ffffff', position: [1.5, 1.5, 0] },
  { name: 'GSAP', color: '#88ce02', position: [3, 1, 0] },
  { name: 'Tailwind', color: '#06b6d4', position: [-3, -1, 0] },
  { name: 'Vite', color: '#646cff', position: [-1.5, -1.5, 0] },
  { name: 'Python', color: '#3776ab', position: [0, -1, 0] },
  { name: 'Docker', color: '#2496ed', position: [1.5, -1.5, 0] },
  { name: 'Git', color: '#f05032', position: [3, -1, 0] },
];

interface TechStack3DProps {
  onSelect?: (tech: string) => void;
}

export function TechStack3D({ onSelect }: TechStack3DProps) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      {TECH_ITEMS.map((item) => (
        <Float
          key={item.name}
          speed={reduced ? 0 : 1.5}
          rotationIntensity={reduced ? 0 : 0.3}
          floatIntensity={reduced ? 0 : 0.5}
        >
          <mesh
            position={item.position}
            onPointerOver={() => setHovered(item.name)}
            onPointerOut={() => setHovered(null)}
            onClick={() => onSelect?.(item.name)}
            scale={hovered === item.name ? 1.3 : 1}
          >
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial
              color={item.color}
              wireframe
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}
