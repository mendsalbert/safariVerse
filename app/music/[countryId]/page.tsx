"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import CountrySelector from "../../components/CountrySelector";
import TuneInList from "../../components/TuneInList";
import { database } from "../../../lib/firebase";
import {
  ref,
  set,
  remove,
  serverTimestamp,
  onValue,
  off,
} from "firebase/database";
// Removed direct Radio Browser API import - using proxy instead

type AnalyserBundle = {
  analyser: AnalyserNode | null;
  data: Uint8Array | null;
};

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#0f172a" roughness={0.9} />
    </mesh>
  );
}

function ClubRoom() {
  // Simple room: floor already exists; add back wall, side walls, ceiling with subtle emissive strips
  return (
    <group position={[0, 0, 0]}>
      {/* Back wall */}
      <mesh position={[0, 2.5, -6]}>
        <boxGeometry args={[20, 5, 0.5]} />
        <meshStandardMaterial color="#0b1020" roughness={0.9} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 5, 0.5]} />
        <meshStandardMaterial color="#0b0f1a" roughness={0.9} />
      </mesh>
      {/* Right wall */}
      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 5, 0.5]} />
        <meshStandardMaterial color="#0b0f1a" roughness={0.9} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#0a0a16" roughness={1.0} />
      </mesh>
      {/* Neon strips on ceiling */}
      {[-6, -2, 2, 6].map((x, i) => (
        <mesh key={i} position={[x, 4.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 10]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#6ee7ff" : "#f472b6"}
            emissive="#101010"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function SpeakerStack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.9 * i + 0.7, 0]}>
          <boxGeometry args={[1.1, 0.9, 0.6]} />
          <meshStandardMaterial color="#111827" roughness={0.7} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={`cone-${i}`} position={[0, 0.9 * i + 0.7, 0.31]}>
          <circleGeometry args={[0.25, 24]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
    </group>
  );
}

function EqualizerBars({ bundle }: { bundle: AnalyserBundle }) {
  const bars = new Array(16).fill(0);
  const refs = useRef<Array<THREE.Mesh | null>>(bars.map(() => null));
  useFrame(() => {
    if (!bundle.analyser || !bundle.data) return;
    const dataArray = new Uint8Array(bundle.data);
    bundle.analyser.getByteFrequencyData(dataArray);
    const slice = dataArray.slice(0, bars.length);
    slice.forEach((v, i) => {
      const m = refs.current[i];
      if (!m) return;
      const h = THREE.MathUtils.mapLinear(v, 0, 255, 0.1, 1.6);
      m.scale.y = h;
    });
  });
  return (
    <group position={[0, 1.05, -0.1]}>
      {bars.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={[i * 0.25 - (bars.length * 0.25) / 2 + 0.25, 0, 0]}
        >
          <boxGeometry args={[0.18, 0.5, 0.12]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#064e3b"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function DJStage({ bundle }: { bundle: AnalyserBundle }) {
  const groupRef = useRef<THREE.Group>(null);
  const djRef = useRef<THREE.Group>(null);
  const spotRefs = useRef<Array<THREE.SpotLight | null>>([
    null,
    null,
    null,
    null,
  ]);
  const discoLightsRef = useRef<Array<THREE.PointLight | null>>([
    null,
    null,
    null,
    null,
  ]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;

    // Animate DJ
    if (djRef.current) {
      djRef.current.position.y = 2.0 + Math.sin(t * 2) * 0.05;
      djRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }

    // Animate disco lights
    discoLightsRef.current.forEach((light, i) => {
      if (!light) return;
      const angle = t * 0.5 + (i * Math.PI) / 2;
      light.position.x = Math.cos(angle) * 5;
      light.position.z = Math.sin(angle) * 5;
      light.intensity = 1.5 + Math.sin(t * 2 + i) * 0.5;
    });

    if (bundle.analyser && bundle.data) {
      const dataArray = new Uint8Array(bundle.data);
      bundle.analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const intensity = THREE.MathUtils.mapLinear(avg, 0, 255, 1.0, 3.0);
      spotRefs.current.forEach((s, i) => {
        if (!s) return;
        s.intensity = intensity * (i % 2 === 0 ? 1.0 : 0.7);
        s.color.setHSL(((t * 0.1 + i * 0.2) % 1) as number, 0.9, 0.6);
      });
    }
  });

  return (
    <group ref={groupRef}>
      <ClubRoom />
      {/* Stage deck */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[12, 0.7, 7]} />
        <meshStandardMaterial color="#4a3c2a" roughness={0.85} />
      </mesh>

      {/* Dance floor tiles with glow */}
      <group position={[0, 0.03, 0]}>
        {Array.from({ length: 6 }, (_, ix) => ix - 3).map((x) =>
          Array.from({ length: 6 }, (_, iz) => iz - 3).map((z) => (
            <mesh
              key={`${x}-${z}`}
              position={[x * 1.0, 0, z * 1.0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.95, 0.95]} />
              <meshStandardMaterial
                color={(x + z) % 2 === 0 ? "#1e293b" : "#334155"}
                roughness={0.9}
                emissive={(x + z) % 2 === 0 ? "#0f172a" : "#1e293b"}
                emissiveIntensity={0.1}
              />
            </mesh>
          ))
        )}
      </group>

      {/* DJ booth */}
      <group position={[0, 1.2, -2.1]}>
        <mesh>
          <boxGeometry args={[3.6, 0.35, 1.4]} />
          <meshStandardMaterial
            color="#1a1a2e"
            roughness={0.6}
            metalness={0.3}
            emissive="#0f0f23"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Turntables */}
        {[-1.0, 1.0].map((x, i) => (
          <group key={i} position={[x, 0.28, 0]}>
            <mesh>
              <cylinderGeometry args={[0.38, 0.38, 0.06, 32]} />
              <meshStandardMaterial
                color="#0f766e"
                metalness={0.4}
                roughness={0.3}
                emissive="#064e3b"
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Spinning vinyl */}
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.01, 32]} />
              <meshStandardMaterial
                color="#1f2937"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))}
        {/* Mixer with EQ */}
        <group position={[0, 0.28, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 0.06, 0.55]} />
            <meshStandardMaterial
              color="#1f2937"
              emissive="#0f172a"
              emissiveIntensity={0.2}
            />
          </mesh>
          <EqualizerBars bundle={bundle} />
        </group>
      </group>

      {/* Enhanced DJ avatar */}
      <group ref={djRef} position={[0, 2.0, -2.1]}>
        {/* Head */}
        <mesh>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
        {/* Body */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.7, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        {/* Arms */}
        <mesh position={[-0.3, -0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
        <mesh position={[0.3, -0.4, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#fde68a" />
        </mesh>
        {/* Headphones */}
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[0.35, 0.05, 8, 16]} />
          <meshStandardMaterial color="#1f2937" metalness={0.8} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.1, 0.05, 0.25]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.1, 0.05, 0.25]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>

      {/* Speaker towers */}
      <SpeakerStack position={[-5.2, 0.6, -2.1]} />
      <SpeakerStack position={[5.2, 0.6, -2.1]} />

      {/* Overhead lights truss */}
      <group position={[0, 3.4, 0]}>
        <mesh>
          <boxGeometry args={[9, 0.15, 0.15]} />
          <meshStandardMaterial
            color="#374151"
            metalness={0.2}
            roughness={0.7}
            emissive="#1f2937"
            emissiveIntensity={0.1}
          />
        </mesh>
        {[-3, -1, 1, 3].map((x, i) => (
          <spotLight
            key={i}
            ref={(el) => (spotRefs.current[i] = el)}
            position={[x, 0, 0]}
            angle={0.6}
            intensity={2.0}
            color={i % 2 === 0 ? 0x00ffff : 0xff00ff}
            target-position={[0, 0, 0]}
          />
        ))}
      </group>

      {/* Additional lighting */}
      <hemisphereLight args={[0x4a5568, 0x1a202c, 1.2]} />
      <directionalLight
        position={[8, 10, 6]}
        intensity={1.0}
        color={0xffffff}
      />
      <directionalLight
        position={[-8, 8, 4]}
        intensity={0.8}
        color={0xfff8dc}
      />
      <pointLight position={[0, 4, 0]} intensity={1.5} color={0xffffff} />

      {/* Stage edge lights */}
      {[-6, 6].map((x, i) => (
        <pointLight
          key={i}
          position={[x, 1, 0]}
          intensity={1.0}
          color={i % 2 === 0 ? 0xff6b6b : 0x4ecdc4}
        />
      ))}

      {/* Additional disco lights around the dance floor */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <group key={`disco-${i}`}>
          <pointLight
            position={[x, 3, 6]}
            intensity={1.5}
            color={[0xff00ff, 0x00ffff, 0xffff00, 0xff6b6b, 0x00ff00][i % 5]}
            distance={8}
          />
          <pointLight
            position={[x, 2, 8]}
            intensity={1.2}
            color={[0x4ecdc4, 0xff6b6b, 0x9b59b6, 0xf39c12, 0xe74c3c][i % 5]}
            distance={6}
          />
        </group>
      ))}

      {/* Rotating disco lights */}
      <group position={[0, 4, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <pointLight
            key={`rotating-${i}`}
            ref={(el) => (discoLightsRef.current[i] = el)}
            position={[5, 0, 0]}
            intensity={2.0}
            color={[0xff0080, 0x8000ff, 0x00ff80, 0xff8000][i]}
            distance={10}
          />
        ))}
      </group>

      {/* Floor disco lights */}
      {[-4, -2, 2, 4].map((x, i) => (
        <pointLight
          key={`floor-${i}`}
          position={[x, 0.2, 4]}
          intensity={0.8}
          color={[0xff1493, 0x00ced1, 0x7fff00, 0xff4500][i % 4]}
          distance={4}
        />
      ))}

      {/* Audience/Crowd area in front of stage - now handled by DJWorld */}

      {/* Participant platform (tune-in zone) */}
      <group position={[0, 0.6, 5.5]}>
        <mesh>
          <boxGeometry args={[10, 0.4, 2]} />
          <meshStandardMaterial color="#0d1b2a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[10.2, 0.5, 0.2]} />
          <meshStandardMaterial color="#1b263b" />
        </mesh>
      </group>
    </group>
  );
}

