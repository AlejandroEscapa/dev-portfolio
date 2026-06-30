import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const PARTICLE_COUNT_DESKTOP = 2000;
const PARTICLE_COUNT_MOBILE = 500;

export function FlowFieldBackground() {
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const count = tier === 'mobile' ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
  const mouse = useRef(new THREE.Vector2(0, 0));
  const pointsRef = useRef<THREE.Points>(null);

  const noise = useMemo(() => createNoise3D(), []);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, [count]);

  const materialRef = useRef<THREE.PointsMaterial>(null);

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

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 20 - 10;
      const y = -(e.clientY / window.innerHeight) * 20 + 10;
      mouse.current.set(x, y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || reduced) return;
    const t = state.clock.elapsedTime * 0.1;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = arr[ix];
      const y = arr[ix + 1];
      const angle = noise(x * 0.1, y * 0.1, t) * Math.PI * 2;
      arr[ix] += Math.cos(angle) * 0.01;
      arr[ix + 1] += Math.sin(angle) * 0.01;

      const dx = x - mouse.current.x;
      const dy = y - mouse.current.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < 4 && distSq > 0.000001) {
        const dist = Math.sqrt(distSq);
        const force = (2 - dist) * 0.02;
        arr[ix] += (dx / dist) * force;
        arr[ix + 1] += (dy / dist) * force;
      }

      if (Math.abs(arr[ix]) > 10) arr[ix] *= -0.95;
      if (Math.abs(arr[ix + 1]) > 10) arr[ix + 1] *= -0.95;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial ref={materialRef} size={0.03} color="#7c5cff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}
