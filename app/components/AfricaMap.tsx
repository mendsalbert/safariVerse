"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Html,
  Environment,
  PerspectiveCamera,
  Stars,
  Sphere,
  useTexture,
} from "@react-three/drei";
import { Suspense, useState, useRef, useMemo } from "react";
import {
  Mesh,
  Vector3,
  Shape,
  ExtrudeGeometry,
  MeshStandardMaterial,
} from "three";
import { motion } from "framer-motion";
import {
  PawPrint,
  Compass,
  Map as MapIcon,
  Globe2,
  Users,
  BookOpen,
  Ruler,
  Sun,
  Sunset as SunsetIcon,
  Building2,
  Mouse,
  ZoomIn,
  MousePointerClick,
} from "lucide-react";

interface Country {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  population: string;
  cities: string[];
  description: string;
  coordinates: [number, number][];
}

// Simplified but more realistic country shapes and positions
const africanCountries: Country[] = [
  {
    id: "egypt",
    name: "Egypt",
    position: [0.5, 1.8, 0.1],
    color: "#C9A96E",
    population: "104M",
    cities: ["Cairo", "Alexandria", "Giza", "Luxor"],
    description: "Land of Pharaohs - Ancient civilization and pyramids",
    coordinates: [
      [0, 0],
      [1, 0],
      [1.2, 0.3],
      [1, 0.8],
      [0.3, 1],
      [-0.2, 0.7],
      [-0.1, 0.2],
    ],
  },
  {
    id: "libya",
    name: "Libya",
    position: [-0.8, 1.5, 0.1],
    color: "#D4B896",
    population: "7M",
    cities: ["Tripoli", "Benghazi", "Misrata"],
    description: "North African nation with Mediterranean coastline",
    coordinates: [
      [-0.5, 0],
      [1, 0],
      [1.2, 0.5],
      [0.8, 1],
      [-0.3, 1],
      [-0.7, 0.3],
    ],
  },
  {
    id: "algeria",
    name: "Algeria",
    position: [-2.2, 1.2, 0.1],
    color: "#B8956A",
    population: "45M",
    cities: ["Algiers", "Oran", "Constantine"],
    description: "Largest African country by land area",
    coordinates: [
      [-1, 0],
      [1.5, 0],
      [1.8, 1],
      [1.2, 1.8],
      [-0.5, 1.5],
      [-1.2, 0.8],
    ],
  },
  {
    id: "morocco",
    name: "Morocco",
    position: [-3.5, 1.8, 0.1],
    color: "#A0522D",
    population: "37M",
    cities: ["Casablanca", "Rabat", "Marrakech", "Fez"],
    description: "Kingdom of Morocco - Beautiful architecture and culture",
    coordinates: [
      [-0.5, 0],
      [0.8, 0],
      [1, 0.8],
      [0.5, 1.2],
      [-0.3, 1],
      [-0.6, 0.3],
    ],
  },
  {
    id: "nigeria",
    name: "Nigeria",
    position: [-0.5, 0.2, 0.1],
    color: "#228B22",
    population: "220M",
    cities: ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt"],
    description: "Giant of Africa - Most populous African nation",
    coordinates: [
      [-0.8, 0],
      [0.8, 0],
      [1, 0.8],
      [0.5, 1.2],
      [-0.5, 1],
      [-1, 0.5],
    ],
  },
  {
    id: "ghana",
    name: "Ghana",
    position: [-1.8, 0.1, 0.1],
    color: "#FFD700",
    population: "32M",
    cities: ["Accra", "Kumasi", "Tamale", "Cape Coast"],
    description: "Land of Gold - Rich in culture, history, and hospitality",
    coordinates: [
      [-0.3, 0],
      [0.5, 0],
      [0.6, 0.8],
      [0.2, 1],
      [-0.2, 0.8],
      [-0.4, 0.3],
    ],
  },
  {
    id: "kenya",
    name: "Kenya",
    position: [2.2, -0.2, 0.1],
    color: "#DC143C",
    population: "54M",
    cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
    description: "Safari Land - Home to incredible wildlife and landscapes",
    coordinates: [
      [-0.5, 0],
      [0.8, 0],
      [1, 1.2],
      [0.3, 1.5],
      [-0.3, 1.2],
      [-0.6, 0.8],
    ],
  },
  {
    id: "ethiopia",
    name: "Ethiopia",
    position: [2.8, 0.5, 0.1],
    color: "#32CD32",
    population: "120M",
    cities: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar"],
    description: "Cradle of Humanity - Ancient history and coffee origins",
    coordinates: [
      [-0.8, 0],
      [1, 0],
      [1.3, 0.5],
      [1, 1.3],
      [0.2, 1.5],
      [-0.5, 1],
      [-0.9, 0.4],
    ],
  },
  {
    id: "south-africa",
    name: "South Africa",
    position: [1.5, -3.2, 0.1],
    color: "#FF8C00",
    population: "60M",
    cities: ["Cape Town", "Johannesburg", "Durban", "Pretoria"],
    description: "Rainbow Nation - Diverse cultures and stunning landscapes",
    coordinates: [
      [-1.2, 0],
      [1.5, 0],
      [1.8, 0.8],
      [1.2, 1.5],
      [-0.8, 1.2],
      [-1.4, 0.5],
    ],
  },
  {
    id: "madagascar",
    name: "Madagascar",
    position: [4.2, -2.5, 0.1],
    color: "#8B4513",
    population: "29M",
    cities: ["Antananarivo", "Toamasina", "Antsirabe"],
    description: "Island nation with unique wildlife and culture",
    coordinates: [
      [-0.2, 0],
      [0.4, 0],
      [0.5, 2],
      [0.2, 2.5],
      [-0.1, 2.2],
      [-0.3, 0.8],
    ],
  },
];