// Create emoji texture function
function createEmojiTexture(emoji: string) {
  console.log(`Creating texture for emoji: ${emoji}`);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 256;
  canvas.height = 256;

  if (context) {
    // Clear canvas with transparent background
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set up emoji rendering
    context.font = "180px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Draw the emoji
    context.fillText(emoji, canvas.width / 2, canvas.height / 2);

    console.log(
      `Canvas created with emoji: ${emoji}, size: ${canvas.width}x${canvas.height}`
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.flipY = false;
  return texture;
}

// Real listener avatar component
function ListenerAvatar({
  user,
  position,
  bundle,
}: {
  user: { id: string; username: string; countryEmoji: string; country: string };
  position: [number, number, number];
  bundle: AnalyserBundle;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const nameRef = useRef<THREE.Group>(null);

  // Create emoji texture
  const emojiTexture = useMemo(() => {
    console.log(
      `Creating emoji texture for ${user.username}: ${user.countryEmoji}`
    );
    return createEmojiTexture(user.countryEmoji || "🌍");
  }, [user.countryEmoji, user.username]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Dancing animation based on music
    let danceIntensity = 0.1;
    if (bundle.analyser && bundle.data) {
      const arr = new Uint8Array(bundle.data);
      bundle.analyser.getByteFrequencyData(arr);
      const avg = arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);
      danceIntensity = THREE.MathUtils.mapLinear(avg, 0, 255, 0.05, 0.3);
    }

    // Bouncing dance animation
    groupRef.current.position.y =
      position[1] +
      Math.abs(Math.sin(t * 2 + position[0] * 0.5)) * danceIntensity;

    // Slight rotation
    groupRef.current.rotation.y = Math.sin(t * 0.5 + position[0] * 0.3) * 0.1;

    // Name tag always faces camera
    if (nameRef.current) {
      nameRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Avatar body */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.15, 0.6, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Avatar head */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {/* Country emoji flag - using canvas texture */}
      <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial
          map={emojiTexture}
          transparent={true}
          alphaTest={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Name tag background */}
      <group ref={nameRef} position={[0, 1.2, 0]}>
        <mesh>
          <planeGeometry
            args={[Math.max(user.username.length * 0.08, 0.8), 0.25]}
          />
          <meshStandardMaterial color="#000000" transparent opacity={0.8} />
        </mesh>

        {/* Username text */}
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.5}
          textAlign="center"
          outlineWidth={0.005}
          outlineColor="#000000"
        >
          {user.username}
        </Text>
      </group>
    </group>
  );
}

function Crowd({
  bundle,
  listeners,
}: {
  bundle: AnalyserBundle;
  listeners: any[];
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Animate the entire crowd group
    groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.02;
  });

  // Generate positions for listeners in the same grid pattern as original crowd
  const generatePositions = (count: number) => {
    const positions: [number, number, number][] = [];

    // Use the same grid pattern as the original mock crowd
    // Grid: x from -6 to 6 (step 2), z from 1 to 7 (step 2)
    const gridPositions: [number, number, number][] = [];

    for (let x = -6; x <= 6; x += 2) {
      for (let z = 1; z <= 7; z += 2) {
        gridPositions.push([x, 0.6, z]);
      }
    }

    // Take only the number of positions we need
    for (let i = 0; i < Math.min(count, gridPositions.length); i++) {
      positions.push(gridPositions[i]);
    }

    return positions;
  };

  const positions = generatePositions(listeners.length);

  return (
    <group ref={groupRef}>
      {listeners.map((listener, index) => (
        <ListenerAvatar
          key={listener.id}
          user={listener}
          position={positions[index] || [0, 0.6, 8]}
          bundle={bundle}
        />
      ))}
    </group>
  );
}

function DJWorld({
  bundle,
  listeners,
}: {
  bundle: AnalyserBundle;
  listeners: any[];
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 6, 14]} fov={70} />
      <ambientLight intensity={0.6} color={0x404040} />
      <Ground />
      <DJStage bundle={bundle} />
      <Crowd bundle={bundle} listeners={listeners} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={6}
        maxDistance={30}
        target={[0, 1.5, -1]}
      />
    </>
  );
}

