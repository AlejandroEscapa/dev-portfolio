import { Canvas } from '@react-three/fiber';
import { type ReactNode } from 'react';

interface SceneProps {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
  dpr?: [number, number];
  frameloop?: 'always' | 'demand' | 'never';
}

export function Scene({
  children,
  className,
  camera = { position: [0, 0, 5], fov: 75 },
  dpr = [1, 2],
  frameloop = 'always',
}: SceneProps) {
  return (
    <Canvas
      className={className}
      camera={camera}
      dpr={dpr}
      frameloop={frameloop}
      gl={{ antialias: true, alpha: true }}
    >
      {children}
    </Canvas>
  );
}
