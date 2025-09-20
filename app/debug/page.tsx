import ContractDebugger from "../components/ContractDebugger";
import MetaMaskFixer from "../components/MetaMaskFixer";

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SafariVerse Contract Debugger
          </h1>
          <p className="text-gray-600">
            Debug and test contract connectivity issues
          </p>
        </div>

        <div className="space-y-8">
          <MetaMaskFixer />
          <ContractDebugger />
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">🔍 About This Debugger</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              This debugger helps identify and resolve contract connectivity
              issues in the SafariVerse application.
            </p>
            <p>
              <strong>What it tests:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Contract connection through browser provider (MetaMask)</li>
              <li>Fallback connection through direct RPC</li>
              <li>Platform statistics retrieval</li>
              <li>Network configuration validation</li>
            </ul>
            <p>
              <strong>Common issues:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Wallet not connected to Hedera Testnet</li>
              <li>MetaMask network configuration issues</li>
              <li>Contract address mismatch</li>
              <li>Network connectivity problems</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
