"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  Text,
  useGLTF,
  Sky,
  Cloud,
  ContactShadows,
  useTexture,
  Plane,
  Float,
  SpotLight,
  BakeShadows,
} from "@react-three/drei";
import {
  Suspense,
  useRef,
  useState,
  useEffect,
  useMemo,
  MutableRefObject,
} from "react";
import { useParams, useRouter } from "next/navigation";
import * as THREE from "three";
import {
  ArrowLeft,
  Heart,
  Star,
  Trophy,
  Zap,
  Apple,
  Shield,
  Volume2,
  VolumeX,
} from "lucide-react";
// Converted R3F animal models (GLB -> components)
// Animal models removed from scene
import { Model as TreeLarge } from "../../components/env/TreeLarge";
import { Model as TreeSavanna } from "../../components/env/TreeSavanna";
import { Model as GrassA } from "../../components/env/GrassA";
import { Model as Rock } from "../../components/env/Rock";
import { Model as Pond } from "../../components/env/Pond";
import { Model as RainbowWithClouds } from "../../components/env/RainbowWithClouds";
import { Model as BarrelCactus } from "../../components/env/BarrelCactus";
import { Model as PricklyPearCactus } from "../../components/env/PricklyPearCactus";
// Bridge removed from scene
import { Model as Humvee } from "../../components/env/Humvee";

// Preload frequently used GLB assets to prevent blank canvas on refresh due to loading stalls
// Add error handling and force preload
const preloadAssets = () => {
  const assets = [
    "/models/animalss/Elephant.glb",
    "/models/animalss/Giraffe.glb",
    "/models/animalss/Lion.glb",
    "/models/animalss/Hippopotamus.glb",
    "/models/animalss/Gazelle.glb",
    "/models/animalss/bird.glb",
    "/models/animalss/Hummingbird.glb",
    "/models/animalss/Waterfall.glb",
    "/models/animalss/Zebra.glb",
    "/models/trees/Big%20Tree.glb",
    "/models/trees/Trees.glb",
    "/models/trees/Twisted%20Tree.glb",
    "/models/rocks/Rock.glb",
    "/models/rocks/Rock%20Large.glb",
    "/models/rocks/Rock%20Medium.glb",
    "/models/rocks/Rocks.glb",
  ];

  assets.forEach((asset) => {
    try {
      useGLTF.preload(asset);
    } catch (error) {
      console.warn(`Failed to preload ${asset}:`, error);
    }
  });
};

preloadAssets();

// Game state interface
interface GameState {
  score: number;
  health: number;
  level: number;
  fruitsCollected: number;
  animalsDefeated: number;
}

// Realistic Avatar component
function Avatar({
  position,
  onMove,
}: {
  position: [number, number, number];
  onMove: (pos: [number, number, number]) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [walkCycle, setWalkCycle] = useState(0);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Realistic walking animation
      const time = state.clock.elapsedTime;
      if (isMoving) {
        setWalkCycle(walkCycle + delta * 8);
        // Body sway
        groupRef.current.rotation.z = Math.sin(time * 6) * 0.05;
        // Vertical bounce
        groupRef.current.position.y = position[1] + Math.sin(time * 12) * 0.02;
      } else {
        // Idle breathing animation
        groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.01;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Avatar body with realistic proportions */}
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.25, 1.2]} />
        <meshPhysicalMaterial
          color="#8B4513"
          roughness={0.8}
          metalness={0.1}
          clearcoat={0.1}
        />
      </mesh>

      {/* Avatar head */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshPhysicalMaterial
          color="#D2691E"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Eyes with realistic materials */}
      <mesh position={[0.08, 1.65, 0.15]} castShadow>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshPhysicalMaterial color="white" roughness={0.1} metalness={0.0} />
      </mesh>
      <mesh position={[-0.08, 1.65, 0.15]} castShadow>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshPhysicalMaterial color="white" roughness={0.1} metalness={0.0} />
      </mesh>

      {/* Pupils */}
      <mesh position={[0.08, 1.65, 0.17]} castShadow>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshPhysicalMaterial color="black" roughness={0.0} metalness={0.0} />
      </mesh>
      <mesh position={[-0.08, 1.65, 0.17]} castShadow>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshPhysicalMaterial color="black" roughness={0.0} metalness={0.0} />
      </mesh>

      {/* Arms */}
      <mesh
        position={[0.35, 1.2, 0]}
        rotation={[0, 0, Math.sin(walkCycle) * 0.3]}
        castShadow
      >
        <capsuleGeometry args={[0.08, 0.6]} />
        <meshPhysicalMaterial color="#8B4513" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh
        position={[-0.35, 1.2, 0]}
        rotation={[0, 0, -Math.sin(walkCycle) * 0.3]}
        castShadow
      >
        <capsuleGeometry args={[0.08, 0.6]} />
        <meshPhysicalMaterial color="#8B4513" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Legs */}
      <mesh
        position={[0.15, 0.3, 0]}
        rotation={[Math.sin(walkCycle + Math.PI) * 0.4, 0, 0]}
        castShadow
      >
        <capsuleGeometry args={[0.1, 0.7]} />
        <meshPhysicalMaterial
          color="#654321"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      <mesh
        position={[-0.15, 0.3, 0]}
        rotation={[Math.sin(walkCycle) * 0.4, 0, 0]}
        castShadow
      >
        <capsuleGeometry args={[0.1, 0.7]} />
        <meshPhysicalMaterial
          color="#654321"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

