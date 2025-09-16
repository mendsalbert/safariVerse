"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import generated animal components
const Giraffe = dynamic(
  () => import("../components/models/animals/Giraffe").then((m) => m.Model),
  { ssr: false }
);
const Zebra = dynamic(
  () => import("../components/models/animals/Horse").then((m) => m.Model),
  { ssr: false }
);
const Lion = dynamic(
  () => import("../components/models/animals/Cat").then((m) => m.Model),
  { ssr: false }
);
const Elephant = dynamic(
  () => import("../components/models/animals/Cow").then((m) => m.Model),
  { ssr: false }
);
const Fox = dynamic(
  () => import("../components/models/animals/Fox").then((m) => m.Model),
  { ssr: false }
);
const Bird = dynamic(
  () => import("../components/models/animals/Bird").then((m) => m.Model),
  { ssr: false }
);

export default function AnimalsShowcase() {
  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-amber-900 via-orange-900 to-rose-900">
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-lg border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-amber-100">
          <h1 className="font-display text-2xl">Safari Animals (GLB → R3F)</h1>
          <a
            href="/babylon"
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            Back to Safari
          </a>
        </div>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 6, 16], fov: 55 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[8, 10, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <group position={[0, -1.2, 0]}>
            <group position={[-8, 0, 0]}>
              <Giraffe />
            </group>
            <group position={[-4, 0, 0]}>
              <Zebra />
            </group>
            <group position={[0, 0, 0]}>
              <Lion />
            </group>
            <group position={[4, 0, 0]}>
              <Elephant />
            </group>
            <group position={[8, 0, 0]}>
              <Fox />
            </group>
            <group position={[12, 2, -2]}>
              <Bird />
            </group>
          </group>
          <ContactShadows
            opacity={0.5}
            scale={40}
            blur={1.5}
            far={20}
            position={[0, -1.2, 0]}
          />
          <Environment preset="sunset" />
        </Suspense>
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
}