export default function MusicStagePage() {
  const router = useRouter();
  const params = useParams();
  const countryId = params.countryId as string;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [station, setStation] = useState("/radio/radio.mp3");
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [streamAttempts, setStreamAttempts] = useState(0);

  // Fallback to Safari Radio only - no external streams
  const fallbackStreams = [
    "/radio/radio.mp3", // Safari Radio - original file
  ];

  const tryFallbackStream = () => {
    if (streamAttempts < fallbackStreams.length - 1) {
      const nextAttempt = streamAttempts + 1;
      setStreamAttempts(nextAttempt);
      const fallbackUrl = fallbackStreams[nextAttempt];
      console.log(`Trying fallback stream ${nextAttempt + 1}:`, fallbackUrl);
      changeStation(fallbackUrl);
    } else {
      console.error("All fallback streams failed");
      setError("All radio streams are currently unavailable");
    }
  };

  type StationRB = {
    name: string;
    url: string;
    urlResolved: string;
    country: string;
    countryCode: string;
    tags: string[];
    favicon: string;
    bitrate: number;
    language: string[];
    lastCheckOk: boolean;
    id: string;
    clickCount?: number;
    source?: string;
    // Virtual chunk properties
    startTime?: number;
    endTime?: number;
    duration?: number;
    virtual?: boolean;
    chunkIndex?: number;
  };

  const [stations, setStations] = useState<StationRB[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [currentStationId, setCurrentStationId] = useState<string | null>(null);

  // Tune In feature state
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [isTunedIn, setIsTunedIn] = useState(false);
  const [userCountry, setUserCountry] = useState<string>("");
  const [userCountryEmoji, setUserCountryEmoji] = useState<string>("");
  const [userId] = useState(
    () => `user_${Math.random().toString(36).substr(2, 9)}`
  );

  // 3D listeners state
  const [listeners3D, setListeners3D] = useState<any[]>([]);
  const [liveReactions, setLiveReactions] = useState<any[]>([]);
  const currentStation = useMemo(
    () =>
      stations.find((s) => s.id === currentStationId) || stations[0] || null,
    [stations, currentStationId]
  );
  const topByClicks = useMemo(() => {
    if (!stations.length) return null;
    return [...stations].sort(
      (a, b) => (b.clickCount || 0) - (a.clickCount || 0)
    )[0];
  }, [stations]);
  const [userSwitches, setUserSwitches] = useState(0);

  const [muted, setMuted] = useState(false);
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const flagFromCode = (code?: string) => {
    if (!code || code.length !== 2) return "";
    try {
      const cc = code.toUpperCase();
      return String.fromCodePoint(
        ...[...cc].map((c) => 127397 + c.charCodeAt(0))
      );
    } catch (e) {
      console.warn("Failed to generate flag for code:", code);
      return "";
    }
  };

  const bundle: AnalyserBundle = useMemo(
    () => ({ analyser: null, data: null }),
    []
  );

  // Note: Participants/listeners are now handled by Firebase via TuneInList component

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  // Wire audio element events for buffering feedback
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);
    const onStalled = () => setIsBuffering(true);
    const onError = (e: any) => {
      setIsBuffering(false);
      setError("Stream error");
      // Try fallback stream after a short delay
      setTimeout(() => {
        tryFallbackStream();
      }, 2000);
    };
    const onLoadStart = () => {};
    const onLoadedData = () => {};
    const onLoadEnd = () => {};

    el.addEventListener("waiting", onWaiting);
    el.addEventListener("canplay", onCanPlay as any);
    el.addEventListener("playing", onPlaying as any);
    el.addEventListener("stalled", onStalled as any);
    el.addEventListener("error", onError as any);
    el.addEventListener("loadstart", onLoadStart as any);
    el.addEventListener("loadeddata", onLoadedData as any);
    el.addEventListener("loadend", onLoadEnd as any);

    return () => {
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("canplay", onCanPlay as any);
      el.removeEventListener("playing", onPlaying as any);
      el.removeEventListener("stalled", onStalled as any);
      el.removeEventListener("error", onError as any);
      el.removeEventListener("loadstart", onLoadStart as any);
      el.removeEventListener("loadeddata", onLoadedData as any);
      el.removeEventListener("loadend", onLoadEnd as any);
    };
  }, []);

  const setupAnalyser = async () => {
    try {
      const el = audioRef.current;
      if (!el) return;

      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        console.warn("AudioContext not supported");
        return;
      }

      const ctx: AudioContext = new AudioContext();
      const src = ctx.createMediaElementSource(el);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      src.connect(analyser);
      analyser.connect(ctx.destination);
      (bundle as any).analyser = analyser;
      (bundle as any).data = dataArray;
    } catch (e: any) {
      console.error("Audio context initialization failed:", e);
      setError("Audio context initialization failed");
    }
  };

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    setError(null);
    try {
      if (!isPlaying) {
        setIsBuffering(true);
        await el.play();
        setIsPlaying(true);
        if (!bundle.analyser) {
          await setupAnalyser();
        }
      } else {
        el.pause();
        setIsPlaying(false);
        setIsBuffering(false);
      }
    } catch (e: any) {
      console.error("Playback error:", e);
      setError("Failed to start playback (CORS or autoplay blocked)");
      setIsBuffering(false);
    }
  };

  const changeStation = (url: string, stationData?: StationRB) => {
    const el = audioRef.current;
    if (!el || !url) return;

    setStation(url);

    // Handle virtual chunks with start/end times
    if (stationData?.virtual && stationData.startTime !== undefined) {
      el.src = url;
      setIsBuffering(true);
      setUserSwitches((c) => c + 1);

      // Set up event listeners for virtual chunk handling
      const onCanPlay = () => {
        el.currentTime = stationData.startTime!;
        el.removeEventListener("canplay", onCanPlay);
      };

      const onTimeUpdate = () => {
        if (stationData.endTime && el.currentTime >= stationData.endTime) {
          el.removeEventListener("timeupdate", onTimeUpdate);
          // Auto-advance to next chunk
          nextStation();
        }
      };

      el.addEventListener("canplay", onCanPlay);
      el.addEventListener("timeupdate", onTimeUpdate);

      // Store cleanup function
      (el as any)._chunkCleanup = () => {
        el.removeEventListener("canplay", onCanPlay);
        el.removeEventListener("timeupdate", onTimeUpdate);
      };
    } else {
      // Regular audio stream
      el.src = url;
      setIsBuffering(true);
      setUserSwitches((c) => c + 1);
    }

    // Add a timeout to detect if stream never loads
    const timeoutId = setTimeout(() => {
      if (isBuffering) {
        console.warn("Stream timeout - trying fallback stream");
        setIsBuffering(false);
        tryFallbackStream();
      }
    }, 10000); // 10 second timeout

    if (isPlaying) {
      el.play()
        .then(() => {
          clearTimeout(timeoutId);
          setIsBuffering(false);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          setError("Playback failed on station change");
          setIsBuffering(false);
        });
    } else {
      // If not playing, clear timeout when canplay event fires
      const onCanPlay = () => {
        clearTimeout(timeoutId);
        el.removeEventListener("canplay", onCanPlay as any);
      };
      el.addEventListener("canplay", onCanPlay as any);
    }
  };

  const nextStation = () => {
    const el = audioRef.current;
    if (!el) return;

    // Simple 3-minute skip forward
    const currentTime = el.currentTime || 0;
    const newTime = currentTime + 180; // 3 minutes = 180 seconds
    const maxTime = el.duration || 3000; // 50 minutes max

    if (newTime < maxTime) {
      el.currentTime = newTime;
      console.log(
        `Skipped to ${Math.floor(newTime / 60)}:${String(
          Math.floor(newTime % 60)
        ).padStart(2, "0")}`
      );
    } else {
      // If we're near the end, go back to beginning
      el.currentTime = 0;
      console.log("Reached end, restarting from beginning");
    }
  };

  const prevStation = () => {
    const el = audioRef.current;
    if (!el) return;

    // Simple 3-minute skip backward
    const currentTime = el.currentTime || 0;
    const newTime = Math.max(0, currentTime - 180); // 3 minutes = 180 seconds

    el.currentTime = newTime;
    console.log(
      `Skipped back to ${Math.floor(newTime / 60)}:${String(
        Math.floor(newTime % 60)
      ).padStart(2, "0")}`
    );
  };

  // Load Safari Radio immediately and start playing
  const loadSafariRadio = () => {
    setStationsLoading(true);
    setError(null);

    // Create the Safari Radio station
    const safariRadioStation: StationRB = {
      id: "safari-radio-main",
      name: "Safari Radio - Full Experience",
      url: "/radio/radio.mp3",
      urlResolved: "/radio/radio.mp3",
      country: "Safari Africa",
      countryCode: "SA",
      tags: ["safari", "african", "music", "radio"],
      favicon: "/safari-bg/safari.png",
      bitrate: 128,
      language: ["English", "Swahili", "French"],
      lastCheckOk: true,
      clickCount: 10000,
      source: "safari-radio",
      startTime: 0,
      endTime: 3000, // 50 minutes
      duration: 3000,
      virtual: false,
      chunkIndex: 0,
    };

    // Set the station and start playing immediately
    setStations([safariRadioStation]);
    setCurrentStationId(safariRadioStation.id);
    setStation(safariRadioStation.urlResolved);
    setIsPlaying(true); // Auto-play
    setStationsLoading(false);
  };

  useEffect(() => {
    // Load Safari Radio immediately when component mounts
    loadSafariRadio();
  }, []);

  // Auto-play when station is set and isPlaying is true
  useEffect(() => {
    const el = audioRef.current;
    if (el && station && isPlaying) {
      el.play().catch((err) => {
        console.log(
          "Auto-play prevented by browser, user interaction required"
        );
        setIsPlaying(false);
      });
    }
  }, [station, isPlaying]);

  // Tune In functions
  const handleCountrySelect = async (
    country: string,
    emoji: string,
    username: string
  ) => {
    console.log("🎵 Country selected:", country, emoji, "Username:", username);

    setUserCountry(country);
    setUserCountryEmoji(emoji);
    setShowCountrySelector(false);

    try {
      console.log("🔥 Attempting to connect to Firebase...");
      console.log("Database instance:", database);
      console.log("User ID:", userId);

      // Add user to Firebase Realtime Database
      const userRef = ref(database, `tunedInUsers/${userId}`);
      console.log("📍 User reference created:", userRef);

      const userData = {
        id: userId,
        country,
        countryEmoji: emoji,
        username: username,
        joinedAt: Date.now(),
      };

      console.log("📝 Writing user data:", userData);

      // Write user data to Firebase
      await set(userRef, userData);

      console.log("✅ Successfully tuned in!");
      setIsTunedIn(true);
    } catch (error: any) {
      console.error("❌ Failed to tune in:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });

      // Show user-friendly error
      alert(
        `Failed to tune in: ${
          error.message || "Unknown error"
        }. Please check the console for details.`
      );
    }
  };

  const handleTuneOut = async () => {
    try {
      // Remove user from Firebase Realtime Database
      const userRef = ref(database, `tunedInUsers/${userId}`);
      await remove(userRef);

      setIsTunedIn(false);
      setUserCountry("");
      setUserCountryEmoji("");
    } catch (error) {
      console.error("Failed to tune out:", error);
    }
  };

  const sendEmojiReaction = async (emoji: string) => {
    if (!userId) return;
    try {
      const reactionId = `reaction_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const reactionData = {
        id: reactionId,
        emoji,
        userId,
        username: userCountry ? userCountry : "Anonymous",
        timestamp: serverTimestamp(),
        // Random position for 3D placement
        position: {
          x: (Math.random() - 0.5) * 10,
          y: Math.random() * 2 + 1,
          z: (Math.random() - 0.5) * 8 + 3,
        },
      };

      await set(ref(database, `liveReactions/${reactionId}`), reactionData);

      // Auto-remove reaction after 5 seconds
      setTimeout(async () => {
        try {
          await remove(ref(database, `liveReactions/${reactionId}`));
        } catch (error) {
          console.error("Error removing reaction:", error);
        }
      }, 5000);
    } catch (error) {
      console.error("Error sending emoji reaction:", error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTunedIn) {
        handleTuneOut();
      }
    };
  }, [isTunedIn]);

  // Sync Firebase listeners with 3D state
  useEffect(() => {
    const tunedInRef = ref(database, "tunedInUsers");

    const unsubscribe = onValue(tunedInRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const users = Object.values(data) as any[];
        // Sort by most recent first and limit to 20 for 3D performance
        const sortedUsers = users
          .sort((a, b) => b.joinedAt - a.joinedAt)
          .slice(0, 20); // Limit to 20 avatars for performance
        setListeners3D(sortedUsers);
      } else {
        setListeners3D([]);
      }
    });

    return () => {
      off(tunedInRef, "value", unsubscribe);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-200 hover:text-white"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-300">Country:</span>
            <span className="font-semibold text-white">{countryId}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!isTunedIn ? (
              <button
                onClick={() => setShowCountrySelector(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold flex items-center gap-2 transition-all duration-200"
                title="Tune In to Safari Radio"
              >
                🎧 Tune In
              </button>
            ) : (
              <button
                onClick={handleTuneOut}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-semibold flex items-center gap-2 transition-all duration-200"
                title="Tune Out"
              >
                {userCountryEmoji} Tuned In
              </button>
            )}
          </div>
          {/* Top-left live info based on real data */}
          <div className="w-full mt-2 flex items-center gap-3 text-xs text-white/80">
            <div className="px-2 py-1 rounded bg-white/10 border border-white/10">
              Top: {topByClicks?.name || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* 3D World */}
      <Canvas className="w-full h-full">
        <DJWorld bundle={bundle} listeners={listeners3D} />
      </Canvas>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={station}
        crossOrigin="anonymous"
        preload="none"
      />

      {/* Controls - Premium Deck */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] md:w-[860px]">
        <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl p-4 md:p-5">
          {/* Top row: Transport + Now Playing + Volume */}
          <div className="flex items-center justify-between gap-4">
            {/* Transport */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={prevStation}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/60 text-gray-100 flex items-center justify-center border border-white/10"
                title="Skip 3 minutes backward"
              >
                <span className="text-lg">⏮</span>
              </button>
              <button
                onClick={togglePlay}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white flex items-center justify-center shadow-lg"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isBuffering ? (
                  <svg
                    className="w-6 h-6 animate-spin"
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
                ) : (
                  <span className="text-xl md:text-2xl">
                    {isPlaying ? "⏸" : "▶"}
                  </span>
                )}
              </button>
              <button
                onClick={nextStation}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/60 text-gray-100 flex items-center justify-center border border-white/10"
                title="Skip 3 minutes forward"
              >
                <span className="text-lg">⏭</span>
              </button>
            </div>

            {/* Now Playing */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-black/30 border border-white/10 overflow-hidden flex items-center justify-center">
                  {currentStation?.favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentStation.favicon}
                      alt="logo"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span className="text-xs text-white/70">🎵</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm md:text-base text-white font-semibold truncate">
                    {currentStation?.name || "Live Radio"}
                  </div>
                  <div className="text-xs text-white/70 truncate">
                    {flagFromCode(currentStation?.countryCode)}{" "}
                    {currentStation?.country || "Global"}
                    {currentStation?.bitrate
                      ? ` · ${currentStation.bitrate}kbps`
                      : ""}
                    {currentStation?.source === "safari-radio" &&
                      " · Safari Radio"}
                    {currentStation?.source === "african-radio" &&
                      " · African Radio"}
                  </div>
                </div>
              </div>
            </div>

            {/* Volume/Mute */}
            <div className="flex items-center gap-2 text-sm text-gray-200">
              <button
                onClick={() => setMuted((m) => !m)}
                className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-center"
                title={muted ? "Unmute" : "Mute"}
              >
                <span>
                  {muted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
                </span>
              </button>
              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="accent-indigo-400"
              />
            </div>
          </div>

          {/* Safari Radio Info */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-gray-300 text-xs">🎵 Safari Radio</span>
            <span className="text-gray-400 text-xs">
              • 50 minutes of African vibes
            </span>
          </div>

          {/* Bottom row: Stations carousel */}
          <div className="mt-3 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20">
            <div className="flex gap-2 min-w-full">
              {stationsLoading && (
                <div className="text-xs text-white/70 px-2 py-1">
                  Loading stations…
                </div>
              )}

              {stations.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    // Clean up previous chunk listeners
                    const el = audioRef.current;
                    if (el && (el as any)._chunkCleanup) {
                      (el as any)._chunkCleanup();
                    }
                    setCurrentStationId(s.id);
                    changeStation(s.urlResolved, s);
                  }}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                    s.id === currentStationId
                      ? "bg-white/15 border-white/30"
                      : "bg-black/25 border-white/10 hover:bg-black/45"
                  }`}
                  title={s.name}
                >
                  <div className="w-8 h-8 rounded-md bg-black/40 overflow-hidden flex items-center justify-center">
                    {s.favicon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.favicon}
                        alt="icon"
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : (
                      <span className="text-[11px]">🎶</span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-white font-medium truncate max-w-[140px]">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-white/60">
                      {flagFromCode(s.countryCode)}{" "}
                      {s.bitrate ? `${s.bitrate}kbps` : ``}
                      {s.source === "safari-radio" && " · Safari Radio"}
                      {s.source === "african-radio" && " · African Radio"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {(isBuffering || error) && (
            <div className="mt-2 text-xs flex items-center gap-2">
              {isBuffering && (
                <span className="text-white/80">Connecting…</span>
              )}
              {error && <span className="text-red-300">{error}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Listeners panel */}
      <div className="absolute top-20 right-4 z-10 w-64">
        <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 text-sm text-white/90 font-semibold mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Listeners
          </div>
          <TuneInList />
        </div>
      </div>

      {/* Country Selector Modal */}
      {showCountrySelector && (
        <CountrySelector
          onCountrySelect={handleCountrySelect}
          onClose={() => setShowCountrySelector(false)}
        />
      )}
    </div>
  );
}
