"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WalletConnector, WalletInfo } from "./wallet-connect";

type WalletProviderState = {
  wallet: WalletInfo | null;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  connect: (type: WalletInfo["type"]) => Promise<void>;
  disconnect: () => Promise<void>;
  getConnector: () => WalletConnector;
  availableWallets: WalletInfo[];
  // WalletConnect (WC) WalletKit hooks
  wcReady: boolean;
  wcError?: string;
  startWalletConnectPairing: (wcUri: string) => Promise<void>;
};

const WalletContext = createContext<WalletProviderState | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connector] = useState(() => new WalletConnector());
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wcReady, setWcReady] = useState(false);
  const [wcError, setWcError] = useState<string | undefined>(undefined);
  const [walletKit, setWalletKit] = useState<any>(null);

  const availableWallets = useMemo(
    () => connector.getAvailableWallets(),
    [connector]
  );

  const connect = useCallback(
    async (type: WalletInfo["type"]) => {
      if (type === "metamask") {
        const w = await connector.connectMetaMask();
        setWallet(w);
      } else if (type === "hashpack") {
        const w = await connector.connectHashPack();
        setWallet(w);
      } else {
        throw new Error("Unsupported wallet");
      }
      setIsModalOpen(false);
    },
    [connector]
  );

  const disconnect = useCallback(async () => {
    await connector.disconnect();
    setWallet(null);
  }, [connector]);

  // Lazy initialize WalletConnect WalletKit
  const ensureWalletKit = useCallback(async () => {
    if (walletKit) return walletKit;
    try {
      const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
      if (!projectId) {
        throw new Error(
          "Missing NEXT_PUBLIC_WC_PROJECT_ID. Create one at dashboard.reown.com"
        );
      }
      const [{ Core }, { WalletKit }] = await Promise.all([
        import("@walletconnect/core"),
        import("@reown/walletkit"),
      ]);
      const core = new Core({ projectId });
      const wk = await WalletKit.init({
        core,
        metadata: {
          name: "SafariVerse",
          description: "SafariVerse Hedera Wallet",
          url: "https://safariverse.app",
          icons: [],
        },
      });
      setWalletKit(wk);
      setWcReady(true);
      setWcError(undefined);

      // Subscribe to proposals: auto-approve for Hedera EVM (eip155:296)
      const { buildApprovedNamespaces, getSdkError } = await import(
        "@walletconnect/utils"
      );
      wk.on("session_proposal", async (proposal: any) => {
        try {
          const address =
            wallet?.evmAddress || "0x0000000000000000000000000000000000000000";
          const approved = buildApprovedNamespaces({
            proposal: proposal.params,
            supportedNamespaces: {
              eip155: {
                chains: ["eip155:296"],
                methods: [
                  "eth_accounts",
                  "eth_requestAccounts",
                  "eth_sendTransaction",
                  "personal_sign",
                  "wallet_switchEthereumChain",
                  "wallet_addEthereumChain",
                ],
                events: ["accountsChanged", "chainChanged"],
                accounts: [
                  `eip155:296:${
                    address || "0x0000000000000000000000000000000000000000"
                  }`,
                ],
              },
            },
          });
          await wk.approveSession({ id: proposal.id, namespaces: approved });
        } catch (err: any) {
          const { getSdkError } = await import("@walletconnect/utils");
          await wk.rejectSession({
            id: proposal.id,
            reason: getSdkError("USER_REJECTED"),
          });
          console.error("WC session proposal rejected:", err);
        }
      });

      return wk;
    } catch (err: any) {
      setWcError(
        `WalletConnect not available. Install deps and set project id. Error: ${
          err?.message || err
        }`
      );
      setWcReady(false);
      return null;
    }
  }, [walletKit, wallet]);

  const startWalletConnectPairing = useCallback(
    async (wcUri: string) => {
      const wk = await ensureWalletKit();
      if (!wk) return;
      await wk.pair({ uri: wcUri });
    },
    [ensureWalletKit]
  );

  const value = useMemo<WalletProviderState>(
    () => ({
      wallet,
      isModalOpen,
      openModal: () => setIsModalOpen(true),
      closeModal: () => setIsModalOpen(false),
      connect,
      disconnect,
      getConnector: () => connector,
      availableWallets,
      wcReady,
      wcError,
      startWalletConnectPairing,
    }),
    [
      wallet,
      isModalOpen,
      connect,
      disconnect,
      connector,
      availableWallets,
      wcReady,
      wcError,
      startWalletConnectPairing,
    ]
  );

  // Silent reconnect on mount if last wallet was MetaMask
  useEffect(() => {
    const last =
      typeof window !== "undefined"
        ? localStorage.getItem("sv_last_wallet")
        : null;
    if (last === "metamask" && !wallet) {
      connector
        .silentConnectMetaMask()
        .then((w) => w && setWallet(w))
        .catch(() => {});
    }
  }, [connector, wallet]);

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
