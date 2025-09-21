import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function DumbbellMesh() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 1, 32]} />
        <meshStandardMaterial color="#bac3cf" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[-0.55, 0, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#949bad" metalness={1} roughness={0.18} />
      </mesh>
      <mesh position={[0.55, 0, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#949bad" metalness={1} roughness={0.18} />
      </mesh>
    </group>
  );
}

export function ThreeDDumbbell() {
  return (
    <div className="w-36 h-36 mx-auto">
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 2, 2]} intensity={0.7} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2.0} />
        <DumbbellMesh />
      </Canvas>
    </div>
  );
}
