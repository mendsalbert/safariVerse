"use client";

import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  useGLTF,
  Bounds,
  Center,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, X, Share2 } from "lucide-react";

function NftModel({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  const groupRef = useRef(null);
  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function NftCard({
  title,
  src,
  onSelect,
  disabled,
}: {
  title: string;
  src: string;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="bg-black/50 border border-amber-500/20 rounded-xl overflow-hidden cursor-pointer hover:border-amber-400/40 transition-colors"
      onClick={onSelect}
    >
      <div className="h-48 w-full">
        {disabled ? (
          <div className="h-full w-full flex items-center justify-center text-yellow-100 text-xs opacity-80">
            Preview paused
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 0, 2.2], fov: 45 }}
            dpr={[1, 1]}
            gl={{
              antialias: true,
              powerPreference: "low-power",
              preserveDrawingBuffer: true,
            }}
            onCreated={({ gl }) => {
              const canvas =
                (gl.getContext && gl.getContext())?.canvas ||
                (gl as any).domElement;
              canvas?.addEventListener?.(
                "webglcontextlost",
                (e: any) => e.preventDefault(),
                false
              );
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} color="#FF8C00" />
              <directionalLight
                position={[2, 3, 2]}
                intensity={1.2}
                color="#FF6B35"
              />
              <directionalLight
                position={[-2, 1, -2]}
                intensity={0.6}
                color="#FFD700"
              />
              <Environment preset="sunset" />
              <Bounds fit clip observe margin={1.15}>
                <group scale={[0.95, 0.95, 0.95]}>
                  <Center>
                    <NftModel src={src} />
                  </Center>
                </group>
              </Bounds>
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                autoRotate
                autoRotateSpeed={1}
              />
            </Suspense>
          </Canvas>
        )}
      </div>
      <div className="px-4 py-3 text-yellow-100 border-t border-amber-500/20">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs opacity-80">SafariVerse NFT</div>
      </div>
    </div>
  );
}

type NftItem = { title: string; src: string; description: string };
const NFT_ITEMS: NftItem[] = [
  {
    title: "Lion",
    src: "/models/animalss/Lion.glb",
    description:
      "The lion is known as the king of the savanna, symbolizing strength and leadership. Its majestic roar can be heard up to 8 kilometers away.",
  },
  {
    title: "Giraffe",
    src: "/models/animalss/Giraffe.glb",
    description:
      "Giraffes are the tallest land animals, using their long necks to browse treetops. Their unique coat patterns are as individual as fingerprints.",
  },
  {
    title: "Elephant",
    src: "/models/animalss/Elephant.glb",
    description:
      "African elephants are gentle giants with remarkable memory and social bonds. Their trunks have over 40,000 muscles and incredible dexterity.",
  },
  {
    title: "Zebra",
    src: "/models/animalss/Zebra.glb",
    description:
      "Zebras’ bold black-and-white stripes help confuse predators and regulate body heat. No two zebras have the same stripe pattern.",
  },
  {
    title: "Gazelle",
    src: "/models/animalss/Gazelle.glb",
    description:
      "Gazelles are agile antelopes famed for their speed and grace. They can make quick, bounding leaps to evade predators on the plains.",
  },
  {
    title: "Hippopotamus",
    src: "/models/animalss/Hippopotamus.glb",
    description:
      "Hippos spend much of their day in water to stay cool under the sun. Despite their size, they can run surprisingly fast on land.",
  },
  {
    title: "Bird",
    src: "/models/animalss/bird.glb",
    description:
      "Birds add music to the savanna, pollinating plants and dispersing seeds. Their keen vision helps them spot food and avoid danger.",
  },
  {
    title: "Hummingbird",
    src: "/models/animalss/Hummingbird.glb",
    description:
      "Hummingbirds hover with rapid wingbeats and sip nectar with precision. They play a vital role in pollination across many ecosystems.",
  },
];

