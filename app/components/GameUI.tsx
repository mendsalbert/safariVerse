"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ShoppingBag,
  MessageCircle,
  Settings,
  Home,
  Star,
  Heart,
  Crown,
  Zap,
} from "lucide-react";

interface GameUIProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

export default function GameUI({ onNavigate, activeSection }: GameUIProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "social", label: "Social", icon: Users },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-auto">
        <div className="bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 backdrop-blur-md bg-opacity-90 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">SafariVerse</h1>
            </div>

            {/* User Stats */}
            <div className="flex items-center space-x-6 text-white">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">1,250</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">500</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="font-semibold">Level 12</span>
              </div>
            </div>

            {/* Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-yellow-300 transition-colors"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Side Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute left-0 top-16 bottom-0 w-64 bg-gradient-to-b from-amber-900 to-orange-900 backdrop-blur-md bg-opacity-95 z-20 pointer-events-auto"
          >
            <div className="p-6">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeSection === item.id
                          ? "bg-yellow-500 text-amber-900 shadow-lg"
                          : "text-white hover:bg-orange-700 hover:text-yellow-200"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User Profile Section */}
              <div className="mt-8 p-4 bg-amber-800 bg-opacity-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Adunni</h3>
                    <p className="text-yellow-200 text-sm">Explorer</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-auto">
        <div className="bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 backdrop-blur-md bg-opacity-90 p-4">
          <div className="flex items-center justify-center space-x-8 max-w-4xl mx-auto">
            <button className="flex flex-col items-center space-y-1 text-white hover:text-yellow-300 transition-colors">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">Players</span>
            </button>

            <button className="flex flex-col items-center space-y-1 text-white hover:text-yellow-300 transition-colors">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">Market</span>
            </button>

            <button className="flex flex-col items-center space-y-1 text-white hover:text-yellow-300 transition-colors">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">Chat</span>
            </button>

            <button className="flex flex-col items-center space-y-1 text-white hover:text-yellow-300 transition-colors">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">NFTs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