interface CountryMeshProps {
  country: Country;
  onClick: (country: Country) => void;
  isSelected: boolean;
}

function CountryMesh({ country, onClick, isSelected }: CountryMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Create extruded geometry from country coordinates
  const geometry = useMemo(() => {
    const shape = new Shape();
    const coords = country.coordinates;

    if (coords.length > 0) {
      shape.moveTo(coords[0][0], coords[0][1]);
      for (let i = 1; i < coords.length; i++) {
        shape.lineTo(coords[i][0], coords[i][1]);
      }
      shape.closePath();
    }

    return new ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
  }, [country.coordinates]);

  useFrame((state) => {
    if (meshRef.current) {
      if (hovered || isSelected) {
        meshRef.current.position.y = country.position[1] + 0.15;
        meshRef.current.scale.setScalar(1.1);
      } else {
        meshRef.current.position.y = country.position[1];
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={country.position}
        geometry={geometry}
        onClick={() => onClick(country)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color={hovered || isSelected ? "#FFD700" : country.color}
          emissive={hovered || isSelected ? "#FF4500" : "#441100"}
          emissiveIntensity={hovered || isSelected ? 0.3 : 0.1}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {(hovered || isSelected) && (
        <Html
          position={[
            country.position[0],
            country.position[1] + 2,
            country.position[2],
          ]}
          center
        >
          <div className="bg-gradient-to-br from-orange-900/95 via-red-900/95 to-amber-900/95 backdrop-blur-xl text-white p-5 rounded-2xl shadow-2xl min-w-[320px] pointer-events-none border-2 border-orange-400/60">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-10 rounded-lg shadow-lg border-2 border-orange-300/50"
                style={{ backgroundColor: country.color }}
              ></div>
              <div>
                <h3 className="font-bold text-2xl text-orange-100">
                  {country.name}
                </h3>
                <p className="text-yellow-200 text-sm font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Population:{" "}
                  {country.population}
                </p>
              </div>
            </div>
            <p className="text-orange-200 text-sm mb-4 leading-relaxed">
              {country.description}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {country.cities.slice(0, 4).map((city) => (
                <span
                  key={city}
                  className="bg-gradient-to-r from-amber-700/60 to-orange-700/60 text-yellow-100 px-3 py-1.5 rounded-lg text-xs font-medium border border-yellow-400/30 flex items-center gap-2"
                >
                  <Building2 className="w-3 h-3" /> {city}
                </span>
              ))}
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-300 font-semibold">
                <SunsetIcon className="w-4 h-4" />
                <span className="text-sm">
                  Click to explore this sunset land →
                </span>
              </div>
            </div>
          </div>
        </Html>
      )}

      <Text
        position={[
          country.position[0],
          country.position[1] + 0.3,
          country.position[2],
        ]}
        fontSize={0.25}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.02}
        outlineColor="#8B4513"
      >
        {country.name}
      </Text>
    </group>
  );
}

function AfricaContinent() {
  // Create a more realistic Africa continent shape
  const continentGeometry = useMemo(() => {
    const shape = new Shape();

    // Simplified Africa continent outline
    shape.moveTo(-4, 2.5); // Northwest (Morocco area)
    shape.lineTo(1, 3); // Northeast (Egypt area)
    shape.lineTo(3, 2); // Red Sea area
    shape.lineTo(4, 1); // Horn of Africa
    shape.lineTo(4.5, -1); // East Africa
    shape.lineTo(4, -2); // Southeast
    shape.lineTo(2, -4); // South Africa
    shape.lineTo(0, -3.8); // Southwest
    shape.lineTo(-2, -1); // West Africa south
    shape.lineTo(-3, 0); // West Africa
    shape.lineTo(-3.5, 1); // Northwest coast
    shape.closePath();

    return new ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: false,
    });
  }, []);

  return (
    <group>
      {/* Africa continent base with realistic shape */}
      <mesh
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={continentGeometry}
      >
        <meshStandardMaterial
          color="#8B4513"
          emissive="#2F1B14"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Ocean */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial
          color="#1B4F72"
          emissive="#FF6B35"
          emissiveIntensity={0.1}
          opacity={0.8}
          transparent
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>

      {/* Ocean sunset reflection */}
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial
          color="#2980B9"
          emissive="#FF8C00"
          emissiveIntensity={0.15}
          opacity={0.5}
          transparent
          roughness={0}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
}

interface AfricaMapProps {
  onCountrySelect: (country: Country) => void;
}

export default function AfricaMap({ onCountrySelect }: AfricaMapProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country);
    onCountrySelect(country);
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
      {/* Safari Sunset Welcome Overlay */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-br from-orange-800/90 via-red-800/90 to-amber-800/90 backdrop-blur-xl text-white p-8 rounded-3xl shadow-2xl max-w-4xl border-2 border-orange-400/50"
        >
          <button
            onClick={() => setShowInfo(false)}
            className="absolute top-4 right-4 text-orange-200 hover:text-white transition-colors text-2xl font-bold"
          >
            ✕
          </button>
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <SunsetIcon className="w-14 h-14 text-orange-200" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-200 via-yellow-200 to-red-200 bg-clip-text text-transparent">
              SafariVerse
            </h1>
            <h2 className="text-2xl font-semibold text-orange-100 mb-4">
              African Sunset Explorer
            </h2>
            <p className="text-orange-100 text-xl mb-6 leading-relaxed">
              Experience the golden hour across Africa. Journey through
              countries bathed in the warm glow of an eternal sunset, discover
              vibrant communities, and connect with the heart of the continent.
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="flex items-center gap-3 text-yellow-200 font-semibold">
                <Mouse className="w-6 h-6" />
                <span>Hover for details</span>
              </div>
              <div className="flex items-center gap-3 text-red-200 font-semibold">
                <MousePointerClick className="w-6 h-6" />
                <span>Click to explore</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Safari Stats Panel */}
      <div className="absolute top-8 right-8 z-10 bg-gradient-to-br from-orange-800/80 via-red-800/80 to-amber-800/80 backdrop-blur-xl p-6 rounded-2xl border-2 border-orange-400/40 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <PawPrint className="w-7 h-7 text-orange-200" />
          <h3 className="font-bold text-orange-100 text-xl">
            Africa at Sunset
          </h3>
        </div>
        <div className="text-sm space-y-3 text-orange-100">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Globe2 className="w-4 h-4" />
              <span>Countries:</span>
            </span>
            <span className="text-yellow-300 font-bold text-lg">
              {africanCountries.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Population:</span>
            </span>
            <span className="text-yellow-300 font-bold text-lg">1.4B+</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Languages:</span>
            </span>
            <span className="text-yellow-300 font-bold text-lg">2000+</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              <span>Area:</span>
            </span>
            <span className="text-yellow-300 font-bold text-lg">30.3M km²</span>
          </div>
        </div>
      </div>

      {/* Safari Navigation Guide */}
      <div className="absolute bottom-8 left-8 z-10 bg-gradient-to-br from-amber-800/80 via-orange-800/80 to-red-800/80 backdrop-blur-xl p-5 rounded-2xl border-2 border-yellow-400/40 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-6 h-6 text-yellow-200" />
          <h4 className="font-bold text-yellow-100 text-lg">Explorer Guide</h4>
        </div>
        <div className="text-sm space-y-2 text-yellow-100">
          <p className="flex items-center gap-2">
            <Mouse className="w-4 h-4" />
            <span>Drag to rotate the continent</span>
          </p>
          <p className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4" />
            <span>Scroll to zoom in/out</span>
          </p>
          <p className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4" />
            <span>Click countries to explore</span>
          </p>
        </div>
      </div>

      {/* Safari Legend */}
      <div className="absolute bottom-8 right-8 z-10 bg-gradient-to-br from-red-800/80 via-orange-800/80 to-amber-800/80 backdrop-blur-xl p-5 rounded-2xl border-2 border-red-400/40 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <MapIcon className="w-6 h-6 text-red-200" />
          <h4 className="font-bold text-red-100 text-lg">Map Legend</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg"></div>
            <span className="text-sm text-red-100">Selected Country</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full shadow-lg"></div>
            <span className="text-sm text-red-100">Ocean Waters</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-amber-700 to-orange-700 rounded-full shadow-lg"></div>
            <span className="text-sm text-red-100">African Land</span>
          </div>
        </div>
      </div>

      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 12, 12]} />

          {/* Safari Sunset Lighting */}
          <ambientLight intensity={0.6} color="#FF8C00" />
          <directionalLight
            position={[20, 15, 10]}
            intensity={1.8}
            color="#FF6B35"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          {/* Warm sunset glow from the west */}
          <pointLight
            position={[-25, 8, -15]}
            intensity={1.2}
            color="#FF4500"
            distance={100}
          />
          {/* Golden hour light */}
          <pointLight
            position={[25, 6, 15]}
            intensity={0.9}
            color="#FFD700"
            distance={80}
          />
          {/* Soft red glow */}
          <pointLight
            position={[0, 10, 25]}
            intensity={0.7}
            color="#DC143C"
            distance={60}
          />

          {/* Sunset Sky with fewer, warmer stars */}
          <Stars
            radius={400}
            depth={50}
            count={3000}
            factor={4}
            saturation={1.2}
            fade
            color="#FFD700"
          />

          {/* Sunset Environment */}
          <Environment preset="sunset" />

          {/* Africa continent */}
          <AfricaContinent />

          {/* Countries */}
          {africanCountries.map((country) => (
            <CountryMesh
              key={country.id}
              country={country}
              onClick={handleCountryClick}
              isSelected={selectedCountry?.id === country.id}
            />
          ))}

          {/* Enhanced controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2.1}
            autoRotate={false}
            autoRotateSpeed={0.5}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
