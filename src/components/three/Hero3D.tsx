import { Float, Icosahedron } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function Hero3D() {
  const reduced = useReducedMotion();
  const ref = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateColor = () => {
      if (!materialRef.current) return;
      const style = getComputedStyle(document.documentElement);
      const primary = style.getPropertyValue('--primary').trim();
      try {
        materialRef.current.color.set(primary || '#7c5cff');
      } catch {
        materialRef.current.color.set('#7c5cff');
      }
    };
    updateColor();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          updateColor();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useFrame(() => {
    if (!ref.current || reduced) return;
    const targetX = mouse.current.y * 0.3;
    const targetY = mouse.current.x * 0.3;
    ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.05;
    ref.current.rotation.y += (targetY - ref.current.rotation.y) * 0.05;
  });

  return (
    <Float speed={reduced ? 0 : 2} rotationIntensity={reduced ? 0 : 0.5} floatIntensity={reduced ? 0 : 0.8}>
      <Icosahedron ref={ref} args={[1.2, 1]}>
        <meshBasicMaterial ref={materialRef} color="#7c5cff" wireframe />
      </Icosahedron>
    </Float>
  );
}
