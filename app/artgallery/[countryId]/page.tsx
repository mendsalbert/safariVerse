"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

function FitModel({
  modelPath,
  targetSize = 2.8,
}: {
  modelPath: string;
  targetSize?: number;
}) {
  const { scene } = useGLTF(modelPath);
  const { fitted, scale } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = targetSize / maxDim;
    return { fitted: cloned, scale: s };
  }, [scene, targetSize]);

  return <primitive object={fitted} scale={[scale, scale, scale]} />;
}

function ModelOnPedestal({
  modelPath,
  scale = 1,
}: {
  modelPath: string;
  scale?: number;
}) {
  return (
    <group>
      {/* Pedestal */}
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[1.0 * scale, 1.2 * scale, 0.35 * scale, 24]} />
        <meshStandardMaterial
          color="#dddddd"
          roughness={0.3}
          metalness={0.05}
        />
      </mesh>
      {/* Model */}
      <FitModel modelPath={modelPath} targetSize={2.4 * scale} />
    </group>
  );
}

type GalleryItem = { type: "model"; src: string; title: string };

function GalleryScene({
  items,
  focusedIndex,
}: {
  items: GalleryItem[];
  focusedIndex: number;
}) {
  const radius = 10;
  const focused = items[focusedIndex];
  return (
    <>
      {/* Bright Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.9} />
      </mesh>

      {/* Center focused model */}
      <group position={[0, 2.2, -4]}>
        <ModelOnPedestal modelPath={focused.src} scale={1.4} />
      </group>

      {/* Background previews in a bright arc */}
      {items.map((it, i) => {
        if (i === focusedIndex) return null;
        const idx = i < focusedIndex ? i : i - 1;
        const total = items.length - 1;
        const angle =
          ((idx - (total - 1) / 2) / Math.max(total - 1, 1)) * Math.PI * 0.65;
        const x = Math.sin(angle) * radius;
        const z = -6 - Math.cos(angle) * radius;
        const y = 1.9;
        const tilt = -angle * 0.35;
        return (
          <group
            key={`${it.type}-${i}`}
            position={[x, y, z]}
            rotation={[0, tilt, 0]}
          >
            <ModelOnPedestal modelPath={it.src} scale={0.95} />
          </group>
        );
      })}

      {/* Bright Studio Lighting */}
      <ambientLight intensity={0.8} />
      <hemisphereLight args={[0xffffff, 0xdddddd, 0.9]} />
      <directionalLight
        position={[8, 12, 10]}
        intensity={1.2}
        color={0xffffff}
      />
      <directionalLight
        position={[-8, 10, -6]}
        intensity={0.9}
        color={0xffffff}
      />
      <spotLight
        position={[0, 12, 2]}
        angle={0.4}
        intensity={2.0}
        color={0xffffff}
      />
    </>
  );
}

export default function ArtGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.countryId as string;

  // 3D GLB artifacts from public/art-gallery (pictures removed per request)
  const items: GalleryItem[] = [
    // {
    //   type: "model",
    //   src: "/art-gallery/An old South African springbok coin.glb",
    //   title: "Springbok Coin",
    // },
    {
      type: "model",
      src: "/art-gallery/Elephant .glb",
      title: "Elephant Sculpture",
    },
    {
      type: "model",
      src: "/art-gallery/2000’s radio.glb",
      title: "2000's Radio",
    },
    { type: "model", src: "/art-gallery/Salt lamp.glb", title: "Salt Lamp" },
    {
      type: "model",
      src: "/art-gallery/African Chair.glb",
      title: "African Chair",
    },
    {
      type: "model",
      src: "/art-gallery/3 leg potjie pot.glb",
      title: "3-Leg Potjie Pot",
    },
    {
      type: "model",
      src: "/art-gallery/Woodstock 2_.glb",
      title: "Woodstock 2",
    },
    { type: "model", src: "/art-gallery/Giraffe (1).glb", title: "Giraffe" },
  ];

  // Preload models
  useGLTF.preload("/art-gallery/An old South African springbok coin.glb");
  useGLTF.preload("/art-gallery/Elephant .glb");
  useGLTF.preload("/art-gallery/2000’s radio.glb");
  useGLTF.preload("/art-gallery/Salt lamp.glb");
  useGLTF.preload("/art-gallery/African Chair.glb");
  useGLTF.preload("/art-gallery/3 leg potjie pot.glb");
  useGLTF.preload("/art-gallery/Woodstock 2_.glb");
  useGLTF.preload("/art-gallery/Giraffe (1).glb");

  const titles = useMemo(() => items.map((it) => it.title), [items]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocusedIndex((p) => (p + 1) % items.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusedIndex((p) => (p - 1 + items.length) % items.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-white to-[#f2efe8]">
      <Canvas camera={{ position: [0, 7, 14], fov: 60 }}>
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={7}
          maxDistance={26}
          target={[0, 2.2, -4]}
        />
        <GalleryScene items={items} focusedIndex={focusedIndex} />
      </Canvas>

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-center bg-white/60 backdrop-blur-md rounded-lg p-3 border border-amber-500/30">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 rounded bg-white/70 text-gray-800 hover:bg-white"
          >
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            African Art Gallery
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setFocusedIndex((p) => (p - 1 + items.length) % items.length)
              }
              className="px-3 py-2 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            >
              Prev
            </button>
            <button
              onClick={() => setFocusedIndex((p) => (p + 1) % items.length)}
              className="px-3 py-2 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
        <div className="px-5 py-3 bg-white/70 text-gray-900 backdrop-blur-lg rounded-xl border border-amber-500/30">
          <p className="text-sm font-semibold text-center">
            {titles[focusedIndex]}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="flex gap-2 bg-white/60 text-gray-900 backdrop-blur-md rounded-full px-4 py-2 border border-amber-500/30">
          {items.map((_, i) => (
            <div
              key={i}
              onClick={() => setFocusedIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === focusedIndex ? "w-8 bg-amber-500" : "w-2 bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
