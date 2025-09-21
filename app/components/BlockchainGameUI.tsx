"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Coins,
  Trophy,
  Star,
  Zap,
  Shield,
  Gift,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Loader,
} from "lucide-react";
import {
  SafariGameBlockchain,
  GameSessionManager,
  GameAchievements,
  GameSession,
} from "../lib/game-blockchain";
import { HederaService } from "../lib/hedera-utils";

// MetaMask ethereum object type declaration
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface BlockchainGameUIProps {
  gameState: {
    score: number;
    health: number;
    survivalTime: number;
    gameOver: boolean;
  };
  onGameStart?: () => void;
  onGameEnd?: () => void;
}

interface WalletState {
  connected: boolean;
  accountId: string | null;
  ethereumAddress?: string | null;
  survivalTokenBalance: number;
  nftCount: number;
  loading: boolean;
  error: string | null;
}

interface RewardState {
  tokensEarned: number;
  nftMinted: string | null;
  achievements: string[];
  transactionIds: string[];
  showRewardModal: boolean;
}

export default function BlockchainGameUI({
  gameState,
  onGameStart,
  onGameEnd,
}: BlockchainGameUIProps) {
  const [walletState, setWalletState] = useState<WalletState>(() => {
    // Load from localStorage on component mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("safari-wallet-state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            connected: false, // Always start disconnected for security
            accountId: parsed.accountId,
            ethereumAddress: parsed.ethereumAddress,
            survivalTokenBalance: parsed.survivalTokenBalance || 0,
            nftCount: parsed.nftCount || 0,
            loading: false,
            error: null,
          };
        } catch (error) {
          // Failed to parse saved wallet state
        }
      }
    }

    return {
      connected: false,
      accountId: null,
      ethereumAddress: null,
      survivalTokenBalance: 0,
      nftCount: 0,
      loading: false,
      error: null,
    };
  });

  const [rewardState, setRewardState] = useState<RewardState>({
    tokensEarned: 0,
    nftMinted: null,
    achievements: [],
    transactionIds: [],
    showRewardModal: false,
  });

  const [gameBlockchain, setGameBlockchain] =
    useState<SafariGameBlockchain | null>(null);
  const [sessionManager, setSessionManager] =
    useState<GameSessionManager | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(
    null
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<string[]>([]);

  // Save wallet state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && walletState.accountId) {
      const stateToSave = {
        accountId: walletState.accountId,
        ethereumAddress: walletState.ethereumAddress,
        survivalTokenBalance: walletState.survivalTokenBalance,
        nftCount: walletState.nftCount,
      };
      localStorage.setItem("safari-wallet-state", JSON.stringify(stateToSave));
    }
  }, [
    walletState.accountId,
    walletState.ethereumAddress,
    walletState.survivalTokenBalance,
    walletState.nftCount,
  ]);

  // Initialize blockchain services
  useEffect(() => {
    const initializeBlockchain = async () => {
      try {
        // This would normally come from user input or environment
        const hederaService = new HederaService({
          accountId: process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || "0.0.123456",
          privateKey: process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY || "",
          network: "testnet",
        });

        const blockchain = new SafariGameBlockchain(hederaService);
        const manager = new GameSessionManager(blockchain);

        setGameBlockchain(blockchain);
        setSessionManager(manager);
      } catch (error) {
        setWalletState((prev) => ({
          ...prev,
          error: "Failed to initialize blockchain services",
        }));
      }
    };

    initializeBlockchain();
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletState({
      connected: false,
      accountId: null,
      ethereumAddress: null,
      survivalTokenBalance: 0,
      nftCount: 0,
      loading: false,
      error: null,
    });

    // Clear localStorage when disconnecting
    if (typeof window !== "undefined") {
      localStorage.removeItem("safari-wallet-state");
    }
  }, []);

  // Connect MetaMask wallet
  const connectWallet = useCallback(async () => {
    if (!gameBlockchain) return;

    setWalletState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask to connect your wallet."
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No accounts found. Please make sure MetaMask is unlocked."
        );
      }

      const ethereumAddress = accounts[0];

      // Check if we have a saved Hedera ID for this Ethereum address
      let simulatedHederaId = walletState.accountId;

      // If no saved ID or different Ethereum address, generate new one
      if (
        !simulatedHederaId ||
        walletState.ethereumAddress !== ethereumAddress
      ) {
        simulatedHederaId = `0.0.${
          Math.floor(Math.random() * 999999) + 100000
        }`;
      }

      // Get network information
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // Get player assets (simulated for demo)
      const assets = await gameBlockchain.getPlayerAssets(simulatedHederaId);

      // Use existing tokens if we have them, otherwise give starting tokens
      let finalTokenBalance = walletState.survivalTokenBalance;

      if (finalTokenBalance === 0) {
        // New player - give starting tokens
        finalTokenBalance = 10000; // 100 SAFARI
      }

      setWalletState({
        connected: true,
        accountId: simulatedHederaId,
        ethereumAddress: ethereumAddress,
        survivalTokenBalance: finalTokenBalance,
        nftCount: assets.achievementNFTs.length,
        loading: false,
        error: null,
      });

      // Listen for account changes
      if (window.ethereum) {
        window.ethereum
          .request({
            method: "eth_accounts",
          })
          .then((accounts: string[]) => {
            if (accounts.length === 0) {
              // User disconnected
              disconnectWallet();
            }
          });
      }
    } catch (error) {
      setWalletState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect MetaMask wallet",
      }));
    }
  }, [
    gameBlockchain,
    disconnectWallet,
    walletState.accountId,
    walletState.ethereumAddress,
    walletState.survivalTokenBalance,
  ]);

  // Start blockchain-enabled game session
  const startGameSession = useCallback(() => {
    if (!sessionManager || !walletState.accountId) return;

    const session = sessionManager.startSession(walletState.accountId);
    setCurrentSession(session);
    onGameStart?.();
  }, [sessionManager, walletState.accountId, onGameStart]);

  // Update session with current game state and track new achievements + real-time tokens
  useEffect(() => {
    if (sessionManager && currentSession && !gameState.gameOver) {
      const previousAchievements = [...currentSession.achievements];
      const previousSurvivalTime = currentSession.survivalTime;
      const previousScore = currentSession.score;

      sessionManager.updateSession({
        survivalTime: gameState.survivalTime,
        score: gameState.score,
      });
      const updatedSession = sessionManager.getCurrentSession();
      setCurrentSession(updatedSession);

      // Calculate and add real-time token rewards
      const timeDiff = gameState.survivalTime - previousSurvivalTime;
      const scoreDiff = gameState.score - previousScore;

      // Award 1 token per minute of survival (every 60 seconds)
      const minutesEarned =
        Math.floor(gameState.survivalTime / 60) -
        Math.floor(previousSurvivalTime / 60);
      // Award 0.1 token per 100 points scored
      const scoreTokens = Math.floor(scoreDiff / 100) * 10; // 10 = 0.1 token in hundredths

      const totalNewTokens = minutesEarned * 100 + scoreTokens; // Convert to hundredths

      if (totalNewTokens > 0) {
        setWalletState((prev) => ({
          ...prev,
          survivalTokenBalance: prev.survivalTokenBalance + totalNewTokens,
        }));
      }

      // Check for new achievements
      if (updatedSession) {
        const newAchievements = updatedSession.achievements.filter(
          (achievement) => !previousAchievements.includes(achievement)
        );

        if (newAchievements.length > 0) {
          setRecentAchievements(newAchievements);
          // Award achievement bonuses
          let achievementBonus = 0;
          newAchievements.forEach((achievement) => {
            switch (achievement) {
              case "FIRST_SURVIVOR":
                achievementBonus += 5000;
                break; // 50 SAFARI
              case "SPEED_DEMON":
                achievementBonus += 2500;
                break; // 25 SAFARI
              case "COLLISION_MASTER":
                achievementBonus += 1500;
                break; // 15 SAFARI
              case "ENDURANCE_RUNNER":
                achievementBonus += 10000;
                break; // 100 SAFARI
              case "SAFARI_MASTER":
                achievementBonus += 20000;
                break; // 200 SAFARI
              default:
                achievementBonus += 1000;
                break; // 10 SAFARI for other achievements
            }
          });

          if (achievementBonus > 0) {
            setWalletState((prev) => ({
              ...prev,
              survivalTokenBalance:
                prev.survivalTokenBalance + achievementBonus,
            }));
          }

          // Clear recent achievements after 4 seconds
          setTimeout(() => {
            setRecentAchievements([]);
          }, 4000);
        }
      }
    }
  }, [
    sessionManager,
    currentSession,
    gameState.survivalTime,
    gameState.score,
    gameState.gameOver,
  ]);

  // End session and process rewards
  const endGameSession = useCallback(async () => {
    if (!sessionManager || !currentSession) return;

    try {
      const result = await sessionManager.endSession();

      if (result.rewards) {
        setRewardState({
          tokensEarned: result.rewards.tokensAwarded,
          nftMinted: result.rewards.nftMinted || null,
          achievements: result.session.achievements,
          transactionIds: result.rewards.transactionIds,
          showRewardModal: true,
        });

        // Update wallet balance
        if (result.rewards.tokensAwarded > 0) {
          setWalletState((prev) => ({
            ...prev,
            survivalTokenBalance:
              prev.survivalTokenBalance + result.rewards!.tokensAwarded,
          }));
        }

        // Update NFT count
        if (result.rewards.nftMinted) {
          setWalletState((prev) => ({
            ...prev,
            nftCount: prev.nftCount + 1,
          }));
        }
      }

      setCurrentSession(null);
      onGameEnd?.();
    } catch (error) {
      // Failed to end game session
    }
  }, [sessionManager, currentSession, onGameEnd]);

  // Handle game over
  useEffect(() => {
    if (gameState.gameOver && currentSession) {
      endGameSession();
    }
  }, [gameState.gameOver, currentSession, endGameSession]);

  // Copy to clipboard utility
  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      // Failed to copy to clipboard
    }
  }, []);

  // Get achievement display info
  const getAchievementInfo = (achievementId: string) => {
    return GameAchievements.getAchievementInfo(achievementId);
  };

  return (
    <>
      {/* Achievement Notification Animations */}
      <style jsx>{`
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeOutRight {
          0% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(50px);
          }
        }
      `}</style>

      {/* Blockchain Wallet Panel - Matching Native Game UI */}
      <div className="absolute top-70 left-3 z-10 bg-black/60 backdrop-blur-lg p-4 rounded-xl border border-green-500/30 text-green-100 max-w-xs">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-yellow-400" />
              Token
            </h3>
          </div>

          {/* Connection Status */}
          {!walletState.connected ? (
            <div className="text-sm space-y-1">
              <button
                onClick={connectWallet}
                disabled={walletState.loading || !gameBlockchain}
                className="w-full px-3 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                {walletState.loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-sm">🦊</span>
                )}
                {walletState.loading ? "Connecting..." : "Connect MetaMask"}
              </button>
              {walletState.error && (
                <p className="text-xs text-red-400">⚠️ Connection failed</p>
              )}
            </div>
          ) : (
            <div className="text-sm space-y-1">
              {/* Connected Status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300">🦊 MetaMask Connected</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>

              {/* Token Balance */}
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>
                  SAFARI: {(walletState.survivalTokenBalance / 100).toFixed(1)}
                </span>
              </div>

              {/* NFT Count */}
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-400" />
                <span>Achievement NFTs: {walletState.nftCount}</span>
              </div>

              {/* Session Status */}
              {currentSession ? (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-green-300">
                    🎮 Earning: +
                    {(
                      Math.floor(gameState.survivalTime / 60) +
                      Math.floor(gameState.score / 100) * 0.1
                    ).toFixed(1)}{" "}
                    SAFARI
                  </span>
                </div>
              ) : !gameState.gameOver ? (
                <div className="space-y-1">
                  <button
                    onClick={startGameSession}
                    className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    Start Earning Session
                  </button>
                  {/* Test button for debugging */}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Rewards Modal */}
      {rewardState.showRewardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-purple-900/90 border-2 border-purple-500 rounded-2xl p-6 max-w-md w-full text-white">
            <div className="text-center space-y-4">
              {/* Header */}
              <div className="space-y-2">
                <div className="text-4xl">🎉</div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
                  Rewards Earned!
                </h2>
              </div>

              {/* Rewards Summary */}
              <div className="space-y-3">
                {/* Tokens */}
                {rewardState.tokensEarned > 0 && (
                  <div className="flex items-center justify-between bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span>SAFARI Tokens</span>
                    </div>
                    <span className="font-bold text-yellow-400">
                      +{(rewardState.tokensEarned / 100).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* NFT */}
                {rewardState.nftMinted && (
                  <div className="flex items-center justify-between bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-blue-400" />
                      <span>Achievement NFT</span>
                    </div>
                    <span className="font-bold text-blue-400">
                      #{rewardState.nftMinted}
                    </span>
                  </div>
                )}

                {/* Achievements */}
                {rewardState.achievements.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-purple-300">
                      New Achievements:
                    </h3>
                    <div className="space-y-1">
                      {rewardState.achievements.map((achievementId) => {
                        const achievement = getAchievementInfo(achievementId);
                        return (
                          <div
                            key={achievementId}
                            className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded p-2"
                          >
                            <Shield className="w-4 h-4 text-purple-400" />
                            <div className="text-left">
                              <div className="text-sm font-medium">
                                {achievement?.name}
                              </div>
                              <div className="text-xs text-gray-300">
                                {achievement?.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction IDs */}
              {rewardState.transactionIds.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-300">
                    Transaction IDs:
                  </h3>
                  <div className="space-y-1">
                    {rewardState.transactionIds.map((txId, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="font-mono bg-gray-800 px-2 py-1 rounded">
                          {txId.substring(0, 20)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(txId, `tx-${index}`)}
                          className="text-gray-400 hover:text-white"
                        >
                          {copied === `tx-${index}` ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={`https://hashscan.io/testnet/transaction/${txId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() =>
                  setRewardState((prev) => ({
                    ...prev,
                    showRewardModal: false,
                  }))
                }
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Notifications - Subtle and Non-Intrusive */}
      {recentAchievements.length > 0 && (
        <div className="absolute top-20 right-4 z-30 space-y-2">
          {recentAchievements.map((achievementId, index) => {
            const achievement = getAchievementInfo(achievementId);
            return (
              <div
                key={`${achievementId}-${index}-${Date.now()}`}
                className="bg-black/80 backdrop-blur-lg border border-green-500/50 rounded-lg p-3 text-green-100 shadow-xl max-w-64"
                style={{
                  animation:
                    "slideInFromRight 0.3s ease-out, fadeOutRight 0.5s ease-in 3s forwards",
                }}
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-green-100">
                      🏆 {achievement?.name}
                    </div>
                    <div className="text-xs text-yellow-300">
                      +{achievement?.name === "First Survivor" ? "50" : "25"}{" "}
                      SAFARI earned
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
