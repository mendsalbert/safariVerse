"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Coins,
  Trophy,
  Star,
  Filter,
  Search,
  ExternalLink,
  Eye,
  Heart,
  TrendingUp,
  Clock,
  Users,
  Award,
  Zap,
} from "lucide-react";

interface MarketplaceItem {
  id: string;
  type: "TOKEN" | "NFT" | "ACHIEVEMENT";
  name: string;
  description: string;
  price: number;
  currency: "SAFARI" | "HBAR";
  seller: string;
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  image?: string;
  metadata?: {
    survivalTime?: number;
    score?: number;
    achievementType?: string;
    timestamp?: number;
  };
  stats?: {
    views: number;
    likes: number;
    offers: number;
  };
  isActive: boolean;
  createdAt: number;
}

interface GameMarketplaceProps {
  playerAccount?: string;
  playerTokenBalance?: number;
  onPurchase?: (itemId: string, price: number) => Promise<boolean>;
  onCreateListing?: (item: Partial<MarketplaceItem>) => Promise<boolean>;
}

const RARITY_COLORS = {
  common: "border-gray-400 bg-gray-100 text-gray-800",
  uncommon: "border-green-400 bg-green-100 text-green-800",
  rare: "border-blue-400 bg-blue-100 text-blue-800",
  epic: "border-purple-400 bg-purple-100 text-purple-800",
  legendary: "border-yellow-400 bg-yellow-100 text-yellow-800",
};

const RARITY_GLOW = {
  common: "shadow-gray-400/20",
  uncommon: "shadow-green-400/40",
  rare: "shadow-blue-400/40",
  epic: "shadow-purple-400/40",
  legendary: "shadow-yellow-400/60 animate-pulse",
};

