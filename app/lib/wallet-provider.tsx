"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
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
};

const WalletContext = createContext<WalletProviderState | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connector] = useState(() => new WalletConnector());
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const availableWallets = useMemo(() => connector.getAvailableWallets(), [connector]);

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
    }),
    [wallet, isModalOpen, connect, disconnect, connector, availableWallets]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}


