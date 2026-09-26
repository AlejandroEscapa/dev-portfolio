import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Scene } from '@/components/three/Scene';
import { HoloFigure } from '@/components/three/HoloFigure';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useCssColor } from '@/hooks/useCssColor';

/**
 * HeroScene — the lazy-loaded hero 3D window content ("~/object.glb"):
 * holographic capsule presentation of the hero GLB. See
 * PROPUESTAS-3D-HERO.md (Propuesta A) for the design contract.
 *
 * Rendering policy:
 *   - hero out of viewport → frameloop "never" (no GPU work; hidden tabs
 *     already pause requestAnimationFrame natively)
 *   - reduced motion / low tier / mobile → frameloop "demand" (static pose,
 *     re-rendered on interaction or theme change), no postprocessing
 *   - otherwise → "always" + Bloom/Vignette
 */
export default function HeroScene() {
  const { shouldUseFallback, prefersReducedMotion } = useDeviceTier();
  const primary = useCssColor('--primary', 'hsl(248 90% 66%)');
  const accent = useCssColor('--accent', 'hsl(190 95% 60%)');
  const pedestal = useCssColor('--card', 'hsl(230 30% 8%)');

  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const motion = !prefersReducedMotion && !shouldUseFallback;

  // Out-of-viewport pause only: hidden tabs already stop requestAnimationFrame
  // natively, and document.hidden is unreliable in embedded webviews.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frameloop = inView ? (motion ? 'always' : 'demand') : 'never';

  return (
    <div ref={rootRef} className="absolute inset-0">
      <Scene
        camera={{ position: [0, 0.95, 3.5], fov: 40 }}
        dpr={[1, 1.75]}
        frameloop={frameloop}
        className="!absolute inset-0"
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[2.5, 3, 2]} intensity={1.15} />
        <directionalLight position={[-2.5, 1.6, 1.2]} intensity={0.45} />
        {/* Rim light — theme-primary; kicks up on hover over the figure */}
        <RimLight color={primary} hovered={hovered} />

        {/* Studio environment built from Lightformers — no external HDR,
            nothing fetched at runtime (drei renders these into an env map). */}
        <Environment resolution={256} frames={1}>
          <Lightformer
            intensity={2.2}
            position={[0, 5, 0]}
            rotation-x={Math.PI / 2}
            scale={[6, 6, 1]}
          />
          <Lightformer
            intensity={1.2}
            position={[-3, 1, 1]}
            rotation-y={Math.PI / 2}
            scale={[4, 2, 1]}
            color={accent}
          />
          <Lightformer
            intensity={0.8}
            position={[3, 1.5, -1]}
            rotation-y={-Math.PI / 2}
            scale={[4, 2, 1]}
          />
        </Environment>

        <HoloFigure
          primary={primary}
          accent={accent}
          pedestal={pedestal}
          onHover={setHovered}
          motion={motion}
        />

        <ContactShadows
          position={[0, 0.005, 0]}
          opacity={0.55}
          scale={3.2}
          blur={2.4}
          far={1.2}
          resolution={256}
        />

        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={Math.PI / 2 - 0.4}
          maxPolarAngle={Math.PI / 2 + 0.2}
          target={[0, 0.72, 0]}
        />

        {!shouldUseFallback && (
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={0.55}
              luminanceThreshold={0.85}
              luminanceSmoothing={0.25}
              mipmapBlur
            />
            <Vignette offset={0.22} darkness={0.5} />
          </EffectComposer>
        )}
      </Scene>
    </div>
  );
}

function RimLight({ color, hovered }: { color: string; hovered: boolean }) {
  const ref = useRef<THREE.DirectionalLight>(null);
  const target = hovered ? 2.6 : 1.2;
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.intensity += (target - ref.current.intensity) * Math.min(1, delta * 8);
  });
  return <directionalLight ref={ref} position={[-1.2, 2.4, -2.6]} intensity={target} color={color} />;
}
