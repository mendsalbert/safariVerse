"use client";

import React from "react";
import HederaWalletPlayground from "./wallet-page";

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
  return <HederaWalletPlayground />;
}

// Legacy version removed due to syntax errors and complexity
// The wallet-page.tsx version provides a better user experience with:
// - Automatic wallet connection
// - Real-time balance updates
// - Working NFT form with file upload, name, and description fields
// - Better error handling
// - Modern UI/UX