// Simple exhaust smoke system that spawns puffs when the vehicle is moving
function ExhaustSmoke({
  vehicleRef,
  velocityRef,
}: {
  vehicleRef: MutableRefObject<THREE.Group | null>;
  velocityRef: MutableRefObject<number>;
}) {
  const MAX_PUFFS = 50;
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  const lifesRef = useRef<Float32Array>(new Float32Array(MAX_PUFFS));
  const maxLifesRef = useRef<Float32Array>(new Float32Array(MAX_PUFFS));
  const velocitiesRef = useRef<Array<THREE.Vector3>>(
    Array.from({ length: MAX_PUFFS }, () => new THREE.Vector3())
  );
  const lastIndexRef = useRef(0);
  const spawnAccumulatorRef = useRef(0);

  useFrame((_, delta) => {
    const vehicle = vehicleRef.current;
    if (!vehicle) return;

    const speed = Math.abs(velocityRef.current);

    // Spawn new puffs based on speed
    if (speed > 0.05) {
      const spawnRate = 8 + speed * 6; // puffs per second scales with speed
      spawnAccumulatorRef.current += spawnRate * delta;
      while (spawnAccumulatorRef.current >= 1) {
        spawnAccumulatorRef.current -= 1;
        const N = MAX_PUFFS;
        let i = lastIndexRef.current;
        let found = -1;
        for (let k = 0; k < N; k++) {
          const idx = (i + k) % N;
          if (lifesRef.current[idx] <= 0) {
            found = idx;
            break;
          }
        }
        if (found >= 0) {
          lastIndexRef.current = (found + 1) % N;
          const mesh = meshRefs.current[found];
          if (mesh) {
            const worldQuat = new THREE.Quaternion();
            vehicle.getWorldQuaternion(worldQuat);
            const worldPos = new THREE.Vector3();
            vehicle.getWorldPosition(worldPos);
            const backDir = new THREE.Vector3(0, 0, 1)
              .applyQuaternion(worldQuat)
              .normalize();
            const emitPos = worldPos
              .clone()
              .add(new THREE.Vector3(0, 0.35, 1.1).applyQuaternion(worldQuat));
            mesh.position.copy(emitPos);
            mesh.scale.setScalar(0.2);

            const v = velocitiesRef.current[found];
            v.copy(backDir).multiplyScalar(0.6 + speed * 0.12);
            v.y += 0.6 + Math.random() * 0.2;
            v.x += (Math.random() - 0.5) * 0.2;
            v.z += (Math.random() - 0.5) * 0.2;

            const life = 0.9 + Math.random() * 0.5;
            lifesRef.current[found] = life;
            maxLifesRef.current[found] = life;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.opacity = 0.35;
          }
        } else {
          break; // all puffs in use
        }
      }
    }

    // Update existing puffs
    const N = MAX_PUFFS;
    for (let i = 0; i < N; i++) {
      const life = lifesRef.current[i];
      if (life > 0) {
        const mesh = meshRefs.current[i];
        if (!mesh) continue;
        const v = velocitiesRef.current[i];
        mesh.position.addScaledVector(v, delta);
        mesh.scale.multiplyScalar(1 + 0.6 * delta);
        const newLife = life - delta;
        lifesRef.current[i] = newLife;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = Math.max(0, (newLife / maxLifesRef.current[i]) * 0.35);
        if (newLife <= 0) {
          mat.opacity = 0;
        }
      }
    }
  });

  return (
    <group>
      {Array.from({ length: MAX_PUFFS }, (_, idx) => (
        <mesh
          key={idx}
          ref={(el) => (meshRefs.current[idx] = el)}
          castShadow={false}
          receiveShadow={false}
          scale={0.2}
        >
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial
            color="#666666"
            roughness={1}
            metalness={0}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Subtly deformed ground for natural terrain
function DeformedGround() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);

  useEffect(() => {
    const geom = geomRef.current;
    if (!geom) return;
    const pos = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const h =
        0.6 * Math.sin(x * 0.06) +
        0.4 * Math.cos(y * 0.05) +
        0.25 * Math.sin((x + y) * 0.08);
      pos.setZ(i, h * 0.35);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  }, []);

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow={false}
    >
      <planeGeometry ref={geomRef} args={[4000, 4000, 256, 256]} />
      <meshStandardMaterial color="#3A5F3A" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

// Terrain height function matching DeformedGround's displacement
function getTerrainHeight(xWorld: number, zWorld: number): number {
  const x = xWorld;
  const y = -zWorld; // plane rotated -90° around X: local Y -> world -Z
  const h =
    0.6 * Math.sin(x * 0.06) +
    0.4 * Math.cos(y * 0.05) +
    0.25 * Math.sin((x + y) * 0.08);
  return h * 0.35;
}

// GLB tree assets
function BigTreeInstance({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const gltf: any = useGLTF("/models/trees/Big%20Tree.glb");
  const cloned = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf?.scene]);
  useEffect(() => {
    if (!cloned) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const minY = box.min.y;
    cloned.position.y = -minY; // lift so base sits at y=0 relative to instance
  }, [cloned]);

  if (!cloned) {
    return null;
  }

  return (
    <group
      position={[position[0], position[1] - 0.2, position[2]]}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      <primitive object={cloned} />
    </group>
  );
}

function TreesInstance({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const gltf: any = useGLTF("/models/trees/Trees.glb");
  const cloned = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf?.scene]);
  useEffect(() => {
    if (!cloned) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const minY = box.min.y;
    cloned.position.y = -minY;
  }, [cloned]);

  if (!cloned) {
    return null;
  }

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      <primitive object={cloned} />
    </group>
  );
}

function TwistedTreeInstance({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const gltf: any = useGLTF("/models/trees/Twisted%20Tree.glb");
  const cloned = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf?.scene]);
  useEffect(() => {
    if (!cloned) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const minY = box.min.y;
    cloned.position.y = -minY;
  }, [cloned]);

  if (!cloned) {
    return null;
  }

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      <primitive object={cloned} />
    </group>
  );
}

function RockInstance({
  url,
  position,
  rotation,
  scale,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const gltf: any = useGLTF(url);
  const cloned = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf?.scene]);
  useEffect(() => {
    if (!cloned) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const minY = box.min.y;
    cloned.position.y = -minY;
  }, [cloned]);

  if (!cloned) {
    return null;
  }

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      <primitive object={cloned} />
    </group>
  );
}

// Lightweight shrub cluster for ground cover
function ShrubCluster({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const color = new THREE.Color().setHSL(
    0.32 + Math.random() * 0.06,
    0.5,
    0.28
  );
  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      {Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 0.8,
            0.15 + Math.random() * 0.15,
            (Math.random() - 0.5) * 0.8,
          ]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[0.25 + Math.random() * 0.18, 10, 10]} />
          <meshStandardMaterial
            color={color}
            roughness={0.92}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

function ZebraInstance({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const gltf: any = useGLTF("/models/animalss/Zebra.glb");
  const cloned = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf?.scene]);
  const groupRef = useRef<THREE.Group>(null);
  const centerRef = useRef<THREE.Vector3>(
    new THREE.Vector3(position[0], position[1], position[2])
  );
  const angleRef = useRef<number>(Math.random() * Math.PI * 2);
  const radiusRef = useRef<number>(8 + Math.random() * 14);
  const speedRef = useRef<number>(0.15 + Math.random() * 0.15);
  const prevPosRef = useRef<THREE.Vector3 | null>(null);
  const driftRef = useRef<number>((Math.random() - 0.5) * 0.2);

  useEffect(() => {
    if (!cloned) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const minY = box.min.y;
    // Position the zebra so its feet are at y=0
    cloned.position.y = -minY;
  }, [cloned]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    angleRef.current += speedRef.current * delta;
    driftRef.current += (Math.random() - 0.5) * 0.02 * delta;
    driftRef.current = Math.max(-0.4, Math.min(0.4, driftRef.current));
    const theta = angleRef.current + driftRef.current;
    const cx = centerRef.current.x;
    const cz = centerRef.current.z;
    const r = radiusRef.current;
    const nx = cx + Math.cos(theta) * r;
    const nz = cz + Math.sin(theta) * r;
    const ny = getTerrainHeight(nx, nz) + 0.15;
    const newPos = new THREE.Vector3(nx, ny, nz);

    const prev = prevPosRef.current || g.position.clone();
    const dx = newPos.x - prev.x;
    const dz = newPos.z - prev.z;
    if (Math.abs(dx) + Math.abs(dz) > 1e-4) {
      g.rotation.y = Math.atan2(dx, dz);
    }
    g.position.copy(newPos);
    prevPosRef.current = newPos;
  });

  // Don't render if GLTF failed to load
  if (!cloned) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      <primitive object={cloned} />
    </group>
  );
}

function WaterfallInstance({
  position,
  rotation,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const gltf: any = useGLTF("/models/animalss/Waterfall.glb");
  const cloned = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf?.scene]);
  useEffect(() => {
    if (!cloned) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const minY = box.min.y;
    cloned.position.y = -minY;
  }, [cloned]);

  if (!cloned) {
    return null;
  }

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      <primitive object={cloned} />
    </group>
  );
}

// TreeTrunkInstance removed per request