export default function GameMarketplace({
  playerAccount,
  playerTokenBalance = 0,
  onPurchase,
  onCreateListing,
}: GameMarketplaceProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<
    "ALL" | "TOKEN" | "NFT" | "ACHIEVEMENT"
  >("ALL");
  const [selectedRarity, setSelectedRarity] = useState<
    "ALL" | "common" | "uncommon" | "rare" | "epic" | "legendary"
  >("ALL");
  const [sortBy, setSortBy] = useState<
    "price" | "rarity" | "newest" | "popular"
  >("newest");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock marketplace data - in a real app, this would come from your blockchain/backend
  const mockItems: MarketplaceItem[] = [
    {
      id: "1",
      type: "NFT",
      name: "Safari Master Achievement #001",
      description:
        "Legendary achievement NFT for surviving over 5 minutes in the Safari Adventure game.",
      price: 50,
      currency: "SAFARI",
      seller: "0.0.123456",
      rarity: "legendary",
      image: "/nft-images/safari-master.png",
      metadata: {
        survivalTime: 320,
        score: 1250,
        achievementType: "Safari Master",
        timestamp: Date.now() - 86400000,
      },
      stats: { views: 156, likes: 23, offers: 3 },
      isActive: true,
      createdAt: Date.now() - 86400000,
    },
    {
      id: "2",
      type: "NFT",
      name: "Endurance Runner #045",
      description:
        "Epic achievement NFT for exceptional endurance in the safari wilderness.",
      price: 25,
      currency: "SAFARI",
      seller: "0.0.789012",
      rarity: "epic",
      image: "/nft-images/endurance-runner.png",
      metadata: {
        survivalTime: 195,
        score: 780,
        achievementType: "Endurance Runner",
        timestamp: Date.now() - 172800000,
      },
      stats: { views: 89, likes: 12, offers: 1 },
      isActive: true,
      createdAt: Date.now() - 172800000,
    },
    {
      id: "3",
      type: "TOKEN",
      name: "SAFARI Token Bundle",
      description:
        "100 SAFARI tokens for immediate use in games and marketplace.",
      price: 5,
      currency: "HBAR",
      seller: "0.0.345678",
      stats: { views: 234, likes: 45, offers: 0 },
      isActive: true,
      createdAt: Date.now() - 43200000,
    },
    {
      id: "4",
      type: "NFT",
      name: "Speed Demon #112",
      description: "Rare achievement NFT for high-speed survival mastery.",
      price: 15,
      currency: "SAFARI",
      seller: "0.0.456789",
      rarity: "rare",
      image: "/nft-images/speed-demon.png",
      metadata: {
        survivalTime: 145,
        score: 920,
        achievementType: "Speed Demon",
        timestamp: Date.now() - 259200000,
      },
      stats: { views: 67, likes: 8, offers: 2 },
      isActive: true,
      createdAt: Date.now() - 259200000,
    },
  ];

  // Initialize marketplace data
  useEffect(() => {
    const loadMarketplaceData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setItems(mockItems);
      setFilteredItems(mockItems);
      setLoading(false);
    };

    loadMarketplaceData();
  }, []);

  // Filter and sort items
  useEffect(() => {
    let filtered = [...items];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== "ALL") {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    // Rarity filter
    if (selectedRarity !== "ALL") {
      filtered = filtered.filter((item) => item.rarity === selectedRarity);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "rarity":
          const rarityOrder = {
            common: 1,
            uncommon: 2,
            rare: 3,
            epic: 4,
            legendary: 5,
          };
          return (
            (rarityOrder[b.rarity || "common"] || 0) -
            (rarityOrder[a.rarity || "common"] || 0)
          );
        case "popular":
          return (b.stats?.views || 0) - (a.stats?.views || 0);
        case "newest":
        default:
          return b.createdAt - a.createdAt;
      }
    });

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedType, selectedRarity, sortBy]);

  // Handle purchase
  const handlePurchase = useCallback(
    async (item: MarketplaceItem) => {
      if (!playerAccount) {
        alert("Please connect your wallet first");
        return;
      }

      if (item.currency === "SAFARI" && playerTokenBalance < item.price) {
        alert("Insufficient SAFARI tokens");
        return;
      }

      try {
        const success = await onPurchase?.(item.id, item.price);
        if (success) {
          alert("Purchase successful!");
          // Remove item from marketplace or update ownership
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        }
      } catch (error) {
        console.error("Purchase failed:", error);
        alert("Purchase failed. Please try again.");
      }
    },
    [playerAccount, playerTokenBalance, onPurchase]
  );

  // Handle create listing
  const handleCreateListing = useCallback(
    async (listingData: Partial<MarketplaceItem>) => {
      if (!playerAccount) {
        alert("Please connect your wallet first");
        return;
      }

      try {
        const success = await onCreateListing?.(listingData);
        if (success) {
          alert("Listing created successfully!");
          setShowCreateModal(false);
          // Refresh marketplace data
        }
      } catch (error) {
        console.error("Create listing failed:", error);
        alert("Failed to create listing. Please try again.");
      }
    },
    [playerAccount, onCreateListing]
  );

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Safari Marketplace
          </h1>
          <p className="text-gray-600 mt-1">
            Trade your game achievements and tokens
          </p>
        </div>
        {playerAccount && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Create Listing
          </button>
        )}
      </div>

      {/* Player Stats */}
      {playerAccount && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-gray-800">
                  {playerTokenBalance.toFixed(2)} SAFARI
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {playerAccount.substring(0, 10)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Types</option>
            <option value="NFT">NFTs</option>
            <option value="TOKEN">Tokens</option>
            <option value="ACHIEVEMENT">Achievements</option>
          </select>

          {/* Rarity Filter */}
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="rarity">Rarity: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Marketplace Items */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No items found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                item.rarity
                  ? `${RARITY_COLORS[item.rarity]} ${RARITY_GLOW[item.rarity]}`
                  : "border-gray-200"
              }`}
            >
              {/* Item Image */}
              {item.image ? (
                <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  {item.type === "NFT" ? (
                    <Trophy className="w-16 h-16 text-purple-600" />
                  ) : item.type === "TOKEN" ? (
                    <Coins className="w-16 h-16 text-yellow-600" />
                  ) : (
                    <Award className="w-16 h-16 text-blue-600" />
                  )}
                </div>
              )}

              {/* Item Content */}
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>
                  {item.rarity && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        RARITY_COLORS[item.rarity]
                      }`}
                    >
                      {item.rarity}
                    </span>
                  )}
                </div>

                {/* Metadata */}
                {item.metadata && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    {item.metadata.survivalTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(item.metadata.survivalTime / 60)}:
                        {(item.metadata.survivalTime % 60)
                          .toString()
                          .padStart(2, "0")}
                      </div>
                    )}
                    {item.metadata.score && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {item.metadata.score}
                      </div>
                    )}
                  </div>
                )}

                {/* Stats */}
                {item.stats && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.stats.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {item.stats.likes}
                      </div>
                    </div>
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                )}

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {item.currency === "SAFARI" ? (
                      <Coins className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Zap className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="font-bold text-gray-900">
                      {item.price} {item.currency}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={
                      !playerAccount ||
                      (item.currency === "SAFARI" &&
                        playerTokenBalance < item.price)
                    }
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    {!playerAccount ? "Connect Wallet" : "Buy Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create Listing
            </h2>
            <p className="text-gray-600 mb-4">
              This feature is coming soon! You'll be able to list your SAFARI
              tokens and achievement NFTs for sale.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
