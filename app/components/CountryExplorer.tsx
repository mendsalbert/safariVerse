"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Html,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, useState, useRef } from "react";
import { Mesh } from "three";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, MessageCircle, Calendar } from "lucide-react";

interface City {
  id: string;
  name: string;
  position: [number, number, number];
  type: "city" | "village" | "town";
  population: string;
  description: string;
  onlineUsers: number;
  landmarks: string[];
  events: string[];
}

interface Country {
  id: string;
  name: string;
  cities: string[];
  description: string;
  population: string;
}

const countryData: Record<string, City[]> = {
  ghana: [
    {
      id: "accra",
      name: "Accra",
      position: [0, 0, 2],
      type: "city",
      population: "2.3M",
      description: "Capital city and economic hub of Ghana",
      onlineUsers: 1247,
      landmarks: [
        "Independence Arch",
        "Kwame Nkrumah Mausoleum",
        "Labadi Beach",
      ],
      events: ["Homowo Festival", "Chale Wote Street Art Festival"],
    },
    {
      id: "kumasi",
      name: "Kumasi",
      position: [-2, 0, 0],
      type: "city",
      population: "3.3M",
      description: "Cultural capital and heart of the Ashanti Kingdom",
      onlineUsers: 892,
      landmarks: ["Manhyia Palace", "Kejetia Market", "Cultural Centre"],
      events: ["Akwasidae Festival", "Adae Festival"],
    },
    {
      id: "cape-coast",
      name: "Cape Coast",
      position: [2, 0, 0],
      type: "town",
      population: "170K",
      description: "Historic coastal town with colonial heritage",
      onlineUsers: 324,
      landmarks: ["Cape Coast Castle", "Elmina Castle", "Kakum National Park"],
      events: ["Fetu Afahye Festival", "Panafest"],
    },
    {
      id: "tamale",
      name: "Tamale",
      position: [0, 0, -2],
      type: "city",
      population: "950K",
      description: "Northern regional capital with rich traditions",
      onlineUsers: 567,
      landmarks: ["Central Mosque", "Cultural Centre", "Tamale Market"],
      events: ["Damba Festival", "Fire Festival"],
    },
    {
      id: "aburi",
      name: "Aburi",
      position: [1, 0, 1],
      type: "village",
      population: "18K",
      description: "Mountain village known for botanical gardens",
      onlineUsers: 89,
      landmarks: ["Aburi Botanical Gardens", "Tetteh Quarshie Cocoa Farm"],
      events: ["Harvest Festival", "Easter Celebrations"],
    },
  ],
  nigeria: [
    {
      id: "lagos",
      name: "Lagos",
      position: [0, 0, 2],
      type: "city",
      population: "15M",
      description: "Economic powerhouse and largest city in Africa",
      onlineUsers: 3456,
      landmarks: ["Victoria Island", "Lekki Peninsula", "National Theatre"],
      events: ["Lagos Carnival", "Felabration"],
    },
    {
      id: "abuja",
      name: "Abuja",
      position: [0, 0, -1],
      type: "city",
      population: "3.8M",
      description: "Modern capital city in the heart of Nigeria",
      onlineUsers: 1789,
      landmarks: [
        "Aso Rock",
        "National Mosque",
        "Nigerian National Christian Centre",
      ],
      events: ["Abuja Carnival", "Independence Day Parade"],
    },
    {
      id: "kano",
      name: "Kano",
      position: [-2, 0, -2],
      type: "city",
      population: "4.1M",
      description: "Ancient trading city with rich Hausa culture",
      onlineUsers: 1234,
      landmarks: ["Kano City Walls", "Gidan Makama Museum", "Kurmi Market"],
      events: ["Durbar Festival", "Eid Celebrations"],
    },
    {
      id: "calabar",
      name: "Calabar",
      position: [2, 0, 1],
      type: "city",
      population: "461K",
      description: "Tourism capital known for festivals and culture",
      onlineUsers: 678,
      landmarks: ["Drill Monkey Sanctuary", "Calabar Museum", "Marina Resort"],
      events: ["Calabar Carnival", "New Yam Festival"],
    },
  ],
};

interface CityMeshProps {
  city: City;
  onClick: (city: City) => void;
  isSelected: boolean;
}

