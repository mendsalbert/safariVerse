"use client";

import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
  Bounds,
  Center,
} from "@react-three/drei";
import { Suspense, useRef } from "react";
import { ArrowLeft } from "lucide-react";

function NftModel({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  const groupRef = useRef(null);
  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function NftCard({ title, src }: { title: string; src: string }) {
  return (
    <div className="bg-black/50 border border-amber-500/20 rounded-xl overflow-hidden">
      <div className="h-48 w-full">
        <Canvas camera={{ position: [0, 0, 2.2], fov: 45 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} color="#FF8C00" />
            <directionalLight
              position={[2, 3, 2]}
              intensity={1.2}
              color="#FF6B35"
            />
            <directionalLight
              position={[-2, 1, -2]}
              intensity={0.6}
              color="#FFD700"
            />
            <Environment preset="sunset" />
            <Bounds fit clip observe margin={1.15}>
              <group scale={[0.95, 0.95, 0.95]}>
                <Center>
                  <NftModel src={src} />
                </Center>
              </group>
            </Bounds>
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              autoRotate
              autoRotateSpeed={1}
            />
          </Suspense>
        </Canvas>
      </div>
      <div className="px-4 py-3 text-yellow-100 border-t border-amber-500/20">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs opacity-80">SafariVerse NFT</div>
      </div>
    </div>
  );
}

const NFT_ITEMS: { title: string; src: string }[] = [
  { title: "Lion", src: "/models/animalss/Lion.glb" },
  { title: "Giraffe", src: "/models/animalss/Giraffe.glb" },
  { title: "Elephant", src: "/models/animalss/Elephant.glb" },
  { title: "Zebra", src: "/models/animalss/Zebra.glb" },
  { title: "Gazelle", src: "/models/animalss/Gazelle.glb" },
  { title: "Hippopotamus", src: "/models/animalss/Hippopotamus.glb" },
];

export default function NftPage() {
  const router = useRouter();
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-lg border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> SafariVerse
          </button>
          <h1 className="font-display text-3xl bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent">
            NFT Marketplace
          </h1>
          <div />
        </div>
      </div>

      <div className="relative z-10 h-full flex items-start justify-center p-6 pt-20">
        <div className="bg-black/60 backdrop-blur-lg p-6 rounded-2xl border border-amber-500/30 text-orange-100 max-w-6xl w-full">
          <h2 className="text-2xl font-semibold mb-2">NFT Marketplace</h2>
          <p className="opacity-90 mb-6">
            Discover, collect, and trade 3D SafariVerse NFTs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NFT_ITEMS.map((item) => (
              <NftCard key={item.title} title={item.title} src={item.src} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
