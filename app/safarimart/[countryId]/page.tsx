"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
  Float,
  useGLTF,
  FirstPersonControls,
} from "@react-three/drei";
import { useRef, useState, useEffect, useMemo } from "react";
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
  ShoppingCart,
  Users,
  Coins,
  Palette,
  Music,
  Camera,
  MessageCircle,
  Gift,
  Crown,
  Sparkles,
} from "lucide-react";

// Simple loading overlay
function LoadingOverlay({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 text-yellow-100">
        <svg
          className="w-6 h-6 animate-spin text-yellow-400"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span className="font-semibold">{text}</span>
      </div>
    </div>
  );
}

// Enhanced Camera Controller
function CameraController() {
  const { camera, gl } = useThree();
  const moveSpeed = 0.3;
  const lookSpeed = 0.002;
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });
  const mouse = useRef({ x: 0, y: 0 });
  const isMouseDown = useRef(false);
  const pitch = useRef(0);
  const yaw = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          keys.current.forward = true;
          break;
        case "KeyS":
          keys.current.backward = true;
          break;
        case "KeyA":
          keys.current.left = true;
          break;
        case "KeyD":
          keys.current.right = true;
          break;
        case "KeyQ":
          keys.current.up = true;
          break;
        case "KeyE":
          keys.current.down = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          keys.current.forward = false;
          break;
        case "KeyS":
          keys.current.backward = false;
          break;
        case "KeyA":
          keys.current.left = false;
          break;
        case "KeyD":
          keys.current.right = false;
          break;
        case "KeyQ":
          keys.current.up = false;
          break;
        case "KeyE":
          keys.current.down = false;
          break;
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        isMouseDown.current = true;
        gl.domElement.style.cursor = "grabbing";
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        isMouseDown.current = false;
        gl.domElement.style.cursor = "grab";
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown.current) {
        const deltaX = event.movementX;
        const deltaY = event.movementY;

        yaw.current -= deltaX * lookSpeed;
        pitch.current -= deltaY * lookSpeed;

        // Clamp pitch to prevent over-rotation
        pitch.current = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, pitch.current)
        );

        // Update camera rotation
        camera.rotation.order = "YXZ";
        camera.rotation.y = yaw.current;
        camera.rotation.x = pitch.current;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      camera.position.addScaledVector(direction, event.deltaY * 0.01);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    gl.domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    gl.domElement.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("wheel", handleWheel);
    };
  }, [camera, gl]);

  useFrame(() => {
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();

    camera.getWorldDirection(direction);
    right.crossVectors(direction, camera.up).normalize();
    up.set(0, 1, 0);

    if (keys.current.forward) {
      camera.position.addScaledVector(direction, moveSpeed);
    }
    if (keys.current.backward) {
      camera.position.addScaledVector(direction, -moveSpeed);
    }
    if (keys.current.left) {
      camera.position.addScaledVector(right, -moveSpeed);
    }
    if (keys.current.right) {
      camera.position.addScaledVector(right, moveSpeed);
    }
    if (keys.current.up) {
      camera.position.addScaledVector(up, moveSpeed);
    }
    if (keys.current.down) {
      camera.position.addScaledVector(up, -moveSpeed);
    }

    // Keep camera above ground
    if (camera.position.y < 1) {
      camera.position.y = 1;
    }
  });

  return null;
}

