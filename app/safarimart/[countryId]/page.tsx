"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
  Float,
  useGLTF,
} from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
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
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
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

function AfricanArtGallery() {
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
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
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

function MusicStage() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[-25, 0, 0]}>
      {/* Stage Platform */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[6, 1, 4]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Drum Set */}
      <group position={[-1, 1.2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.1]} />
          <meshStandardMaterial color="#2F4F4F" roughness={0.3} />
        </mesh>
      </group>

      {/* Microphone */}
      <group position={[1, 1.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <meshStandardMaterial
            color="#C0C0C0"
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial
            color="#C0C0C0"
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* Speakers */}
      {[-2, 2].map((x, i) => (
        <group key={i} position={[x, 1.5, -1.5]}>
          <mesh>
            <boxGeometry args={[0.8, 1.2, 0.4]} />
            <meshStandardMaterial color="#2F4F4F" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Clickable Area for Music Stage */}
      <mesh
        position={[0, 0.5, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[6, 1, 4]} />
        <meshBasicMaterial
          color={hovered ? "#FFD700" : "#8B4513"}
          transparent
          opacity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Music Stage Label */}
      <Text
        position={[0, 3, 0]}
        fontSize={1.2}
        color={hovered ? "#FFD700" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
      >
        Music Stage
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
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
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

function SocialHub() {
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
      {/* Social Hub Building */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[8, 4, 6]} />
        <meshStandardMaterial color="#F0E68C" roughness={0.6} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[9, 1, 7]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Seating Areas */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 3;
        const z = Math.sin(angle) * 3;
        return (
          <group key={i} position={[x, 0.3, z]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[1, 0.6, 0.8]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Central Table */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.1, 16]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Clickable Area for Social Hub */}
      <mesh
        position={[0, 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[8, 4, 6]} />
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
  scale = [1, 1, 1],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  modelPath: string;
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const { scene } = useGLTF(modelPath);

  return (
    <primitive
      object={scene.clone()}
      scale={scale}
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
          <ArtifactModel
            modelPath="/artifact/African mask sculpture .glb"
            scale={[2, 2, 2]}
          />
        );
      case "pottery1":
        return (
          <ArtifactModel
            modelPath="/artifact/African Women Bust.glb"
            scale={[2, 2, 2]}
          />
        );
      case "textile1":
        return (
          <ArtifactModel
            modelPath="/artifact/Wooden ornament.glb"
            scale={[2, 2, 2]}
          />
        );
      case "jewelry1":
        return (
          <ArtifactModel
            modelPath="/artifact/African woman wood sculpture .glb"
            scale={[2, 2, 2]}
          />
        );
      case "artifact1":
        return (
          <ArtifactModel
            modelPath="/artifact/African Artifact - Yale Art Gallery.glb"
            scale={[2, 2, 2]}
          />
        );
      case "fashion1":
        return (
          <ArtifactModel
            modelPath="/artifact/%23Fashion%20Bucket%20Hat%20from%20Africa%20.glb"
            scale={[2, 2, 2]}
          />
        );
      case "plant1":
        return (
          <ArtifactModel
            modelPath="/artifact/Little Succulent Plant.glb"
            scale={[2, 2, 2]}
          />
        );
      case "drum1":
        return (
          <ArtifactModel
            modelPath="/artifact/African Drum.glb"
            scale={[2, 2, 2]}
          />
        );
      case "cucumber1":
        return (
          <ArtifactModel
            modelPath="/artifact/African Cucumber.glb"
            scale={[2, 2, 2]}
          />
        );
      case "nft1":
        return (
          <ArtifactModel
            modelPath="/artifact/African Artifact - Yale Art Gallery.glb"
            scale={[2, 2, 2]}
          />
        );
      case "nft2":
        return (
          <ArtifactModel
            modelPath="/artifact/%23Fashion%20Bucket%20Hat%20from%20Africa%20.glb"
            scale={[2, 2, 2]}
          />
        );
      case "nft3":
        return (
          <ArtifactModel
            modelPath="/artifact/Little Succulent Plant.glb"
            scale={[2, 2, 2]}
          />
        );
      case "nft4":
        return (
          <ArtifactModel
            modelPath="/artifact/African Drum.glb"
            scale={[2, 2, 2]}
          />
        );
      case "nft5":
        return (
          <ArtifactModel
            modelPath="/artifact/African Cucumber.glb"
            scale={[2, 2, 2]}
          />
        );
      case "music1":
        return (
          <ArtifactModel
            modelPath="/artifact/African Drum.glb"
            scale={[2, 2, 2]}
          />
        );
      case "music2":
        return (
          <ArtifactModel
            modelPath="/artifact/African Cucumber.glb"
            scale={[2, 2, 2]}
          />
        );
      case "music3":
        return (
          <ArtifactModel
            modelPath="/artifact/African mask sculpture .glb"
            scale={[2, 2, 2]}
          />
        );
      case "music4":
        return (
          <ArtifactModel
            modelPath="/artifact/African Women Bust.glb"
            scale={[2, 2, 2]}
          />
        );
      default:
        return (
          <ArtifactModel
            modelPath="/artifact/African mask sculpture .glb"
            scale={[2, 2, 2]}
          />
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

      {/* Item Label */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={isFocused ? 0.3 : 0.25}
        color={isFocused ? "#FFD700" : isHovered ? "#FFD700" : "#FFFFFF"}
        anchorX="center"
        anchorY="middle"
      >
        {item.name}
      </Text>

      {/* Price Label */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={isFocused ? 0.22 : 0.18}
        color={isFocused ? "#FFD700" : "#FFD700"}
        anchorX="center"
        anchorY="middle"
      >
        {item.price} SVT
      </Text>
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
  const itemsPerRow = 3;
  const rows = Math.ceil(items.length / itemsPerRow);

  return (
    <>
      {/* Shop Floor */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Shop Walls */}
      <mesh position={[0, 4, -15]}>
        <boxGeometry args={[40, 8, 0.2]} />
        <meshStandardMaterial color="#DEB887" roughness={0.7} />
      </mesh>
      <mesh position={[-20, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[30, 8, 0.2]} />
        <meshStandardMaterial color="#DEB887" roughness={0.7} />
      </mesh>
      <mesh position={[20, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[30, 8, 0.2]} />
        <meshStandardMaterial color="#DEB887" roughness={0.7} />
      </mesh>
      <mesh position={[0, 4, 15]}>
        <boxGeometry args={[40, 8, 0.2]} />
        <meshStandardMaterial color="#DEB887" roughness={0.7} />
      </mesh>

      {/* Gallery Shelves - Multiple Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <group key={rowIndex}>
          {/* Shelf Base */}
          <mesh position={[0, 1.5 + rowIndex * 2.5, -4.5]} rotation={[0, 0, 0]}>
            <boxGeometry args={[14, 0.2, 1]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>

          {/* Shelf Back */}
          <mesh position={[0, 2.2 + rowIndex * 2.5, -4.5]} rotation={[0, 0, 0]}>
            <boxGeometry args={[14, 1.4, 0.1]} />
            <meshStandardMaterial color="#D2B48C" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Character Customization Display */}
      {/* Professional 3D Display Frame */}
      <group position={[0, 2, -3.5]}>
        {/* Main Backdrop Panel */}
        <mesh>
          <boxGeometry args={[14, 8, 0.5]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.2}
            metalness={0.8}
            emissive="#0a0a0a"
          />
        </mesh>

        {/* Inner Display Area */}
        <mesh position={[0, 0, 0.3]}>
          <planeGeometry args={[12, 6.5]} />
          <meshStandardMaterial
            color="#000814"
            roughness={0.1}
            emissive="#001122"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Ornate Frame Border */}
        <mesh position={[0, 0, 0.4]}>
          <ringGeometry args={[6.5, 7, 64]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.1}
            metalness={0.9}
            emissive="#f59e0b"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Corner Decorations */}
        {[
          [-5.5, 3],
          [5.5, 3],
          [-5.5, -3],
          [5.5, -3],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.5]}>
            <boxGeometry args={[1, 1, 0.2]} />
            <meshStandardMaterial
              color="#fbbf24"
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        ))}

        {/* Luxury Base Pedestal */}
        <mesh position={[0, -4.5, 0]}>
          <cylinderGeometry args={[4, 5, 0.8, 16]} />
          <meshStandardMaterial
            color="#374151"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>

        {/* Pedestal Top */}
        <mesh position={[0, -4.1, 0]}>
          <cylinderGeometry args={[4.2, 4.2, 0.2, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* Main Focused Item - Large in Center */}
      {items[focusedIndex] && (
        <group>
          <ShopItem3D
            item={items[focusedIndex]}
            position={[0, 2, -2]}
            scale={[3, 3, 3]}
            onItemClick={onItemClick}
            isHovered={hoveredItem === items[focusedIndex].id}
            onHover={(hovered) =>
              onHover(hovered ? items[focusedIndex].id : null)
            }
            isFocused={true}
          />

          {/* Focus Ring */}
          <mesh position={[0, 1, -2]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[4, 4.5, 32]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {/* Background Items - Carousel Preview */}
      {items.map((item, index) => {
        if (index === focusedIndex) return null; // Skip the focused item

        // Position items in a horizontal line behind the frame
        const totalItems = items.length;
        const spacing = 4;
        const startX = (-(totalItems - 1) * spacing) / 2;
        const x = startX + index * spacing;
        const z = -8; // Behind the frame
        const y = 2;

        // Add depth variation for more visual interest
        const depthOffset = Math.sin(index * 0.5) * 2;
        const finalZ = z + depthOffset;

        return (
          <group key={item.id}>
            <ShopItem3D
              item={item}
              position={[x, y, finalZ]}
              scale={[1.2, 1.2, 1.2]}
              onItemClick={() => setFocusedIndex(index)}
              isHovered={hoveredItem === item.id}
              onHover={(hovered) => onHover(hovered ? item.id : null)}
              isFocused={false}
            />
            {/* Subtle glow for background items */}
            <mesh
              position={[x, y - 0.5, finalZ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[1.5, 2, 16]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Professional Display Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[0, 15, 10]} intensity={1.0} />

      {/* Main Display Spotlight */}
      <spotLight
        position={[0, 8, 0]}
        target-position={[0, 2, -2]}
        intensity={4.0}
        angle={0.5}
        penumbra={0.2}
        color="#FFD700"
        castShadow
      />

      {/* Frame Accent Lighting */}
      <pointLight position={[0, 2, -3]} intensity={2.0} color="#fbbf24" />
      <pointLight position={[-7, 2, -3.5]} intensity={1.5} color="#f59e0b" />
      <pointLight position={[7, 2, -3.5]} intensity={1.5} color="#f59e0b" />

      {/* Background Item Lighting */}
      <pointLight position={[0, 4, -8]} intensity={0.6} color="#FFFFFF" />

      {/* Room Ambient Lighting */}
      <pointLight position={[-10, 6, 5]} intensity={0.8} color="#FFA500" />
      <pointLight position={[10, 6, 5]} intensity={0.8} color="#FFA500" />
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
          style={{ background: "linear-gradient(to bottom, #1a1a2e, #16213e)" }}
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
          <button
            onClick={onBackToMain}
            className="flex items-center gap-2 text-white hover:text-amber-300 transition-colors bg-black/40 hover:bg-black/60 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
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
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-black/60 backdrop-blur-lg rounded-lg p-3 border border-amber-500/30 max-w-xs">
            <h3 className="text-lg font-bold text-amber-300 mb-1">
              {items[focusedIndex].name}
            </h3>
            <p className="text-amber-200 text-sm font-semibold">
              {items[focusedIndex].price} SVT
            </p>
            <p className="text-gray-300 text-xs mt-1">
              Item {focusedIndex + 1} of {items.length}
            </p>
          </div>
        </div>
      )}

      {/* Carousel Navigation - Bottom Center */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-4 bg-black/70 backdrop-blur-lg rounded-full px-6 py-3 border border-amber-500/30">
          {/* Previous Button */}
          <button
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

          {/* Item Counter */}
          <div className="flex items-center gap-2 px-4">
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

      {/* Instructions - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-amber-500/30">
          <p className="text-amber-300 text-xs">
            🎮 Arrow Keys • Enter/Space • ESC
          </p>
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
              <div className="border-t border-amber-400/30 pt-2 mt-2">
                <div className="flex justify-between items-center text-lg font-bold text-yellow-100">
                  <span>Total:</span>
                  <span>{getTotalPrice()} SVT</span>
                </div>
                <button className="w-full mt-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-2 rounded-lg font-bold hover:from-yellow-600 hover:to-amber-600 transition-all">
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-3 border border-amber-500/30">
          <p className="text-orange-200 text-sm">
            Click on items to add to cart • Use mouse to rotate view
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
}: {
  countryId: string;
  isShopOpen: boolean;
  setIsShopOpen: (open: boolean) => void;
  onBackToMain: () => void;
}) {
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
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent">
                SafariMart -{" "}
                {countryId.charAt(0).toUpperCase() + countryId.slice(1)}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-100">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">{balance} SVT</span>
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
                  onClick={() => setActiveTab(tab.id as any)}
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
                    onClick={() => setIsShopOpen(true)}
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
                    onClick={() => setIsShopOpen(true)}
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
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded text-sm mt-2">
                  Start Creating
                </button>
              </div>
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">Exhibit Art</h4>
                <p className="text-sm text-orange-200">
                  Showcase your creations to the community
                </p>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded text-sm mt-2">
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
                <h4 className="font-semibold text-yellow-100">
                  Tokenized Assets
                </h4>
                <p className="text-sm text-orange-200">
                  Trade digital representations of African culture
                </p>
                <button className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded text-sm mt-2">
                  View Market
                </button>
              </div>
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">Auction House</h4>
                <p className="text-sm text-orange-200">
                  Bid on rare cultural artifacts
                </p>
                <button className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded text-sm mt-2">
                  Join Auction
                </button>
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
                  Connect with other African culture enthusiasts
                </p>
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded text-sm mt-2">
                  Join Chat
                </button>
              </div>
              <div className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-3">
                <h4 className="font-semibold text-yellow-100">
                  Cultural Events
                </h4>
                <p className="text-sm text-orange-200">
                  Participate in virtual cultural celebrations
                </p>
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded text-sm mt-2">
                  View Events
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
}: {
  countryId: string;
  onMarketplaceClick: () => void;
}) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 12, 18]}
        fov={60}
        near={0.1}
        far={1000}
      />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 15, 5]} intensity={1.0} />

      {/* Ground */}
      <Ground />

      {/* African Trees */}
      <AfricanTrees />

      {/* Cultural Buildings */}
      <AfricanMarketplace onMarketplaceClick={onMarketplaceClick} />
      <AfricanArtGallery />
      <MusicStage />
      <TradingPost />
      <SocialHub />

      {/* Controls */}
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={8}
        maxDistance={40}
        target={[0, 0, 0]}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

export default function SafariMartPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.countryId as string;
  const [isShopOpen, setIsShopOpen] = useState(false);

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
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
          onMarketplaceClick={() => setIsShopOpen(true)}
        />
      </Canvas>

      {/* UI Overlay */}
      <SafariMartUI
        countryId={countryId}
        isShopOpen={isShopOpen}
        setIsShopOpen={setIsShopOpen}
        onBackToMain={() => router.push("/")}
      />
    </div>
  );
}
