import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function PlateMesh() {
  return (
    <mesh>
      <torusGeometry args={[0.5, 0.13, 16, 100]} />
      <meshStandardMaterial color="#6366f1" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

export function ThreeDPlate() {
  return (
    <div className="w-28 h-28 mx-auto">
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={0.8} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.8} />
        <PlateMesh />
      </Canvas>
    </div>
  );
}
