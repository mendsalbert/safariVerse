"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { RadioBrowserApi, StationSearchType } from "radio-browser-api";

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

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;

    // Animate DJ
    if (djRef.current) {
      djRef.current.position.y = 2.0 + Math.sin(t * 2) * 0.05;
      djRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }

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

      {/* Audience/Crowd area in front of stage */}
      <Crowd bundle={bundle} />

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

function Crowd({ bundle }: { bundle: AnalyserBundle }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const children = groupRef.current.children;
    let avg = 0.6;
    if (bundle.analyser && bundle.data) {
      const arr = new Uint8Array(bundle.data);
      bundle.analyser.getByteFrequencyData(arr);
      avg = arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);
      avg = THREE.MathUtils.mapLinear(avg, 0, 255, 0.8, 1.3);
    }
    children.forEach((g, i) => {
      g.position.y =
        0.6 + Math.abs(Math.sin(t * (1 + (i % 5) * 0.1) + i)) * 0.1 * avg;
    });
  });
  // Simple stick-figure crowd grid
  const crowd: any[] = [];
  for (let x = -6; x <= 6; x += 2) {
    for (let z = 1; z <= 7; z += 2) {
      crowd.push(
        <group key={`c-${x}-${z}`} position={[x, 0.6, z]}>
          {/* body */}
          <mesh>
            <cylinderGeometry args={[0.12, 0.15, 0.6, 8]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          {/* head */}
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </group>
      );
    }
  }
  return <group ref={groupRef}>{crowd}</group>;
}

