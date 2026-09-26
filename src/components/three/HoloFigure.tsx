import { useLayoutEffect, useMemo, useRef, useEffect } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from '@/lib/gsap';

const MODEL_URL = '/3d/zoro-fanko-pop-draco.glb';
const TARGET_HEIGHT = 1.5;

// Draco decoder is self-hosted from /public/draco (no CDN dependency).
useGLTF.preload(MODEL_URL, '/draco/');

interface HoloFigureProps {
  primary: string;
  accent: string;
  pedestal: string;
  onHover: (hovered: boolean) => void;
  /** Full animation allowed (turntable, float, materialisation). */
  motion: boolean;
}

/**
 * HoloFigure — "holographic capsule" presentation of the hero GLB
 * (Propuesta A in PROPUESTAS-3D-HERO.md):
 *
 *   figure on a lit pedestal, scan-ring materialisation on load,
 *   slow turntable + mouse parallax, hover → rim light kick.
 *
 * All motion is gated by `motion` (false under prefers-reduced-motion
 * or the low-tier fallback path): the figure then renders as a static,
 * fully-opaque pose. Drag-orbit lives in HeroScene (OrbitControls).
 */
export function HoloFigure({ primary, accent, pedestal, onHover, motion }: HoloFigureProps) {
  const floatRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const riseRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const scanMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const { scene: raw } = useGLTF(MODEL_URL, '/draco/');

  const { model, materials } = useMemo(() => {
    const clone = raw.clone(true);
    // Own the materials: the animation mutates opacity, which must not
    // leak into drei's cached scene across HMR / strict double-mounts.
    const mats: THREE.MeshStandardMaterial[] = [];
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        const owned = mat.clone();
        owned.envMapIntensity = 0.55;
        (child as THREE.Mesh).material = owned;
        mats.push(owned);
      }
    });
    // Recentre the model on X/Z and rest its base on y=0 (pedestal top).
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);
    const scale = TARGET_HEIGHT / box.getSize(new THREE.Vector3()).y;

    const wrap = new THREE.Group();
    wrap.scale.setScalar(scale);
    wrap.add(clone);
    return { model: wrap, materials: mats };
  }, [raw]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // Materialisation: fade-in + rise + accent scan ring sweeping bottom→top.
  // Rooted in gsap.context (§15.8) so strict-mode double-mounts are safe.
  useLayoutEffect(() => {
    if (!motion) return;
    const ctx = gsap.context(() => {
      const scanMat = scanMatRef.current!;
      materials.forEach((m) => gsap.set(m, { opacity: 0, transparent: true }));
      gsap.set(riseRef.current!.position, { y: -0.3 });
      gsap.set(riseRef.current!.scale, { x: 0.92, y: 0.92, z: 0.92 });
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1.1 },
        onComplete: () => {
          materials.forEach((m) => {
            m.transparent = false;
            m.opacity = 1;
          });
          if (scanRef.current) scanRef.current.visible = false;
        },
      });
      tl.set(scanRef.current, { visible: true }, 0);
      tl.to(riseRef.current!.position, { y: 0 }, 0);
      tl.to(riseRef.current!.scale, { x: 1, y: 1, z: 1 }, 0);
      materials.forEach((m) => tl.to(m, { opacity: 1, duration: 0.9 }, 0.05));
      tl.fromTo(
        scanRef.current!.position,
        { y: 0.05 },
        { y: TARGET_HEIGHT + 0.2, duration: 1.35, ease: 'power2.inOut' },
        0.1,
      );
      tl.to(scanMat, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 1.0);
    }, floatRef);
    return () => ctx.revert();
  }, [motion, materials]);

  useFrame((_, delta) => {
    if (!motion) return;
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.12;
    if (tiltRef.current) {
      tiltRef.current.rotation.x += (mouse.current.y * 0.08 - tiltRef.current.rotation.x) * 0.05;
      tiltRef.current.rotation.z += (mouse.current.x * 0.05 - tiltRef.current.rotation.z) * 0.05;
    }
  });

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(true);
    document.body.style.cursor = 'grab';
  };
  const handleOut = () => {
    onHover(false);
    document.body.style.cursor = '';
  };

  return (
    <Float
      ref={floatRef}
      speed={motion ? 0.9 : 0}
      rotationIntensity={motion ? 0.15 : 0}
      floatIntensity={motion ? 0.6 : 0}
      floatingRange={[0.02, 0.1]}
    >
      <group ref={tiltRef}>
        <group ref={riseRef}>
          <group
            ref={spinRef}
            onPointerOver={handleOver}
            onPointerOut={handleOut}
          >
            <primitive object={model} position={[0, 0, 0]} />
          </group>
        </group>

        {/* Scan ring — visible only during the materialisation sweep */}
        <mesh ref={scanRef} rotation-x={Math.PI / 2} visible={false} position={[0, 0.05, 0]}>
          <torusGeometry args={[0.7, 0.012, 12, 72]} />
          <meshBasicMaterial
            ref={scanMatRef}
            color={accent}
            transparent
            opacity={0.9}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Pedestal: dark disc + accent-emissive top edge (bloom pickup) */}
      <group position={[0, -0.08, 0]}>
        <mesh>
          <cylinderGeometry args={[0.55, 0.62, 0.12, 64]} />
          <meshStandardMaterial
            color={pedestal}
            metalness={0.2}
            roughness={0.6}
            envMapIntensity={0.35}
          />
        </mesh>
        <mesh position={[0, 0.062, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.55, 0.008, 8, 96]} />
          <meshBasicMaterial color={accent} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}