// African Cultural Environment Components
function AfricanMarketplace({
  onMarketplaceClick,
}: {
  onMarketplaceClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central Market Square */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[15, 15, 0.2, 32]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Market Stalls */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 12;
        const z = Math.sin(angle) * 12;
        return (
          <group
            key={i}
            position={[x, 0, z]}
            rotation={[0, angle + Math.PI, 0]}
          >
            {/* Stall Structure */}
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[3, 3, 2]} />
              <meshStandardMaterial color="#D2691E" roughness={0.7} />
            </mesh>

            {/* Stall Roof */}
            <mesh position={[0, 2.8, 0]}>
              <coneGeometry args={[2.2, 1.5, 4]} />
              <meshStandardMaterial color="#CD853F" roughness={0.8} />
            </mesh>

            {/* Stall Counter */}
            <mesh position={[0, 0.3, 1.2]}>
              <boxGeometry args={[2.5, 0.6, 0.2]} />
              <meshStandardMaterial color="#8B4513" roughness={0.9} />
            </mesh>
          </group>
        );
      })}

      {/* Central Fire Pit */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[2, 2, 0.3, 16]} />
        <meshStandardMaterial color="#2F4F4F" roughness={0.9} />
      </mesh>

      {/* Fire Effect */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshBasicMaterial color="#FF4500" transparent opacity={0.6} />
        </mesh>
      </Float>

      {/* Clickable Area for Marketplace */}
      <mesh
        position={[0, 0.1, 0]}
        onClick={onMarketplaceClick}
        onPointerOver={(e) => {
          setHovered(true);
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <cylinderGeometry args={[15, 15, 0.1, 32]} />
        <meshBasicMaterial
          color={hovered ? "#FFD700" : "#8B4513"}
          transparent
          opacity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Marketplace Label */}
      <Text
        position={[0, 4, 0]}
        fontSize={1.5}
        color={hovered ? "#FFD700" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
      >
        African Marketplace
      </Text>
    </group>
  );
}

function AfricanArtGallery({
  onArtGalleryClick,
}: {
  onArtGalleryClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[25, 0, 0]}>
      {/* Gallery Building */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[8, 4, 6]} />
        <meshStandardMaterial color="#F5DEB3" roughness={0.6} />
      </mesh>

      {/* Gallery Roof */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[9, 1, 7]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Art Displays */}
      {Array.from({ length: 6 }, (_, i) => {
        const x = (i % 3) * 2.5 - 2.5;
        const z = Math.floor(i / 3) * 3 - 1.5;
        return (
          <group key={i} position={[x, 1.5, z]}>
            {/* Art Frame */}
            <mesh>
              <boxGeometry args={[1.5, 1.5, 0.1]} />
              <meshStandardMaterial
                color="#DAA520"
                roughness={0.3}
                metalness={0.2}
              />
            </mesh>

            {/* Art Canvas */}
            <mesh position={[0, 0, 0.06]}>
              <boxGeometry args={[1.3, 1.3, 0.05]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#FF6347" : "#32CD32"}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
      })}

      {/* Entrance */}
      <mesh position={[0, 1, 3]}>
        <boxGeometry args={[2, 2, 0.2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Clickable Area for Art Gallery */}
      <mesh
        position={[0, 2, 0]}
        onPointerOver={(e) => {
          setHovered(true);
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={onArtGalleryClick}
      >
        <boxGeometry args={[8, 4, 6]} />
        <meshBasicMaterial
          color={hovered ? "#FFD700" : "#F5DEB3"}
          transparent
          opacity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Art Gallery Label */}
      <Text
        position={[0, 6, 0]}
        fontSize={1.2}
        color={hovered ? "#FFD700" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
      >
        Art Gallery
      </Text>
    </group>
  );
}

function MusicStage({ onMusicStageClick }: { onMusicStageClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // simple tempo for lights/equalizer
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.06;
  });

  // helper: build a stacked speaker
  const SpeakerStack = ({
    position,
  }: {
    position: [number, number, number];
  }) => (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.8 * i + 0.6, 0]}>
          <boxGeometry args={[0.9, 0.8, 0.5]} />
          <meshStandardMaterial
            color="#1f2937"
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
      ))}
      {/* speaker cones */}
      {[0, 1, 2].map((i) => (
        <mesh key={`cone-${i}`} position={[0, 0.8 * i + 0.6, 0.26]}>
          <circleGeometry args={[0.22, 24]} />
          <meshStandardMaterial
            color="#111827"
            metalness={0.2}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );

  // helper: simple animated equalizer bar
  const Equalizer = () => {
    const bars = new Array(8).fill(0);
    const refs = useRef<Array<THREE.Mesh | null>>(bars.map(() => null));
    useFrame((state) => {
      const t = state.clock.elapsedTime;
      refs.current.forEach((m, i) => {
        if (!m) return;
        const h = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i * 0.5));
        m.scale.y = h;
      });
    });
    return (
      <group position={[0, 1.05, 0.2]}>
        {bars.map((_, i) => (
          <mesh
            key={i}
            ref={(el) => (refs.current[i] = el)}
            position={[i * 0.25 - (bars.length * 0.25) / 2 + 0.25, 0, 0]}
          >
            <boxGeometry args={[0.18, 0.5, 0.1]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#064e3b"
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}
      </group>
    );
  };

  return (
    <group ref={groupRef} position={[-25, 0, 0]}>
      {/* Stage Platform */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[10, 0.7, 6]} />
        <meshStandardMaterial color="#3f2a1f" roughness={0.8} />
      </mesh>

      {/* Dance Floor */}
      <group position={[0, 0.02, 0]}>
        {[-2, -1, 0, 1, 2].map((x) =>
          [-2, -1, 0, 1, 2].map((z) => (
            <mesh
              key={`${x}-${z}`}
              position={[x * 0.9, 0, z * 0.9]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.85, 0.85]} />
              <meshStandardMaterial
                color={(x + z) % 2 === 0 ? "#1f2937" : "#374151"}
                roughness={0.8}
              />
            </mesh>
          ))
        )}
      </group>

      {/* DJ Booth */}
      <group position={[0, 1.1, -1.6]}>
        {/* Booth table */}
        <mesh>
          <boxGeometry args={[3.2, 0.3, 1.2]} />
          <meshStandardMaterial
            color="#111827"
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
        {/* Turntables */}
        {[-0.8, 0.8].map((x, i) => (
          <group key={i} position={[x, 0.25, 0]}>
            <mesh>
              <cylinderGeometry args={[0.35, 0.35, 0.06, 32]} />
              <meshStandardMaterial
                color="#0f766e"
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.12, 0.06, 0.12]}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
              <meshStandardMaterial
                color="#d1d5db"
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))}
        {/* Mixer */}
        <group position={[0, 0.25, 0]}>
          <mesh>
            <boxGeometry args={[0.8, 0.06, 0.5]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <Equalizer />
        </group>
      </group>

      {/* DJ (stylized) */}
      <group position={[0, 1.9, -1.6]}>
        <mesh>
          <sphereGeometry args={[0.25, 20, 20]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 0.6, 12]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        {/* arms */}
        <mesh position={[-0.25, -0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0.25, -0.4, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>

      {/* Speaker Stacks */}
      <SpeakerStack position={[-4.2, 0.5, -1.6]} />
      <SpeakerStack position={[4.2, 0.5, -1.6]} />

      {/* Overhead Truss with moving lights */}
      <group position={[0, 3.2, 0]}>
        <mesh>
          <boxGeometry args={[8, 0.15, 0.15]} />
          <meshStandardMaterial
            color="#374151"
            metalness={0.2}
            roughness={0.7}
          />
        </mesh>
        {[-3, -1, 1, 3].map((x, i) => (
          <spotLight
            key={i}
            position={[x, 0, 0]}
            angle={0.5}
            intensity={1.6}
            color={i % 2 === 0 ? 0x00ffff : 0xff00ff}
            target-position={[0, 0, 0]}
          />
        ))}
      </group>

      {/* Clickable Area for Music Stage */}
      <mesh
        position={[0, 0.35, 0]}
        onPointerOver={(e) => {
          setHovered(true);
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        onClick={onMusicStageClick}
      >
        <boxGeometry args={[10, 0.7, 6]} />
        <meshBasicMaterial
          color={hovered ? "#FFD700" : "#3f2a1f"}
          transparent
          opacity={hovered ? 0.25 : 0}
        />
      </mesh>

      {/* Music Stage Label */}
      <Text
        position={[0, 3.8, 0]}
        fontSize={1.3}
        color={hovered ? "#FFD700" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
      >
        Music Stage (DJ Set)
      </Text>
    </group>
  );
}

function TradingPost() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 25]}>
      {/* Trading Post Building */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[6, 4, 4]} />
        <meshStandardMaterial color="#DEB887" roughness={0.7} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[4, 2, 4]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Trading Counter */}
      <mesh position={[0, 0.5, 2.2]}>
        <boxGeometry args={[4, 1, 0.3]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>

      {/* Display Shelves */}
      {Array.from({ length: 4 }, (_, i) => {
        const x = (i % 2) * 2 - 1;
        const z = Math.floor(i / 2) * 1.5 - 0.75;
        return (
          <group key={i} position={[x, 1.5, z]}>
            <mesh>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#FFD700" : "#FF6347"}
                roughness={0.3}
                metalness={0.4}
              />
            </mesh>
          </group>
        );
      })}

      {/* Clickable Area for Trading Post */}
      <mesh
        position={[0, 2, 0]}
        onPointerOver={(e) => {
          setHovered(true);
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[6, 4, 4]} />
        <meshBasicMaterial
          color={hovered ? "#FFD700" : "#DEB887"}
          transparent
          opacity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Trading Post Label */}
      <Text
        position={[0, 6, 0]}
        fontSize={1.2}
        color={hovered ? "#FFD700" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
      >
        Trading Post
      </Text>
    </group>
  );
}

function SocialHub({ onSocialHubClick }: { onSocialHubClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -25]}>
      {/* Social Hub Building - Enhanced */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[10, 4, 8]} />
        <meshStandardMaterial color="#F0E68C" roughness={0.6} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[11, 1, 9]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Community Circle */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[6, 6, 0.2, 32]} />
        <meshStandardMaterial color="#4ade80" roughness={0.8} />
      </mesh>

      {/* Seating Areas - More seats for community */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 4;
        const z = Math.sin(angle) * 4;
        return (
          <group key={i} position={[x, 0.3, z]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[1.2, 0.6, 0.8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Central Community Fire */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.2}>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshBasicMaterial color="#ff6b35" transparent opacity={0.7} />
        </mesh>
      </Float>

      {/* Welcome Banner */}
      <mesh position={[0, 3, 4.5]} rotation={[0, 0, 0]}>
        <boxGeometry args={[6, 1, 0.1]} />
        <meshStandardMaterial color="#059669" roughness={0.5} />
      </mesh>

      {/* Clickable Area for Social Hub */}
      <mesh
        position={[0, 2, 0]}
        onClick={onSocialHubClick}
        onPointerOver={(e) => {
          setHovered(true);
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[10, 4, 8]} />
        <meshBasicMaterial
          color={hovered ? "#FFD700" : "#F0E68C"}
          transparent
          opacity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Social Hub Label */}
      <Text
        position={[0, 6, 0]}
        fontSize={1.2}
        color={hovered ? "#FFD700" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
      >
        Social Hub
      </Text>
    </group>
  );
}

function AfricanTrees() {
  return (
    <group>
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 35 + Math.random() * 15;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 3 + Math.random() * 4;

        return (
          <group key={i} position={[x, height / 2, z]}>
            {/* Tree Trunk */}
            <mesh>
              <cylinderGeometry args={[0.3, 0.5, height]} />
              <meshStandardMaterial color="#8B4513" roughness={0.9} />
            </mesh>

            {/* Tree Canopy */}
            <mesh position={[0, height * 0.7, 0]}>
              <sphereGeometry args={[height * 0.6, 8, 8]} />
              <meshStandardMaterial
                color="#228B22"
                roughness={0.8}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Ground() {
  return (
    <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#8FBC8F" roughness={0.9} />
    </mesh>
  );
}

// Preload all artifact models
useGLTF.preload("/artifact/African mask sculpture .glb");
useGLTF.preload("/artifact/African Women Bust.glb");
useGLTF.preload("/artifact/Wooden ornament.glb");
useGLTF.preload("/artifact/African woman wood sculpture .glb");
useGLTF.preload("/artifact/African Artifact - Yale Art Gallery.glb");
useGLTF.preload("/artifact/%23Fashion%20Bucket%20Hat%20from%20Africa%20.glb");
useGLTF.preload("/artifact/Little Succulent Plant.glb");
useGLTF.preload("/artifact/African Drum.glb");
useGLTF.preload("/artifact/African Cucumber.glb");

// 3D Artifact Loader Component
function ArtifactModel({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  targetSize = 1.4,
  scaleMultiplier = 1,
}: {
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  targetSize?: number; // desired max dimension in world units
  scaleMultiplier?: number; // optional additional multiplier after fitting
}) {
  const { scene } = useGLTF(modelPath);

  const { fittedScene, finalScale } = useMemo(() => {
    const cloned = scene.clone(true);
    // Compute bounding box of the model
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fitScale = targetSize / maxDim;
    const normalizedScale = fitScale * scaleMultiplier;
    return { fittedScene: cloned, finalScale: normalizedScale };
  }, [scene, targetSize, scaleMultiplier]);

  return (
    <primitive
      object={fittedScene}
      scale={[finalScale, finalScale, finalScale]}
      position={position}
      rotation={rotation}
    />
  );
}

// 3D Shop Item Component
function ShopItem3D({
  item,
  position,
  onItemClick,
  isHovered,
  onHover,
  scale = [1, 1, 1],
  isFocused = false,
}: {
  item: any;
  position: [number, number, number];
  onItemClick: (item: any) => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  scale?: [number, number, number];
  isFocused?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;

      // Focus effect - gentle pulsing
      if (isFocused) {
        groupRef.current.scale.setScalar(
          scale[0] + Math.sin(state.clock.elapsedTime * 3) * 0.1
        );
      } else {
        groupRef.current.scale.set(scale[0], scale[1], scale[2]);
      }
    }
  });

  const getArtifactModel = () => {
    switch (item.id) {
      case "mask1":
        return (
          <ArtifactModel modelPath="/artifact/African mask sculpture .glb" />
        );
      case "pottery1":
        return <ArtifactModel modelPath="/artifact/African Women Bust.glb" />;
      case "textile1":
        return <ArtifactModel modelPath="/artifact/Wooden ornament.glb" />;
      case "jewelry1":
        return (
          <ArtifactModel modelPath="/artifact/African woman wood sculpture .glb" />
        );
      case "artifact1":
        return (
          <ArtifactModel modelPath="/artifact/African Artifact - Yale Art Gallery.glb" />
        );
      case "fashion1":
        return (
          <ArtifactModel modelPath="/artifact/%23Fashion%20Bucket%20Hat%20from%20Africa%20.glb" />
        );
      case "plant1":
        return (
          <ArtifactModel modelPath="/artifact/Little Succulent Plant.glb" />
        );
      case "drum1":
        return <ArtifactModel modelPath="/artifact/African Drum.glb" />;
      case "cucumber1":
        return <ArtifactModel modelPath="/artifact/African Cucumber.glb" />;
      case "nft1":
        return (
          <ArtifactModel modelPath="/artifact/African Artifact - Yale Art Gallery.glb" />
        );
      case "nft2":
        return (
          <ArtifactModel modelPath="/artifact/%23Fashion%20Bucket%20Hat%20from%20Africa%20.glb" />
        );
      case "nft3":
        return (
          <ArtifactModel modelPath="/artifact/Little Succulent Plant.glb" />
        );
      case "nft4":
        return <ArtifactModel modelPath="/artifact/African Drum.glb" />;
      case "nft5":
        return <ArtifactModel modelPath="/artifact/African Cucumber.glb" />;
      case "music1":
        return <ArtifactModel modelPath="/artifact/African Drum.glb" />;
      case "music2":
        return <ArtifactModel modelPath="/artifact/African Cucumber.glb" />;
      case "music3":
        return (
          <ArtifactModel modelPath="/artifact/African mask sculpture .glb" />
        );
      case "music4":
        return <ArtifactModel modelPath="/artifact/African Women Bust.glb" />;
      default:
        return (
          <ArtifactModel modelPath="/artifact/African mask sculpture .glb" />
        );
    }
  };

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onClick={() => onItemClick(item)}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      >
        {getArtifactModel()}
      </group>

      {/* Removed in-scene title and price labels for a cleaner display */}
    </group>
  );
}

// 3D Shop Environment
function ShopEnvironment3D({
  selectedCategory,
  onItemClick,
  hoveredItem,
  onHover,
  focusedIndex,
  setFocusedIndex,
}: {
  selectedCategory: string;
  onItemClick: (item: any) => void;
  hoveredItem: string | null;
  onHover: (itemId: string | null) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
}) {
  const shopItems = {
    crafts: [
      {
        id: "mask1",
        name: "African Mask Sculpture",
        price: 150,
        category: "crafts",
      },
      {
        id: "pottery1",
        name: "African Women Bust",
        price: 200,
        category: "crafts",
      },
      {
        id: "textile1",
        name: "Wooden Ornament",
        price: 120,
        category: "crafts",
      },
      {
        id: "jewelry1",
        name: "Wood Sculpture",
        price: 180,
        category: "crafts",
      },
      {
        id: "artifact1",
        name: "Yale Art Gallery Artifact",
        price: 300,
        category: "crafts",
      },
      {
        id: "fashion1",
        name: "African Fashion Bucket Hat",
        price: 250,
        category: "crafts",
      },
      {
        id: "plant1",
        name: "Succulent Plant Art",
        price: 180,
        category: "crafts",
      },
      {
        id: "drum1",
        name: "Traditional African Drum",
        price: 220,
        category: "crafts",
      },
      {
        id: "cucumber1",
        name: "African Cucumber Art",
        price: 160,
        category: "crafts",
      },
    ],
    digital: [
      {
        id: "nft1",
        name: "Yale Art Gallery NFT",
        price: 300,
        category: "digital",
      },
      {
        id: "nft2",
        name: "Fashion Bucket Hat NFT",
        price: 250,
        category: "digital",
      },
      {
        id: "nft3",
        name: "Succulent Plant NFT",
        price: 180,
        category: "digital",
      },
      {
        id: "nft4",
        name: "African Drum NFT",
        price: 220,
        category: "digital",
      },
      {
        id: "nft5",
        name: "African Cucumber NFT",
        price: 160,
        category: "digital",
      },
    ],
    music: [
      {
        id: "music1",
        name: "Traditional African Drum",
        price: 220,
        category: "music",
      },
      {
        id: "music2",
        name: "African Cucumber Art",
        price: 160,
        category: "music",
      },
      {
        id: "music3",
        name: "Mask Sculpture Music",
        price: 150,
        category: "music",
      },
      {
        id: "music4",
        name: "Women Bust Music",
        price: 200,
        category: "music",
      },
    ],
  };

  const items = shopItems[selectedCategory as keyof typeof shopItems] || [];

  // Premium marketplace layout (bright studio + pedestals)
  const radius = 10;

  return (
    <>
      {/* Bright Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.9} />
      </mesh>

      {/* Center focused item on pedestal */}
      {items[focusedIndex] && (
        <group position={[0, 2.2, -4]}>
          {/* Pedestal */}
          <mesh position={[0, -1.0, 0]}>
            <cylinderGeometry args={[1.0, 1.2, 0.35, 24]} />
            <meshStandardMaterial
              color="#dddddd"
              roughness={0.3}
              metalness={0.05}
            />
          </mesh>
          {/* Item */}
          <ShopItem3D
            item={items[focusedIndex]}
            position={[0, 0, 0]}
            scale={[2.0, 2.0, 2.0]}
            onItemClick={onItemClick}
            isHovered={hoveredItem === items[focusedIndex].id}
            onHover={(hovered) =>
              onHover(hovered ? items[focusedIndex].id : null)
            }
            isFocused={true}
          />
        </group>
      )}

      {/* Background items in a bright arc with pedestals */}
      {items.map((item, index) => {
        if (index === focusedIndex) return null;
        const idx = index < focusedIndex ? index : index - 1;
        const total = items.length - 1;
        const angle =
          ((idx - (total - 1) / 2) / Math.max(total - 1, 1)) * Math.PI * 0.65;
        const x = Math.sin(angle) * radius;
        const z = -6 - Math.cos(angle) * radius;
        const y = 1.9;
        const tilt = -angle * 0.35;
        return (
          <group key={item.id} position={[x, y, z]} rotation={[0, tilt, 0]}>
            {/* Pedestal */}
            <mesh position={[0, -1.0, 0]}>
              <cylinderGeometry args={[0.9, 1.1, 0.35, 24]} />
              <meshStandardMaterial
                color="#e5e7eb"
                roughness={0.35}
                metalness={0.05}
              />
            </mesh>
            {/* Item */}
            <ShopItem3D
              item={item}
              position={[0, 0, 0]}
              scale={[1.0, 1.0, 1.0]}
              onItemClick={() => setFocusedIndex(index)}
              isHovered={hoveredItem === item.id}
              onHover={(hovered) => onHover(hovered ? item.id : null)}
              isFocused={false}
            />
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

// Virtual Shop Component
function VirtualShop({
  isOpen,
  onClose,
  onBackToMain,
}: {
  isOpen: boolean;
  onClose: () => void;
  onBackToMain: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState("crafts");
  const [cart, setCart] = useState<
    Array<{ id: string; name: string; price: number; quantity: number }>
  >([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Define shop items outside useEffect for UI access
  const shopItems = {
    crafts: [
      {
        id: "mask1",
        name: "African Mask Sculpture",
        price: 150,
        category: "crafts",
      },
      {
        id: "pottery1",
        name: "African Women Bust",
        price: 200,
        category: "crafts",
      },
      {
        id: "textile1",
        name: "Wooden Ornament",
        price: 120,
        category: "crafts",
      },
      {
        id: "jewelry1",
        name: "Wood Sculpture",
        price: 180,
        category: "crafts",
      },
      {
        id: "artifact1",
        name: "Yale Art Gallery Artifact",
        price: 300,
        category: "crafts",
      },
      {
        id: "fashion1",
        name: "African Fashion Bucket Hat",
        price: 250,
        category: "crafts",
      },
      {
        id: "plant1",
        name: "Succulent Plant Art",
        price: 180,
        category: "crafts",
      },
      {
        id: "drum1",
        name: "Traditional African Drum",
        price: 220,
        category: "crafts",
      },
      {
        id: "cucumber1",
        name: "African Cucumber Art",
        price: 160,
        category: "crafts",
      },
    ],
    digital: [
      {
        id: "nft1",
        name: "Yale Art Gallery NFT",
        price: 300,
        category: "digital",
      },
      {
        id: "nft2",
        name: "Fashion Bucket Hat NFT",
        price: 250,
        category: "digital",
      },
      {
        id: "nft3",
        name: "Succulent Plant NFT",
        price: 180,
        category: "digital",
      },
      {
        id: "nft4",
        name: "African Drum NFT",
        price: 220,
        category: "digital",
      },
      {
        id: "nft5",
        name: "African Cucumber NFT",
        price: 160,
        category: "digital",
      },
    ],
    music: [
      {
        id: "music1",
        name: "Traditional African Drum",
        price: 220,
        category: "music",
      },
      {
        id: "music2",
        name: "African Cucumber Art",
        price: 160,
        category: "music",
      },
      {
        id: "music3",
        name: "Mask Sculpture Music",
        price: 150,
        category: "music",
      },
      {
        id: "music4",
        name: "Women Bust Music",
        price: 200,
        category: "music",
      },
    ],
  };

  const items = shopItems[selectedCategory as keyof typeof shopItems] || [];

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen) return;
      const itemsPerRow = 3;
      const totalItems = items.length;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev - 1;
            return newIndex < 0 ? totalItems - 1 : newIndex;
          });
          break;
        case "ArrowRight":
          event.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev + 1;
            return newIndex >= totalItems ? 0 : newIndex;
          });
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev - 3; // Jump by 3 for faster navigation
            return newIndex < 0 ? totalItems - 1 : newIndex;
          });
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev + 3; // Jump by 3 for faster navigation
            return newIndex >= totalItems ? 0 : newIndex;
          });
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (items[focusedIndex]) {
            addToCart(items[focusedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, selectedCategory, focusedIndex, addToCart, onClose]);

  // Reset focus when category changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50">
      {/* 3D Shop Environment */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 8, 12], fov: 75 }}
          style={{ background: "linear-gradient(to bottom, #faf7f2, #efe7db)" }}
        >
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={5}
            maxDistance={25}
            target={[0, 2, -2]}
            enableDamping={true}
            dampingFactor={0.05}
          />
          <ShopEnvironment3D
            selectedCategory={selectedCategory}
            onItemClick={addToCart}
            hoveredItem={hoveredItem}
            onHover={setHoveredItem}
            focusedIndex={focusedIndex}
            setFocusedIndex={setFocusedIndex}
          />
        </Canvas>
      </div>

      {/* Minimal UI Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-3">
          {/* Close shop: return to virtual world */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-amber-300 transition-colors bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Close
          </button>
          {/* Back to previous page */}
          <button
            onClick={onBackToMain}
            className="flex items-center gap-2 text-white hover:text-amber-300 transition-colors bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          {/* Close X */}
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 text-xl font-bold bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            ×
          </button>
        </div>
      </div>

      {/* Current Item Display - Bottom Right */}
      {items[focusedIndex] && (
        <div className="hidden">
          {/* Moved info into bottom control center */}
        </div>
      )}

      {/* Carousel Navigation - Bottom Center */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
        <div className="flex items-center gap-4 bg-black/70 backdrop-blur-lg rounded-full px-6 py-3 border border-amber-500/30">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() =>
              setFocusedIndex((prev) =>
                prev === 0 ? items.length - 1 : prev - 1
              )
            }
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-500/25"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Focused Item Info */}
          {items[focusedIndex] && (
            <div className="flex items-center gap-3 px-4">
              <div className="text-amber-300 font-semibold">
                {items[focusedIndex].name}
              </div>
              <div className="text-yellow-400 font-bold">
                {items[focusedIndex].price} SVT
              </div>
            </div>
          )}

          {/* Item Counter */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex gap-1">
              {items.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === focusedIndex
                      ? "bg-amber-400 w-8"
                      : "bg-gray-500 hover:bg-gray-400"
                  }`}
                  onClick={() => setFocusedIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() =>
              setFocusedIndex((prev) =>
                prev === items.length - 1 ? 0 : prev + 1
              )
            }
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-500/25"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Categories - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="flex gap-2">
          {["crafts", "digital", "music"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                  : "bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Control Instructions - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/60 backdrop-blur-lg rounded-lg p-4 border border-amber-500/30 max-w-xs">
          <h3 className="text-amber-300 font-semibold mb-2 text-sm">
            🎮 Controls
          </h3>
          <div className="space-y-1 text-xs text-orange-200">
            <div className="flex justify-between">
              <span>WASD:</span>
              <span className="text-yellow-300">Move</span>
            </div>
            <div className="flex justify-between">
              <span>Q/E:</span>
              <span className="text-yellow-300">Up/Down</span>
            </div>
            <div className="flex justify-between">
              <span>Mouse:</span>
              <span className="text-yellow-300">Look Around</span>
            </div>
            <div className="flex justify-between">
              <span>Scroll:</span>
              <span className="text-yellow-300">Zoom</span>
            </div>
            <div className="flex justify-between">
              <span>Click:</span>
              <span className="text-yellow-300">Interact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shopping Cart - Moved to avoid overlap */}
      <div className="absolute top-16 right-4 z-10">
        <div className="bg-black/60 backdrop-blur-lg rounded-lg p-3 border border-amber-500/30 max-w-xs">
          <h3 className="text-lg font-semibold text-yellow-100 mb-2">
            Cart ({cart.length})
          </h3>
          {cart.length === 0 ? (
            <p className="text-orange-200 text-center py-2 text-sm">Empty</p>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-orange-800/40 rounded p-2"
                >
                  <div>
                    <p className="text-yellow-100 font-medium text-sm">
                      {item.name}
                    </p>
                    <p className="text-orange-200 text-xs">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold text-sm">
                      {item.price * item.quantity} SVT
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t border-amber-400/30 pt-2 mt-2 space-y-2">
                <div className="flex justify-between items-center text-lg font-bold text-yellow-100">
                  <span>Total:</span>
                  <span>{getTotalPrice()} SVT</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCart([])}
                    className="w-1/2 bg-black/40 text-orange-100 hover:bg-black/60 rounded py-2 text-sm font-semibold"
                  >
                    Clear
                  </button>
                  <button className="w-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-2 rounded-lg font-bold hover:from-yellow-600 hover:to-amber-600 transition-all text-sm">
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Instructions - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-4 border border-amber-500/30 max-w-sm">
          <h3 className="text-amber-300 font-semibold mb-2 text-sm">
            🎮 Movement Controls
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-orange-200">
            <div className="flex justify-between">
              <span>WASD:</span>
              <span className="text-yellow-300">Move</span>
            </div>
            <div className="flex justify-between">
              <span>Q/E:</span>
              <span className="text-yellow-300">Up/Down</span>
            </div>
            <div className="flex justify-between">
              <span>Mouse:</span>
              <span className="text-yellow-300">Look</span>
            </div>
            <div className="flex justify-between">
              <span>Scroll:</span>
              <span className="text-yellow-300">Zoom</span>
            </div>
          </div>
          <p className="text-orange-200 text-xs mt-2">
            Click on buildings to enter shops
          </p>
        </div>
      </div>
    </div>
  );
}

// Interactive UI Components
function SafariMartUI({
  countryId,
  isShopOpen,
  setIsShopOpen,
  onBackToMain,
  controlMode,
  setControlMode,
  onOpenMarketplace,
  onOpenGallery,
  onOpenMusic,
}: {
  countryId: string;
  isShopOpen: boolean;
  setIsShopOpen: (open: boolean) => void;
  onBackToMain: () => void;
  controlMode: "firstPerson" | "orbit";
  setControlMode: (mode: "firstPerson" | "orbit") => void;
  onOpenMarketplace: () => void;
  onOpenGallery: () => void;
  onOpenMusic: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "marketplace" | "gallery" | "music" | "trading" | "social"
  >("marketplace");
  const [balance, setBalance] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const savedBalance = localStorage.getItem("svtBalance");
    if (savedBalance) {
      setBalance(parseInt(savedBalance));
    }
  }, []);

  const tabs = [
    {
      id: "marketplace",
      label: "Marketplace",
      icon: ShoppingCart,
      color: "from-green-500 to-teal-500",
    },
    {
      id: "gallery",
      label: "Art Gallery",
      icon: Palette,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "music",
      label: "Music Stage",
      icon: Music,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "trading",
      label: "Trading Post",
      icon: Coins,
      color: "from-yellow-500 to-amber-500",
    },
    {
      id: "social",
      label: "Social Hub",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Virtual Shop */}
      <VirtualShop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onBackToMain={onBackToMain}
      />

      {/* Top Navigation */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToMain}
                className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent">
                Safariverse -{" "}
                {countryId.charAt(0).toUpperCase() + countryId.slice(1)}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-100">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">{balance} SVT</span>
              </div>

              {/* Control Mode Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-orange-100 text-sm">Controls:</span>
                <button
                  onClick={() =>
                    setControlMode(
                      controlMode === "firstPerson" ? "orbit" : "firstPerson"
                    )
                  }
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    controlMode === "firstPerson"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-black/40 text-orange-100 hover:bg-black/60"
                  }`}
                >
                  {controlMode === "firstPerson" ? "WASD" : "Orbit"}
                </button>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-orange-100 hover:text-white transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-4 border border-amber-500/30">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === "marketplace") {
                      onOpenMarketplace();
                    } else if (tab.id === "gallery") {
                      onOpenGallery();
                    } else if (tab.id === "music") {
                      onOpenMusic();
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white`
                      : "text-orange-100 hover:bg-black/40"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Panels */}
      <div className="absolute top-20 left-4 right-4 z-10 pointer-events-auto">
        {activeTab === "marketplace" && (
          <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30 max-w-md">
            <h3 className="text-xl font-bold text-yellow-100 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> African Marketplace
            </h3>
            <div className="space-y-3">
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">
                  Traditional Crafts
                </h4>
                <p className="text-sm text-orange-200">
                  Handmade masks, pottery, and textiles
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-yellow-400 font-semibold">50 SVT</span>
                  <button
                    onClick={onOpenMarketplace}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded text-sm hover:from-green-600 hover:to-teal-600 transition-all"
                  >
                    Enter Shop
                  </button>
                </div>
              </div>
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">Digital Art</h4>
                <p className="text-sm text-orange-200">
                  NFTs inspired by African culture
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-yellow-400 font-semibold">100 SVT</span>
                  <button
                    onClick={onOpenMarketplace}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded text-sm hover:from-green-600 hover:to-teal-600 transition-all"
                  >
                    Enter Shop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30 max-w-md">
            <h3 className="text-xl font-bold text-yellow-100 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" /> Art Gallery
            </h3>
            <div className="space-y-3">
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">Create Art</h4>
                <p className="text-sm text-orange-200">
                  Design your own African-inspired artwork
                </p>
                <button
                  onClick={onOpenGallery}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded text-sm mt-2"
                >
                  Start Creating
                </button>
              </div>
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">Exhibit Art</h4>
                <p className="text-sm text-orange-200">
                  Showcase your creations to the community
                </p>
                <button
                  onClick={onOpenGallery}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded text-sm mt-2"
                >
                  Exhibit Now
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "music" && (
          <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30 max-w-md">
            <h3 className="text-xl font-bold text-yellow-100 mb-4 flex items-center gap-2">
              <Music className="w-5 h-5" /> Music Stage
            </h3>
            <div className="space-y-3">
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">
                  Live Performance
                </h4>
                <p className="text-sm text-orange-200">
                  Join the virtual stage and perform
                </p>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded text-sm mt-2">
                  Perform Now
                </button>
              </div>
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">
                  Music Creation
                </h4>
                <p className="text-sm text-orange-200">
                  Compose African-inspired music
                </p>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded text-sm mt-2">
                  Create Music
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "trading" && (
          <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30 max-w-md">
            <h3 className="text-xl font-bold text-yellow-100 mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5" /> Trading Post
            </h3>
            <div className="space-y-3">
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">Coming Soon</h4>
                <p className="text-sm text-orange-200">
                  Tokenized assets marketplace is under construction.
                </p>
              </div>
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">Auction House</h4>
                <p className="text-sm text-orange-200">
                  Coming soon — bid on rare cultural artifacts.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30 max-w-md">
            <h3 className="text-xl font-bold text-yellow-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> Social Hub
            </h3>
            <div className="space-y-3">
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">
                  Community Chat
                </h4>
                <p className="text-sm text-orange-200">
                  Connect with fellow safari adventurers
                </p>
                <button
                  onClick={() => router.push("/socialhub")}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded text-sm mt-2 hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  Join Community
                </button>
              </div>
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">
                  Interactive Activities
                </h4>
                <p className="text-sm text-orange-200">
                  Mini games, events, and social features
                </p>
                <button
                  onClick={() => router.push("/socialhub")}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded text-sm mt-2 hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  Explore Hub
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main SafariMart Scene
function SafariMartScene({
  countryId,
  onMarketplaceClick,
  onArtGalleryClick,
  onMusicStageClick,
  controlMode,
}: {
  countryId: string;
  onMarketplaceClick: () => void;
  onArtGalleryClick: () => void;
  onMusicStageClick: () => void;
  controlMode: "firstPerson" | "orbit";
}) {
  const router = useRouter();
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 8, 15]}
        fov={75}
        near={0.1}
        far={1000}
      />

      {/* Conditional Camera Controller */}
      {controlMode === "firstPerson" && <CameraController />}

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 5]} intensity={1.2} />
      <directionalLight position={[-10, 10, -5]} intensity={0.8} />
      <hemisphereLight args={[0x87ceeb, 0x8fbc8f, 0.4]} />

      {/* Ground */}
      <Ground />

      {/* African Trees */}
      <AfricanTrees />

      {/* Cultural Buildings */}
      <AfricanMarketplace onMarketplaceClick={onMarketplaceClick} />
      <AfricanArtGallery onArtGalleryClick={onArtGalleryClick} />
      <MusicStage onMusicStageClick={onMusicStageClick} />
      <TradingPost />
      <SocialHub onSocialHubClick={() => router.push("/socialhub")} />

      {/* OrbitControls for orbit mode */}
      {controlMode === "orbit" && (
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={50}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
        />
      )}
    </>
  );
}

export default function SafariMartPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.countryId as string;
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [controlMode, setControlMode] = useState<"firstPerson" | "orbit">(
    "firstPerson"
  );
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);

  const openMarketplace = () => {
    setIsLoadingMarketplace(true);
    // brief delay to show loading state and allow assets to settle
    setTimeout(() => {
      setIsLoadingMarketplace(false);
      setIsShopOpen(true);
    }, 800);
  };

  const openGallery = () => {
    setIsLoadingGallery(true);
    setTimeout(() => {
      setIsLoadingGallery(false);
      router.push(`/artgallery/${countryId}`);
    }, 800);
  };

  const openMusic = () => {
    setIsLoadingMusic(true);
    setTimeout(() => {
      setIsLoadingMusic(false);
      router.push(`/music/${countryId}`);
    }, 800);
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
      {/* Loading Overlays */}
      {isLoadingMarketplace && (
        <LoadingOverlay text="Opening African Marketplace..." />
      )}
      {isLoadingGallery && <LoadingOverlay text="Entering Art Gallery..." />}
      {isLoadingMusic && <LoadingOverlay text="Heading to Music Stage..." />}
      {/* 3D SafariMart Environment */}
      <Canvas
        className="w-full h-full"
        gl={{
          antialias: true,
          alpha: false,
        }}
      >
        <SafariMartScene
          countryId={countryId}
          onMarketplaceClick={openMarketplace}
          onArtGalleryClick={openGallery}
          onMusicStageClick={openMusic}
          controlMode={controlMode}
        />
      </Canvas>

      {/* UI Overlay */}
      <SafariMartUI
        countryId={countryId}
        isShopOpen={isShopOpen}
        setIsShopOpen={setIsShopOpen}
        onBackToMain={() => router.back()}
        controlMode={controlMode}
        setControlMode={setControlMode}
        onOpenMarketplace={openMarketplace}
        onOpenGallery={openGallery}
        onOpenMusic={openMusic}
      />
    </div>
  );
}