export default function NftPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<NftItem | null>(null);
  const modalOpen = !!selected;
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const ethereum = (window as any)?.ethereum;
    if (!ethereum) return;
    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
    };
    ethereum
      .request?.({ method: "eth_accounts" })
      .then(handleAccountsChanged)
      .catch(() => {});
    ethereum.on?.("accountsChanged", handleAccountsChanged);
    return () => {
      ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    const ethereum = (window as any)?.ethereum;
    if (!ethereum) {
      alert("MetaMask not detected. Please install MetaMask to continue.");
      return;
    }
    try {
      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
    } catch (e) {}
  };

  const disconnectWallet = () => setAccount(null);
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
      <div className="absolute top-0 left-0 right-0 z-30 bg-black/40 backdrop-blur-lg border-b border-amber-500/30 pointer-events-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> SafariVerse
          </button>
          <h1 className="font-display text-3xl bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent">
            NFT Marketplace
          </h1>
          <div className="flex items-center gap-3">
            {account && (
              <span className="hidden sm:inline text-yellow-100 text-xs">
                {account.slice(0, 6)}…{account.slice(-4)}
              </span>
            )}
            <button
              onClick={account ? disconnectWallet : connectWallet}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-colors shadow"
            >
              {account ? "Disconnect" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-0 flex items-start justify-center p-6 pt-20">
        <div className="bg-black/60 backdrop-blur-lg p-6 rounded-2xl border border-amber-500/30 text-orange-100 max-w-6xl w-full">
          <h2 className="text-2xl font-semibold mb-2">NFT Marketplace</h2>
          <p className="opacity-90 mb-6">
            Discover, collect, and trade 3D SafariVerse NFTs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NFT_ITEMS.map((item) => (
              <NftCard
                key={`${item.title}-${modalOpen ? "paused" : "live"}`}
                title={item.title}
                src={item.src}
                onSelect={() => setSelected(item)}
                disabled={modalOpen}
              />
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-12 right-0 text-white hover:text-amber-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-black/70 border border-amber-500/30 rounded-2xl overflow-hidden">
              <div className="h-80 w-full">
                <Canvas
                  camera={{ position: [0, 0, 3], fov: 45 }}
                  dpr={[1, 1]}
                  gl={{
                    antialias: true,
                    powerPreference: "low-power",
                    preserveDrawingBuffer: true,
                  }}
                  onCreated={({ gl }) => {
                    const canvas =
                      (gl.getContext && gl.getContext())?.canvas ||
                      (gl as any).domElement;
                    canvas?.addEventListener?.(
                      "webglcontextlost",
                      (e: any) => e.preventDefault(),
                      false
                    );
                  }}
                >
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.6} color="#FF8C00" />
                    <directionalLight
                      position={[2, 3, 2]}
                      intensity={1.2}
                      color="#FF6B35"
                    />
                    <directionalLight
                      position={[-2, 1, -2]}
                      intensity={0.6}
                      color="#FFD700"
                    />
                    <Environment preset="sunset" />
                    <Bounds fit clip observe margin={1.1}>
                      <group scale={[1.05, 1.05, 1.05]}>
                        <Center>
                          <NftModel src={selected.src} />
                        </Center>
                      </group>
                    </Bounds>
                    <OrbitControls
                      enablePan={false}
                      enableZoom
                      autoRotate
                      autoRotateSpeed={0.8}
                    />
                  </Suspense>
                </Canvas>
              </div>
              <div className="p-4 text-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-yellow-100">
                    {selected.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert("Mint coming soon")}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-colors shadow"
                    >
                      Mint
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (navigator.share) {
                            await navigator.share({
                              title: selected.title,
                              url: window.location.href,
                            });
                          } else {
                            await navigator.clipboard.writeText(
                              window.location.href
                            );
                            alert("Link copied to clipboard");
                          }
                        } catch {}
                      }}
                      className="bg-black/40 border border-amber-500/30 text-yellow-100 px-3 py-2 rounded-lg text-sm font-medium hover:bg-black/60 transition-colors flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>
                <p className="text-sm opacity-90">{selected.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
