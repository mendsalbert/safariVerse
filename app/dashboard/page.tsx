"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WalletProvider, useWallet } from "../lib/wallet-provider";
import WalletModal from "../components/WalletModal";
import {
  getMyProducts,
  getAllActiveProducts,
  getMyPurchases,
  formatPrice,
  type ProductData,
  type PurchaseWithProduct,
} from "../lib/safarimart";
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
  const [myProducts, setMyProducts] = useState<ProductData[]>([]);
  const [myPurchases, setMyPurchases] = useState<PurchaseWithProduct[]>([]);
  const [platformStats, setPlatformStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: BigInt(0),
  });
  const [userStats, setUserStats] = useState({
    totalRevenue: BigInt(0),
    totalSales: 0,
    totalPurchases: 0,
    totalSpent: BigInt(0),
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
      console.log("🔄 Loading dashboard data...");

      const [myProductsResult, allProducts, purchasesData] = await Promise.all([
        getMyProducts(),
        getAllActiveProducts(),
        getMyPurchases(),
      ]);

      console.log("📊 Dashboard data loaded:", {
        myProducts: myProductsResult.products.length,
        allProducts: allProducts.length,
        myPurchases: purchasesData.length,
      });

      setMyProducts(myProductsResult.products);
      setMyPurchases(purchasesData);

      // Calculate platform stats - sum up individual sales
      let platformTotalSales = 0;
      let platformTotalRevenue = BigInt(0);

      // Loop through each product and check if it has been sold
      for (const product of allProducts) {
        platformTotalSales += Number(product.totalSales);
        // If product has been sold, add its price to revenue
        if (Number(product.totalSales) > 0) {
          platformTotalRevenue += product.price;
        }
      }

      setPlatformStats({
        totalProducts: allProducts.length,
        totalSales: platformTotalSales,
        totalRevenue: platformTotalRevenue,
      });

      // Calculate user stats - sum up individual sales
      let userTotalSales = 0;
      let userTotalRevenue = BigInt(0);

      // Loop through each of my products and check if it has been sold
      for (const product of myProductsResult.products) {
        userTotalSales += Number(product.totalSales);
        // If product has been sold, add its price to revenue
        if (Number(product.totalSales) > 0) {
          userTotalRevenue += product.price;
        }
      }
      const userTotalSpent = purchasesData.reduce(
        (sum, p) => sum + p.purchase.pricePaid,
        BigInt(0)
      );

      setUserStats({
        totalRevenue: userTotalRevenue,
        totalSales: userTotalSales,
        totalPurchases: purchasesData.length,
        totalSpent: userTotalSpent,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Set empty states on error
      setMyProducts([]);
      setMyPurchases([]);
      setPlatformStats({
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: BigInt(0),
      });
      setUserStats({
        totalRevenue: BigInt(0),
        totalSales: 0,
        totalPurchases: 0,
        totalSpent: BigInt(0),
      });
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
          <div className="space-y-6 mb-8">
            {/* User Personal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  Products you've created
                </p>
              </div>

              {/* My Sales */}
              <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <h3 className="text-lg font-semibold text-yellow-100">
                      My Sales
                    </h3>
                  </div>
                  <span className="text-2xl font-bold text-green-400">
                    {userStats.totalSales}
                  </span>
                </div>
                <p className="text-orange-200 text-sm">
                  Items sold from your products
                </p>
              </div>

              {/* My Revenue */}
              <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-yellow-100">
                      My Revenue
                    </h3>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">
                    {formatPrice(userStats.totalRevenue)} HBAR
                  </span>
                </div>
                <p className="text-orange-200 text-sm">
                  Total earnings from sales
                </p>
              </div>

              {/* My Purchases */}
              <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-purple-400" />
                    <h3 className="text-lg font-semibold text-yellow-100">
                      My Purchases
                    </h3>
                  </div>
                  <span className="text-2xl font-bold text-purple-400">
                    {userStats.totalPurchases}
                  </span>
                </div>
                <p className="text-orange-200 text-sm">
                  Items you've purchased
                </p>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-amber-500/20">
              <h3 className="text-lg font-semibold text-yellow-100 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Platform Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {platformStats.totalProducts}
                  </div>
                  <div className="text-orange-200 text-sm">Total Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {platformStats.totalSales}
                  </div>
                  <div className="text-orange-200 text-sm">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {formatPrice(platformStats.totalRevenue)} HBAR
                  </div>
                  <div className="text-orange-200 text-sm">
                    Platform Revenue
                  </div>
                </div>
              </div>
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
                  key={`product-${product.productId}-${index}`}
                  className="bg-orange-900/40 border border-amber-400/30 rounded-lg p-4 hover:bg-orange-900/60 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-yellow-100 text-lg">
                      {product.title}
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
                      <span>Sold: {Number(product.totalSales)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>
                        Revenue: {formatPrice(product.totalRevenue)} HBAR
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-xs text-orange-300 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Created:</span>
                      <span>
                        {new Date(
                          Number(product.createdAt) * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Creator:</span>
                      <span className="font-mono text-xs">
                        {product.creator.slice(0, 6)}...
                        {product.creator.slice(-4)}
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
                        window.open(product.fileUrl, "_blank");
                      }}
                      className="flex-1 bg-green-500/20 text-green-300 hover:bg-green-500/30 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Purchases Section */}
        <div className="bg-black/60 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-yellow-100 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              My Purchases ({myPurchases.length})
            </h2>
          </div>

          {myPurchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-yellow-100 mb-2">
                No Purchases Yet
              </h3>
              <p className="text-orange-200 mb-6">
                Start exploring the marketplace to find amazing products
              </p>
              <button
                onClick={() => router.push("/safarimart/nigeria")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 mx-auto"
              >
                <ShoppingCart className="w-5 h-5" />
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPurchases.map((item, index) => (
                <div
                  key={`purchase-${item.purchase.purchaseId}-${index}`}
                  className="bg-purple-900/40 border border-purple-400/30 rounded-lg p-4 hover:bg-purple-900/60 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-yellow-100 text-lg">
                      {item.product.title}
                    </h3>
                    <span className="text-xs text-purple-300 bg-purple-800/40 px-2 py-1 rounded">
                      {item.product.category}
                    </span>
                  </div>

                  <p className="text-orange-200 text-sm mb-3 line-clamp-2">
                    {item.product.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-orange-200 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Paid:</span>
                      <span className="text-yellow-400 font-bold">
                        {formatPrice(item.product.price)} HBAR
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Date:</span>
                      <span>
                        {new Date(
                          Number(item.purchase.purchasedAt) * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-xs text-orange-300 mb-4">
                    <div className="flex items-center justify-between">
                      <span>Creator:</span>
                      <span className="font-mono text-xs">
                        {item.product.creator.slice(0, 6)}...
                        {item.product.creator.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Purchase ID:</span>
                      <span className="font-mono text-xs">
                        #{item.purchase.purchaseId.toString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        window.open(item.product.fileUrl, "_blank");
                      }}
                      className="flex-1 bg-green-500/20 text-green-300 hover:bg-green-500/30 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Product
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
