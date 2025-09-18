"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
  Float,
  useGLTF,
} from "@react-three/drei";
import { useRef, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import {
  ArrowLeft,
  Send,
  Users,
  MessageCircle,
  Heart,
  Smile,
  Settings,
  Volume2,
  VolumeX,
  UserPlus,
  Crown,
  Star,
  Gamepad2,
  Calendar,
  Gift,
  Camera,
} from "lucide-react";

// Types
interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  avatar: string;
  color: string;
}

interface User {
  id: string;
  username: string;
  avatar: string;
  color: string;
  position: [number, number, number];
  isOnline: boolean;
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

// Avatar Component
function Avatar({
  user,
  onClick,
  isHovered,
  onHover,
}: {
  user: User;
  onClick: (user: User) => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(1);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y =
        user.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;

      // Hover effect
      const targetScale = isHovered ? 1.2 : 1;
      setScale((prev) => THREE.MathUtils.lerp(prev, targetScale, 0.1));
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group
      ref={groupRef}
      position={user.position}
      onClick={() => onClick(user)}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Avatar Body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1, 8]} />
        <meshStandardMaterial color={user.color} roughness={0.6} />
      </mesh>

      {/* Avatar Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#fdbcb4" roughness={0.4} />
      </mesh>

      {/* Online Indicator */}
      {user.isOnline && (
        <mesh position={[0.3, 1.3, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      )}

      {/* Username Label */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.2}
        color={isHovered ? "#fbbf24" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
      >
        {user.username}
      </Text>
    </group>
  );
}

// Social Activity Areas
function ChatCircle({ onEnter }: { onEnter: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Chat Circle Platform */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[8, 8, 0.2, 32]} />
        <meshStandardMaterial color="#1e40af" roughness={0.8} />
      </mesh>

      {/* Chat Seats */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 6;
        const z = Math.sin(angle) * 6;
        return (
          <group key={i} position={[x, 0.3, z]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[1, 0.6, 0.8]} />
              <meshStandardMaterial color="#3b82f6" roughness={0.7} />
            </mesh>
          </group>
        );
      })}

      {/* Central Chat Icon */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
        </mesh>
      </Float>

      {/* Clickable Area */}
      <mesh
        position={[0, 0.1, 0]}
        onClick={onEnter}
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
        <cylinderGeometry args={[8, 8, 0.1, 32]} />
        <meshBasicMaterial
          color={hovered ? "#fbbf24" : "#1e40af"}
          transparent
          opacity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Chat Circle Label */}
      <Text
        position={[0, 3, 0]}
        fontSize={1.2}
        color={hovered ? "#fbbf24" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
      >
        Community Chat
      </Text>
    </group>
  );
}

function GameArea({ onEnter }: { onEnter: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[20, 0, 0]}>
      {/* Game Platform */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[12, 0.5, 8]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.8} />
      </mesh>

      {/* Game Tables */}
      {[-3, 0, 3].map((x, i) => (
        <group key={i} position={[x, 0.8, 0]}>
          <mesh>
            <cylinderGeometry args={[1.5, 1.5, 0.1, 16]} />
            <meshStandardMaterial color="#8b5cf6" roughness={0.6} />
          </mesh>
          {/* Game Pieces */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Clickable Area */}
      <mesh
        position={[0, 0.25, 0]}
        onClick={onEnter}
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
        <boxGeometry args={[12, 0.5, 8]} />
        <meshBasicMaterial
          color={hovered ? "#fbbf24" : "#7c3aed"}
          transparent
          opacity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Game Area Label */}
      <Text
        position={[0, 3, 0]}
        fontSize={1.2}
        color={hovered ? "#fbbf24" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
      >
        Mini Games
      </Text>
    </group>
  );
}

function EventStage({ onEnter }: { onEnter: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[-20, 0, 0]}>
      {/* Stage Platform */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[10, 2, 6]} />
        <meshStandardMaterial color="#dc2626" roughness={0.7} />
      </mesh>

      {/* Stage Curtains */}
      <mesh position={[-4.5, 2.5, 0]}>
        <boxGeometry args={[1, 3, 6]} />
        <meshStandardMaterial color="#991b1b" roughness={0.8} />
      </mesh>
      <mesh position={[4.5, 2.5, 0]}>
        <boxGeometry args={[1, 3, 6]} />
        <meshStandardMaterial color="#991b1b" roughness={0.8} />
      </mesh>

      {/* Audience Seating */}
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 6 }, (_, seat) => {
          const x = (seat - 2.5) * 1.5;
          const z = 5 + row * 1.5;
          return (
            <mesh key={`${row}-${seat}`} position={[x, 0.3, z]}>
              <boxGeometry args={[0.8, 0.6, 0.6]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
            </mesh>
          );
        })
      )}

      {/* Spotlight */}
      <spotLight
        position={[0, 8, 2]}
        angle={0.5}
        intensity={2}
        color={0xfbbf24}
        target-position={[0, 1, 0]}
      />

      {/* Clickable Area */}
      <mesh
        position={[0, 1, 0]}
        onClick={onEnter}
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
        <boxGeometry args={[10, 2, 6]} />
        <meshBasicMaterial
          color={hovered ? "#fbbf24" : "#dc2626"}
          transparent
          opacity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Event Stage Label */}
      <Text
        position={[0, 4.5, 0]}
        fontSize={1.2}
        color={hovered ? "#fbbf24" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
      >
        Event Stage
      </Text>
    </group>
  );
}

