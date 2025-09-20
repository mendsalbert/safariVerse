"use client";

export interface HederaNetworkConfig {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
}

export const HEDERA_TESTNET_CONFIG: HederaNetworkConfig = {
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
};

export const HEDERA_MAINNET_CONFIG: HederaNetworkConfig = {
  chainId: "0x127", // 295 in hex
  chainName: "Hedera Mainnet",
  rpcUrls: ["https://mainnet.hashio.io/api"],
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 18,
  },
  blockExplorerUrls: ["https://hashscan.io/mainnet"],
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class HederaNetworkManager {
  private static instance: HederaNetworkManager;

  public static getInstance(): HederaNetworkManager {
    if (!HederaNetworkManager.instance) {
      HederaNetworkManager.instance = new HederaNetworkManager();
    }
    return HederaNetworkManager.instance;
  }

  /**
   * Check if we're connected to Hedera Testnet
   */
  async isConnectedToHederaTestnet(): Promise<boolean> {
    if (typeof window === "undefined" || !window.ethereum) {
      return false;
    }

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      return chainId === HEDERA_TESTNET_CONFIG.chainId;
    } catch (error) {
      console.error("Error checking chain ID:", error);
      return false;
    }
  }

  /**
   * Switch to Hedera Testnet or add it if it doesn't exist
   */
  async switchToHederaTestnet(): Promise<void> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask or compatible wallet not found");
    }

    try {
      // First, try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HEDERA_TESTNET_CONFIG.chainId }],
      });

      console.log("✅ Successfully switched to Hedera Testnet");
    } catch (switchError: any) {
      // If the network doesn't exist (error code 4902), add it
      if (switchError.code === 4902) {
        console.log("📝 Adding Hedera Testnet to MetaMask...");

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [HEDERA_TESTNET_CONFIG],
        });

        console.log("✅ Successfully added Hedera Testnet");
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Ensure we're connected to Hedera Testnet
   */
  async ensureHederaTestnet(): Promise<void> {
    const isConnected = await this.isConnectedToHederaTestnet();

    if (!isConnected) {
      console.log(
        "🔄 Not connected to Hedera Testnet, attempting to switch..."
      );
      await this.switchToHederaTestnet();

      // Wait a moment for the network switch to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify the switch was successful
      const isNowConnected = await this.isConnectedToHederaTestnet();
      if (!isNowConnected) {
        throw new Error("Failed to switch to Hedera Testnet");
      }
    }
  }

  /**
   * Get current network information
   */
  async getCurrentNetwork(): Promise<{
    chainId: string;
    chainName: string;
    isHedera: boolean;
  }> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask or compatible wallet not found");
    }

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      let chainName = "Unknown";
      const isHedera =
        chainId === HEDERA_TESTNET_CONFIG.chainId ||
        chainId === HEDERA_MAINNET_CONFIG.chainId;

      if (chainId === HEDERA_TESTNET_CONFIG.chainId) {
        chainName = "Hedera Testnet";
      } else if (chainId === HEDERA_MAINNET_CONFIG.chainId) {
        chainName = "Hedera Mainnet";
      }

      return {
        chainId,
        chainName,
        isHedera,
      };
    } catch (error) {
      console.error("Error getting network info:", error);
      throw error;
    }
  }

  /**
   * Listen for network changes
   */
  onNetworkChanged(callback: (chainId: string) => void): void {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("chainChanged", callback);
    }
  }

  /**
   * Remove network change listeners
   */
  removeNetworkListeners(): void {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.removeAllListeners("chainChanged");
    }
  }
}

// Convenience function to get the network manager instance
export const getHederaNetworkManager = () => HederaNetworkManager.getInstance();
