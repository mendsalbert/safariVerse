"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Sky,
  Environment,
  Text3D,
  Center,
} from "@react-three/drei";
import { Suspense, useRef } from "react";
import { Mesh } from "three";

function AfricanVillage() {
  const groundRef = useRef<Mesh>(null);

  return (
    <group>
      {/* Ground - African Savannah */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Traditional African Huts */}
      {[...Array(5)].map((_, i) => (
        <group
          key={i}
          position={[(Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40]}
        >
          {/* Hut base */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[2, 3, 3, 8]} />
            <meshStandardMaterial color="#D2691E" />
          </mesh>
          {/* Roof */}
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[3.5, 2.5, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </group>
      ))}

      {/* Baobab Trees */}
      {[...Array(3)].map((_, i) => (
        <group
          key={`tree-${i}`}
          position={[(Math.random() - 0.5) * 30, 0, (Math.random() - 0.5) * 30]}
        >
          {/* Trunk */}
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[1, 1.5, 6]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          {/* Crown */}
          <mesh position={[0, 7, 0]}>
            <sphereGeometry args={[4, 8, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      ))}

      {/* Marketplace Stalls */}
      {[...Array(4)].map((_, i) => (
        <group key={`stall-${i}`} position={[(i - 2) * 4, 0, 8]}>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[3, 2, 2]} />
            <meshStandardMaterial color="#CD853F" />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[3.5, 0.2, 2.5]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WelcomeText() {
  return (
    <Center position={[0, 8, -15]}>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={2}
        height={0.2}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
      >
        SafariVerse
        <meshStandardMaterial color="#FFD700" />
      </Text3D>
    </Center>
  );
}

export default function GameScene() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 5, 15], fov: 75 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* Environment */}
          <Sky
            distance={450000}
            sunPosition={[0, 1, 0]}
            inclination={0}
            azimuth={0.25}
          />
          <Environment preset="sunset" />

          {/* 3D Scene */}
          <AfricanVillage />
          <WelcomeText />

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