function MediaCenter({ onEnter }: { onEnter: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 20]}>
      {/* Media Center Building */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[8, 4, 6]} />
        <meshStandardMaterial color="#059669" roughness={0.6} />
      </mesh>

      {/* Screen Wall */}
      <mesh position={[0, 2.5, 3.1]}>
        <boxGeometry args={[6, 3, 0.1]} />
        <meshBasicMaterial color="#1f2937" />
      </mesh>

      {/* Screen Content */}
      <mesh position={[0, 2.5, 3.15]}>
        <boxGeometry args={[5.5, 2.5, 0.05]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Seating */}
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 4 }, (_, seat) => {
          const x = (seat - 1.5) * 1.2;
          const z = -2 - row * 1.2;
          return (
            <mesh key={`${row}-${seat}`} position={[x, 0.3, z]}>
              <boxGeometry args={[0.8, 0.6, 0.6]} />
              <meshStandardMaterial color="#065f46" roughness={0.7} />
            </mesh>
          );
        })
      )}

      {/* Clickable Area */}
      <mesh
        position={[0, 2, 0]}
        onClick={onEnter}
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
        <boxGeometry args={[8, 4, 6]} />
        <meshBasicMaterial
          color={hovered ? "#fbbf24" : "#059669"}
          transparent
          opacity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Media Center Label */}
      <Text
        position={[0, 5, 0]}
        fontSize={1.2}
        color={hovered ? "#fbbf24" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
      >
        Media Center
      </Text>
    </group>
  );
}

