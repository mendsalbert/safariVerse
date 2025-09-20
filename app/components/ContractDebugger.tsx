"use client";

import { useState } from "react";
import {
  testContractConnection,
  getPlatformStats,
} from "../lib/safariverse-marketplace";
import { getHederaNetworkManager } from "../lib/hedera-network";

export default function ContractDebugger() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    networkInfo?: any;
    connectionTest?: any;
    platformStats?: any;
    timestamp?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<{
    chainId: string;
    chainName: string;
    isHedera: boolean;
  } | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log("🧪 Starting contract debug tests...");

      // Test 0: Network information
      console.log("Test 0: Network information");
      const networkManager = getHederaNetworkManager();
      const network = await networkManager.getCurrentNetwork();
      setNetworkInfo(network);

      // Test 1: Contract connection
      console.log("Test 1: Contract connection test");
      const connectionTest = await testContractConnection();

      // Test 2: Platform stats
      console.log("Test 2: Platform stats test");
      const platformStats = await getPlatformStats();

      setResults({
        networkInfo: network,
        connectionTest,
        platformStats,
        timestamp: new Date().toISOString(),
      });

      console.log("✅ All tests completed successfully");
    } catch (err: unknown) {
      console.error("❌ Debug tests failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const switchToHederaTestnet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const networkManager = getHederaNetworkManager();
      await networkManager.switchToHederaTestnet();

      // Refresh network info
      const network = await networkManager.getCurrentNetwork();
      setNetworkInfo(network);

      console.log("✅ Successfully switched to Hedera Testnet");
    } catch (err: unknown) {
      console.error("❌ Failed to switch network:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to switch to Hedera Testnet"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔧 Contract Debugger</h2>
      <p className="text-gray-600 mb-6">
        This component helps debug contract connectivity issues. Click the
        button below to run tests.
      </p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={runTests}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Running Tests..." : "Run Debug Tests"}
        </button>

        <button
          onClick={switchToHederaTestnet}
          disabled={isLoading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Switching..." : "Switch to Hedera Testnet"}
        </button>
      </div>

      {/* Network Information */}
      {networkInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">🌐 Network Information</h3>
          <div
            className={`p-2 rounded ${
              networkInfo.isHedera
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div>
              <strong>Network:</strong> {networkInfo.chainName}
            </div>
            <div>
              <strong>Chain ID:</strong> {networkInfo.chainId}
            </div>
            <div>
              <strong>Is Hedera:</strong>{" "}
              {networkInfo.isHedera ? "✅ Yes" : "❌ No"}
            </div>
          </div>
          {!networkInfo.isHedera && (
            <div className="mt-2 text-sm text-red-600">
              ⚠️ You&apos;re not connected to Hedera Testnet. Click &quot;Switch
              to Hedera Testnet&quot; above.
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {results && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">📊 Test Results</h3>

          {/* Network Information in Results */}
          {results.networkInfo && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">🌐 Network Status</h4>
              <div
                className={`p-2 rounded ${
                  results.networkInfo.isHedera
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <div>
                  <strong>Network:</strong> {results.networkInfo.chainName}
                </div>
                <div>
                  <strong>Chain ID:</strong> {results.networkInfo.chainId}
                </div>
                <div>
                  <strong>Is Hedera:</strong>{" "}
                  {results.networkInfo.isHedera ? "✅ Yes" : "❌ No"}
                </div>
              </div>
            </div>
          )}

          {/* Connection Test Results */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">🔗 Connection Test</h4>
            <div
              className={`p-2 rounded ${
                results.connectionTest.success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Status:{" "}
              {results.connectionTest.success ? "✅ Success" : "❌ Failed"}
            </div>
            {results.connectionTest.details && (
              <div className="mt-2 text-sm">
                <pre className="bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(results.connectionTest.details, null, 2)}
                </pre>
              </div>
            )}
            {results.connectionTest.error && (
              <div className="mt-2 text-sm text-red-600">
                Error: {results.connectionTest.error}
              </div>
            )}
          </div>

          {/* Platform Stats Results */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">📈 Platform Stats</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Products:</span>
                <br />
                {results.platformStats.totalProducts.toString()}
              </div>
              <div>
                <span className="font-medium">Total Sales:</span>
                <br />
                {results.platformStats.totalSales.toString()}
              </div>
              <div>
                <span className="font-medium">Total Revenue:</span>
                <br />
                {results.platformStats.totalRevenue.toString()}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Tests completed at: {results.timestamp}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          💡 Troubleshooting Tips
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • <strong>CALL_EXCEPTION errors</strong> usually indicate network
            mismatch
          </li>
          <li>
            • Use the &quot;Switch to Hedera Testnet&quot; button to ensure
            correct network
          </li>
          <li>
            • Ensure MetaMask or another compatible wallet is installed and
            unlocked
          </li>
          <li>
            • If errors persist, try refreshing the page and reconnecting your
            wallet
          </li>
          <li>• Check the browser console (F12) for detailed error messages</li>
          <li>
            • The contract address is:{" "}
            <code className="bg-gray-200 px-1 rounded">
              0x5f190e7dbbaeFac2c1Bb328A6fB393dA53813988
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
}
