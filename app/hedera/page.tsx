"use client";

import React, { useState } from "react";
import { WalletProvider, useWallet } from "../lib/wallet-provider";
import WalletModal from "../components/WalletModal";
import HederaWalletPlayground from "./wallet-page";
import {
  mintNft,
  listMyMinted,
  listAllTokens,
  type TokenData,
} from "../lib/safariverse-nft";

// TypeScript interfaces for reference
interface TokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
}

interface FileInfo {
  fileId: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

interface TransactionInfo {
  id: string;
  type: string;
  status: "pending" | "success" | "error";
  details: string;
  timestamp: Date;
}

interface NFTInfo {
  tokenId: string;
  serialNumber: string;
  metadata: string;
  mintedAt: Date;
}

export default function HederaPlayground() {
  // Use the wallet-based version for better UX and working NFT form
  return (
    <WalletProvider>
      <ConnectBar />
      <MintForm />
      <HederaWalletPlayground />
      <WalletModal />
    </WalletProvider>
  );
}

function ConnectBar() {
  const { wallet, openModal, disconnect } = useWallet();
  return (
    <div className="w-full flex items-center justify-between gap-3 p-3 border-b border-gray-200/50 bg-white/50 sticky top-0 z-40">
      <div className="text-sm font-medium">Hedera Wallet Playground</div>
      <div className="flex items-center gap-2">
        {wallet?.evmAddress ? (
          <>
            <span className="text-xs text-gray-600 hidden sm:inline">
              {wallet.evmAddress}
            </span>
            <button
              onClick={disconnect}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={openModal}
            className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

function MintForm() {
  const { wallet, openModal } = useWallet();
  const [fileUrl, setFileUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceEth, setPriceEth] = useState("");
  const [status, setStatus] = useState<string>("");
  const [minted, setMinted] = useState<{
    tokenIds: bigint[];
    data: TokenData[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [all, setAll] = useState<{
    tokenIds: bigint[];
    data: TokenData[];
  } | null>(null);

  const onMint = async () => {
    try {
      if (!wallet?.evmAddress) {
        openModal();
        return;
      }
      if (!fileUrl || !title) {
        setStatus("Please provide at least file URL and title");
        return;
      }
      setLoading(true);
      setStatus("Minting...");
      const res = await mintNft({ fileUrl, title, description, priceEth });
      setStatus(`Minted! Tx: ${res.txHash}`);
      const mine = await listMyMinted();
      setMinted(mine);
    } catch (e: any) {
      setStatus(`Error: ${e?.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  };
  const onListAll = async () => {
    try {
      setStatus("Loading all tokens...");
      const res = await listAllTokens();
      setAll(res);
      setStatus("");
    } catch (e: any) {
      setStatus(`Error: ${e?.message || String(e)}`);
    }
  };

  return (
    <div className="mx-auto my-4 w-full max-w-3xl rounded-lg border border-gray-200 bg-white/70 p-4">
      <h3 className="mb-3 text-base font-semibold">
        Quick Mint (EVM contract)
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">
            File URL (.glb or media)
          </span>
          <input
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://.../model.glb"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My 3D NFT"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="sm:col-span-2 text-sm">
          <span className="mb-1 block text-gray-600">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description..."
            className="w-full rounded border px-3 py-2 text-sm"
            rows={3}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">
            Price (HBAR, 18 decimals)
          </span>
          <input
            value={priceEth}
            onChange={(e) => setPriceEth(e.target.value)}
            placeholder="0.0"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </label>
        <div className="flex items-end justify-end gap-2">
          <button
            onClick={onMint}
            disabled={loading}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "Minting..."
              : wallet?.evmAddress
              ? "Mint NFT"
              : "Connect to Mint"}
          </button>
          <button
            onClick={onListAll}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            List All NFTs
          </button>
        </div>
      </div>
      {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
      {minted && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold">Your Minted NFTs</h4>
          <ul className="space-y-2 text-sm">
            {minted.tokenIds.map((id, i) => (
              <li key={String(id)} className="rounded border p-2">
                <div className="font-medium">Token #{String(id)}</div>
                <div className="text-gray-600">{minted.data[i]?.title}</div>
                <div className="truncate text-gray-500">
                  {minted.data[i]?.fileUrl}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {all && (
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-semibold">All NFTs</h4>
          <ul className="space-y-2 text-sm">
            {all.tokenIds.map((id, i) => (
              <li key={`all-${String(id)}`} className="rounded border p-2">
                <div className="font-medium">Token #{String(id)}</div>
                <div className="text-gray-600">{all.data[i]?.title}</div>
                <div className="truncate text-gray-500">
                  {all.data[i]?.fileUrl}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Legacy version removed due to syntax errors and complexity
// The wallet-page.tsx version provides a better user experience with:
// - Automatic wallet connection
// - Real-time balance updates
// - Working NFT form with file upload, name, and description fields
// - Better error handling
// - Modern UI/UX
