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
import {
  listAllTokens,
  getOwnershipHistory,
  myCollectedWithData,
  collect,
  mintNft,
  listMyMinted,
  type TokenData,
} from "../lib/safariverse-nft";
import { WalletProvider, useWallet } from "../lib/wallet-provider";
import WalletModal from "../components/WalletModal";
import { ArrowLeft, X, Share2, Plus } from "lucide-react";

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

export default function NftPage() {
  return (
    <WalletProvider>
      <NftPageContent />
      <WalletModal />
    </WalletProvider>
  );
}

function NftPageContent() {
  const router = useRouter();
  const { wallet, openModal } = useWallet();
  const [selected, setSelected] = useState<NftItem | null>(null);
  const [showMintModal, setShowMintModal] = useState(false);
  const modalOpen = !!selected;
  const [account, setAccount] = useState<string | null>(null);
  const [items, setItems] = useState<NftItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [myItems, setMyItems] = useState<NftItem[]>([]);
  const [myCreatedItems, setMyCreatedItems] = useState<NftItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    "marketplace" | "my-nfts" | "my-created"
  >("marketplace");

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

  // Load NFTs from the smart contract (public RPC, no wallet required)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await listAllTokens();
        if (!mounted) return;
        const toItems: NftItem[] = res.data
          .filter((d) => {
            const url = (d.fileUrl || "").trim();
            const hasValidUrl =
              url && url.length > 0 && url.toLowerCase().endsWith(".glb");
            console.log("NFT data:", {
              title: d.title,
              fileUrl: d.fileUrl,
              hasUrl: !!d.fileUrl,
              urlLength: url.length,
              isEmpty: url === "",
              hasValidUrl,
            });
            return hasValidUrl;
          })
          .map((d) => ({
            title: d.title || "Untitled NFT",
            src: `/api/glb?url=${encodeURIComponent(d.fileUrl)}`,
            description: d.description || "",
          }));
        setItems(toItems);
      } catch (e) {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
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

  // Load created NFTs when switching to my-created tab
  useEffect(() => {
    if (activeTab === "my-created" && account && myCreatedItems.length === 0) {
      (async () => {
        try {
          const res = await listMyMinted();
          const created: NftItem[] = res.data
            .filter((d) => {
              const url = (d.fileUrl || "").trim();
              return (
                url && url.length > 0 && url.toLowerCase().endsWith(".glb")
              );
            })
            .map((d) => ({
              title: d.title || "Untitled NFT",
              src: `/api/glb?url=${encodeURIComponent(d.fileUrl)}`,
              description: d.description || "",
            }));
          setMyCreatedItems(created);
        } catch (e) {
          console.error("Failed to load created NFTs:", e);
        }
      })();
    }
  }, [activeTab, account, myCreatedItems.length]);
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
          <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "marketplace"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                  : "text-orange-200 hover:text-white hover:bg-white/10"
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab("my-nfts")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "my-nfts"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                  : "text-orange-200 hover:text-white hover:bg-white/10"
              }`}
            >
              My NFTs
            </button>
            <button
              onClick={() => setActiveTab("my-created")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "my-created"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                  : "text-orange-200 hover:text-white hover:bg-white/10"
              }`}
            >
              My Artwork
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMintModal(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-3 py-2 rounded-lg text-sm font-medium hover:from-amber-600 hover:to-yellow-600 transition-colors shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add NFT
            </button>
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
          {activeTab === "marketplace" ? (
            <>
              <h2 className="text-2xl font-semibold mb-2">NFT Marketplace</h2>
              <p className="opacity-90 mb-6">
                Discover, collect, and trade 3D SafariVerse NFTs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(loading ? [] : items).map((item, idx) => (
                  <NftCard
                    key={`${item.src}-${idx}-${modalOpen ? "paused" : "live"}`}
                    title={item.title}
                    src={item.src}
                    onSelect={() => setSelected(item)}
                    disabled={modalOpen}
                  />
                ))}
                {!loading && items.length === 0 && (
                  <div className="col-span-full text-center text-yellow-100/80 text-sm">
                    No NFTs found yet.
                  </div>
                )}
                {loading && (
                  <div className="col-span-full text-center text-yellow-100/80 text-sm">
                    Loading NFTs...
                  </div>
                )}
              </div>
            </>
          ) : activeTab === "my-nfts" ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">My NFTs</h2>
                  <p className="opacity-90">
                    Your collected NFTs from the SafariVerse ecosystem.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await myCollectedWithData();
                      const mine: NftItem[] = res.data
                        .filter((d) => {
                          const url = (d.fileUrl || "").trim();
                          return (
                            url &&
                            url.length > 0 &&
                            url.toLowerCase().endsWith(".glb")
                          );
                        })
                        .map((d) => ({
                          title: d.title || "Untitled NFT",
                          src: `/api/glb?url=${encodeURIComponent(d.fileUrl)}`,
                          description: d.description || "",
                        }));
                      setMyItems(mine);
                    } catch {}
                  }}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>
              {!account ? (
                <div className="text-center py-12">
                  <p className="text-amber-200 mb-4">
                    Connect your wallet to view your NFTs
                  </p>
                  <button
                    onClick={connectWallet}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-colors shadow"
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : myItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-amber-200">No NFTs collected yet</p>
                  <p className="text-amber-300 text-sm mt-2">
                    Visit the Marketplace to collect your first NFT
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myItems.map((item, idx) => (
                    <NftCard
                      key={`my-${item.src}-${idx}-${
                        modalOpen ? "paused" : "live"
                      }`}
                      title={item.title}
                      src={item.src}
                      onSelect={() => setSelected(item)}
                      disabled={modalOpen}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">My Artwork</h2>
                  <p className="opacity-90">
                    NFTs you've created and minted on SafariVerse.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await listMyMinted();
                      const created: NftItem[] = res.data
                        .filter((d) => {
                          const url = (d.fileUrl || "").trim();
                          return (
                            url &&
                            url.length > 0 &&
                            url.toLowerCase().endsWith(".glb")
                          );
                        })
                        .map((d) => ({
                          title: d.title || "Untitled NFT",
                          src: `/api/glb?url=${encodeURIComponent(d.fileUrl)}`,
                          description: d.description || "",
                        }));
                      setMyCreatedItems(created);
                    } catch {}
                  }}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>
              {!account ? (
                <div className="text-center py-12">
                  <p className="text-amber-200 mb-4">
                    Connect your wallet to view your created NFTs
                  </p>
                  <button
                    onClick={connectWallet}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-colors shadow"
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : myCreatedItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-amber-200">No NFTs created yet</p>
                  <p className="text-amber-300 text-sm mt-2">
                    Use the "Add NFT" button to create your first NFT
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myCreatedItems.map((item, idx) => (
                    <NftCard
                      key={`created-${item.src}-${idx}-${
                        modalOpen ? "paused" : "live"
                      }`}
                      title={item.title}
                      src={item.src}
                      onSelect={() => setSelected(item)}
                      disabled={modalOpen}
                    />
                  ))}
                </div>
              )}
            </>
          )}
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
                    {(() => {
                      const saved = myItems.some((i) => i.src === selected.src);
                      const Button = (
                        <button
                          onClick={async () => {
                            if (saved) return;
                            try {
                              const catalog = await listAllTokens();
                              const original = (selected as any).src.startsWith(
                                "/api/glb"
                              )
                                ? decodeURIComponent(
                                    (selected as any).src.split("url=")[1]
                                  )
                                : (selected as any).src;
                              const idx = catalog.data.findIndex(
                                (d) => d.fileUrl === original
                              );
                              if (idx === -1) {
                                alert("NFT not found in catalog");
                                return;
                              }
                              const tokenId = catalog.tokenIds[idx];
                              const txHash = await collect(tokenId);
                              alert(`Saved to My NFTs! Tx: ${txHash}`);
                              try {
                                const res = await myCollectedWithData();
                                const mine: NftItem[] = res.data
                                  .filter((d) => {
                                    const url = (d.fileUrl || "").trim();
                                    return (
                                      url &&
                                      url.length > 0 &&
                                      url.toLowerCase().endsWith(".glb")
                                    );
                                  })
                                  .map((d) => ({
                                    title: d.title || "Untitled NFT",
                                    src: `/api/glb?url=${encodeURIComponent(
                                      d.fileUrl
                                    )}`,
                                    description: d.description || "",
                                  }));
                                setMyItems(mine);
                              } catch {}
                            } catch (e: any) {
                              alert(`Save failed: ${e?.message || String(e)}`);
                            }
                          }}
                          disabled={saved}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-colors shadow disabled:opacity-60"
                        >
                          {saved ? "Owned NFT" : "Save to My NFTs"}
                        </button>
                      );
                      return Button;
                    })()}
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

      {/* Mint NFT Modal */}
      {showMintModal && (
        <MintNftModal
          onClose={() => setShowMintModal(false)}
          onMintSuccess={() => {
            setShowMintModal(false);
            // Refresh the items list
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function MintNftModal({
  onClose,
  onMintSuccess,
}: {
  onClose: () => void;
  onMintSuccess: () => void;
}) {
  const { wallet, openModal } = useWallet();
  const [fileUrl, setFileUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceEth, setPriceEth] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onMint = async () => {
    try {
      if (!wallet?.evmAddress) {
        openModal();
        return;
      }
      if (!fileUrl || !title) {
        setStatus("Please provide at least file URL and title");
        return;
      }
      setLoading(true);
      setStatus("Minting...");
      const res = await mintNft({ fileUrl, title, description, priceEth });
      setStatus(`Minted! Tx: ${res.txHash}`);
      setTimeout(() => {
        onMintSuccess();
      }, 2000);
    } catch (e: any) {
      setStatus(`Error: ${e?.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-2xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-amber-300 transition-colors z-10"
        >
          <X className="w-8 h-8" />
        </button>
        <div className="bg-black/70 border border-amber-500/30 rounded-2xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-yellow-100 mb-4">
              Create New NFT
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  File URL (.glb or media)
                </label>
                <input
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://.../model.glb"
                  className="w-full rounded-lg border border-amber-500/30 bg-black/40 text-orange-100 px-3 py-2 text-sm placeholder-orange-300/60 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My 3D NFT"
                  className="w-full rounded-lg border border-amber-500/30 bg-black/40 text-orange-100 px-3 py-2 text-sm placeholder-orange-300/60 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description..."
                  className="w-full rounded-lg border border-amber-500/30 bg-black/40 text-orange-100 px-3 py-2 text-sm placeholder-orange-300/60 focus:border-amber-400 focus:outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Price (HBAR, 18 decimals)
                </label>
                <input
                  value={priceEth}
                  onChange={(e) => setPriceEth(e.target.value)}
                  placeholder="0.0"
                  className="w-full rounded-lg border border-amber-500/30 bg-black/40 text-orange-100 px-3 py-2 text-sm placeholder-orange-300/60 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-orange-200 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onMint}
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-colors shadow disabled:opacity-50"
                >
                  {loading
                    ? "Minting..."
                    : wallet?.evmAddress
                    ? "Mint NFT"
                    : "Connect to Mint"}
                </button>
              </div>
              {status && (
                <div className="mt-4 p-3 rounded-lg bg-black/40 border border-amber-500/30">
                  <p className="text-sm text-orange-200">{status}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
