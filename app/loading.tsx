"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Safari Logo */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-500/30 rounded-full animate-spin">
            <div className="absolute inset-2 border-4 border-amber-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 border-2 border-orange-300 rounded-full animate-bounce"></div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent mb-2">
            Loading SafariVerse
          </h2>
          <p className="text-orange-200 text-sm">
            Preparing your African adventure...
          </p>
        </div>
        
        {/* Progress Animation */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
