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
  Plus,
  CheckCircle,
  Package,
  Download,
  Share2,
} from "lucide-react";
import { WalletProvider, useWallet } from "../../lib/wallet-provider";
import WalletModal from "../../components/WalletModal";
import {
  listProduct,
  getAllActiveProducts,
  getProductsByCategory,
  purchaseProduct,
  getMyProducts,
  formatPrice,
  parsePrice,
  PRODUCT_CATEGORIES,
  SAFARIMART_ADDRESS,
  type ProductData,
  type ProductCategory,
} from "../../lib/safarimart";

// Additional types for the UI
type ProductInput = {
  name: string;
  description: string;
  fileUrl: string;
  price: string;
  category: string;
};

// Utility function to remove duplicate products
function removeDuplicateProducts(products: ProductData[]): ProductData[] {
  const seen = new Map<string, ProductData>();
  const duplicatesFound: string[] = [];

  for (const product of products) {
    // Create a unique key based on normalized title and fileUrl
    // Normalize title: lowercase, trim, remove extra spaces, remove special chars
    const normalizedTitle = product.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "") // Remove special characters
      .replace(/\s+/g, " "); // Replace multiple spaces with single space

    const key = `${normalizedTitle}_${product.fileUrl}`;

    if (!seen.has(key)) {
      seen.set(key, product);
    } else {
      // Log the duplicate found
      duplicatesFound.push(`"${product.title}" (ID: ${product.productId})`);

      // If we find a duplicate, keep the one with the higher productId (more recent)
      const existing = seen.get(key)!;
      if (product.productId > existing.productId) {
        console.log(
          `🔄 Replacing duplicate "${existing.title}" (ID: ${existing.productId}) with newer version (ID: ${product.productId})`
        );
        seen.set(key, product);
      } else {
        console.log(
          `🗑️ Removing duplicate "${product.title}" (ID: ${product.productId}), keeping existing (ID: ${existing.productId})`
        );
      }
    }
  }

  if (duplicatesFound.length > 0) {
    console.log(
      `🔍 Found ${duplicatesFound.length} duplicate products:`,
      duplicatesFound
    );
  }

  // Additional pass: remove products with very similar titles (even with different fileUrls)
  const uniqueProducts = Array.from(seen.values());
  const finalProducts: ProductData[] = [];
  const titlesSeen = new Set<string>();

  for (const product of uniqueProducts) {
    const normalizedTitle = product.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ");

    if (!titlesSeen.has(normalizedTitle)) {
      titlesSeen.add(normalizedTitle);
      finalProducts.push(product);
    } else {
      console.log(
        `🗑️ Removing similar title duplicate: "${product.title}" (ID: ${product.productId})`
      );
    }
  }

  return finalProducts;
}

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

// Note: GLB models are loaded immediately for marketplace, lazy loaded for art gallery

