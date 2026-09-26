import { Canvas } from '@react-three/fiber';
import { type ReactNode } from 'react';

interface SceneProps {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
}

export function Scene({ children, className, camera = { position: [0, 0, 5], fov: 75 } }: SceneProps) {
  return (
    <Canvas className={className} camera={camera} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      {children}
    </Canvas>
  );
}