// Generic wandering animal (optionally flying)
function AnimalWanderer({
  url,
  position,
  rotation,
  scale,
  radiusMin = 8,
  radiusMax = 16,
  speedMin = 0.12,
  speedMax = 0.22,
  fly = false,
  minAltitude = 2,
  maxAltitude = 6,
  yOffset = 0.18,
  groundOffset = 0.28,
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  radiusMin?: number;
  radiusMax?: number;
  speedMin?: number;
  speedMax?: number;
  fly?: boolean;
  minAltitude?: number;
  maxAltitude?: number;
  yOffset?: number;
  groundOffset?: number;
}) {
  const gltf: any = useGLTF(url);
  const cloned = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf?.scene]);
  const groupRef = useRef<THREE.Group>(null);
  const centerRef = useRef<THREE.Vector3>(
    new THREE.Vector3(position[0], position[1], position[2])
  );
  const angleRef = useRef<number>(Math.random() * Math.PI * 2);
  const radiusRef = useRef<number>(
    radiusMin + Math.random() * Math.max(0.001, radiusMax - radiusMin)
  );
  const speedRef = useRef<number>(
    speedMin + Math.random() * Math.max(0.001, speedMax - speedMin)
  );
  const prevPosRef = useRef<THREE.Vector3 | null>(null);
  const driftRef = useRef<number>((Math.random() - 0.5) * 0.2);
  const altitudeRef = useRef<number>(
    minAltitude + Math.random() * Math.max(0, maxAltitude - minAltitude)
  );
  const footClearanceRef = useRef<number>(0.02);

  useEffect(() => {
    if (!cloned) return;
    const box = new THREE.Box3().setFromObject(cloned);
    const minY = box.min.y;
    const sizeY = box.max.y - box.min.y;
    const uniformScale = Array.isArray(scale) ? scale[1] : 1;

    // Position the model so its bottom sits at y=0
    cloned.position.y = -minY;

    // Set proper clearance to ensure animals stand on terrain surface
    // Use a more generous clearance based on model size
    footClearanceRef.current = Math.max(
      0.25 * uniformScale,
      sizeY * uniformScale * 0.18
    );
  }, [cloned, scale]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    angleRef.current += speedRef.current * delta;
    driftRef.current += (Math.random() - 0.5) * 0.02 * delta;
    driftRef.current = Math.max(-0.4, Math.min(0.4, driftRef.current));
    const theta = angleRef.current + driftRef.current;
    const cx = centerRef.current.x;
    const cz = centerRef.current.z;
    const r = radiusRef.current;
    const nx = cx + Math.cos(theta) * r;
    const nz = cz + Math.sin(theta) * r;
    const groundY = getTerrainHeight(nx, nz);
    const ny = fly
      ? groundY +
        altitudeRef.current +
        Math.sin(state.clock.elapsedTime * 1.3) * 0.4 +
        yOffset +
        footClearanceRef.current +
        groundOffset
      : groundY + yOffset + footClearanceRef.current + groundOffset;
    const newPos = new THREE.Vector3(nx, ny, nz);

    const prev = prevPosRef.current || g.position.clone();
    const dx = newPos.x - prev.x;
    const dz = newPos.z - prev.z;
    if (Math.abs(dx) + Math.abs(dz) > 1e-4) {
      g.rotation.y = Math.atan2(dx, dz);
    }
    g.position.copy(newPos);

    // Safety: ensure the model never intersects the ground
    // Compute current world-space bottom of the model and lift if needed
    const bbox = new THREE.Box3().setFromObject(g);
    const bottomY = bbox.min.y;
    const terrainY = groundY;
    const epsilon = 0.02;
    if (bottomY < terrainY + epsilon) {
      const lift = terrainY + epsilon - bottomY;
      g.position.y += lift;
    }
    prevPosRef.current = newPos;
  });

  // Don't render if GLTF failed to load
  if (!cloned) {
    return null;
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      <primitive object={cloned} />
    </group>
  );
}

// Drivable Humvee player component
function PlayerHumvee() {
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef<number>(0);
  const steeringRef = useRef<number>(0);
  const keysRef = useRef<{ [k: string]: boolean }>({});
  const { camera } = useThree();
  const camDistanceRef = useRef<number>(1.6);
  // Seamless driving sound (gapless loop) via Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);
  const driveBufferRef = useRef<AudioBuffer | null>(null);
  const driveSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
      const Ctx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      gainRef.current = gain;
    }
    return audioCtxRef.current as AudioContext;
  };

  const loadDriveBuffer = async () => {
    if (driveBufferRef.current) return driveBufferRef.current;
    const ctx = ensureAudioContext();
    const res = await fetch("/sound/safari-track.mp3");
    const arr = await res.arrayBuffer();
    const buf = await ctx.decodeAudioData(arr.slice(0));
    driveBufferRef.current = buf;
    return buf;
  };

  const startDriveLoop = async () => {
    const ctx = ensureAudioContext();
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {}
    }
    const buffer = await loadDriveBuffer();
    if (driveSourceRef.current) {
      try {
        driveSourceRef.current.stop();
      } catch {}
      driveSourceRef.current.disconnect();
      driveSourceRef.current = null;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainRef.current as GainNode);
    try {
      source.start(0);
    } catch {}
    driveSourceRef.current = source;
  };

  const stopDriveLoop = () => {
    if (driveSourceRef.current) {
      try {
        driveSourceRef.current.stop();
      } catch {}
      driveSourceRef.current.disconnect();
      driveSourceRef.current = null;
    }
  };

  // Initial placement near camp
  const startPosition = useMemo<[number, number, number]>(
    () => [-2, 0.12, 6],
    []
  );

  useEffect(() => {
    const isMoveKey = (k: string) =>
      k === "w" ||
      k === "a" ||
      k === "s" ||
      k === "d" ||
      k === "arrowup" ||
      k === "arrowdown" ||
      k === "arrowleft" ||
      k === "arrowright";
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;
      if (isMoveKey(key)) {
        // Start seamless loop on first movement key press (user gesture)
        startDriveLoop();
      }
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
      // If no movement keys are held, pause the driving audio
      if (
        !keysRef.current["w"] &&
        !keysRef.current["a"] &&
        !keysRef.current["s"] &&
        !keysRef.current["d"] &&
        !keysRef.current["arrowup"] &&
        !keysRef.current["arrowdown"] &&
        !keysRef.current["arrowleft"] &&
        !keysRef.current["arrowright"]
      ) {
        stopDriveLoop();
      }
    };
    const onWheel = (e: WheelEvent) => {
      camDistanceRef.current = Math.min(
        10,
        Math.max(0.8, camDistanceRef.current + e.deltaY * 0.01)
      );
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("wheel", onWheel as any);
      stopDriveLoop();
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...startPosition);
    }
  }, [startPosition]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const ACCEL = 6.0;
    const BRAKE = 10.0;
    const MAX_SPEED = 16.0;
    const FRICTION = 2.0;
    const STEER_SPEED = 3.5;
    const STEER_DAMP = 3.0;

    const keys = keysRef.current;

    // Acceleration / braking
    if (keys["w"] || keys["arrowup"]) velocityRef.current += ACCEL * delta;
    if (keys["s"] || keys["arrowdown"]) velocityRef.current -= ACCEL * delta;
    if (keys[" "] || keys["shift"]) {
      // handbrake
      if (velocityRef.current > 0)
        velocityRef.current = Math.max(0, velocityRef.current - BRAKE * delta);
      if (velocityRef.current < 0)
        velocityRef.current = Math.min(0, velocityRef.current + BRAKE * delta);
    }

    // Natural friction
    if (!keys["w"] && !keys["s"] && !keys["arrowup"] && !keys["arrowdown"]) {
      if (velocityRef.current > 0)
        velocityRef.current = Math.max(
          0,
          velocityRef.current - FRICTION * delta
        );
      if (velocityRef.current < 0)
        velocityRef.current = Math.min(
          0,
          velocityRef.current + FRICTION * delta
        );
    }

    // Clamp speed
    velocityRef.current = Math.max(
      -MAX_SPEED * 0.4,
      Math.min(MAX_SPEED, velocityRef.current)
    );

    // Steering input (allow turning even when stationary)
    if (keys["a"] || keys["arrowleft"])
      steeringRef.current += STEER_SPEED * delta;
    if (keys["d"] || keys["arrowright"])
      steeringRef.current -= STEER_SPEED * delta;
    // Dampen steering back to zero
    if (!keys["a"] && !keys["d"] && !keys["arrowleft"] && !keys["arrowright"]) {
      if (steeringRef.current > 0)
        steeringRef.current = Math.max(
          0,
          steeringRef.current - STEER_DAMP * delta
        );
      if (steeringRef.current < 0)
        steeringRef.current = Math.min(
          0,
          steeringRef.current + STEER_DAMP * delta
        );
    }
    // Clamp steering
    steeringRef.current = Math.max(-0.8, Math.min(0.8, steeringRef.current));

    // Apply rotation and translation (allow in-place turning)
    const speedNorm = Math.min(1, Math.abs(velocityRef.current) / MAX_SPEED);
    const directionSign =
      velocityRef.current === 0 ? 1 : Math.sign(velocityRef.current);
    const turnInfluence = Math.max(0.25, speedNorm) * directionSign;
    group.rotation.y += steeringRef.current * turnInfluence * delta;
    const forward = new THREE.Vector3(0, 0, -1)
      .applyEuler(group.rotation)
      .multiplyScalar(velocityRef.current * delta);
    group.position.add(forward);
    // Keep grounded
    group.position.y = 0.12;

    // Audio is handled by key handlers for reliable gesture-driven control

    // Follow camera
    const camOffset = new THREE.Vector3(
      0,
      4.0,
      camDistanceRef.current
    ).applyEuler(group.rotation);
    const target = group.position.clone();
    camera.position.lerp(target.clone().add(camOffset), 0.12);
    camera.lookAt(target);
  });

  return (
    <>
      <group ref={groupRef} castShadow receiveShadow>
        <group scale={[0.65, 0.65, 0.65]} rotation={[0, -Math.PI / 2, 0]}>
          <Humvee />
        </group>
      </group>
      <ExhaustSmoke vehicleRef={groupRef} velocityRef={velocityRef} />
    </>
  );
}

