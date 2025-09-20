"use client";

import { useState } from "react";

export default function MetaMaskFixer() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fixMetaMaskRPC = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not detected");
      }

      // Remove existing Hedera Testnet if it exists
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x128" }],
        });
      } catch (e) {
        // Ignore if network doesn't exist
      }

      // Add the network with improved configuration
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x128", // 296 in hex
            chainName: "Hedera Testnet",
            rpcUrls: [
              "https://testnet.hashio.io/api",
              "https://hedera-testnet.rpc.thirdweb.com",
            ],
            nativeCurrency: {
              name: "HBAR",
              symbol: "HBAR",
              decimals: 18,
            },
            blockExplorerUrls: ["https://hashscan.io/testnet"],
          },
        ],
      });

      setResult("✅ MetaMask RPC configuration updated successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`❌ Failed to fix MetaMask RPC: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRPCConnection = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { ethers } = await import("ethers");

      const rpcEndpoints = [
        "https://testnet.hashio.io/api",
        "https://hedera-testnet.rpc.thirdweb.com",
      ];

      const results = [];

      for (const rpcUrl of rpcEndpoints) {
        try {
          const provider = new ethers.JsonRpcProvider(rpcUrl, {
            name: "hedera-testnet",
            chainId: 296,
          });

          const blockNumber = await provider.getBlockNumber();
          results.push(`✅ ${rpcUrl} - Block: ${blockNumber}`);
        } catch (err: any) {
          results.push(`❌ ${rpcUrl} - Error: ${err.message}`);
        }
      }

      setResult(results.join("\n"));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`❌ Failed to test RPC connections: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔧 MetaMask RPC Fixer</h2>
      <p className="text-gray-600 mb-6">
        This tool helps fix MetaMask RPC connectivity issues with Hedera
        Testnet.
      </p>

      <div className="space-y-4">
        <button
          onClick={fixMetaMaskRPC}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Fixing..." : "Fix MetaMask RPC Configuration"}
        </button>

        <button
          onClick={testRPCConnection}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Testing..." : "Test RPC Endpoints"}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-semibold mb-2">✅ Result</h3>
          <pre className="text-green-700 text-sm whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">
          💡 What This Does
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Updates MetaMask&apos;s Hedera Testnet RPC configuration</li>
          <li>• Adds multiple RPC endpoints for better reliability</li>
          <li>• Tests different RPC endpoints to find working ones</li>
          <li>• Helps resolve &quot;RPC endpoint not found&quot; errors</li>
        </ul>
      </div>
    </div>
  );
}
