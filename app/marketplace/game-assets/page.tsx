"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  Coins,
  Trophy,
  Star,
  TrendingUp,
  Filter,
  Search,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";
import GameMarketplace from "../../components/GameMarketplace";
import { HederaService } from "../../lib/hedera-utils";
import { SafariGameBlockchain } from "../../lib/game-blockchain";

export default function GameAssetsMarketplacePage() {
  const router = useRouter();
  const [walletConnected, setWalletConnected] = useState(false);
  const [playerAccount, setPlayerAccount] = useState<string | null>(null);
  const [playerTokenBalance, setPlayerTokenBalance] = useState(0);
  const [gameBlockchain, setGameBlockchain] =
    useState<SafariGameBlockchain | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize blockchain services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // This would normally come from user wallet connection
        const hederaService = new HederaService({
          accountId: process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || "0.0.123456",
          privateKey: process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY || "",
          network: "testnet",
        });

        const blockchain = new SafariGameBlockchain(hederaService);
        setGameBlockchain(blockchain);

        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize blockchain services:", error);
        setLoading(false);
      }
    };

    initializeServices();
  }, []);

  // Connect wallet handler
  const handleConnectWallet = async () => {
    if (!gameBlockchain) return;

    try {
      const accountId = prompt(
        "Enter your Hedera Account ID (format: 0.0.123456):"
      );

      if (!accountId) return;

      // Validate account ID format
      const accountIdRegex = /^0\.0\.\d+$/;
      if (!accountIdRegex.test(accountId)) {
        alert("Invalid account ID format. Use format: 0.0.123456");
        return;
      }

      // Get player assets
      const assets = await gameBlockchain.getPlayerAssets(accountId);

      setPlayerAccount(accountId);
      setPlayerTokenBalance(assets.survivalTokenBalance);
      setWalletConnected(true);

      console.log("Wallet connected for marketplace");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  // Handle purchase
  const handlePurchase = async (
    itemId: string,
    price: number
  ): Promise<boolean> => {
    if (!playerAccount || !gameBlockchain) {
      alert("Please connect your wallet first");
      return false;
    }

    try {
      // In a real implementation, this would interact with your SafariMart contract
      // For now, we'll simulate the purchase
      console.log(`Purchasing item ${itemId} for ${price} tokens`);

      // Simulate successful purchase
      setPlayerTokenBalance((prev) => prev - price * 100); // Convert to token units

      return true;
    } catch (error) {
      console.error("Purchase failed:", error);
      return false;
    }
  };

  // Handle create listing
  const handleCreateListing = async (listingData: any): Promise<boolean> => {
    if (!playerAccount) {
      alert("Please connect your wallet first");
      return false;
    }

    try {
      // In a real implementation, this would interact with your SafariMart contract
      console.log("Creating listing:", listingData);

      // Simulate successful listing
      return true;
    } catch (error) {
      console.error("Create listing failed:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-purple-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/marketplace")}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Marketplace
              </button>
              <div className="h-6 w-px bg-purple-200"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Game Assets Marketplace
              </h1>
            </div>

            {/* Wallet Section */}
            <div className="flex items-center gap-4">
              {walletConnected ? (
                <div className="flex items-center gap-4 bg-purple-100 border border-purple-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-gray-800">
                      {(playerTokenBalance / 100).toFixed(2)} SAFARI
                    </span>
                  </div>
                  <div className="h-4 w-px bg-purple-300"></div>
                  <div className="text-sm text-gray-600">
                    {playerAccount?.substring(0, 10)}...
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <div className="text-sm text-gray-600">NFTs Listed</div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
              <Coins className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">892K</div>
            <div className="text-sm text-gray-600">SAFARI Volume</div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">+24%</div>
            <div className="text-sm text-gray-600">24h Growth</div>
          </div>

          <div className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">4.8</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Featured Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border border-yellow-200 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">
                Achievement NFTs
              </div>
              <div className="text-sm text-gray-600">
                Rare game achievements
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
              <Coins className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">SAFARI Tokens</div>
              <div className="text-sm text-gray-600">Game currency bundles</div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
              <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Legendary Items</div>
              <div className="text-sm text-gray-600">
                Ultra-rare collectibles
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Trending</div>
              <div className="text-sm text-gray-600">Hot items this week</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-8 bg-white/40 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Play & Earn</h3>
              <p className="text-sm text-gray-600">
                Play Safari Adventure game to earn SAFARI tokens and unlock
                achievement NFTs
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trade Assets</h3>
              <p className="text-sm text-gray-600">
                List your earned tokens and NFTs on the marketplace for other
                players to buy
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real Value</h3>
              <p className="text-sm text-gray-600">
                Convert your gaming achievements into real economic value
                through blockchain ownership
              </p>
            </div>
          </div>
        </div>

        {/* Main Marketplace */}
        <GameMarketplace
          playerAccount={playerAccount}
          playerTokenBalance={playerTokenBalance}
          onPurchase={handlePurchase}
          onCreateListing={handleCreateListing}
        />
      </div>

      {/* Footer */}
      <div className="mt-16 bg-white/40 backdrop-blur-lg border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h3 className="font-bold text-gray-900 mb-2">
              Start Earning Today
            </h3>
            <p className="text-gray-600 mb-4">
              Play Safari Adventure and turn your gaming skills into real
              blockchain assets
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push("/game/kenya")}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Play Game
              </button>
              <button
                onClick={() => router.push("/marketplace")}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Explore Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