// Keyboard zoom hotkeys for OrbitControls (Ctrl/Cmd +/-)
function CameraHotkeys({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      if (!ctrlOrMeta) return;
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        if (controlsRef.current?.dollyIn) {
          controlsRef.current.dollyIn(1.1);
          controlsRef.current.update?.();
        } else {
          // Fallback: adjust FOV if controls not available
          (camera as THREE.PerspectiveCamera).fov = Math.max(
            15,
            (camera as THREE.PerspectiveCamera).fov * 0.95
          );
          (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
        }
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        if (controlsRef.current?.dollyOut) {
          controlsRef.current.dollyOut(1.1);
          controlsRef.current.update?.();
        } else {
          (camera as THREE.PerspectiveCamera).fov = Math.min(
            120,
            (camera as THREE.PerspectiveCamera).fov * 1.05
          );
          (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, { passive: false } as any);
    return () => window.removeEventListener("keydown", onKeyDown as any);
  }, [controlsRef, camera]);
  return null;
}

function ControlsAndHotkeys() {
  const controlsRef = useRef<any>(null);
  return (
    <>
      <CameraHotkeys controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={6}
        maxDistance={2000}
      />
    </>
  );
}

// Realistic Fruit component
function Fruit({
  position,
  onCollect,
  id,
}: {
  position: [number, number, number];
  onCollect: (id: string) => void;
  id: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [collected, setCollected] = useState(false);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;

      // Glow effect
      if (glowRef.current) {
        glowRef.current.scale.setScalar(
          1 + Math.sin(state.clock.elapsedTime * 4) * 0.1
        );
      }
    }
  });

  const handleClick = () => {
    if (!collected) {
      setCollected(true);
      onCollect(id);
    }
  };

  if (collected) return null;

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group
        position={position}
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Main fruit body */}
        <mesh ref={meshRef} castShadow receiveShadow scale={hovered ? 1.2 : 1}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshPhysicalMaterial
            color="#FF4500"
            roughness={0.3}
            metalness={0.1}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
            transmission={0.1}
            thickness={0.5}
          />
        </mesh>

        {/* Fruit stem */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.01, 0.02, 0.05]} />
          <meshPhysicalMaterial color="#228B22" roughness={0.8} />
        </mesh>

        {/* Glowing aura */}
        <mesh ref={glowRef} scale={1.5}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Sparkle particles */}
        {Array.from({ length: 3 }, (_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * 2.1) * 0.3,
              Math.cos(i * 1.7) * 0.3,
              Math.sin(i * 1.3) * 0.3,
            ]}
          >
            <sphereGeometry args={[0.01]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Realistic Animal component (Lion)
function Animal({
  position,
  onDefeat,
  id,
}: {
  position: [number, number, number];
  onDefeat: (id: string) => void;
  id: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [defeated, setDefeated] = useState(false);
  const [aggressive, setAggressive] = useState(false);
  const [health, setHealth] = useState(100);

  useFrame((state) => {
    if (groupRef.current && !defeated) {
      const time = state.clock.elapsedTime;

      // Realistic patrol movement
      groupRef.current.position.x = position[0] + Math.sin(time * 0.3) * 3;
      groupRef.current.position.z = position[2] + Math.cos(time * 0.2) * 2;
      groupRef.current.rotation.y = Math.atan2(
        Math.cos(time * 0.3),
        Math.sin(time * 0.2)
      );

      // Breathing animation
      groupRef.current.scale.y = 1 + Math.sin(time * 4) * 0.02;

      // Random aggression
      if (Math.random() < 0.001) {
        setAggressive(!aggressive);
      }
    }
  });

  const handleClick = () => {
    if (!defeated) {
      const newHealth = health - 34;
      setHealth(newHealth);
      if (newHealth <= 0) {
        setDefeated(true);
        onDefeat(id);
      }
      setAggressive(true);
      setTimeout(() => setAggressive(false), 1000);
    }
  };

  if (defeated) return null;

  const lionColor = aggressive ? "#CD853F" : "#DEB887";
  const maneColor = aggressive ? "#8B4513" : "#D2691E";

  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* Lion body */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.35, 1.2]} />
        <meshPhysicalMaterial
          color={lionColor}
          roughness={0.8}
          metalness={0.1}
          clearcoat={0.2}
        />
      </mesh>

      {/* Lion head */}
      <mesh position={[0.8, 0.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshPhysicalMaterial
          color={lionColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Lion mane */}
      <mesh position={[0.7, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshPhysicalMaterial
          color={maneColor}
          roughness={1.0}
          metalness={0.0}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[1.0, 0.6, 0.15]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshPhysicalMaterial color="#FFD700" roughness={0.1} />
      </mesh>
      <mesh position={[1.0, 0.6, -0.15]} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshPhysicalMaterial color="#FFD700" roughness={0.1} />
      </mesh>

      {/* Pupils */}
      <mesh position={[1.05, 0.6, 0.15]}>
        <sphereGeometry args={[0.02]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh position={[1.05, 0.6, -0.15]}>
        <sphereGeometry args={[0.02]} />
        <meshBasicMaterial color="black" />
      </mesh>

      {/* Nose */}
      <mesh position={[1.1, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshPhysicalMaterial color="#8B4513" roughness={0.5} />
      </mesh>

      {/* Legs */}
      {[
        [0.3, 0, 0.2],
        [0.3, 0, -0.2],
        [-0.3, 0, 0.2],
        [-0.3, 0, -0.2],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.4]} />
          <meshPhysicalMaterial color={lionColor} roughness={0.8} />
        </mesh>
      ))}

      {/* Tail */}
      <mesh
        position={[-0.8, 0.3, 0]}
        rotation={[0, 0, Math.sin(Date.now() * 0.01) * 0.3]}
        castShadow
      >
        <cylinderGeometry args={[0.03, 0.05, 0.6]} />
        <meshPhysicalMaterial color={lionColor} roughness={0.8} />
      </mesh>

      {/* Health bar */}
      {health < 100 && (
        <group position={[0, 1.2, 0]}>
          <mesh>
            <planeGeometry args={[1, 0.1]} />
            <meshBasicMaterial color="red" transparent opacity={0.8} />
          </mesh>
          <mesh position={[-(1 - health / 100) / 2, 0, 0.001]}>
            <planeGeometry args={[health / 100, 0.08]} />
            <meshBasicMaterial color="green" transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Realistic Natural Park Environment
function ParkEnvironment() {
  const grassPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 200; i++) {
      positions.push([
        (Math.random() - 0.5) * 100,
        0,
        (Math.random() - 0.5) * 100,
      ]);
    }
    return positions;
  }, []);

  return (
    <>
      {/* Realistic Ground with terrain variation */}
      <mesh
        position={[0, -0.1, 0]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[100, 100, 50, 50]} />
        <meshPhysicalMaterial
          color="#3A5F3A"
          roughness={0.9}
          metalness={0.1}
          clearcoat={0.1}
        />
      </mesh>

      {/* Realistic African Baobab Trees */}
      {Array.from({ length: 12 }, (_, i) => {
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;
        const height = 8 + Math.random() * 6;
        const trunkRadius = 0.8 + Math.random() * 0.4;
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Baobab trunk - thick and realistic */}
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry
                args={[trunkRadius * 0.7, trunkRadius, height, 8]}
              />
              <meshPhysicalMaterial
                color="#8B4513"
                roughness={0.95}
                metalness={0.05}
                normalScale={[2, 2]}
              />
            </mesh>

            {/* Baobab canopy - sparse and realistic */}
            {Array.from(
              { length: 5 + Math.floor(Math.random() * 3) },
              (_, j) => {
                const angle = (j / 8) * Math.PI * 2;
                const branchLength = 3 + Math.random() * 2;
                return (
                  <group
                    key={j}
                    position={[0, height - 1, 0]}
                    rotation={[0, angle, Math.PI / 6]}
                  >
                    {/* Branch */}
                    <mesh position={[0, 0, branchLength / 2]} castShadow>
                      <cylinderGeometry args={[0.1, 0.15, branchLength]} />
                      <meshPhysicalMaterial color="#654321" roughness={0.9} />
                    </mesh>
                    {/* Leaves cluster */}
                    <mesh position={[0, 0, branchLength]} castShadow>
                      <sphereGeometry
                        args={[0.8 + Math.random() * 0.4, 8, 8]}
                      />
                      <meshPhysicalMaterial
                        color="#228B22"
                        roughness={0.8}
                        metalness={0.1}
                        transparent
                        opacity={0.9}
                      />
                    </mesh>
                  </group>
                );
              }
            )}
          </group>
        );
      })}

      {/* Acacia Trees */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = (Math.random() - 0.5) * 70;
        const z = (Math.random() - 0.5) * 70;
        const height = 4 + Math.random() * 3;
        return (
          <group key={`acacia-${i}`} position={[x, 0, z]}>
            {/* Acacia trunk */}
            <mesh position={[0, height / 2, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.2, height]} />
              <meshPhysicalMaterial color="#8B4513" roughness={0.9} />
            </mesh>
            {/* Flat-top canopy characteristic of Acacia */}
            <mesh position={[0, height, 0]} castShadow>
              <cylinderGeometry args={[2.5, 2, 0.5, 8]} />
              <meshPhysicalMaterial
                color="#228B22"
                roughness={0.8}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        );
      })}

      {/* Realistic Rock formations */}
      {Array.from({ length: 15 }, (_, i) => {
        const x = (Math.random() - 0.5) * 90;
        const z = (Math.random() - 0.5) * 90;
        const scale = 0.5 + Math.random() * 1.5;
        return (
          <mesh
            key={i}
            position={[x, scale * 0.3, z]}
            castShadow
            receiveShadow
            scale={scale}
          >
            <dodecahedronGeometry args={[0.8, 1]} />
            <meshPhysicalMaterial
              color="#696969"
              roughness={0.95}
              metalness={0.1}
              clearcoat={0.1}
            />
          </mesh>
        );
      })}

      {/* Grass patches */}
      {grassPositions.map((pos, i) => (
        <mesh
          key={`grass-${i}`}
          position={pos as [number, number, number]}
          receiveShadow
        >
          <coneGeometry args={[0.05, 0.3, 3]} />
          <meshPhysicalMaterial
            color="#90EE90"
            roughness={0.9}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Termite mounds */}
      {Array.from({ length: 4 }, (_, i) => {
        const x = (Math.random() - 0.5) * 60;
        const z = (Math.random() - 0.5) * 60;
        const height = 1 + Math.random() * 2;
        return (
          <mesh
            key={`mound-${i}`}
            position={[x, height / 2, z]}
            castShadow
            receiveShadow
          >
            <coneGeometry args={[0.8, height, 6]} />
            <meshPhysicalMaterial
              color="#CD853F"
              roughness={0.95}
              metalness={0.0}
            />
          </mesh>
        );
      })}

      {/* Water hole */}
      <mesh
        position={[15, -0.05, -10]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[4, 16]} />
        <meshPhysicalMaterial
          color="#4682B4"
          roughness={0.1}
          metalness={0.8}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>

      {/* Contact shadows for better ground contact */}
      <ContactShadows
        position={[0, -0.1, 0]}
        opacity={0.6}
        scale={100}
        blur={2}
        far={20}
      />
    </>
  );
}

// Main game component
function GameScene() {
  // Seeded RNG for stable but rich randomness per load
  const rand = (() => {
    const seedRef = useRef<number>(
      (Date.now() >>> 0) ^ Math.floor(Math.random() * 1e9)
    );
    const fnRef = useRef<() => number | null>(null);
    if (!fnRef.current) {
      const mulberry32 = (a: number) => () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      fnRef.current = mulberry32(seedRef.current);
    }
    return fnRef.current as () => number;
  })();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    health: 100,
    level: 1,
    fruitsCollected: 0,
    animalsDefeated: 0,
  });

  const [avatarPosition, setAvatarPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);

  // Generate fruits
  const fruits = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: `fruit-${i}`,
        position: [
          (Math.random() - 0.5) * 30,
          0.5,
          (Math.random() - 0.5) * 30,
        ] as [number, number, number],
      })),
    []
  );

  // Generate animals
  const animals = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: `animal-${i}`,
        position: [
          (Math.random() - 0.5) * 25,
          0,
          (Math.random() - 0.5) * 25,
        ] as [number, number, number],
      })),
    []
  );

  // Handle fruit collection
  const handleFruitCollect = (fruitId: string) => {
    setGameState((prev) => ({
      ...prev,
      score: prev.score + 10,
      fruitsCollected: prev.fruitsCollected + 1,
    }));
  };

  // Handle animal defeat
  const handleAnimalDefeat = (animalId: string) => {
    setGameState((prev) => ({
      ...prev,
      score: prev.score + 25,
      animalsDefeated: prev.animalsDefeated + 1,
    }));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const moveSpeed = 0.5;
      switch (event.key.toLowerCase()) {
        case "w":
          setAvatarPosition((prev) => [prev[0], prev[1], prev[2] - moveSpeed]);
          break;
        case "s":
          setAvatarPosition((prev) => [prev[0], prev[1], prev[2] + moveSpeed]);
          break;
        case "a":
          setAvatarPosition((prev) => [prev[0] - moveSpeed, prev[1], prev[2]]);
          break;
        case "d":
          setAvatarPosition((prev) => [prev[0] + moveSpeed, prev[1], prev[2]]);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 11, 10]}
        fov={70}
        near={0.1}
        far={5000}
      />

      {/* Scene fog for depth and atmosphere */}
      <fog attach="fog" args={["#173d22", 120, 4000]} />

      {/* Lighting similar to /animals showcase */}
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#e8e0c1", "#1a2a1a", 0.35]} />
      <directionalLight position={[8, 10, 5]} intensity={1.2} />

      <Environment preset="sunset" background={false} />
      {/* Soft volumetric clouds + rainbow asset */}
      <group position={[0, 15, -18]} scale={[3.2, 3.2, 3.2]}>
        <RainbowWithClouds />
      </group>

      {/* Deformed ground for natural terrain */}
      <DeformedGround />

      {/* River removed */}

      {/* Bridge removed */}

      {/* Minimal, clean environment using converted GLB assets */}
      <group position={[0, 0, 0]}>
        {/* Ground patch via grass tiles */}
        <group position={[0, 0, 0]}>
          <group position={[-4, 0, -4]}>
            <GrassA />
          </group>
          <group position={[0, 0, -4]}>
            <GrassA />
          </group>
          <group position={[4, 0, -4]}>
            <GrassA />
          </group>
          <group position={[-4, 0, 0]}>
            <GrassA />
          </group>
          <group position={[0, 0, 0]}>
            <GrassA />
          </group>
          <group position={[4, 0, 0]}>
            <GrassA />
          </group>
        </group>

        {/* Pond at the side */}
        <group position={[10, 0, -6]} scale={[1.2, 1.2, 1.2]}>
          <Pond />
        </group>

        {/* Camp area removed */}

        {/* Trees and rocks framing the scene */}
        <group position={[8, 0, 4]} scale={[1.2, 1.2, 1.2]}>
          <TreeSavanna />
        </group>
        <group position={[12, 0, 2]}>
          <TreeLarge />
        </group>
        <group position={[-10, 0, -2]}>
          <TreeSavanna />
        </group>
        <group position={[-8, 0, -5]}>
          <Rock />
        </group>

        {/* Desert and road elements removed as requested */}

        {/* Procedurally scatter more trees with spacing (expanded world) */}
        {(() => {
          const count = 220;
          const range = 1600; // expanded world area
          const minDist2 = 10 * 10; // minimum separation
          const avoidStart = { x: -2, z: 6, r2: 12 * 12 };
          const positions: Array<[number, number, number, number]> = [];
          let attempts = 0;
          while (positions.length < count && attempts < count * 80) {
            attempts++;
            const x = (rand() - 0.5) * (range * 2);
            const z = (rand() - 0.5) * (range * 2);
            const dx0 = x - avoidStart.x;
            const dz0 = z - avoidStart.z;
            if (dx0 * dx0 + dz0 * dz0 < avoidStart.r2) continue;
            let ok = true;
            for (let j = 0; j < positions.length; j++) {
              const [px, , pz] = positions[j];
              const dx = px - x;
              const dz = pz - z;
              if (dx * dx + dz * dz < minDist2) {
                ok = false;
                break;
              }
            }
            if (!ok) continue;
            const y = getTerrainHeight(x, z);
            const scale = 0.9 + rand() * 0.6;
            const typePick = rand();
            positions.push([x, y, z, typePick]);
          }
          return positions.map(([x, y, z, t], i) => (
            <group
              key={`tree-scatter-${i}`}
              position={[x, y, z]}
              scale={[1, 1, 1]}
            >
              {t > 0.45 ? <TreeLarge /> : <TreeSavanna />}
            </group>
          ));
        })()}

        {/* Near-field ring of trees to densify view around start */}
        {(() => {
          const ringCount = 45;
          const innerR = 18;
          const outerR = 65;
          const items: any[] = [];
          for (let i = 0; i < ringCount; i++) {
            const r = innerR + Math.random() * (outerR - innerR);
            const a = Math.random() * Math.PI * 2;
            const x = -2 + Math.cos(a) * r;
            const z = 6 + Math.sin(a) * r;
            const y = getTerrainHeight(x, z);
            items.push(
              <group key={`near-tree-${i}`} position={[x, y, z]}>
                {Math.random() > 0.5 ? <TreeLarge /> : <TreeSavanna />}
              </group>
            );
          }
          return items;
        })()}

        {/* Scatter GLB tree varieties with spacing (expanded world) */}
        {(() => {
          const count = 240;
          const range = 1800;
          const minDist2 = 12 * 12;
          const avoidStart = { x: -2, z: 6, r2: 14 * 14 };
          const positions: Array<{
            x: number;
            y: number;
            z: number;
            pick: number;
            rot: number;
            s: number;
          }> = [];
          let attempts = 0;
          while (positions.length < count && attempts < count * 100) {
            attempts++;
            const x = (rand() - 0.5) * (range * 2);
            const z = (rand() - 0.5) * (range * 2);
            const dx0 = x - avoidStart.x;
            const dz0 = z - avoidStart.z;
            if (dx0 * dx0 + dz0 * dz0 < avoidStart.r2) continue;
            let ok = true;
            for (let j = 0; j < positions.length; j++) {
              const p = positions[j];
              const dx = p.x - x;
              const dz = p.z - z;
              if (dx * dx + dz * dz < minDist2) {
                ok = false;
                break;
              }
            }
            if (!ok) continue;
            positions.push({
              x,
              z,
              y: getTerrainHeight(x, z),
              pick: rand(),
              rot: rand() * Math.PI * 2,
              s: 0.7 + rand() * 1.3,
            });
          }
          return positions.map((p, i) => {
            const pos: [number, number, number] = [p.x, p.y, p.z];
            const rot: [number, number, number] = [0, p.rot, 0];
            const scl: [number, number, number] = [p.s, p.s, p.s];
            return p.pick < 0.5 ? (
              <BigTreeInstance
                key={`bigtree-${i}`}
                position={pos}
                rotation={rot}
                scale={scl}
              />
            ) : (
              <TwistedTreeInstance
                key={`twisted-${i}`}
                position={pos}
                rotation={rot}
                scale={scl}
              />
            );
          });
        })()}

        {/* Near-field shrubs and rocks for ground detail */}
        {(() => {
          const items: any[] = [];
          for (let i = 0; i < 60; i++) {
            const r = 10 + Math.random() * 40;
            const a = Math.random() * Math.PI * 2;
            const x = -2 + Math.cos(a) * r;
            const z = 6 + Math.sin(a) * r;
            const y = getTerrainHeight(x, z);
            if (Math.random() < 0.65) {
              items.push(
                <ShrubCluster
                  key={`shrub-${i}`}
                  position={[x, y, z]}
                  rotation={[0, Math.random() * Math.PI * 2, 0]}
                  scale={[
                    0.9 + Math.random() * 0.6,
                    1,
                    0.9 + Math.random() * 0.6,
                  ]}
                />
              );
            } else {
              const s = 0.4 + Math.random() * 0.8;
              const url =
                Math.random() > 0.5
                  ? "/models/rocks/Rock.glb"
                  : "/models/rocks/Rocks.glb";
              items.push(
                <RockInstance
                  key={`near-rock-${i}`}
                  url={url}
                  position={[x, y, z]}
                  rotation={[0, Math.random() * Math.PI * 2, 0]}
                  scale={[s, s, s]}
                />
              );
            }
          }
          return items;
        })()}

        {/* Zebras near the start with spacing */}
        {(() => {
          const count = 6;
          const minDist2 = 12 * 12;
          const positions: Array<[number, number, number]> = [];
          let attempts = 0;
          while (positions.length < count && attempts < count * 80) {
            attempts++;
            const r = 25 + Math.random() * 60;
            const a = Math.random() * Math.PI * 2;
            const x = -2 + Math.cos(a) * r;
            const z = 6 + Math.sin(a) * r;
            let ok = true;
            for (let j = 0; j < positions.length; j++) {
              const [px, , pz] = positions[j];
              const dx = px - x;
              const dz = pz - z;
              if (dx * dx + dz * dz < minDist2) {
                ok = false;
                break;
              }
            }
            if (!ok) continue;
            const y = getTerrainHeight(x, z);
            positions.push([x, y, z]);
          }
          return positions.map((pos, i) => (
            <ZebraInstance
              key={`zebra-${i}`}
              position={pos}
              rotation={[0, Math.random() * Math.PI * 2, 0]}
              scale={[
                0.2 + Math.random() * 0.05,
                (0.2 + Math.random() * 0.05) * 0.6,
                0.2 + Math.random() * 0.05,
              ]}
            />
          ));
        })()}

        {/* A waterfall landmark somewhere in the world */}
        {(() => {
          const x = 200 + Math.random() * 300;
          const z = -150 + Math.random() * 300;
          const y = getTerrainHeight(x, z);
          return (
            <WaterfallInstance
              position={[x, y, z]}
              rotation={[0, Math.random() * Math.PI * 2, 0]}
              scale={[2.2, 2.2, 2.2]}
            />
          );
        })()}

        {/* Moving animals: Elephants, Giraffes, Lions, Hippos, Gazelles, Birds */}
        {(() => {
          const items: any[] = [];
          const center = { x: -2, z: 6 };
          function spawn(n: number, factory: (i: number) => any) {
            for (let i = 0; i < n; i++) items.push(factory(i));
          }
          // Elephants: slow, large radius
          spawn(4, (i) => {
            const r = 80 + Math.random() * 120;
            const a = Math.random() * Math.PI * 2;
            const x = center.x + Math.cos(a) * r;
            const z = center.z + Math.sin(a) * r;
            const y = getTerrainHeight(x, z);
            return (
              <AnimalWanderer
                key={`ele-${i}`}
                url="/models/animalss/Elephant.glb"
                position={[x, y, z]}
                rotation={[0, Math.random() * Math.PI * 2, 0]}
                scale={[0.02, 0.02, 0.02]}
                radiusMin={20}
                radiusMax={35}
                speedMin={0.06}
                speedMax={0.1}
                yOffset={0.5}
                groundOffset={0.5}
              />
            );
          });
          // Giraffes: medium, graceful
          spawn(5, (i) => {
            const r = 60 + Math.random() * 120;
            const a = Math.random() * Math.PI * 2;
            const x = center.x + Math.cos(a) * r;
            const z = center.z + Math.sin(a) * r;
            const y = getTerrainHeight(x, z);
            return (
              <AnimalWanderer
                key={`gir-${i}`}
                url="/models/animalss/Giraffe.glb"
                position={[x, y, z]}
                rotation={[0, Math.random() * Math.PI * 2, 0]}
                scale={[0.075, 0.075, 0.075]}
                radiusMin={18}
                radiusMax={30}
                speedMin={0.08}
                speedMax={0.14}
                yOffset={1.1}
                groundOffset={0.8}
              />
            );
          });
          // Lions: smaller, faster
          spawn(6, (i) => {
            const r = 50 + Math.random() * 120;
            const a = Math.random() * Math.PI * 2;
            const x = center.x + Math.cos(a) * r;
            const z = center.z + Math.sin(a) * r;
            const y = getTerrainHeight(x, z);
            return (
              <AnimalWanderer
                key={`lion-${i}`}
                url="/models/animalss/Lion.glb"
                position={[x, y, z]}
                rotation={[0, Math.random() * Math.PI * 2, 0]}
                scale={[0.075, 0.075, 0.075]}
                radiusMin={12}
                radiusMax={24}
                speedMin={0.14}
                speedMax={0.22}
                groundOffset={0.26}
              />
            );
          });
          // Hippos: near water idea—just place randomly for now
          spawn(3, (i) => {
            const r = 120 + Math.random() * 180;
            const a = Math.random() * Math.PI * 2;
            const x = center.x + Math.cos(a) * r;
            const z = center.z + Math.sin(a) * r;
            const y = getTerrainHeight(x, z);
            return (
              <AnimalWanderer
                key={`hippo-${i}`}
                url="/models/animalss/Hippopotamus.glb"
                position={[x, y, z]}
                rotation={[0, Math.random() * Math.PI * 2, 0]}
                scale={[0.09, 0.09, 0.09]}
                radiusMin={10}
                radiusMax={20}
                speedMin={0.06}
                speedMax={0.1}
                yOffset={0.08}
                groundOffset={0.2}
              />
            );
          });
          // Gazelles: small, quick
          spawn(8, (i) => {
            const r = 40 + Math.random() * 140;
            const a = Math.random() * Math.PI * 2;
            const x = center.x + Math.cos(a) * r;
            const z = center.z + Math.sin(a) * r;
            const y = getTerrainHeight(x, z);
            return (
              <AnimalWanderer
                key={`gaz-${i}`}
                url="/models/animalss/Gazelle.glb"
                position={[x, y, z]}
                rotation={[0, Math.random() * Math.PI * 2, 0]}
                scale={[0.035, 0.035, 0.035]}
                radiusMin={14}
                radiusMax={26}
                speedMin={0.16}
                speedMax={0.28}
                yOffset={0.32}
                groundOffset={0.32}
              />
            );
          });
          // Birds (ground birds)
          spawn(10, (i) => {
            const r = 30 + Math.random() * 160;
            const a = Math.random() * Math.PI * 2;
            const x = center.x + Math.cos(a) * r;
            const z = center.z + Math.sin(a) * r;
            const y = getTerrainHeight(x, z);
            return (
              <AnimalWanderer
                key={`bird-${i}`}
                url="/models/animalss/bird.glb"
                position={[x, y, z]}
                rotation={[0, Math.random() * Math.PI * 2, 0]}
                scale={[0.02, 0.02, 0.02]}
                radiusMin={8}
                radiusMax={16}
                speedMin={0.2}
                speedMax={0.3}
                groundOffset={0.1}
              />
            );
          });
          // Hummingbirds (flying)
          spawn(8, (i) => {
            const r = 20 + Math.random() * 60;
            const a = Math.random() * Math.PI * 2;
            const x = center.x + Math.cos(a) * r;
            const z = center.z + Math.sin(a) * r;
            const y = getTerrainHeight(x, z);
            return (
              <AnimalWanderer
                key={`hum-${i}`}
                url="/models/animalss/Hummingbird.glb"
                position={[x, y, z]}
                rotation={[0, Math.random() * Math.PI * 2, 0]}
                scale={[0.015, 0.015, 0.015]}
                radiusMin={8}
                radiusMax={14}
                speedMin={0.28}
                speedMax={0.4}
                fly
                minAltitude={2}
                maxAltitude={6}
                groundOffset={0.1}
              />
            );
          });
          return items;
        })()}
        {/* Scatter GLB rocks spaced apart (expanded world) */}
        {(() => {
          const count = 240;
          const positions: Array<[number, number, number]> = [];
          const minDist2 = 14 * 14;
          const avoidStart = { x: -2, z: 6, r2: 14 * 14 };
          let attempts = 0;
          while (positions.length < count && attempts < count * 50) {
            attempts++;
            const x = (rand() - 0.5) * 2000;
            const z = (rand() - 0.5) * 2000;
            const y = getTerrainHeight(x, z);
            const dx0 = x - avoidStart.x;
            const dz0 = z - avoidStart.z;
            if (dx0 * dx0 + dz0 * dz0 < avoidStart.r2) continue;
            let ok = true;
            for (let j = 0; j < positions.length; j++) {
              const [px, , pz] = positions[j];
              const dx = px - x;
              const dz = pz - z;
              if (dx * dx + dz * dz < minDist2) {
                ok = false;
                break;
              }
            }
            if (ok) positions.push([x, y, z]);
          }
          return positions.map((pos, idx) => {
            const rot: [number, number, number] = [0, rand() * Math.PI * 2, 0];
            const s = 0.5 + rand() * 1.5;
            const scl: [number, number, number] = [s, s, s];
            const choice = rand();
            const url =
              choice < 0.25
                ? "/models/rocks/Rock.glb"
                : choice < 0.5
                ? "/models/rocks/Rock%20Large.glb"
                : choice < 0.75
                ? "/models/rocks/Rock%20Medium.glb"
                : "/models/rocks/Rocks.glb";
            return (
              <RockInstance
                key={`rock-${idx}`}
                url={url}
                position={pos}
                rotation={rot}
                scale={scl}
              />
            );
          });
        })()}
      </group>

      {/* Player Humvee */}
      <PlayerHumvee />

      {/* Animals removed */}

      {/* Removed floating collectibles and procedural geometric animals for a cleaner scene */}

      {/* Contact shadows for grounding */}
      <ContactShadows
        opacity={0.5}
        scale={60}
        blur={1.5}
        far={20}
        position={[0, 0.01, 0]}
      />

      <ControlsAndHotkeys />
    </>
  );
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.countryId as string;

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    health: 100,
    level: 1,
    fruitsCollected: 0,
    animalsDefeated: 0,
  });

  // Jungle ambience audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Initialize audio once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio("/sound/jungle-sounds.mp3");
      audio.loop = true;
      audio.volume = 0.35;
      audio.muted = isMuted;
      audioRef.current = audio;
      if (!isMuted) {
        audio.play().catch(() => {});
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // React to mute/unmute changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
    if (!isMuted) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isMuted]);

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-sky-800 via-sky-600 to-sky-300">
      {/* Game Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-lg border-b border-green-500/30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push(`/country/${countryId}`)}
            className="flex items-center gap-2 text-green-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Country
          </button>
          <h1 className="font-display text-2xl bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200 bg-clip-text text-transparent">
            Safari Adventure Game
          </h1>
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="flex items-center gap-2 text-green-100 hover:text-white transition-colors"
            aria-label={
              isMuted ? "Unmute jungle ambience" : "Mute jungle ambience"
            }
            title={isMuted ? "Unmute jungle ambience" : "Mute jungle ambience"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
            <span>{isMuted ? "Sound Off" : "Sound On"}</span>
          </button>
        </div>
      </div>

      {/* Game Stats UI */}
      <div className="absolute top-16 left-4 z-10 bg-black/60 backdrop-blur-lg p-4 rounded-xl border border-green-500/30 text-green-100">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Score: {gameState.score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span>Health: {gameState.health}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Apple className="w-4 h-4 text-orange-400" />
            <span>Fruits: {gameState.fruitsCollected}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Animals: {gameState.animalsDefeated}</span>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-lg p-4 rounded-xl border border-green-500/30 text-green-100">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" /> Controls
        </h3>
        <div className="text-sm space-y-1">
          <p>
            <kbd className="bg-green-700/50 px-2 py-1 rounded text-xs">
              W A S D
            </kbd>{" "}
            Drive Humvee
          </p>
          <p>
            <kbd className="bg-green-700/50 px-2 py-1 rounded text-xs">
              Click
            </kbd>{" "}
            Collect Fruits / Interact
          </p>
          <p>
            <kbd className="bg-green-700/50 px-2 py-1 rounded text-xs">
              Click
            </kbd>{" "}
            Fight Animals
          </p>
        </div>
      </div>

      {/* Game Objectives */}
      <div className="absolute top-16 right-4 z-10 bg-black/60 backdrop-blur-lg p-4 rounded-xl border border-green-500/30 text-green-100 max-w-xs">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" /> Objectives
        </h3>
        <div className="text-sm space-y-1">
          <p>🍎 Collect fruits (+10 points)</p>
          <p>🦁 Defeat animals (+25 points)</p>
          <p>🌟 Reach 500 points to win!</p>
        </div>
      </div>

      {/* 3D Game Canvas */}
      <Canvas shadows className="w-full h-full">
        <Suspense
          fallback={
            <>
              <ambientLight intensity={0.8} />
              <PerspectiveCamera makeDefault position={[0, 5, 5]} />
              <Text
                position={[0, 0, 0]}
                fontSize={1.2}
                color="#e5ffe5"
                anchorX="center"
                anchorY="middle"
              >
                Loading Safari Adventure...
              </Text>
              <Text
                position={[0, -1, 0]}
                fontSize={0.6}
                color="#ccffcc"
                anchorX="center"
                anchorY="middle"
              >
                Please wait while we load the animals and environment
              </Text>
              {/* Simple loading animation */}
              <mesh position={[0, -2, 0]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.5, 0.1, 8, 16]} />
                <meshBasicMaterial color="#4ade80" />
              </mesh>
            </>
          }
        >
          <GameScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
