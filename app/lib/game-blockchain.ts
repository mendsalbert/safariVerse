import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  Hbar,
  TokenAssociateTransaction,
  TokenId,
  FileCreateTransaction,
  FileAppendTransaction,
} from "@hashgraph/sdk";
import { HederaService } from "./hedera-utils";

// Game-specific blockchain integration
export interface GameReward {
  type: "SURVIVAL_TOKEN" | "ACHIEVEMENT_NFT" | "RARE_ENCOUNTER_NFT";
  amount?: number;
  metadata?: GameNFTMetadata;
  achievementId?: string;
}

export interface GameNFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  game_data: {
    achievement_type: string;
    timestamp: number;
    survival_time?: number;
    score?: number;
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  };
}

export interface GameSession {
  sessionId: string;
  playerId: string;
  startTime: number;
  endTime?: number;
  survivalTime: number;
  score: number;
  achievements: string[];
  tokensEarned: number;
  nftsEarned: GameNFTMetadata[];
}

export class SafariGameBlockchain {
  private hederaService: HederaService;
  private survivalTokenId?: TokenId;
  private achievementNFTCollectionId?: TokenId;
  private initialized: boolean = false;

  constructor(hederaService: HederaService) {
    this.hederaService = hederaService;
  }

  // Initialize game tokens and NFT collections
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create Safari Survival Token (Fungible)
      const survivalTokenResult = await this.hederaService.createFungibleToken({
        name: "Safari Survival Token",
        symbol: "SAFARI",
        decimals: 2,
        initialSupply: 1000000, // 1M initial supply
        maxSupply: 10000000, // 10M max supply
      });

      if (survivalTokenResult.tokenId) {
        this.survivalTokenId = TokenId.fromString(survivalTokenResult.tokenId);
      }

      // Create Safari Achievement NFT Collection
      const achievementNFTResult = await this.hederaService.createNFTCollection(
        {
          name: "Safari Adventure Achievements",
          symbol: "SAFNFT",
          maxSupply: 100000, // 100k max NFTs
        }
      );

      if (achievementNFTResult.tokenId) {
        this.achievementNFTCollectionId = TokenId.fromString(
          achievementNFTResult.tokenId
        );
      }

