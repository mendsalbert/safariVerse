"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Star,
  Filter,
  Search,
  Eye,
  Crown,
  Zap,
} from "lucide-react";

interface NFT {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category: "art" | "culture" | "history" | "music";
  rarity: "common" | "rare" | "epic" | "legendary";
  owner: string;
  likes: number;
}

const sampleNFTs: NFT[] = [
  {
    id: "1",
    name: "Ancient Kente Cloth Pattern",
    description:
      "Traditional Ghanaian Kente cloth design from the Ashanti Kingdom",
    price: 0.5,
    currency: "ETH",
    image: "/api/placeholder/300/300",
    category: "culture",
    rarity: "rare",
    owner: "KofiMansa",
    likes: 42,
  },
  {
    id: "2",
    name: "Sahara Sunset",
    description:
      "Digital art capturing the beauty of the Sahara Desert at sunset",
    price: 0.8,
    currency: "ETH",
    image: "/api/placeholder/300/300",
    category: "art",
    rarity: "epic",
    owner: "DesertDreamer",
    likes: 89,
  },
  {
    id: "3",
    name: "Mansa Musa's Crown",
    description: "Legendary crown of the richest man in history",
    price: 2.5,
    currency: "ETH",
    image: "/api/placeholder/300/300",
    category: "history",
    rarity: "legendary",
    owner: "GoldenEmpire",
    likes: 156,
  },
  {
    id: "4",
    name: "Djembe Rhythms",
    description: "Audio NFT of traditional West African drumming",
    price: 0.3,
    currency: "ETH",
    image: "/api/placeholder/300/300",
    category: "music",
    rarity: "common",
    owner: "RhythmMaster",
    likes: 23,
  },
  {
    id: "5",
    name: "Great Zimbabwe Ruins",
    description: "3D reconstruction of the ancient stone city",
    price: 1.2,
    currency: "ETH",
    image: "/api/placeholder/300/300",
    category: "history",
    rarity: "epic",
    owner: "StoneCity",
    likes: 67,
  },
  {
    id: "6",
    name: "African Mask Collection",
    description: "Traditional ceremonial masks from various tribes",
    price: 0.7,
    currency: "ETH",
    image: "/api/placeholder/300/300",
    category: "culture",
    rarity: "rare",
    owner: "MaskCollector",
    likes: 34,
  },
];

const rarityColors = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-yellow-500",
};

const rarityIcons = {
  common: Star,
  rare: Star,
  epic: Crown,
  legendary: Crown,
};

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const filteredNFTs = sampleNFTs.filter((nft) => {
    const matchesCategory =
      selectedCategory === "all" || nft.category === selectedCategory;
    const matchesRarity =
      selectedRarity === "all" || nft.rarity === selectedRarity;
    const matchesSearch =
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesRarity && matchesSearch;
  });

  const categories = [
    { id: "all", label: "All" },
    { id: "art", label: "Art" },
    { id: "culture", label: "Culture" },
    { id: "history", label: "History" },
    { id: "music", label: "Music" },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            African NFT Marketplace
          </h1>
          <p className="text-orange-700">
            Discover and trade unique African cultural artifacts
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search NFTs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-amber-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-amber-200"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredNFTs.map((nft, index) => {
              const RarityIcon = rarityIcons[nft.rarity];
              return (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedNFT(nft)}
                >
                  {/* NFT Image */}
                  <div className="relative h-48 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="w-12 h-12 text-white" />
                    </div>

                    {/* Rarity Badge */}
                    <div
                      className={`absolute top-3 right-3 ${
                        rarityColors[nft.rarity]
                      } text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
                    >
                      <RarityIcon className="w-3 h-3" />
                      {nft.rarity}
                    </div>
                  </div>

                  {/* NFT Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {nft.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {nft.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-amber-600">
                          {nft.price}
                        </span>
                        <span className="text-gray-500 font-medium">
                          {nft.currency}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{nft.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        by{" "}
                        <span className="font-medium text-amber-700">
                          {nft.owner}
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* NFT Detail Modal */}
      <AnimatePresence>
        {selectedNFT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNFT(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedNFT.name}
                  </h2>
                  <button
                    onClick={() => setSelectedNFT(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-amber-200 to-orange-300 h-64 rounded-lg flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 mb-4">
                      {selectedNFT.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-bold text-2xl text-amber-600">
                          {selectedNFT.price} {selectedNFT.currency}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Owner:</span>
                        <span className="font-medium text-amber-700">
                          {selectedNFT.owner}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="capitalize font-medium">
                          {selectedNFT.category}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Rarity:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-white text-sm font-medium ${
                            rarityColors[selectedNFT.rarity]
                          }`}
                        >
                          {selectedNFT.rarity}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors">
                        Buy Now
                      </button>
                      <button className="w-full border-2 border-amber-500 text-amber-600 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors">
                        Make Offer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
