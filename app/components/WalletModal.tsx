"use client";

import React from "react";
import { useWallet } from "../lib/wallet-provider";

export default function WalletModal() {
  const { isModalOpen, closeModal, availableWallets, connect } = useWallet();
  if (!isModalOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Connect Wallet</h2>
          <button onClick={closeModal} className="rounded px-2 py-1 text-sm hover:bg-gray-100">
            Close
          </button>
        </div>
        <div className="space-y-2">
          {availableWallets.map((w) => (
            <button
              key={w.type}
              disabled={!w.isInstalled}
              onClick={() => connect(w.type)}
              className="flex w-full items-center justify-between rounded border p-3 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{w.icon}</span>
                <span className="font-medium">{w.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {w.isInstalled ? "Detected" : "Not Installed"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