      this.initialized = true;
      console.log("Safari Game Blockchain initialized successfully");
      console.log("Survival Token ID:", this.survivalTokenId?.toString());
      console.log(
        "Achievement NFT Collection ID:",
        this.achievementNFTCollectionId?.toString()
      );
    } catch (error) {
      console.error("Failed to initialize Safari Game Blockchain:", error);
      throw error;
    }
  }

  // Calculate token rewards based on game performance
  calculateTokenRewards(gameSession: GameSession): number {
    let baseReward = 0;

    // Base survival reward (1 token per minute survived)
    baseReward += Math.floor(gameSession.survivalTime / 60) * 100; // 1 SAFARI per minute

    // Score-based bonus
    baseReward += Math.floor(gameSession.score / 100) * 10; // 0.1 SAFARI per 100 points

    // Achievement bonuses
    gameSession.achievements.forEach((achievement) => {
      switch (achievement) {
        case "FIRST_SURVIVOR":
          baseReward += 1000;
          break; // 10 SAFARI
        case "SPEED_DEMON":
          baseReward += 500;
          break; // 5 SAFARI
        case "COLLISION_MASTER":
          baseReward += 300;
          break; // 3 SAFARI
        case "ENDURANCE_RUNNER":
          baseReward += 2000;
          break; // 20 SAFARI
        case "SAFARI_MASTER":
          baseReward += 5000;
          break; // 50 SAFARI
        default:
          baseReward += 100;
          break; // 1 SAFARI for other achievements
      }
    });

    return baseReward;
  }

  // Determine if player should receive NFT based on achievements
  shouldMintAchievementNFT(gameSession: GameSession): GameNFTMetadata | null {
    // Rare NFTs for special achievements
    if (
      gameSession.achievements.includes("SAFARI_MASTER") &&
      gameSession.survivalTime > 300
    ) {
      return this.createNFTMetadata("Safari Master", "legendary", gameSession);
    }

    if (
      gameSession.achievements.includes("ENDURANCE_RUNNER") &&
      gameSession.survivalTime > 180
    ) {
      return this.createNFTMetadata("Endurance Runner", "epic", gameSession);
    }

    if (gameSession.score > 500) {
      return this.createNFTMetadata("High Scorer", "rare", gameSession);
    }

    if (gameSession.survivalTime > 120 && Math.random() < 0.1) {
      // 10% chance for 2+ minute survivors
      return this.createNFTMetadata("Lucky Survivor", "uncommon", gameSession);
    }

    return null;
  }

  // Create NFT metadata for achievements
  private createNFTMetadata(
    achievementType: string,
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary",
    gameSession: GameSession
  ): GameNFTMetadata {
    const rarityColors = {
      common: "#808080",
      uncommon: "#00FF00",
      rare: "#0080FF",
      epic: "#8000FF",
      legendary: "#FFD700",
    };

    return {
      name: `Safari ${achievementType} #${Date.now()}`,
      description: `Earned by surviving ${Math.floor(
        gameSession.survivalTime / 60
      )} minutes and ${
        gameSession.survivalTime % 60
      } seconds in the Safari Adventure game with a score of ${
        gameSession.score
      }.`,
      image: `https://safariverse.app/nft-images/${rarity}-${achievementType
        .toLowerCase()
        .replace(" ", "-")}.png`,
      attributes: [
        { trait_type: "Rarity", value: rarity },
        { trait_type: "Achievement Type", value: achievementType },
        {
          trait_type: "Survival Time (seconds)",
          value: gameSession.survivalTime,
        },
        { trait_type: "Final Score", value: gameSession.score },
        {
          trait_type: "Achievements Count",
          value: gameSession.achievements.length,
        },
        {
          trait_type: "Date Earned",
          value: new Date().toISOString().split("T")[0],
        },
        { trait_type: "Rarity Color", value: rarityColors[rarity] },
      ],
      game_data: {
        achievement_type: achievementType,
        timestamp: Date.now(),
        survival_time: gameSession.survivalTime,
        score: gameSession.score,
        rarity: rarity,
      },
    };
  }

  // Reward player with tokens and/or NFTs
  async rewardPlayer(
    playerAccountId: string,
    gameSession: GameSession
  ): Promise<{
    tokensAwarded: number;
    nftMinted?: string;
    transactionIds: string[];
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const results: string[] = [];
    const tokensAwarded = this.calculateTokenRewards(gameSession);
    let nftMinted: string | undefined;

    try {
      // Award survival tokens
      if (tokensAwarded > 0 && this.survivalTokenId) {
        const tokenTransferResult = await this.hederaService.transferTokens({
          tokenId: this.survivalTokenId.toString(),
          amount: tokensAwarded,
          recipientAccountId: playerAccountId,
        });
        results.push(tokenTransferResult.transactionId);
      }

      // Check for NFT rewards
      const nftMetadata = this.shouldMintAchievementNFT(gameSession);
      if (nftMetadata && this.achievementNFTCollectionId) {
        // Upload metadata to IPFS/File service
        const metadataJson = JSON.stringify(nftMetadata);
        const fileResult = await this.hederaService.uploadFile(
          new TextEncoder().encode(metadataJson),
          new Date(Date.now() + 7890000000) // 3 months expiration
        );

        // Mint NFT with metadata
        const nftMintResult = await this.hederaService.mintNFT(
          this.achievementNFTCollectionId.toString(),
          [metadataJson]
        );

        if (nftMintResult.serials.length > 0) {
          nftMinted = nftMintResult.serials[0].toString();
        }
        results.push(nftMintResult.transactionId);
      }

      return {
        tokensAwarded,
        nftMinted,
        transactionIds: results,
      };
    } catch (error) {
      console.error("Failed to reward player:", error);
      throw error;
    }
  }

  // Get player's game assets
  async getPlayerAssets(playerAccountId: string): Promise<{
    survivalTokenBalance: number;
    achievementNFTs: Array<{
      serialNumber: string;
      metadata: GameNFTMetadata;
    }>;
  }> {
    try {
      let survivalTokenBalance = 0;
      const achievementNFTs: Array<{
        serialNumber: string;
        metadata: GameNFTMetadata;
      }> = [];

      // Get token balance
      if (this.survivalTokenId) {
        // For demo purposes, return 0 so new players get starting tokens
        // In a real implementation, you'd query the account balance from Hedera
        survivalTokenBalance = 0; // Always 0 for new players
      }

      // Get NFTs (this would require additional implementation in HederaService)
      // For now, return empty array

      return {
        survivalTokenBalance,
        achievementNFTs,
      };
    } catch (error) {
      console.error("Failed to get player assets:", error);
      return {
        survivalTokenBalance: 0,
        achievementNFTs: [],
      };
    }
  }

  // Create marketplace listing for game assets
  async createMarketplaceListing(
    ownerAccountId: string,
    assetType: "TOKEN" | "NFT",
    assetId: string,
    price: number,
    description: string
  ): Promise<string> {
    // This would integrate with your SafariMart contract
    // Implementation depends on your marketplace architecture
    throw new Error("Marketplace integration not yet implemented");
  }

  // Get token and NFT collection IDs
  getSurvivalTokenId(): TokenId | undefined {
    return this.survivalTokenId;
  }

  getAchievementNFTCollectionId(): TokenId | undefined {
    return this.achievementNFTCollectionId;
  }
}