function CityMesh({ city, onClick, isSelected }: CityMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      if (hovered || isSelected) {
        meshRef.current.scale.setScalar(1.3);
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      } else {
        meshRef.current.scale.setScalar(1);
        meshRef.current.rotation.y = 0;
      }
    }
  });

  const getGeometry = () => {
    switch (city.type) {
      case "city":
        return <boxGeometry args={[1, 1.5, 1]} />;
      case "town":
        return <boxGeometry args={[0.8, 1, 0.8]} />;
      case "village":
        return <boxGeometry args={[0.6, 0.7, 0.6]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const getColor = () => {
    if (hovered || isSelected) return "#FFD700";
    switch (city.type) {
      case "city":
        return "#FF6B35";
      case "town":
        return "#4ECDC4";
      case "village":
        return "#45B7D1";
      default:
        return "#95A5A6";
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={city.position}
        onClick={() => onClick(city)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {getGeometry()}
        <meshStandardMaterial
          color={getColor()}
          emissive={hovered || isSelected ? "#444400" : "#000000"}
        />
      </mesh>

      {(hovered || isSelected) && (
        <Html
          position={[city.position[0], city.position[1] + 2, city.position[2]]}
        >
          <div className="bg-white bg-opacity-95 p-4 rounded-lg shadow-lg text-center min-w-[250px] pointer-events-none">
            <h3 className="font-bold text-lg text-amber-900">{city.name}</h3>
            <p className="text-xs text-amber-600 uppercase mb-2">{city.type}</p>
            <p className="text-sm text-gray-600 mb-3">{city.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{city.population}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{city.onlineUsers} online</span>
              </div>
            </div>
          </div>
        </Html>
      )}

      <Text
        position={[city.position[0], city.position[1] - 1.2, city.position[2]]}
        fontSize={0.25}
        color="#2D1810"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {city.name}
      </Text>
    </group>
  );
}

interface CountryExplorerProps {
  country: Country;
  onBack: () => void;
  onCitySelect: (city: City) => void;
}

export default function CountryExplorer({
  country,
  onBack,
  onCitySelect,
}: CountryExplorerProps) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const cities = countryData[country.id] || [];

  const handleCityClick = (city: City) => {
    setSelectedCity(city);
    onCitySelect(city);
  };

  const totalOnlineUsers = cities.reduce(
    (sum, city) => sum + city.onlineUsers,
    0
  );

  return (
    <div className="w-full h-screen relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 backdrop-blur-md bg-opacity-90 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="text-white hover:text-yellow-300 transition-colors"
            >
              ← Back to Africa
            </button>
            <h1 className="text-2xl font-bold text-white">
              Exploring {country.name}
            </h1>
          </div>
          <div className="text-white text-sm">
            <span>{totalOnlineUsers} explorers online</span>
          </div>
        </div>
      </div>

      {/* Country info sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute left-4 top-24 z-10 bg-white p-6 rounded-xl shadow-lg max-w-sm"
      >
        <h2 className="text-2xl font-bold text-amber-900 mb-3">
          {country.name}
        </h2>
        <p className="text-gray-700 mb-4">{country.description}</p>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">
              Locations to Explore:
            </h3>
            <div className="space-y-2">
              {cities.map((city) => (
                <div
                  key={city.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedCity?.id === city.id
                      ? "bg-amber-100 border border-amber-300"
                      : "bg-gray-50 hover:bg-amber-50"
                  }`}
                  onClick={() => handleCityClick(city)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{city.name}</span>
                    <span className="text-xs bg-amber-200 px-2 py-1 rounded">
                      {city.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {city.population}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {city.onlineUsers}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected city details */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white p-6 rounded-xl shadow-lg max-w-2xl w-full mx-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-amber-900">
                  {selectedCity.name}
                </h3>
                <p className="text-amber-600 uppercase text-sm">
                  {selectedCity.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedCity(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700 mb-4">{selectedCity.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600" />
                    <span>Population: {selectedCity.population}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{selectedCity.onlineUsers} users online</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-amber-800 mb-2">Landmarks</h4>
                <div className="space-y-1 mb-4">
                  {selectedCity.landmarks.map((landmark) => (
                    <div
                      key={landmark}
                      className="flex items-center gap-2 text-sm"
                    >
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>{landmark}</span>
                    </div>
                  ))}
                </div>

                <h4 className="font-semibold text-amber-800 mb-2">
                  Local Events
                </h4>
                <div className="space-y-1">
                  {selectedCity.events.map((event) => (
                    <div
                      key={event}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>{event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Join Local Chat
              </button>
              <button className="flex-1 border border-amber-500 text-amber-600 py-3 rounded-lg font-medium hover:bg-amber-50 transition-colors">
                Explore Virtually
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Scene */}
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 6, 6]} />

          {/* Lighting */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, 5, -10]} intensity={0.5} />

          {/* Environment */}
          <Environment preset="sunset" />

          {/* Ground */}
          <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>

          {/* Cities */}
          {cities.map((city) => (
            <CityMesh
              key={city.id}
              city={city}
              onClick={handleCityClick}
              isSelected={selectedCity?.id === city.id}
            />
          ))}

          {/* Country name in 3D */}
          <Text
            position={[0, 3, -4]}
            fontSize={1}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {country.name}
          </Text>

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
