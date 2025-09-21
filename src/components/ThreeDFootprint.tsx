import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function FootMesh() {
  return (
    <mesh rotation={[Math.PI / 4, 0, 0]}>
      <boxGeometry args={[0.75, 0.33, 0.10]} />
      <meshStandardMaterial color="#22c55e" metalness={0.5} roughness={0.35} />
    </mesh>
  );
}

export function ThreeDFootprint() {
  return (
    <div className="w-24 h-24 mx-auto">
      <Canvas camera={{ position: [0, 0, 1.5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 2]} intensity={0.7} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
        <FootMesh />
      </Canvas>
    </div>
  );
}