// Achievement detection utilities
export class GameAchievements {
  private static achievements = {
    FIRST_SURVIVOR: {
      id: "FIRST_SURVIVOR",
      name: "First Survivor",
      description: "Survive your first minute in the safari",
      condition: (session: GameSession) => session.survivalTime >= 60,
    },
    SPEED_DEMON: {
      id: "SPEED_DEMON",
      name: "Speed Demon",
      description: "Reach high speeds without crashing",
      condition: (session: GameSession) =>
        session.score > 200 && session.survivalTime > 120,
    },
    COLLISION_MASTER: {
      id: "COLLISION_MASTER",
      name: "Collision Master",
      description: "Survive multiple collisions and keep going",
      condition: (session: GameSession) => session.survivalTime > 90,
    },
    ENDURANCE_RUNNER: {
      id: "ENDURANCE_RUNNER",
      name: "Endurance Runner",
      description: "Survive for over 3 minutes",
      condition: (session: GameSession) => session.survivalTime >= 180,
    },
    SAFARI_MASTER: {
      id: "SAFARI_MASTER",
      name: "Safari Master",
      description: "Achieve legendary status by surviving over 5 minutes",
      condition: (session: GameSession) => session.survivalTime >= 300,
    },
  };

  static checkAchievements(session: GameSession): string[] {
    const earned: string[] = [];

    Object.values(this.achievements).forEach((achievement) => {
      if (achievement.condition(session)) {
        earned.push(achievement.id);
      }
    });

    return earned;
  }

  static getAchievementInfo(achievementId: string) {
    return this.achievements[achievementId as keyof typeof this.achievements];
  }

  static getAllAchievements() {
    return Object.values(this.achievements);
  }
}

// Game session manager
export class GameSessionManager {
  private currentSession: GameSession | null = null;
  private blockchain: SafariGameBlockchain;

  constructor(blockchain: SafariGameBlockchain) {
    this.blockchain = blockchain;
  }

  startSession(playerId: string): GameSession {
    this.currentSession = {
      sessionId: `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      playerId,
      startTime: Date.now(),
      survivalTime: 0,
      score: 0,
      achievements: [],
      tokensEarned: 0,
      nftsEarned: [],
    };

    return this.currentSession;
  }

  updateSession(
    updates: Partial<Pick<GameSession, "survivalTime" | "score">>
  ): void {
    if (!this.currentSession) return;

    if (updates.survivalTime !== undefined) {
      this.currentSession.survivalTime = updates.survivalTime;
    }
    if (updates.score !== undefined) {
      this.currentSession.score = updates.score;
    }

    // Check for new achievements
    const newAchievements = GameAchievements.checkAchievements(
      this.currentSession
    );
    this.currentSession.achievements = [
      ...new Set([...this.currentSession.achievements, ...newAchievements]),
    ];
  }

  async endSession(): Promise<{
    session: GameSession;
    rewards: {
      tokensAwarded: number;
      nftMinted?: string;
      transactionIds: string[];
    } | null;
  }> {
    if (!this.currentSession) {
      throw new Error("No active session to end");
    }

    this.currentSession.endTime = Date.now();

    let rewards = null;

    // Only reward if player survived at least 30 seconds
    if (this.currentSession.survivalTime >= 30) {
      try {
        rewards = await this.blockchain.rewardPlayer(
          this.currentSession.playerId,
          this.currentSession
        );
        this.currentSession.tokensEarned = rewards.tokensAwarded;
      } catch (error) {
        console.error("Failed to process blockchain rewards:", error);
      }
    }

    const completedSession = { ...this.currentSession };
    this.currentSession = null;

    return {
      session: completedSession,
      rewards,
    };
  }

  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }
}
