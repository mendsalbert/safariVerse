"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WalletProvider, useWallet } from "../lib/wallet-provider";
import WalletModal from "../components/WalletModal";
import {
  getMyProducts,
  getPlatformStats,
  type Product,
  formatPrice,
} from "../lib/safariverse-marketplace";
import {
  ArrowLeft,
  Crown,
  ShoppingCart,
  Coins,
  Users,
  TrendingUp,
  Package,
  DollarSign,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Loading component
function LoadingOverlay({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
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

// Dashboard Content Component
function DashboardContent() {
  const router = useRouter();
  const { wallet } = useWallet();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [platformStats, setPlatformStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: "0",
  });
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (wallet?.evmAddress) {
      loadDashboardData();
    }
  }, [wallet?.evmAddress]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [productsData, stats] = await Promise.all([
        getMyProducts(),
        getPlatformStats(),
      ]);
      setMyProducts(productsData);
      setPlatformStats({
        totalProducts: Number(stats.totalProducts),
        totalSales: Number(stats.totalSales),
        totalRevenue: formatPrice(stats.totalRevenue),
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet?.evmAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-amber-900 flex items-center justify-center p-4">
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-8 border border-amber-500/30 max-w-md w-full text-center">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-yellow-100 mb-4">
            My Dashboard
          </h1>
          <p className="text-orange-200 mb-6">
            Connect your wallet to view your dashboard and manage your products
          </p>
          <button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-amber-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent">
              My Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
            >
              {showStats ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
              {showStats ? "Hide Stats" : "Show Stats"}
            </button>
            <button
              onClick={() => router.push("/safarimart/nigeria")}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Product
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* My Products */}
            <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-blue-400" />
                  <h3 className="text-lg font-semibold text-yellow-100">
                    My Products
                  </h3>
                </div>
                <span className="text-2xl font-bold text-blue-400">
                  {myProducts.length}
                </span>
              </div>
              <p className="text-orange-200 text-sm">
                Products you've created in the marketplace
              </p>
            </div>

            {/* Platform Stats */}
            <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <h3 className="text-lg font-semibold text-yellow-100">
                    Platform Total
                  </h3>
                </div>
                <span className="text-2xl font-bold text-green-400">
                  {platformStats.totalProducts}
                </span>
              </div>
              <p className="text-orange-200 text-sm">
                Total products across the entire marketplace
              </p>
            </div>

            {/* Revenue */}
            <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-yellow-100">
                    Platform Revenue
                  </h3>
                </div>
                <span className="text-2xl font-bold text-yellow-400">
                  {platformStats.totalRevenue} HBAR
                </span>
              </div>
              <p className="text-orange-200 text-sm">
                Total revenue generated on the platform
              </p>
            </div>
          </div>
        )}

        {/* My Products Section */}
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-yellow-100 flex items-center gap-2">
              <Package className="w-6 h-6" />
              My Products
            </h2>
            <button
              onClick={loadDashboardData}
              className="text-orange-200 hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-orange-200">Loading your products...</div>
            </div>
          ) : myProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-yellow-100 mb-2">
                No Products Yet
              </h3>
              <p className="text-orange-200 mb-6">
                Create your first product to start selling in the marketplace
              </p>
              <button
                onClick={() => router.push("/safarimart/nigeria")}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map((product, index) => (
                <div
                  key={`product-${product.id}-${index}`}
                  className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-4 hover:bg-orange-900/60 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-yellow-100 text-lg">
                      {product.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {product.isActive ? (
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 inline mr-1" />
                      )}
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="text-orange-200 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-orange-300 bg-orange-800/40 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <span className="text-yellow-400 font-bold">
                      {formatPrice(product.price)} HBAR
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-orange-200 mb-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Sold: {Number(product.itemsSold)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>
                        Revenue: {formatPrice(product.totalRevenue)} HBAR
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // TODO: Implement edit functionality
                        alert("Edit functionality coming soon!");
                      }}
                      className="flex-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement delete functionality
                        alert("Delete functionality coming soon!");
                      }}
                      className="flex-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push("/safarimart/nigeria")}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white p-6 rounded-xl transition-all flex items-center gap-3"
          >
            <Plus className="w-6 h-6" />
            <div className="text-left">
              <h3 className="font-semibold">Create Product</h3>
              <p className="text-sm opacity-90">
                Add a new item to the marketplace
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push("/safarimart/nigeria")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-6 rounded-xl transition-all flex items-center gap-3"
          >
            <ShoppingCart className="w-6 h-6" />
            <div className="text-left">
              <h3 className="font-semibold">Browse Marketplace</h3>
              <p className="text-sm opacity-90">
                Explore and buy from other creators
              </p>
            </div>
          </button>

          <button
            onClick={() => router.push("/nft")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-xl transition-all flex items-center gap-3"
          >
            <Crown className="w-6 h-6" />
            <div className="text-left">
              <h3 className="font-semibold">NFT Gallery</h3>
              <p className="text-sm opacity-90">View and manage your NFTs</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  return (
    <WalletProvider>
      <DashboardContent />
      <WalletModal />
    </WalletProvider>
  );
}
