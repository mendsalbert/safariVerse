"use client";

import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Environment,
  PerspectiveCamera,
  Text,
} from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import {
  Globe2,
  MapPin,
  Compass,
  Map as MapIcon,
  Mouse,
  ZoomIn,
} from "lucide-react";

type LatLng = { lat: number; lng: number };

interface CountryMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

const africanTop10: CountryMarker[] = [
  { id: "nigeria", name: "Nigeria", lat: 9.082, lng: 8.675, color: "#22c55e" },
  { id: "ghana", name: "Ghana", lat: 7.946, lng: -1.023, color: "#eab308" },
  {
    id: "ethiopia",
    name: "Ethiopia",
    lat: 9.145,
    lng: 40.489,
    color: "#84cc16",
  },
  { id: "egypt", name: "Egypt", lat: 26.82, lng: 30.802, color: "#f59e0b" },
  {
    id: "dr-congo",
    name: "DR Congo",
    lat: -4.038,
    lng: 21.758,
    color: "#ef4444",
  },
  {
    id: "tanzania",
    name: "Tanzania",
    lat: -6.369,
    lng: 34.888,
    color: "#06b6d4",
  },
  {
    id: "south-africa",
    name: "South Africa",
    lat: -30.559,
    lng: 22.937,
    color: "#f97316",
  },
  { id: "kenya", name: "Kenya", lat: -0.0236, lng: 37.906, color: "#dc2626" },
  { id: "uganda", name: "Uganda", lat: 1.3733, lng: 32.2903, color: "#eab308" },
  {
    id: "algeria",
    name: "Algeria",
    lat: 28.0339,
    lng: 1.6596,
    color: "#a855f7",
  },
  { id: "sudan", name: "Sudan", lat: 12.8628, lng: 30.2176, color: "#f43f5e" },
];

function latLngToVector3(
  lat: number,
  lng: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function CountryPin({
  country,
  radius,
}: {
  country: CountryMarker;
  radius: number;
}) {
  const pos = useMemo(
    () => latLngToVector3(country.lat, country.lng, radius + 0.001),
    [country, radius]
  );
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <group position={pos.toArray()}>
      <Html distanceFactor={10} center>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => router.push(`/country/${country.id}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              router.push(`/country/${country.id}`);
            }
          }}
          role="button"
          tabIndex={0}
          className="flex items-center justify-center cursor-pointer"
          style={{ pointerEvents: "auto" }}
        >
          <MapPin className="w-4 h-4" style={{ color: "#ffffff" }} />
        </div>
      </Html>

      {hovered && (
        <Html distanceFactor={10} center position={[0, 0.2, 0]}>
          <div
            className="px-2 py-1 rounded-md text-xs text-white bg-black/80 border border-white/20 whitespace-nowrap cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/country/${country.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                router.push(`/country/${country.id}`);
              }
            }}
            style={{ pointerEvents: "auto" }}
          >
            {country.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function RotatingGlobe({ onReady }: { onReady?: () => void }) {
  const earthTexture = useLoader(THREE.TextureLoader, "/earth_daymap.jpg");
  const bumpTexture = useLoader(THREE.TextureLoader, "/earth_bump.jpg");
  const specTexture = useLoader(THREE.TextureLoader, "/earth_spec.jpg");
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.02;
  });

  const radius = 2.2;
  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhongMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.04}
          specularMap={specTexture}
          shininess={8}
        />
      </mesh>

      {/* Glow atmosphere */}
      <mesh>
        <sphereGeometry args={[radius + 0.03, 64, 64]} />
        <meshBasicMaterial color="#ff7f32" transparent opacity={0.08} />
      </mesh>

      {/* Country pins */}
      {africanTop10.map((c) => (
        <CountryPin key={c.id} country={c} radius={radius} />
      ))}
    </group>
  );
}

export default function GlobeAfrica() {
  const [showInfo, setShowInfo] = useState(true);
  const router = useRouter();
  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
      {/* Modal on load */}
      {showInfo && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-gradient-to-br from-orange-800/90 via-red-800/90 to-amber-800/90 backdrop-blur-xl text-white p-8 rounded-3xl shadow-2xl max-w-4xl border-2 border-orange-400/50 text-center">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-4 text-orange-200 hover:text-white font-bold text-xl"
            >
              ×
            </button>
            <h1 className="font-display text-5xl bg-gradient-to-r from-orange-200 via-yellow-200 to-red-200 bg-clip-text text-transparent mb-2">
              Hedera SafariVerse
            </h1>
            <p className="text-orange-100 text-lg">
              Explore Africa on the world map. Hover pins to identify countries.
            </p>
          </div>
        </div>
      )}
      {/* Top-left title */}
      <div className="absolute top-6 left-6 z-10 bg-black/50 text-white px-4 py-2 rounded-xl border border-amber-500/40 flex items-center gap-2">
        <Globe2 className="w-5 h-5 text-amber-300" />
        <span className="font-display tracking-wide">Africa on the World</span>
      </div>
      {/* Top-right stats */}
      <div className="absolute top-6 right-6 z-10 bg-black/60 backdrop-blur-lg p-4 rounded-xl border border-amber-500/30 text-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <MapIcon className="w-5 h-5 text-amber-300" />
          <span className="font-semibold">Overview</span>
        </div>
        <div className="text-sm space-y-1">
          <div className="flex justify-between gap-6">
            <span>Markers:</span>
            <span className="text-yellow-300 font-semibold">
              {africanTop10.length}
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Theme:</span>
            <span className="text-yellow-300 font-semibold">Safari Sunset</span>
          </div>
        </div>
      </div>
      {/* Bottom-left guide */}
      <div className="absolute bottom-6 left-6 z-10 bg-black/60 backdrop-blur-lg p-4 rounded-xl border border-amber-500/30 text-yellow-100">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-yellow-300" />
          <span className="font-semibold">Explorer Guide</span>
        </div>
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <Mouse className="w-4 h-4" />
            <span>Drag to rotate</span>
          </div>
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4" />
            <span>Scroll to zoom</span>
          </div>
        </div>
      </div>
      {/* Bottom-right area intentionally left free for global UI controls */}
      <Canvas shadows onPointerMissed={() => {}}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 7]} />
          <ambientLight intensity={0.5} color="#FF8C00" />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.2}
            color="#FF6B35"
            castShadow
          />
          <directionalLight
            position={[-5, -4, -3]}
            intensity={0.6}
            color="#FFD700"
          />

          {/* Replaced failing HDR environment with local-friendly lighting */}
          <hemisphereLight args={[0xffe0a3, 0x2b1100, 0.9]} />
          <pointLight position={[0, 3, 6]} intensity={1.0} color="#FFD39A" />
          <pointLight position={[0, -3, -6]} intensity={0.6} color="#FFA64D" />

          <RotatingGlobe />

          <OrbitControls
            enablePan={false}
            minDistance={6}
            maxDistance={12}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
