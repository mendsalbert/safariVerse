"use client";

import { useRouter } from "next/navigation";
import Marketplace from "../components/Marketplace";

export default function MarketplacePage() {
  const router = useRouter();
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-40 text-center">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,140,0,0.35)]">
          SafariVerse
        </h1>
      </div>

      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-colors shadow-lg"
      >
        ← Back to Africa Map
      </button>

      <div className="relative z-10 h-full">
        <Marketplace />
      </div>
    </div>
  );
}