// 3D Artifact Loader Component
function ArtifactModel({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  targetSize = 1.4,
  scaleMultiplier = 1,
  enableLazyLoading = false,
}: {
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  targetSize?: number; // desired max dimension in world units
  scaleMultiplier?: number; // optional additional multiplier after fitting
  enableLazyLoading?: boolean; // whether to enable lazy loading (for art gallery)
}) {
  try {
    // Load the model immediately for marketplace, or with preloading for art gallery
    const { scene } = useGLTF(modelPath, enableLazyLoading);

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
  } catch (error) {
    console.warn(`Failed to load GLB model: ${modelPath}`, error);
    console.log(`Model path details:`, {
      originalPath: modelPath,
      isProxyUrl: modelPath.startsWith("/api/glb"),
      error: error instanceof Error ? error.message : String(error),
    });
    // Return a fallback box if model fails to load
    return (
      <mesh position={position} rotation={rotation} scale={[0.5, 0.5, 0.5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    );
  }
}

// 3D Shop Item Component
function ShopItem3D({
  product,
  position,
  onItemClick,
  isHovered,
  onHover,
  scale = [1, 1, 1],
  isFocused = false,
}: {
  product: ProductData;
  position: [number, number, number];
  onItemClick: (product: ProductData) => void;
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
    // Use the product's fileUrl if it's a .glb file, otherwise fallback to default
    if (product.fileUrl && product.fileUrl.toLowerCase().endsWith(".glb")) {
      // Use the same URL proxying method as the NFT page
      const proxiedUrl = `/api/glb?url=${encodeURIComponent(product.fileUrl)}`;
      console.log(`Loading artifact from: ${product.fileUrl} -> ${proxiedUrl}`);

      // Load immediately without preloading for marketplace
      return <ArtifactModel modelPath={proxiedUrl} enableLazyLoading={false} />;
    }

    // Fallback to default model based on category - load immediately for marketplace
    switch (product.category) {
      case "3d-model":
        return (
          <ArtifactModel
            modelPath="/artifact/African mask sculpture .glb"
            enableLazyLoading={false}
          />
        );
      case "texture":
        return (
          <ArtifactModel
            modelPath="/artifact/African Women Bust.glb"
            enableLazyLoading={false}
          />
        );
      case "audio":
        return (
          <ArtifactModel
            modelPath="/artifact/African Drum.glb"
            enableLazyLoading={false}
          />
        );
      case "animation":
        return (
          <ArtifactModel
            modelPath="/artifact/Wooden ornament.glb"
            enableLazyLoading={false}
          />
        );
      case "material":
        return (
          <ArtifactModel
            modelPath="/artifact/African woman wood sculpture .glb"
            enableLazyLoading={false}
          />
        );
      case "shader":
        return (
          <ArtifactModel
            modelPath="/artifact/African Artifact - Yale Art Gallery.glb"
            enableLazyLoading={false}
          />
        );
      case "script":
        return (
          <ArtifactModel
            modelPath="/artifact/%23Fashion%20Bucket%20Hat%20from%20Africa%20.glb"
            enableLazyLoading={false}
          />
        );
      case "template":
        return (
          <ArtifactModel
            modelPath="/artifact/Little Succulent Plant.glb"
            enableLazyLoading={false}
          />
        );
      case "asset-pack":
        return (
          <ArtifactModel
            modelPath="/artifact/African Cucumber.glb"
            enableLazyLoading={false}
          />
        );
      default:
        return (
          <ArtifactModel
            modelPath="/artifact/African mask sculpture .glb"
            enableLazyLoading={false}
          />
        );
    }
  };

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onClick={() => onItemClick(product)}
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
  products,
}: {
  selectedCategory: string | "all";
  onItemClick: (product: ProductData) => void;
  hoveredItem: string | null;
  onHover: (itemId: string | null) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  products: ProductData[];
}) {
  // Filter products by category
  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") {
      return product.isActive;
    }
    return product.category === selectedCategory && product.isActive;
  });

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
      {filteredProducts[focusedIndex] && (
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
            product={filteredProducts[focusedIndex]}
            position={[0, 0, 0]}
            scale={[2.0, 2.0, 2.0]}
            onItemClick={onItemClick}
            isHovered={
              hoveredItem === String(filteredProducts[focusedIndex].productId)
            }
            onHover={(hovered) =>
              onHover(
                hovered
                  ? String(filteredProducts[focusedIndex].productId)
                  : null
              )
            }
            isFocused={true}
          />
        </group>
      )}

      {/* Background items in a bright arc with pedestals */}
      {filteredProducts.map((product, index) => {
        if (index === focusedIndex) return null;
        const idx = index < focusedIndex ? index : index - 1;
        const total = filteredProducts.length - 1;
        const angle =
          ((idx - (total - 1) / 2) / Math.max(total - 1, 1)) * Math.PI * 0.65;
        const x = Math.sin(angle) * radius;
        const z = -6 - Math.cos(angle) * radius;
        const y = 1.9;
        const tilt = -angle * 0.35;
        return (
          <group
            key={`background-${product.productId}-${index}`}
            position={[x, y, z]}
            rotation={[0, tilt, 0]}
          >
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
              product={product}
              position={[0, 0, 0]}
              scale={[1.0, 1.0, 1.0]}
              onItemClick={() => setFocusedIndex(index)}
              isHovered={hoveredItem === String(product.productId)}
              onHover={(hovered) =>
                onHover(hovered ? String(product.productId) : null)
              }
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
  onNetworkStatusChange,
  networkStatus,
  retryCount,
  onRetryCountChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onBackToMain: () => void;
  onNetworkStatusChange: (status: "online" | "offline" | "error") => void;
  networkStatus: "online" | "offline" | "error";
  retryCount: number;
  onRetryCountChange: (count: number) => void;
}) {
  const { wallet, openModal } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | "all"
  >("all");
  const [cart, setCart] = useState<
    Array<{
      id: string;
      name: string;
      price: string;
      quantity: number;
      product: ProductData;
    }>
  >([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedProduct, setPurchasedProduct] = useState<ProductData | null>(
    null
  );
  const [transactionHash, setTransactionHash] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const [platformStats, setPlatformStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: "0",
  });

  // Load artifact GLB models immediately for marketplace (no lazy loading)
  const artifactsLoadedRef = useRef(false);
  useEffect(() => {
    if (!artifactsLoadedRef.current) {
      try {
        // Load all artifacts immediately without preloading for marketplace
        useGLTF("/artifact/African mask sculpture .glb");
        useGLTF("/artifact/African Women Bust.glb");
        useGLTF("/artifact/Wooden ornament.glb");
        useGLTF("/artifact/African woman wood sculpture .glb");
        useGLTF("/artifact/African Artifact - Yale Art Gallery.glb");
        useGLTF("/artifact/%23Fashion%20Bucket%20Hat%20from%20Africa%20.glb");
        useGLTF("/artifact/Little Succulent Plant.glb");
        useGLTF("/artifact/African Drum.glb");
        useGLTF("/artifact/African Cucumber.glb");
        console.log("✅ All marketplace artifacts loaded immediately");
      } catch (e) {
        console.warn("Artifact loading failed (non-blocking):", e);
      } finally {
        artifactsLoadedRef.current = true;
      }
    }
  }, []); // Load on component mount, not when shop opens

  // Load marketplace data
  useEffect(() => {
    if (isOpen) {
      loadMarketplaceData();
    }
  }, [isOpen]);

  // Also reload data when network status changes to online
  useEffect(() => {
    if (isOpen && networkStatus === "online") {
      console.log(
        "🔄 Network status changed to online, reloading marketplace data..."
      );
      loadMarketplaceData();
    }
  }, [networkStatus, isOpen]);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading marketplace data...");

      // Load all active products from SafariMart
      const rawProductsData = await getAllActiveProducts();

      // Remove duplicates from the products
      const productsData = removeDuplicateProducts(rawProductsData);

      console.log("📊 Marketplace data loaded:", {
        rawProducts: rawProductsData.length,
        uniqueProducts: productsData.length,
        duplicatesRemoved: rawProductsData.length - productsData.length,
      });

      setProducts(productsData);
      setPlatformStats({
        totalProducts: productsData.length,
        totalSales: productsData.reduce(
          (sum, p) => sum + Number(p.totalSales),
          0
        ),
        totalRevenue: formatPrice(
          productsData.reduce((sum, p) => sum + p.totalRevenue, BigInt(0))
        ),
      });
      onNetworkStatusChange("online");
      onRetryCountChange(0); // Reset retry count on success
    } catch (error) {
      console.error("Failed to load marketplace data:", error);

      // Set default values when loading fails
      setProducts([]);
      setPlatformStats({
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: "0",
      });

      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes("circuit breaker")) {
          console.warn(
            "🔄 MetaMask circuit breaker detected - using offline mode"
          );
          onNetworkStatusChange("offline");
        } else {
          console.warn("⚠️ Network issues detected - using offline mode");
          onNetworkStatusChange("error");
        }
      } else {
        onNetworkStatusChange("error");
      }

      // Auto-retry after a delay (up to 3 times)
      if (retryCount < 3) {
        const delay = Math.min(5000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
        console.log(
          `🔄 Retrying in ${delay}ms (attempt ${retryCount + 1}/3)...`
        );
        setTimeout(() => {
          onRetryCountChange(retryCount + 1);
          loadMarketplaceData();
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter products by category
  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") {
      return product.isActive;
    }
    return product.category === selectedCategory && product.isActive;
  });

  const addToCart = (product: ProductData) => {
    setCart((prev) => {
      const existing = prev.find(
        (cartItem) => cartItem.id === String(product.productId)
      );
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === String(product.productId)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          id: String(product.productId),
          name: product.title,
          price: formatPrice(product.price),
          quantity: 1,
          product: product,
        },
      ];
    });
  };

  const purchaseItem = async (product: ProductData) => {
    if (!wallet?.evmAddress) {
      openModal();
      return;
    }

    try {
      setLoading(true);
      console.log(`=== PURCHASE DEBUG ===`);
      console.log(`Product ID: ${product.productId}`);
      console.log(`Product name: ${product.title}`);
      console.log(`Product price (BigInt): ${product.price}`);
      console.log(
        `Product price (formatted): ${formatPrice(product.price)} HBAR`
      );
      console.log(`Wallet address: ${wallet.evmAddress}`);

      // Purchase the product using SafariMart library
      const result = await purchaseProduct(product.productId);

      // Show success modal
      setPurchasedProduct(product);
      setTransactionHash(result.txHash);
      setShowSuccessModal(true);

      // Refresh marketplace data
      await loadMarketplaceData();
    } catch (error: any) {
      console.error("Purchase error:", error);

      const errorMessage = error?.message || String(error);

      // Handle circuit breaker specifically
      if (
        errorMessage?.includes("circuit breaker") ||
        errorMessage?.includes("circuit breaker is open")
      ) {
        alert(
          "⚠️ MetaMask circuit breaker is open!\n\n" +
            "This happens when too many requests are made in a short time.\n\n" +
            "Please wait 30-60 seconds and try again, or:\n" +
            "1. Refresh the page\n" +
            "2. Restart MetaMask\n" +
            "3. Try again in a few minutes"
        );
      } else {
        alert(`Purchase failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price);
      return total + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    if (!wallet?.evmAddress) {
      openModal();
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      setLoading(true);

      // Process each item in the cart
      for (const item of cart) {
        if (item.product) {
          console.log(`Processing checkout for: ${item.name}`);
          await purchaseItem(item.product);
        }
      }

      // Clear cart after successful checkout
      setCart([]);

      // Show success modal for the last item purchased
      if (cart.length > 0) {
        const lastItem = cart[cart.length - 1];
        setPurchasedProduct(lastItem.product);
        setTransactionHash("Multiple transactions completed");
        setShowSuccessModal(true);
      }

      // Refresh marketplace data
      await loadMarketplaceData();
    } catch (error: any) {
      console.error("Checkout failed:", error);

      const errorMessage = error?.message || String(error);

      // Handle circuit breaker specifically
      if (
        errorMessage?.includes("circuit breaker") ||
        errorMessage?.includes("circuit breaker is open")
      ) {
        alert(
          "⚠️ MetaMask circuit breaker is open!\n\n" +
            "This happens when too many requests are made in a short time.\n\n" +
            "Please wait 30-60 seconds and try again, or:\n" +
            "1. Refresh the page\n" +
            "2. Restart MetaMask\n" +
            "3. Try again in a few minutes"
        );
      } else {
        alert(`Checkout failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen) return;

      // Don't interfere with typing in input fields
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.contentEditable === "true")
      ) {
        return;
      }

      const totalItems = filteredProducts.length;

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
          event.preventDefault();
          if (filteredProducts[focusedIndex]) {
            addToCart(filteredProducts[focusedIndex]);
          }
          break;
        case " ":
          // Only prevent space if not in a modal or input field
          if (!showCreateModal) {
            event.preventDefault();
            if (filteredProducts[focusedIndex]) {
              addToCart(filteredProducts[focusedIndex]);
            }
          }
          break;
        case "p":
          event.preventDefault();
          if (filteredProducts[focusedIndex]) {
            purchaseItem(filteredProducts[focusedIndex]);
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
  }, [
    isOpen,
    selectedCategory,
    focusedIndex,
    filteredProducts,
    addToCart,
    purchaseItem,
    onClose,
  ]);

  // Reset focus when category changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50">
      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProductCreated={loadMarketplaceData}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        product={purchasedProduct}
        transactionHash={transactionHash}
        copySuccess={copySuccess}
        setCopySuccess={setCopySuccess}
      />
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
            products={products}
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
      {filteredProducts[focusedIndex] && (
        <div className="hidden">
          {/* Moved info into bottom control center */}
        </div>
      )}

      {/* Carousel Navigation - Bottom Center */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
        <div className="flex items-center gap-4 bg-black/70 backdrop-blur-lg rounded-full px-6 py-3 border border-amber-500/30">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() =>
              setFocusedIndex((prev) =>
                prev === 0 ? filteredProducts.length - 1 : prev - 1
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
          {filteredProducts[focusedIndex] && (
            <div className="flex items-center gap-3 px-4">
              <div className="text-amber-300 font-semibold">
                {filteredProducts[focusedIndex].title}
              </div>
              <div className="text-yellow-400 font-bold">
                {formatPrice(filteredProducts[focusedIndex].price)} HBAR
              </div>
              <button
                onClick={() => purchaseItem(filteredProducts[focusedIndex])}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded text-sm hover:from-green-600 hover:to-teal-600 transition-all disabled:opacity-50"
              >
                {loading ? "..." : "Buy"}
              </button>
            </div>
          )}

          {/* Item Counter */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex gap-1">
              {filteredProducts.map((_, index) => (
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
                prev === filteredProducts.length - 1 ? 0 : prev + 1
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
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
        <div className="flex gap-2 flex-wrap">
          {/* All Categories Button */}
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              selectedCategory === "all"
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                : "bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
            }`}
          >
            All
          </button>
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as ProductCategory)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                  : "bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
          {/* Add Product Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 transition-all z-50 relative"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          {/* Refresh Button */}
          <button
            onClick={loadMarketplaceData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all z-50 relative disabled:opacity-50"
            title="Refresh marketplace data"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Loading..." : "Refresh"}
          </button>
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
                      {item.price} HBAR
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
                  <span>{getTotalPrice().toFixed(2)} HBAR</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCart([])}
                    className="w-1/2 bg-black/40 text-orange-100 hover:bg-black/60 rounded py-2 text-sm font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-2 rounded-lg font-bold hover:from-yellow-600 hover:to-amber-600 transition-all text-sm disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Checkout"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple Marketplace Content Component
function MarketplaceContent({
  onOpenMarketplace,
}: {
  onOpenMarketplace: () => void;
}) {
  return (
    <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30 max-w-md">
      <h3 className="text-xl font-bold text-yellow-100 mb-4 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5" /> African Marketplace
      </h3>
      <div className="space-y-4">
        <p className="text-orange-200">
          Explore the vibrant African marketplace filled with unique cultural
          artifacts, digital art, and traditional crafts.
        </p>
        <button
          onClick={onOpenMarketplace}
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all"
        >
          Enter Marketplace
        </button>
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
  networkStatus,
  onRetryConnection,
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
  networkStatus: "online" | "offline" | "error";
  onRetryConnection: () => void;
}) {
  const router = useRouter();
  const { wallet, openModal, disconnect } = useWallet();
  const [activeTab, setActiveTab] = useState<
    "marketplace" | "dashboard" | "gallery" | "music" | "trading" | "social"
  >("marketplace");
  const [balance, setBalance] = useState(0);
  const [hbarBalance, setHbarBalance] = useState("0");
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const savedBalance = localStorage.getItem("svtBalance");
    if (savedBalance) {
      setBalance(parseInt(savedBalance));
    }
  }, []);

  // Fetch HBAR balance when wallet is connected with improved error handling
  useEffect(() => {
    const fetchHbarBalance = async (retryCount = 0) => {
      if (wallet?.evmAddress) {
        try {
          // Check if we have a cached balance first
          const cachedBalance = localStorage.getItem(
            `hbar_balance_${wallet.evmAddress}`
          );
          const cacheTime = localStorage.getItem(
            `hbar_balance_time_${wallet.evmAddress}`
          );

          // Use cached balance if it's less than 30 seconds old
          if (
            cachedBalance &&
            cacheTime &&
            Date.now() - parseInt(cacheTime) < 30000
          ) {
            console.log("📊 Using cached HBAR balance");
            setHbarBalance(cachedBalance);
            return;
          }

          // Try multiple RPC providers as fallback
          const rpcUrls = [
            "https://testnet.hashio.io/api", // Primary Hedera RPC
            "https://hedera-testnet.public.blastapi.io", // Backup RPC
          ];

          let balance = null;
          let lastError = null;

          for (const rpcUrl of rpcUrls) {
            try {
              console.log(`🔍 Trying RPC: ${rpcUrl}`);
              const { JsonRpcProvider } = await import("ethers");
              const provider = new JsonRpcProvider(rpcUrl, {
                name: "hedera-testnet",
                chainId: 296,
              });

              balance = await provider.getBalance(wallet.evmAddress);
              console.log(
                `✅ Balance fetched from ${rpcUrl}: ${balance.toString()}`
              );
              break; // Success, exit the loop
            } catch (error) {
              console.warn(
                `⚠️ Failed to fetch from ${rpcUrl}:`,
                (error as Error).message
              );
              lastError = error;
              continue; // Try next RPC
            }
          }

          if (!balance) {
            // All RPCs failed, try MetaMask as last resort with circuit breaker handling
            try {
              console.log("🔍 Trying MetaMask RPC as last resort...");
              const { BrowserProvider } = await import("ethers");
              const provider = new BrowserProvider(window.ethereum, 296);
              balance = await provider.getBalance(wallet.evmAddress);
            } catch (error) {
              console.error("❌ All balance fetch methods failed:", error);

              // Handle circuit breaker specifically
              const errorMessage = (error as Error).message;
              if (
                errorMessage?.includes("circuit breaker") ||
                errorMessage?.includes("circuit breaker is open")
              ) {
                console.warn(
                  "🔄 MetaMask circuit breaker is open, using fallback balance"
                );
                setHbarBalance("--"); // Show loading state

                // Retry after a delay if we haven't exceeded max retries
                if (retryCount < 2) {
                  setTimeout(
                    () => fetchHbarBalance(retryCount + 1),
                    5000 + retryCount * 5000
                  );
                  return;
                }
              }

              // Use cached balance or default
              const fallbackBalance = cachedBalance || "0";
              setHbarBalance(fallbackBalance);
              return;
            }
          }

          // Convert from wei to HBAR (1 HBAR = 10^18 wei)
          const balanceInHbar = Number(balance) / 1e18;

          // Format with appropriate decimal places and scientific notation for very large numbers
          let formattedBalance;
          if (balanceInHbar >= 1000000) {
            formattedBalance = (balanceInHbar / 1000000).toFixed(1) + "M"; // Millions
          } else if (balanceInHbar >= 1000) {
            formattedBalance = (balanceInHbar / 1000).toFixed(1) + "K"; // Thousands
          } else if (balanceInHbar >= 1) {
            formattedBalance = balanceInHbar.toFixed(2); // 2 decimals for amounts >= 1
          } else {
            formattedBalance = balanceInHbar.toFixed(4); // 4 decimals for small amounts
          }

          // Cache the balance
          localStorage.setItem(
            `hbar_balance_${wallet.evmAddress}`,
            formattedBalance
          );
          localStorage.setItem(
            `hbar_balance_time_${wallet.evmAddress}`,
            Date.now().toString()
          );

          setHbarBalance(formattedBalance);
        } catch (error) {
          console.error("Failed to fetch HBAR balance:", error);

          // Try to use cached balance
          const cachedBalance = localStorage.getItem(
            `hbar_balance_${wallet.evmAddress}`
          );
          setHbarBalance(cachedBalance || "0");
        }
      } else {
        setHbarBalance("0");
      }
    };

    fetchHbarBalance();
  }, [wallet?.evmAddress]);

  const tabs = [
    {
      id: "marketplace",
      label: "Marketplace",
      icon: ShoppingCart,
      color: "from-green-500 to-teal-500",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Crown,
      color: "from-blue-500 to-purple-500",
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
    <div className="absolute inset-0">
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
              {/* Network Status Indicator */}
              <div
                className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${
                  networkStatus === "online"
                    ? "bg-green-900/40 text-green-300 border border-green-500/30"
                    : networkStatus === "offline"
                    ? "bg-yellow-900/40 text-yellow-300 border border-yellow-500/30"
                    : "bg-red-900/40 text-red-300 border border-red-500/30"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    networkStatus === "online"
                      ? "bg-green-400"
                      : networkStatus === "offline"
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                />
                {networkStatus === "online"
                  ? "Online"
                  : networkStatus === "offline"
                  ? "Offline Mode"
                  : "Network Error"}
              </div>
              {/* Manual Retry Button */}
              {networkStatus !== "online" && (
                <button
                  onClick={onRetryConnection}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-900/40 text-blue-300 border border-blue-500/30 rounded text-xs hover:bg-blue-800/40 transition-colors"
                  title="Retry connection"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Retry
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Wallet Connection */}
              {!wallet?.evmAddress ? (
                <button
                  onClick={() => {
                    console.log("Opening wallet modal...");
                    openModal();
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  <Coins className="w-4 h-4" />
                  Connect MetaMask
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Balances */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-100 bg-green-900/30 px-3 py-1 rounded-lg">
                      <Coins className="w-4 h-4 text-green-400" />
                      <span className="font-semibold">{hbarBalance} HBAR</span>
                    </div>
                  </div>

                  {/* Wallet Info */}
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-300 bg-black/40 px-3 py-1 rounded-lg">
                      {wallet.evmAddress.slice(0, 6)}...
                      {wallet.evmAddress.slice(-4)}
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          console.log("Disconnecting wallet...");
                          await disconnect();
                          console.log("Wallet disconnected successfully");
                        } catch (error) {
                          console.error("Failed to disconnect wallet:", error);
                        }
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all"
                    >
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              )}

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
          <MarketplaceContent onOpenMarketplace={onOpenMarketplace} />
        )}

        {activeTab === "dashboard" && (
          <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30 max-w-md">
            <h3 className="text-xl font-bold text-yellow-100 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5" /> My Dashboard
            </h3>
            <div className="space-y-4">
              <p className="text-orange-200">
                Manage your products, view sales statistics, and track your
                marketplace activity.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                Open Full Dashboard
              </button>
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
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          zoomSpeed={1.2}
          rotateSpeed={1.0}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
      )}
    </>
  );
}

// Create Product Modal Component
function CreateProductModal({
  isOpen,
  onClose,
  onProductCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}) {
  const { wallet, openModal } = useWallet();
  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    description: "",
    fileUrl: "",
    price: "",
    category: PRODUCT_CATEGORIES[0],
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isCircuitBreakerOpen, setIsCircuitBreakerOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet?.evmAddress) {
      openModal();
      return;
    }

    if (!formData.name || !formData.fileUrl || !formData.price) {
      setStatus("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setIsCircuitBreakerOpen(false);
      setStatus("Creating product...");

      const result = await listProduct({
        fileUrl: formData.fileUrl,
        title: formData.name,
        description: formData.description,
        category: formData.category,
        priceEth: formData.price,
      });
      setStatus(
        `✅ Product created successfully! Transaction: ${result.txHash}`
      );

      setTimeout(() => {
        onProductCreated();
        onClose();
        setFormData({
          name: "",
          description: "",
          fileUrl: "",
          price: "",
          category: PRODUCT_CATEGORIES[0],
        });
        setStatus("");
        setRetryCount(0);
      }, 3000); // Increased delay to ensure blockchain state is updated
    } catch (error: any) {
      console.error("Create product error:", error);

      const errorMessage = error?.message || String(error);

      // Check if it's a circuit breaker error
      if (
        errorMessage?.includes("circuit breaker") ||
        errorMessage?.includes("circuit breaker is open")
      ) {
        setIsCircuitBreakerOpen(true);
        setStatus(
          `⚠️ MetaMask circuit breaker is open. Please wait 30-60 seconds and try again.`
        );

        // Auto-retry after delay (up to 3 times)
        if (retryCount < 3) {
          const delay = Math.min(30000 * Math.pow(2, retryCount), 120000); // 30s, 60s, 120s
          console.log(
            `🔄 Auto-retrying create product in ${delay}ms (attempt ${
              retryCount + 1
            }/3)...`
          );
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            setStatus("🔄 Circuit breaker recovered, retrying...");
            // Retry the submission
            handleSubmit(e);
          }, delay);
        } else {
          setStatus(
            `❌ Circuit breaker still open after ${retryCount} attempts. Please refresh the page and try again.`
          );
        }
      } else {
        setStatus(`❌ Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="relative max-w-2xl w-full mx-4">
        <div className="bg-black/70 border border-amber-500/30 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-yellow-100">
                Create New Product
              </h3>
              {isCircuitBreakerOpen && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900/40 text-yellow-300 border border-yellow-500/30 rounded-lg text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Circuit Breaker Open
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Product Name *
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-amber-500/30 bg-black/40 text-orange-100 px-3 py-2 text-sm placeholder-orange-300/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your product..."
                  className="w-full rounded-lg border border-amber-500/30 bg-black/40 text-orange-100 px-3 py-2 text-sm placeholder-orange-300/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  File URL (.glb or media) *
                </label>
                <input
                  value={formData.fileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, fileUrl: e.target.value })
                  }
                  placeholder="https://.../model.glb"
                  className="w-full rounded-lg border border-amber-500/30 bg-black/40 text-orange-100 px-3 py-2 text-sm placeholder-orange-300/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Price (HBAR) *
                </label>
                <input
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.1"
                  type="number"
                  step="0.01"
                  className="w-full rounded-lg border border-amber-500/30 bg-black/40 text-orange-100 px-3 py-2 text-sm placeholder-orange-300/60 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full rounded-lg border border-amber-500/30 bg-black/40 text-orange-100 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-orange-200 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || isCircuitBreakerOpen}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-colors shadow disabled:opacity-50"
                >
                  {loading
                    ? "Creating..."
                    : isCircuitBreakerOpen
                    ? "Circuit Breaker Open"
                    : "Create Product"}
                </button>
              </div>
              {isCircuitBreakerOpen && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCircuitBreakerOpen(false);
                      setRetryCount(0);
                      setStatus("");
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-900/40 text-blue-300 border border-blue-500/30 rounded-lg text-sm hover:bg-blue-800/40 transition-colors"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Retry Now
                  </button>
                  <span className="text-xs text-orange-300">
                    Or wait for auto-retry (
                    {retryCount < 3
                      ? `${30 * Math.pow(2, retryCount)}s`
                      : "disabled"}
                    )
                  </span>
                </div>
              )}
              {status && (
                <div className="mt-4 p-3 rounded-lg bg-black/40 border border-amber-500/30">
                  <p className="text-sm text-orange-200">{status}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Success Modal Component
function SuccessModal({
  isOpen,
  onClose,
  product,
  transactionHash,
  copySuccess,
  setCopySuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
  transactionHash: string;
  copySuccess: boolean;
  setCopySuccess: (success: boolean) => void;
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Hide confetti after animation
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ["#fbbf24", "#f59e0b", "#d97706", "#b45309"][
                  Math.floor(Math.random() * 4)
                ],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-2xl w-full mx-4">
        <div className="bg-black/70 border border-amber-500/30 rounded-2xl overflow-hidden backdrop-blur-lg">
          {/* Header with Success Icon */}
          <div className="relative p-8 text-center bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-b border-green-500/30">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
              {/* Animated Success Circle */}
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200 bg-clip-text text-transparent mb-2">
              Purchase Successful!
            </h2>
            <p className="text-green-100 text-lg">
              Your African artifact has been added to your collection
            </p>
          </div>

          {/* Product Details */}
          <div className="p-6">
            <div className="bg-black/50 border border-amber-500/20 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                {/* Product Icon */}
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-yellow-100 mb-2">
                    {product.title}
                  </h3>
                  <p className="text-orange-200 text-sm mb-3">
                    {product.description ||
                      "A beautiful African cultural artifact"}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Coins className="w-4 h-4" />
                      <span className="font-semibold">
                        {formatPrice(product.price)} HBAR
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-300">
                      <Sparkles className="w-4 h-4" />
                      <span className="capitalize">{product.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-black/50 border border-amber-500/20 rounded-xl p-4 mb-6">
              <h4 className="text-lg font-semibold text-yellow-100 mb-3 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Transaction Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-orange-200">Transaction Hash:</span>
                  <span className="text-green-300 font-mono text-sm">
                    {transactionHash.slice(0, 8)}...{transactionHash.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-200">Status:</span>
                  <span className="flex items-center gap-2 text-green-300">
                    <CheckCircle className="w-4 h-4" />
                    Confirmed
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-200">Network:</span>
                  <span className="text-blue-300">Hedera Testnet</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(transactionHash);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  } catch (err) {
                    console.error("Failed to copy:", err);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
              >
                <Share2 className="w-4 h-4" />
                {copySuccess ? "Copied!" : "Copy Transaction"}
              </button>

              <button
                onClick={() => {
                  // Open Hedera Explorer
                  window.open(
                    `https://hashscan.io/testnet/transaction/${transactionHash}`,
                    "_blank"
                  );
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Download className="w-4 h-4" />
                View on Explorer
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-black/40 border-t border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-orange-200">
                Your digital artifact is now safely stored on the blockchain
              </div>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SafariMartPage() {
  return (
    <WalletProvider>
      <SafariMartPageContent />
      <WalletModal />
    </WalletProvider>
  );
}

function SafariMartPageContent() {
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
  const [networkStatus, setNetworkStatus] = useState<
    "online" | "offline" | "error"
  >("online");
  const [retryCount, setRetryCount] = useState(0);

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

  const handleRetryConnection = () => {
    setRetryCount(0);
    setNetworkStatus("online");
    // The VirtualShop component will automatically retry when networkStatus changes
  };

  return (
    <div
      className="w-full h-screen relative bg-gradient-to-b from-orange-900 via-red-800 to-amber-900"
      style={{ touchAction: "none" }}
    >
      {/* Loading Overlays */}
      {isLoadingMarketplace && (
        <LoadingOverlay text="Opening African Marketplace..." />
      )}
      {isLoadingGallery && <LoadingOverlay text="Entering Art Gallery..." />}
      {isLoadingMusic && <LoadingOverlay text="Heading to Music Stage..." />}
      {/* 3D SafariMart Environment */}
      <Canvas
        className="w-full h-full"
        style={{ touchAction: "none", pointerEvents: "auto" }}
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

      {/* Virtual Shop */}
      <VirtualShop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onBackToMain={() => router.back()}
        onNetworkStatusChange={setNetworkStatus}
        networkStatus={networkStatus}
        retryCount={retryCount}
        onRetryCountChange={setRetryCount}
      />

      {/* UI Overlay */}
      <div className="pointer-events-none">
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
          networkStatus={networkStatus}
          onRetryConnection={handleRetryConnection}
        />
      </div>
    </div>
  );
}