function DJWorld({ bundle }: { bundle: AnalyserBundle }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 6, 14]} fov={70} />
      <ambientLight intensity={0.6} color={0x404040} />
      <Ground />
      <DJStage bundle={bundle} />
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
  const [station, setStation] = useState(
    "https://stream.zeno.fm/0f5t9t4p7k0uv"
  );
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

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
  };

  const [stations, setStations] = useState<StationRB[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [tagFilter, setTagFilter] = useState("afrobeats");
  const currentStation = useMemo(
    () => stations.find((s) => s.urlResolved === station) || null,
    [stations, station]
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
    const cc = code.toUpperCase();
    return String.fromCodePoint(
      ...[...cc].map((c) => 127397 + c.charCodeAt(0))
    );
  };

  const bundle: AnalyserBundle = useMemo(
    () => ({ analyser: null, data: null }),
    []
  );

  // Participants (tune-in) - simple local presence placeholder
  type Participant = { id: string; name: string; joinedAt: number };
  const [participants, setParticipants] = useState<Participant[]>([]);
  const addMeAsParticipant = () => {
    const my = {
      id: "me",
      name: "You",
      joinedAt: Date.now(),
    };
    setParticipants((prev) => {
      if (prev.some((p) => p.id === my.id)) return prev;
      return [my, ...prev];
    });
  };

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
    const onError = () => {
      setIsBuffering(false);
      setError("Stream error");
    };
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("canplay", onCanPlay as any);
    el.addEventListener("playing", onPlaying as any);
    el.addEventListener("stalled", onStalled as any);
    el.addEventListener("error", onError as any);
    return () => {
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("canplay", onCanPlay as any);
      el.removeEventListener("playing", onPlaying as any);
      el.removeEventListener("stalled", onStalled as any);
      el.removeEventListener("error", onError as any);
    };
  }, []);

  const setupAnalyser = async () => {
    try {
      const el = audioRef.current;
      if (!el) return;
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
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
        if (!bundle.analyser) await setupAnalyser();
      } else {
        el.pause();
        setIsPlaying(false);
        setIsBuffering(false);
      }
    } catch (e: any) {
      setError("Failed to start playback (CORS or autoplay blocked)");
      setIsBuffering(false);
    }
  };

  const changeStation = (url: string) => {
    const el = audioRef.current;
    if (!el) return;
    setStation(url);
    el.src = url;
    setIsBuffering(true);
    setUserSwitches((c) => c + 1);
    if (isPlaying) {
      el.play()
        .then(() => setIsBuffering(false))
        .catch(() => {
          setError("Playback failed on station change");
          setIsBuffering(false);
        });
    }
  };

  const nextStation = () => {
    if (!stations.length) return;
    const idx = Math.max(
      0,
      stations.findIndex((s) => s.urlResolved === station)
    );
    const next = stations[(idx + 1) % stations.length];
    changeStation(next.urlResolved);
  };

  const prevStation = () => {
    if (!stations.length) return;
    const idx = Math.max(
      0,
      stations.findIndex((s) => s.urlResolved === station)
    );
    const prev = stations[(idx - 1 + stations.length) % stations.length];
    changeStation(prev.urlResolved);
  };

  // Radio Browser API (no external lib) - fetch stations by tag and country name
  const fetchStations = async (tag: string, countryName: string) => {
    try {
      setStationsLoading(true);
      setError(null);
      const api = new RadioBrowserApi("SafariVerse Radio");
      // Try tag + country, then tag-only
      let results = await api.searchStations({
        tag,
        country: countryName || undefined,
        hideBroken: true,
        limit: 50,
        order: "clickCount",
        reverse: true,
      });
      if (!results || results.length === 0) {
        results = await api.searchStations({
          tag,
          hideBroken: true,
          limit: 50,
          order: "clickCount",
          reverse: true,
        });
      }

      const mapped: StationRB[] = (results || []).map((d: any) => ({
        id: d.id ?? d.stationuuid ?? crypto.randomUUID(),
        name: d.name,
        url: d.url,
        urlResolved: d.urlResolved ?? d.url_resolved ?? d.url,
        country: d.country,
        countryCode: d.countryCode ?? d.countrycode ?? "",
        tags: Array.isArray(d.tags)
          ? d.tags
          : (d.tags || "").split(",").map((t: string) => t.trim()),
        favicon: d.favicon,
        bitrate: d.bitrate ?? 0,
        language: Array.isArray(d.language)
          ? d.language
          : (d.language || "").split(",").map((t: string) => t.trim()),
        lastCheckOk: Boolean(d.lastCheckOk ?? d.lastcheckok ?? true),
        clickCount: d.clickCount ?? d.clickcount ?? 0,
      }));
      // Prefer entries with resolved URL
      const filtered = mapped.filter((s) => !!s.urlResolved);
      setStations(filtered);
      // If nothing selected yet, pick first
      if (filtered.length > 0) {
        changeStation(filtered[0].urlResolved);
      }
    } catch (e: any) {
      setError("Could not load stations from Radio Browser");
    } finally {
      setStationsLoading(false);
    }
  };

  useEffect(() => {
    // Capitalize country name from slug (fallback to empty to search broadly)
    const prettyCountry = countryId
      ? countryId
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "";
    fetchStations(tagFilter, prettyCountry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId, tagFilter]);

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
            <button
              onClick={addMeAsParticipant}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
              title="Tune In"
            >
              Tune In
            </button>
          </div>
          {/* Top-left live info based on real data */}
          <div className="w-full mt-2 flex items-center gap-3 text-xs text-white/80">
            <div className="px-2 py-1 rounded bg-white/10 border border-white/10">
              Top: {topByClicks?.name || "—"}
            </div>
            <div className="px-2 py-1 rounded bg-white/10 border border-white/10">
              Switches: {userSwitches}
            </div>
            <div className="px-2 py-1 rounded bg-white/10 border border-white/10">
              Results: {stations.length}
              {stationsLoading ? " (loading)" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* 3D World */}
      <Canvas className="w-full h-full">
        <DJWorld bundle={bundle} />
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
                title="Previous station"
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
                title="Next station"
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

          {/* Middle row: Tag & quick chips */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-xs">Tag:</span>
              <input
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                placeholder="afrobeats, afro, jazz"
                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-gray-200 w-40"
              />
            </div>
            {[
              "afrobeats",
              "afro",
              "amapiano",
              "highlife",
              "afrobeat",
              "afro-house",
            ].map((tg) => (
              <button
                key={tg}
                onClick={() => setTagFilter(tg)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  tagFilter === tg
                    ? "bg-indigo-600/80 text-white border-indigo-400/40"
                    : "bg-black/30 text-gray-200 border-white/10 hover:bg-black/50"
                }`}
              >
                #{tg}
              </button>
            ))}
          </div>

          {/* Bottom row: Stations carousel */}
          <div className="mt-3 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20">
            <div className="flex gap-2 min-w-full">
              {stationsLoading && (
                <div className="text-xs text-white/70 px-2 py-1">
                  Loading stations…
                </div>
              )}
              {!stationsLoading && stations.length === 0 && (
                <div className="text-xs text-white/70 px-2 py-1">
                  No results. Try another tag.
                </div>
              )}
              {stations.map((s) => (
                <button
                  key={s.id}
                  onClick={() => changeStation(s.urlResolved)}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                    s.urlResolved === station
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

      {/* Participants panel */}
      <div className="absolute top-20 right-4 z-10 w-64">
        <div className="bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-3">
          <div className="text-sm text-white/90 font-semibold mb-2">
            Listeners
          </div>
          {participants.length === 0 ? (
            <div className="text-xs text-white/60">
              No listeners yet. Hit "Tune In" to join.
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-auto">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 text-xs text-white/90"
                >
                  <span>🎧</span>
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
