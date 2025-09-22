"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import {
  ART_GALLERY_ITEMS,
  type ArtGalleryItem,
} from "../../lib/art-gallery-utils";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>
  );
}

function FitModel({
  modelPath,
  targetSize = 2.8,
}: {
  modelPath: string;
  targetSize?: number;
}) {
  try {
    // Use lazy loading for art gallery models
    const { scene } = useGLTF(modelPath, true);
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
  } catch (error) {
    console.warn(`Failed to load GLB model: ${modelPath}`, error);
    // Return a fallback box if model fails to load
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    );
  }
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
      {/* Safari-themed Pedestal */}
      <mesh position={[0, -1.0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0 * scale, 1.2 * scale, 0.4 * scale, 32]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Pedestal Base */}
      <mesh position={[0, -1.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.3 * scale, 1.3 * scale, 0.15 * scale, 32]} />
        <meshStandardMaterial
          color="#fdba74"
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* Model */}
      <group position={[0, 0, 0]}>
        <FitModel modelPath={modelPath} targetSize={2.4 * scale} />
      </group>
    </group>
  );
}

// Use the imported type from utils
type GalleryItem = ArtGalleryItem;

function GalleryScene({
  items,
  focusedIndex,
}: {
  items: GalleryItem[];
  focusedIndex: number;
}) {
  const focused = items[focusedIndex];

  return (
    <>
      {/* Safari-themed Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>

      {/* Center focused model */}
      <group position={[0, 2.2, 0]}>
        <ModelOnPedestal modelPath={focused.src} scale={1.4} />
      </group>

      {/* Background previews - only show nearby models */}
      {items.map((it, i) => {
        if (i === focusedIndex) return null;

        // Only show models within 2 positions of the current focus
        const distance = Math.abs(i - focusedIndex);
        if (distance > 2) return null;

        const angle = ((i - focusedIndex) / items.length) * Math.PI * 2;
        const radius = 8;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <group
            key={`preview-${i}`}
            position={[x, 1.5, z]}
            rotation={[0, -angle, 0]}
          >
            <ModelOnPedestal modelPath={it.src} scale={0.8} />
          </group>
        );
      })}

      {/* Safari-themed lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.0}
        color={0xfff7ed}
      />
      <directionalLight
        position={[-10, 10, -5]}
        intensity={0.8}
        color={0xffedd5}
      />
    </>
  );
}

export default function ArtGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.countryId as string;

  // Use predefined art gallery items from AWS S3 for faster loading
  const items: GalleryItem[] = ART_GALLERY_ITEMS;
  const titles = useMemo(() => items.map((it) => it.title), [items]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Lazy loading: Only preload the current model and next/prev models
  useEffect(() => {
    const preloadModel = (index: number) => {
      if (index >= 0 && index < items.length) {
        try {
          useGLTF.preload(items[index].src);
        } catch (error) {
          console.warn(`Failed to preload model: ${items[index].title}`, error);
        }
      }
    };

    // Preload current model and adjacent models only
    preloadModel(focusedIndex);
    preloadModel(focusedIndex - 1);
    preloadModel(focusedIndex + 1);
  }, [focusedIndex, items]);

  // Track loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [focusedIndex]);

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
    <div className="w-full h-screen relative bg-gradient-to-b from-orange-50 to-amber-100">
      <Canvas camera={{ position: [5, 4, 8], fov: 60 }}>
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={4}
          maxDistance={15}
          target={[0, 1.5, 0]}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 6}
        />
        <GalleryScene items={items} focusedIndex={focusedIndex} />
      </Canvas>

      {/* Museum Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-center bg-orange-50/90 backdrop-blur-md rounded-xl p-4 border border-orange-200 shadow-lg">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            ← Back
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              African Heritage Museum
            </h1>
            <p className="text-sm text-gray-600">
              Collection of {items.length} Artifacts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setFocusedIndex((p) => (p - 1 + items.length) % items.length)
              }
              className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setFocusedIndex((p) => (p + 1) % items.length)}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Artifact Information Panel */}
      <div className="absolute bottom-6 left-6 z-10 max-w-md">
        <div className="bg-orange-50/95 backdrop-blur-lg rounded-xl p-6 border border-orange-200 shadow-xl">
          <div className="flex items-start gap-4">
            {isLoading && <LoadingSpinner />}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {titles[focusedIndex]}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Artifact:</strong> {focusedIndex + 1} of{" "}
                  {items.length}
                </p>
                <p>
                  <strong>Collection:</strong> African Heritage
                </p>
                <p>
                  <strong>Status:</strong> {isLoading ? "Loading..." : "Ready"}
                </p>
              </div>

              {/* Navigation hints */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Use arrow keys or buttons to navigate • Drag to rotate view
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Navigation */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="bg-orange-50/95 backdrop-blur-lg rounded-xl p-4 border border-orange-200 shadow-xl">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Collection Items
          </h4>
          <div className="grid grid-cols-5 gap-2 max-w-xs">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setFocusedIndex(i)}
                className={`h-8 w-8 rounded-lg border-2 transition-all ${
                  i === focusedIndex
                    ? "bg-orange-600 border-orange-600"
                    : "bg-orange-100 border-orange-300 hover:bg-orange-200"
                }`}
                title={titles[i]}
              >
                <span
                  className={`text-xs font-medium ${
                    i === focusedIndex ? "text-white" : "text-gray-600"
                  }`}
                >
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
