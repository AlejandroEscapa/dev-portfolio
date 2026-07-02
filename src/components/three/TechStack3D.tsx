import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TechItem {
  name: string;
  icon: string;
  position: [number, number, number];
}

const TECH_ITEMS: TechItem[] = [
  { name: "TypeScript", icon: "/icons/ts.svg", position: [-4.5, 2, 0] },
  { name: "Kotlin", icon: "/icons/kotlin.svg", position: [-2.25, 2, 0] },
  { name: "Java", icon: "/icons/java.svg", position: [0, 2, 0] },
  { name: "Swift", icon: "/icons/swift.svg", position: [2.25, 2, 0] },
  { name: "Python", icon: "/icons/python.svg", position: [4.5, 2, 0] },
  { name: "Angular", icon: "/icons/angular.svg", position: [-4.5, 0, 0] },
  { name: "React", icon: "/icons/react.svg", position: [-2.25, 0, 0] },
  { name: "Docker", icon: "/icons/docker.svg", position: [0, 0, 0] },
  { name: "PostgreSQL", icon: "/icons/postgre.svg", position: [2.25, 0, 0] },
  { name: "MongoDB", icon: "/icons/mongodb.svg", position: [4.5, 0, 0] },
  { name: "GitHub", icon: "/icons/github.svg", position: [-2.25, -2, 0] },
  { name: "Supabase", icon: "/icons/supabase.svg", position: [0, -2, 0] },
  { name: "VS Code", icon: "/icons/vscode.svg", position: [2.25, -2, 0] },
];

function TechIcon({
  item,
  mouse,
  isHovered,
}: {
  item: TechItem;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  isHovered: boolean;
}) {
  const texture = useTexture(item.icon);
  const ref = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(1);

  // Max-sharpness texture filtering — NearestFilter preserves hard SVG edges
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = true;

  useFrame(() => {
    if (!ref.current) return;

    // Gentle cursor tracking — same lerp style as Hero3D
    const tiltX = mouse.current.y * 0.1;
    const tiltY = mouse.current.x * 0.1;
    ref.current.rotation.x += (tiltX - ref.current.rotation.x) * 0.04;
    ref.current.rotation.y += (tiltY - ref.current.rotation.y) * 0.04;

    // Smooth hover scale
    const target = isHovered ? 1.2 : 1;
    scaleRef.current += (target - scaleRef.current) * 0.08;
    ref.current.scale.setScalar(scaleRef.current);
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1.2, 1.2]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

export function TechStack3D() {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reduced]);

  return (
    <>
      {TECH_ITEMS.map((item) => (
        <group
          key={item.name}
          position={item.position}
          onPointerOver={() => setHovered(item.name)}
          onPointerOut={() => setHovered(null)}
        >
          <TechIcon item={item} mouse={mouse} isHovered={hovered === item.name} />
        </group>
      ))}
    </>
  );
}