function AfricanTrees() {
  return (
    <group>
      {Array.from({ length: 15 }, (_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 35 + Math.random() * 10;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 3 + Math.random() * 3;

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
      <planeGeometry args={[150, 150]} />
      <meshStandardMaterial color="#8FBC8F" roughness={0.9} />
    </mesh>
  );
}

// Chat System Component
function ChatSystem({
  isOpen,
  onClose,
  messages,
  onSendMessage,
}: {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}) {
  const [inputMessage, setInputMessage] = useState("");
  const [username] = useState("Explorer" + Math.floor(Math.random() * 1000));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-amber-400/40 w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 p-6">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Community Chat
                </h2>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span>
                    {Math.floor(Math.random() * 50) + 10} adventurers online
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area with Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-900/50 to-gray-800/50 custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={msg.id} className="flex items-start gap-4 group">
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg ring-2 ring-white/20"
                  style={{ backgroundColor: msg.color }}
                >
                  {msg.username[0]}
                </div>
                {/* Online indicator for active users */}
                {index < 3 && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-amber-300 text-lg">
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-4 text-gray-100 shadow-lg border border-slate-600/30 group-hover:border-amber-400/30 transition-all duration-300">
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <div className="p-6 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-t border-amber-400/20">
          <div className="space-y-4">
            {/* Textarea with send button */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your safari adventures with the community..."
                  className="w-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300 shadow-inner"
                  rows={3}
                />
              </div>
              {/* Send button positioned next to textarea */}
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim()}
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:opacity-50 font-semibold flex items-center gap-2 min-w-[100px] justify-center"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>

            {/* Action buttons row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm">
                  <Smile className="w-4 h-4" />
                  😊
                </button>
                <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm">
                  <Gift className="w-4 h-4" />
                  GIF
                </button>
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl text-sm">
                  <Camera className="w-4 h-4" />
                  Photo
                </button>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span>Press Enter to send</span>
                <span className="text-gray-500">•</span>
                <span>Shift+Enter for new line</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f59e0b, #ea580c);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #fbbf24, #f97316);
        }
      `}</style>
    </div>
  );
}

// Main Social Hub Scene
function SocialHubScene({
  onChatEnter,
  onGameEnter,
  onEventEnter,
  onMediaEnter,
  controlMode,
  users,
  onUserClick,
  hoveredUser,
  setHoveredUser,
}: {
  onChatEnter: () => void;
  onGameEnter: () => void;
  onEventEnter: () => void;
  onMediaEnter: () => void;
  controlMode: "firstPerson" | "orbit";
  users: User[];
  onUserClick: (user: User) => void;
  hoveredUser: string | null;
  setHoveredUser: (userId: string | null) => void;
}) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 15, 25]}
        fov={75}
        near={0.1}
        far={1000}
      />

      {/* Conditional Camera Controller */}
      {controlMode === "firstPerson" && <CameraController />}

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[15, 20, 10]} intensity={1.2} />
      <directionalLight position={[-15, 15, -10]} intensity={0.8} />
      <hemisphereLight args={[0x87ceeb, 0x8fbc8f, 0.5]} />

      {/* Ground */}
      <Ground />

      {/* African Trees */}
      <AfricanTrees />

      {/* Social Activity Areas */}
      <ChatCircle onEnter={onChatEnter} />
      <GameArea onEnter={onGameEnter} />
      <EventStage onEnter={onEventEnter} />
      <MediaCenter onEnter={onMediaEnter} />

      {/* User Avatars */}
      {users.map((user) => (
        <Avatar
          key={user.id}
          user={user}
          onClick={onUserClick}
          isHovered={hoveredUser === user.id}
          onHover={(hovered) => setHoveredUser(hovered ? user.id : null)}
        />
      ))}

      {/* OrbitControls for orbit mode */}
      {controlMode === "orbit" && (
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={10}
          maxDistance={80}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
        />
      )}
    </>
  );
}

// Social Hub UI
function SocialHubUI({
  onBack,
  controlMode,
  setControlMode,
  isMuted,
  setIsMuted,
  onlineUsers,
  selectedUser,
  setSelectedUser,
}: {
  onBack: () => void;
  controlMode: "firstPerson" | "orbit";
  setControlMode: (mode: "firstPerson" | "orbit") => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onlineUsers: number;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Navigation */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent">
                Social Hub
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-400">
                <Users className="w-5 h-5" />
                <span className="font-semibold">{onlineUsers} online</span>
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

      {/* Activity Guide */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-4 border border-amber-500/30 max-w-sm">
          <h3 className="text-amber-300 font-semibold mb-3 text-sm flex items-center gap-2">
            <Star className="w-4 h-4" />
            Social Activities
          </h3>
          <div className="space-y-2 text-xs text-orange-200">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageCircle className="w-3 h-3" />
                Chat Circle:
              </span>
              <span className="text-blue-300">Community Chat</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gamepad2 className="w-3 h-3" />
                Game Area:
              </span>
              <span className="text-purple-300">Mini Games</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Event Stage:
              </span>
              <span className="text-red-300">Live Events</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Camera className="w-3 h-3" />
                Media Center:
              </span>
              <span className="text-green-300">Content Sharing</span>
            </div>
          </div>
          <p className="text-orange-200 text-xs mt-3 pt-2 border-t border-amber-500/20">
            Click on areas or avatars to interact!
          </p>
        </div>
      </div>

      {/* User Profile Panel */}
      {selectedUser && (
        <div className="absolute top-20 right-4 z-10 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-lg rounded-xl p-4 border border-amber-500/30 max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-amber-300 font-semibold">User Profile</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: selectedUser.color }}
                >
                  {selectedUser.username[0]}
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {selectedUser.username}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        selectedUser.isOnline ? "bg-green-400" : "bg-gray-400"
                      }`}
                    ></div>
                    <span
                      className={
                        selectedUser.isOnline
                          ? "text-green-400"
                          : "text-gray-400"
                      }
                    >
                      {selectedUser.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 rounded text-sm hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Chat
                </button>
                <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded text-sm hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-1">
                  <UserPlus className="w-3 h-3" />
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SocialHubPage() {
  const router = useRouter();
  const [controlMode, setControlMode] = useState<"firstPerson" | "orbit">(
    "firstPerson"
  );
  const [isMuted, setIsMuted] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      username: "SafariGuide",
      message:
        "Welcome to the Social Hub! Feel free to explore and connect with other adventurers.",
      timestamp: new Date(Date.now() - 300000),
      avatar: "🦁",
      color: "#f59e0b",
    },
    {
      id: "2",
      username: "Explorer42",
      message:
        "This virtual world is amazing! Love the African-inspired design.",
      timestamp: new Date(Date.now() - 120000),
      avatar: "🌍",
      color: "#10b981",
    },
    {
      id: "3",
      username: "AdventureSeeker",
      message: "Anyone up for exploring the game area together?",
      timestamp: new Date(Date.now() - 60000),
      avatar: "🎮",
      color: "#8b5cf6",
    },
  ]);

  // Mock users
  const [users] = useState<User[]>([
    {
      id: "1",
      username: "AdventureSeeker",
      avatar: "🦒",
      color: "#f59e0b",
      position: [3, 0, 2],
      isOnline: true,
    },
    {
      id: "2",
      username: "SafariExplorer",
      avatar: "🦓",
      color: "#10b981",
      position: [-4, 0, -1],
      isOnline: true,
    },
    {
      id: "3",
      username: "CultureLover",
      avatar: "🦁",
      color: "#8b5cf6",
      position: [15, 0, 3],
      isOnline: true,
    },
    {
      id: "4",
      username: "GameMaster",
      avatar: "🐘",
      color: "#ef4444",
      position: [18, 0, -2],
      isOnline: false,
    },
    {
      id: "5",
      username: "EventHost",
      avatar: "🎭",
      color: "#06b6d4",
      position: [-18, 0, 1],
      isOnline: true,
    },
    {
      id: "6",
      username: "ContentCreator",
      avatar: "📹",
      color: "#84cc16",
      position: [2, 0, 18],
      isOnline: true,
    },
  ]);

  const handleSendMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: "You",
      message,
      timestamp: new Date(),
      avatar: "👤",
      color: "#3b82f6",
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleChatEnter = () => {
    setIsChatOpen(true);
  };

  const handleGameEnter = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(
        "Mini games coming soon! 🎮 Features planned: African board games, trivia, and collaborative activities!"
      );
    }, 1000);
  };

  const handleEventEnter = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(
        "Live events coming soon! 🎭 Features planned: Cultural performances, storytelling sessions, and community gatherings!"
      );
    }, 1000);
  };

  const handleMediaEnter = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(
        "Media Center coming soon! 📹 Features planned: Share photos, videos, and cultural content with the community!"
      );
    }, 1000);
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-blue-900 via-indigo-800 to-purple-900">
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay text="Loading activity..." />}

      {/* Chat System */}
      <ChatSystem
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
      />

      {/* 3D Social Hub Environment */}
      <Canvas
        className="w-full h-full"
        gl={{
          antialias: true,
          alpha: false,
        }}
      >
        <SocialHubScene
          onChatEnter={handleChatEnter}
          onGameEnter={handleGameEnter}
          onEventEnter={handleEventEnter}
          onMediaEnter={handleMediaEnter}
          controlMode={controlMode}
          users={users}
          onUserClick={handleUserClick}
          hoveredUser={hoveredUser}
          setHoveredUser={setHoveredUser}
        />
      </Canvas>

      {/* UI Overlay */}
      <SocialHubUI
        onBack={() => router.back()}
        controlMode={controlMode}
        setControlMode={setControlMode}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onlineUsers={users.filter((u) => u.isOnline).length}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />
    </div>
  );
}
