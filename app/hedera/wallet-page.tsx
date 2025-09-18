"use client";

import { useState, useEffect } from "react";
import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  FileCreateTransaction,
  TokenMintTransaction,
  TransferTransaction,
  Hbar,
  Client,
  PrivateKey,
  AccountId,
  FileAppendTransaction,
  AccountBalanceQuery,
} from "@hashgraph/sdk";
import {
  Upload,
  Coins,
  FileText,
  Send,
  Eye,
  Wallet,
  Settings,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Zap,
  AlertCircle,
  Shield,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  WalletConnector,
  WalletInfo,
  WalletType,
  formatHBAR,
  shortenAddress,
  getWalletIcon,
} from "../lib/wallet-connect";

// Types
interface TokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  type: string;
}

interface FileInfo {
  fileId: string;
  size: number;
  expirationTime: Date;
}

interface NFTInfo {
  tokenId: string;
  serialNumber: number;
  metadata: string;
}

interface Transaction {
  id: string;
  type: string;
  status: "pending" | "success" | "error";
  details: string;
  timestamp: Date;
  txHash?: string;
}

export default function HederaWalletPlayground() {
  const router = useRouter();

  // Wallet state
  const [walletConnector] = useState(new WalletConnector());
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [currentWallet, setCurrentWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountCreationStatus, setAccountCreationStatus] = useState<{
    isCreating: boolean;
    isNew: boolean;
    message: string;
  }>({ isCreating: false, isNew: false, message: "" });

  // App state
  const [activeTab, setActiveTab] = useState("connect");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Token creation state
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState("2");
  const [createdTokens, setCreatedTokens] = useState<TokenInfo[]>([]);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);

  // NFT state
  const [nftTokenId, setNftTokenId] = useState("");
  const [nftMetadata, setNftMetadata] = useState("");
  const [mintedNFTs, setMintedNFTs] = useState<NFTInfo[]>([]);
  const [nftFile, setNftFile] = useState<File | null>(null);
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [autoCollectionCreated, setAutoCollectionCreated] = useState(false);

  // Account balance state
  const [accountBalance, setAccountBalance] = useState<string>("");
  const [tokenBalances, setTokenBalances] = useState<any>({});
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Real Hedera account setup
  const [showHederaSetup, setShowHederaSetup] = useState(false);
  const [hederaAccountId, setHederaAccountId] = useState("");
  const [hederaPrivateKey, setHederaPrivateKey] = useState("");
  const [realHederaClient, setRealHederaClient] = useState<any>(null);
  const [isRealAccount, setIsRealAccount] = useState(false);
  const [parsedPrivateKey, setParsedPrivateKey] = useState<PrivateKey | null>(
    null
  );
  const [saveCredentials, setSaveCredentials] = useState(false);

  // Load saved credentials from localStorage
  useEffect(() => {
    const savedAccountId = localStorage.getItem("hedera_account_id");
    const savedPrivateKey = localStorage.getItem("hedera_private_key");
    const savedSaveCredentials =
      localStorage.getItem("hedera_save_credentials") === "true";

    if (savedAccountId && savedPrivateKey && savedSaveCredentials) {
      setHederaAccountId(savedAccountId);
      setHederaPrivateKey(savedPrivateKey);
      setSaveCredentials(true);
      console.log("📱 Loaded saved Hedera credentials from localStorage");

      // Auto-connect with saved credentials
      setTimeout(() => {
        setupRealHederaClient();
      }, 1000);
    }
  }, []);

  // Initialize wallets on component mount
  useEffect(() => {
    const wallets = walletConnector.getAvailableWallets();
    console.log("🔍 Available wallets:", wallets);
    // Filter out MetaMask for now (commented out as requested)
    const filteredWallets = wallets.filter(
      (wallet) => wallet.type !== "metamask"
    );
    console.log("✅ Filtered wallets:", filteredWallets);

    // If no wallets are available, show a manual connection option
    if (filteredWallets.length === 0) {
      console.log("⚠️ No wallets detected, adding manual option");
      const manualWallet = {
        type: "hashpack" as const,
        name: "HashPack (Manual)",
        icon: "📦",
        isInstalled: false,
        isConnected: false,
      };
      setAvailableWallets([manualWallet]);
    } else {
      setAvailableWallets(filteredWallets);
    }

    // Set up event listeners for wallet changes
    walletConnector.onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else {
        // Account changed, refresh connection
        refreshWalletConnection();
      }
    });

    walletConnector.onChainChanged((chainId) => {
      // Network changed, refresh connection
      refreshWalletConnection();
    });

    return () => {
      walletConnector.removeListeners();
    };
  }, []);

  // Refresh wallet connection
  const refreshWalletConnection = async () => {
    const wallet = walletConnector.getCurrentWallet();
    if (wallet) {
      setCurrentWallet(wallet);
      await queryAccountBalance();
    }
  };

  // Connect to wallet
  const connectWallet = async (walletType: WalletType) => {
    console.log("🔗 Attempting to connect wallet:", walletType);
    setIsConnecting(true);
    setAccountCreationStatus({
      isCreating: true,
      isNew: false,
      message: "Connecting to wallet...",
    });

    try {
      let walletInfo: WalletInfo;

      // MetaMask connection commented out as requested
      /* 
      if (walletType === "metamask") {
        setAccountCreationStatus({
          isCreating: true,
          isNew: false,
          message: "Checking for existing Hedera account...",
        });
        walletInfo = await walletConnector.connectMetaMask();

        // Check if this is a new account (pseudo account ID indicates new account)
        const isNewAccount =
          walletInfo.accountId?.startsWith("0x") ||
          (walletInfo.accountId?.includes("0.0.") &&
            parseInt(walletInfo.accountId.split(".")[2]) > 1000000);

        if (isNewAccount) {
          setAccountCreationStatus({
            isCreating: false,
            isNew: true,
            message:
              "Demo account created! For production use, create a proper Hedera account at portal.hedera.com",
          });
        } else {
          setAccountCreationStatus({
            isCreating: false,
            isNew: false,
            message: "Connected to existing Hedera account",
          });
        }
      } else */ if (walletType === "hashpack") {
        console.log("🔗 Connecting to HashPack...");
        try {
          walletInfo = await walletConnector.connectHashPack();
          setAccountCreationStatus({
            isCreating: false,
            isNew: false,
            message: "Connected to HashPack wallet",
          });
        } catch (error: any) {
          console.error("❌ HashPack connection failed:", error);
          // If HashPack is not installed, show manual setup option
          if (error.message.includes("not installed")) {
            setAccountCreationStatus({
              isCreating: false,
              isNew: false,
              message:
                "HashPack not detected. Please install HashPack or use manual setup below.",
            });
            throw new Error(
              "HashPack not installed. Please install HashPack extension or use the manual Hedera account setup below."
            );
          }
          throw error;
        }
      } else {
        // Only HashPack is supported now (MetaMask commented out)
        console.error("❌ Unsupported wallet type:", walletType);
        throw new Error(
          `Unsupported wallet type: ${walletType}. Only HashPack is currently supported.`
        );
      }

      setCurrentWallet(walletInfo);
      setActiveTab("dashboard");

      // Fetch balance with a small delay to ensure account is ready
      setTimeout(() => {
        queryAccountBalance();
      }, 1000);

      addTransaction(
        "wallet_connect",
        "success",
        `Connected to ${walletInfo.name}`
      );
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      setAccountCreationStatus({
        isCreating: false,
        isNew: false,
        message: `Failed to connect: ${error.message}`,
      });
      addTransaction(
        "wallet_connect",
        "error",
        `Failed to connect: ${error.message}`
      );
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const handleDisconnect = async () => {
    await walletConnector.disconnect();
    setCurrentWallet(null);
    setActiveTab("connect");
    setAccountBalance("");
    setTokenBalances({});
    setBalanceLoading(false);
  };

  // Handle tab change with automatic balance refresh
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    // Auto-refresh balance when switching to dashboard
    if (tabId === "dashboard" && currentWallet && !balanceLoading) {
      setTimeout(() => {
        queryAccountBalance();
      }, 500);
    }
  };

  // Add transaction to history
  const addTransaction = (
    type: string,
    status: "success" | "error" | "pending",
    details: string,
    txHash?: string
  ) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      status,
      details,
      timestamp: new Date(),
      txHash,
    };
    setTransactions((prev) => [newTransaction, ...prev.slice(0, 9)]);
  };

  // Query account balance with retry logic
  const queryAccountBalance = async (retries = 3) => {
    if (!currentWallet?.accountId && !isRealAccount) return;

    setBalanceLoading(true);
    try {
      if (isRealAccount) {
        // For real accounts, use the real Hedera client
        const balanceQuery = new AccountBalanceQuery().setAccountId(
          AccountId.fromString(hederaAccountId)
        );
        const balance = await balanceQuery.execute(realHederaClient);
        setAccountBalance(balance.hbars.toString());
        setTokenBalances(balance.tokens);
        console.log(
          "✅ Real account balance fetched:",
          balance.hbars.toString(),
          "HBAR"
        );
      } else {
        // For wallet accounts, use the wallet connector
        console.log(
          "🔍 Fetching balance for account:",
          currentWallet?.accountId
        );
        const balance = await walletConnector.getAccountBalance();
        setAccountBalance(balance.hbars);
        setTokenBalances(balance.tokens);
        console.log("✅ Balance fetched successfully:", balance.hbars, "HBAR");
      }
    } catch (error) {
      console.error("Balance query failed:", error);

      // Retry logic for newly created accounts
      if (retries > 0) {
        console.log(`🔄 Retrying balance query... (${retries} retries left)`);
        setTimeout(() => queryAccountBalance(retries - 1), 2000);
        return; // Don't set loading to false yet
      } else {
        // Set default balance for demo accounts
        console.log("🎯 Using fallback balance for demo account");
        setAccountBalance("100.00000000");
        setTokenBalances({});
      }
    } finally {
      setBalanceLoading(false);
    }
  };

  // Create token
  const createToken = async () => {
    if (!currentWallet && !isRealAccount) return;

    try {
      setLoading(true);
      addTransaction(
        "token_create",
        "pending",
        `Creating token ${tokenName} (${tokenSymbol})`
      );

      let txId: string;
      let isDemoAccount = false;

      if (isRealAccount) {
        // Use real Hedera client for real accounts
        if (!parsedPrivateKey) {
          throw new Error(
            "Private key not available. Please reconnect your account."
          );
        }

        const tokenCreateTx = new TokenCreateTransaction()
          .setTokenName(tokenName)
          .setTokenSymbol(tokenSymbol)
          .setTokenType(TokenType.FungibleCommon)
          .setDecimals(parseInt(tokenDecimals))
          .setInitialSupply(parseInt(tokenSupply))
          .setTreasuryAccountId(AccountId.fromString(hederaAccountId))
          .setSupplyType(TokenSupplyType.Infinite);

        const tokenCreateSubmit = await tokenCreateTx.execute(realHederaClient);
        const tokenCreateRx = await tokenCreateSubmit.getReceipt(
          realHederaClient
        );
        txId = tokenCreateSubmit.transactionId.toString();
      } else {
        // Use wallet connector for wallet accounts
        const tokenCreateTx = new TokenCreateTransaction()
          .setTokenName(tokenName)
          .setTokenSymbol(tokenSymbol)
          .setTokenType(TokenType.FungibleCommon)
          .setDecimals(parseInt(tokenDecimals))
          .setInitialSupply(parseInt(tokenSupply))
          .setTreasuryAccountId(currentWallet!.accountId!)
          .setSupplyType(TokenSupplyType.Infinite);

        txId = await walletConnector.executeTransaction(tokenCreateTx);

        // Generate a demo token ID for demo accounts
        isDemoAccount = Boolean(
          currentWallet!.accountId?.startsWith("0x") ||
            (currentWallet!.accountId?.includes("0.0.") &&
              parseInt(currentWallet!.accountId.split(".")[2]) > 1000000)
        );
      }

      const tokenId = isDemoAccount
        ? `0.0.${Date.now().toString().slice(-6)}`
        : "0.0.PENDING";

      const newToken: TokenInfo = {
        tokenId,
        name: tokenName,
        symbol: tokenSymbol,
        totalSupply: tokenSupply,
        decimals: parseInt(tokenDecimals),
        type: "Fungible",
      };

      setCreatedTokens((prev) => [...prev, newToken]);

      const message = isDemoAccount
        ? `Demo token created: ${tokenId}`
        : `Token created: ${tokenId}`;

      addTransaction("token_create", "success", message, txId);

      // Clear form
      setTokenName("");
      setTokenSymbol("");
      setTokenSupply("");
    } catch (error: any) {
      console.error("Token creation failed:", error);
      addTransaction(
        "token_create",
        "error",
        `Token creation failed: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Upload file
  const uploadFile = async () => {
    if ((!currentWallet && !isRealAccount) || !selectedFile) return;

    try {
      setLoading(true);
      addTransaction(
        "file_upload",
        "pending",
        `Uploading file: ${selectedFile.name}`
      );

      // Read file contents
      const fileBuffer = await selectedFile.arrayBuffer();
      const fileBytes = new Uint8Array(fileBuffer);

      let txId: string;
      let isDemoAccount = false;

      if (isRealAccount) {
        // Use real Hedera client for real accounts
        if (!parsedPrivateKey) {
          throw new Error(
            "Private key not available. Please reconnect your account."
          );
        }

        const fileCreateTx = new FileCreateTransaction()
          .setContents(fileBytes.slice(0, 1024)) // First chunk
          .setExpirationTime(new Date(Date.now() + 7890000000));

        const fileCreateSubmit = await fileCreateTx.execute(realHederaClient);
        const fileCreateRx = await fileCreateSubmit.getReceipt(
          realHederaClient
        );
        txId = fileCreateSubmit.transactionId.toString();
      } else {
        // Use wallet connector for wallet accounts
        const fileCreateTx = new FileCreateTransaction()
          .setContents(fileBytes.slice(0, 1024)) // First chunk
          .setExpirationTime(new Date(Date.now() + 7890000000));

        txId = await walletConnector.executeTransaction(fileCreateTx);

        // Generate a demo file ID for demo accounts
        isDemoAccount = Boolean(
          currentWallet!.accountId?.startsWith("0x") ||
            (currentWallet!.accountId?.includes("0.0.") &&
              parseInt(currentWallet!.accountId.split(".")[2]) > 1000000)
        );
      }

      const fileId = isDemoAccount
        ? `0.0.${Date.now().toString().slice(-6)}`
        : "0.0.PENDING";

      const newFile: FileInfo = {
        fileId,
        size: fileBytes.length,
        expirationTime: new Date(Date.now() + 7890000000),
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      const message = isDemoAccount
        ? `Demo file uploaded: ${fileId}`
        : `File uploaded: ${fileId}`;

      addTransaction("file_upload", "success", message, txId);
      setSelectedFile(null);
    } catch (error: any) {
      console.error("File upload failed:", error);
      addTransaction(
        "file_upload",
        "error",
        `File upload failed: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Create NFT collection
  const createNFTCollection = async () => {
    if (!isRealAccount) {
      addTransaction(
        "nft_create",
        "error",
        "❌ Please connect your real Hedera account first. Demo accounts cannot create real NFT collections."
      );
      return;
    }

    if (!realHederaClient) {
      addTransaction(
        "nft_create",
        "error",
        "❌ Hedera client not available. Please reconnect your account."
      );
      return;
    }

    try {
      setLoading(true);
      addTransaction(
        "nft_create",
        "pending",
        "Creating real NFT collection on Hedera",
        "pending"
      );

      console.log("🚀 Creating real NFT collection...");

      // Use the already parsed private key from setup
      if (!parsedPrivateKey) {
        throw new Error(
          "Private key not available. Please reconnect your account."
        );
      }

      // Check account balance to ensure sufficient funds
      const balanceQuery = new AccountBalanceQuery().setAccountId(
        AccountId.fromString(hederaAccountId)
      );
      const currentBalance = await balanceQuery.execute(realHederaClient);
      console.log(
        "💰 Current account balance:",
        currentBalance.hbars.toString()
      );

      if (currentBalance.hbars.toTinybars().toNumber() < 2000000000) {
        // 20 HBAR in tinybars
        throw new Error(
          "Insufficient balance. Need at least 20 HBAR to create NFT collection."
        );
      }

      // Create actual NFT collection on Hedera
      // Set supply key to the operator's public key for minting NFTs
      const nftCreateTx = new TokenCreateTransaction()
        .setTokenName("SafariVerse NFT Collection")
        .setTokenSymbol("SAFARI")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(AccountId.fromString(hederaAccountId))
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(parsedPrivateKey.publicKey) // Set supply key to operator's public key
        .setAdminKey(parsedPrivateKey.publicKey) // Set admin key to operator's public key
        .setMaxTransactionFee(new Hbar(20)) // Set max fee to 20 HBAR
        .setTransactionMemo("SafariVerse NFT Collection Creation"); // Add memo for debugging

      // Execute with the operator client (no need to freeze or sign manually)
      console.log("🚀 Creating NFT collection with operator:", {
        operator: realHederaClient.operatorAccountId?.toString(),
        operatorKey: parsedPrivateKey.publicKey.toString(),
        treasuryAccount: hederaAccountId,
        note: "Operator will automatically become admin and supply key",
      });

      // Log transaction details for debugging
      console.log("📋 Transaction details:", {
        tokenName: "SafariVerse NFT Collection",
        tokenSymbol: "SAFARI",
        tokenType: "NonFungibleUnique",
        treasuryAccountId: hederaAccountId,
        supplyKey: parsedPrivateKey.publicKey.toString(),
        adminKey: parsedPrivateKey.publicKey.toString(),
        maxFee: "20 HBAR",
      });

      // Debug client state
      console.log("🔍 Client debug info:", {
        hasOperator: !!realHederaClient.operatorAccountId,
        operatorAccountId: realHederaClient.operatorAccountId?.toString(),
        operatorPublicKey: realHederaClient.operatorPublicKey?.toString(),
        network: realHederaClient.network?.toString(),
      });

      // Try to manually sign the transaction if needed
      console.log("🔐 Attempting to sign transaction manually...");
      try {
        // Freeze the transaction first
        nftCreateTx.freezeWith(realHederaClient);
        console.log("✅ Transaction frozen successfully");

        // Sign the transaction
        nftCreateTx.sign(parsedPrivateKey);
        console.log("✅ Transaction signed successfully");
      } catch (signError) {
        console.warn(
          "⚠️ Manual signing failed, proceeding with client execution:",
          signError
        );
      }

      let nftCreateSubmit, nftCreateRx, tokenId;

      try {
        console.log("🔄 Attempting transaction execution...");
        nftCreateSubmit = await nftCreateTx.execute(realHederaClient);
        console.log("✅ Transaction executed successfully");

        nftCreateRx = await nftCreateSubmit.getReceipt(realHederaClient);
        console.log("✅ Receipt obtained successfully");

        tokenId = nftCreateRx.tokenId?.toString();
        console.log("🎯 Token ID:", tokenId);
      } catch (executionError) {
        console.error("❌ Transaction execution failed:", executionError);

        // Try alternative approach - create a new client instance
        console.log("🔄 Trying alternative approach with fresh client...");
        const freshClient = Client.forTestnet();
        freshClient.setOperator(
          AccountId.fromString(hederaAccountId),
          parsedPrivateKey
        );

        // Recreate the transaction
        const altNftCreateTx = new TokenCreateTransaction()
          .setTokenName("SafariVerse NFT Collection")
          .setTokenSymbol("SAFARI")
          .setTokenType(TokenType.NonFungibleUnique)
          .setDecimals(0)
          .setInitialSupply(0)
          .setTreasuryAccountId(AccountId.fromString(hederaAccountId))
          .setSupplyType(TokenSupplyType.Infinite)
          .setSupplyKey(parsedPrivateKey.publicKey)
          .setAdminKey(parsedPrivateKey.publicKey)
          .setMaxTransactionFee(new Hbar(20))
          .setTransactionMemo("SafariVerse NFT Collection Creation - Retry");

        nftCreateSubmit = await altNftCreateTx.execute(freshClient);
        nftCreateRx = await nftCreateSubmit.getReceipt(freshClient);
        tokenId = nftCreateRx.tokenId?.toString();

        console.log("✅ Alternative approach succeeded:", tokenId);
      }

      if (tokenId) {
        setNftTokenId(tokenId);
        addTransaction(
          "nft_create",
          "success",
          `Real NFT collection created: ${tokenId}`,
          nftCreateSubmit.transactionId.toString()
        );

        console.log("✅ Real NFT collection created:", {
          tokenId,
          transactionId: nftCreateSubmit.transactionId.toString(),
        });
      } else {
        throw new Error("Failed to get token ID from receipt");
      }
    } catch (error: any) {
      console.error("NFT collection creation failed:", error);
      addTransaction(
        "nft_create",
        "error",
        `NFT collection creation failed: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Upload file to Hedera File Service
  const uploadFileToHedera = async (file: File): Promise<string> => {
    if (!realHederaClient) {
      throw new Error(
        "Hedera client not available. Please reconnect your account."
      );
    }

    if (!hederaPrivateKey) {
      throw new Error(
        "Private key not available. Please reconnect your account."
      );
    }

    console.log("📁 Uploading file to Hedera File Service:", file.name);

    // Read file contents
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Use the already parsed private key from setup
    if (!parsedPrivateKey) {
      throw new Error(
        "Private key not available. Please reconnect your account."
      );
    }

    // Create file on Hedera File Service
    const fileCreateTx = new FileCreateTransaction()
      .setContents(fileBytes.slice(0, 1024)) // First chunk (max 1KB per transaction)
      .setExpirationTime(new Date(Date.now() + 7890000000)) // ~3 months
      .setMaxTransactionFee(new Hbar(5));

    const fileCreateSubmit = await fileCreateTx.execute(realHederaClient);
    const fileCreateRx = await fileCreateSubmit.getReceipt(realHederaClient);
    const fileId = fileCreateRx.fileId?.toString();

    if (!fileId) {
      throw new Error("Failed to get file ID from receipt");
    }

    // If file is larger than 1KB, append remaining chunks
    if (fileBytes.length > 1024) {
      let offset = 1024;
      while (offset < fileBytes.length) {
        const chunk = fileBytes.slice(offset, offset + 1024);
        const fileAppendTx = new FileAppendTransaction()
          .setFileId(fileId)
          .setContents(chunk)
          .setMaxTransactionFee(new Hbar(5));

        await fileAppendTx.execute(realHederaClient);
        offset += 1024;
      }
    }

    console.log("✅ File uploaded to Hedera:", fileId);
    return fileId;
  };

  // Mint NFT
  const mintNFT = async () => {
    console.log("🎯 Mint NFT called", {
      isRealAccount,
      nftTokenId,
      nftFile: !!nftFile,
      nftMetadata: !!nftMetadata,
    });

    // Enhanced validation with better error messages
    if (!isRealAccount) {
      console.log("❌ Not connected to real Hedera account");
      addTransaction(
        "nft_mint",
        "error",
        "❌ Please connect your real Hedera account first. Demo accounts cannot mint real NFTs."
      );
      return;
    }

    if (!realHederaClient) {
      console.log("❌ Hedera client not initialized");
      addTransaction(
        "nft_mint",
        "error",
        "❌ Hedera client not available. Please reconnect your account."
      );
      return;
    }

    // Auto-create collection if it doesn't exist
    if (!nftTokenId) {
      console.log("🔄 No NFT collection found, creating one automatically...");
      addTransaction(
        "nft_mint",
        "pending",
        "🔄 Creating NFT collection automatically...",
        "pending"
      );

      try {
        await createNFTCollection();
        if (!nftTokenId) {
          addTransaction(
            "nft_mint",
            "error",
            "❌ Failed to create NFT collection automatically"
          );
          return;
        }
        addTransaction(
          "nft_mint",
          "success",
          "✅ NFT collection created automatically",
          "auto-created"
        );
      } catch (error) {
        console.error("❌ Auto collection creation failed:", error);
        addTransaction(
          "nft_mint",
          "error",
          "❌ Failed to create NFT collection automatically"
        );
        return;
      }
    }

    // Check if we have either a file or manual metadata
    if (!nftFile && !nftMetadata) {
      console.log("❌ No file or metadata provided");
      addTransaction(
        "nft_mint",
        "error",
        "❌ Please upload a file or provide metadata to create your NFT"
      );
      return;
    }

    try {
      setLoading(true);
      addTransaction(
        "nft_mint",
        "pending",
        "Minting real NFT on Hedera",
        "pending"
      );

      let metadata = nftMetadata;

      // If file is provided, upload it to Hedera File Service
      if (nftFile) {
        console.log("📁 Uploading file to Hedera...");
        const fileId = await uploadFileToHedera(nftFile);

        // Create NFT metadata following OpenSea standard
        const nftMetadataObj = {
          name: nftName || nftFile.name.split(".")[0],
          description:
            nftDescription || "NFT created with SafariVerse Hedera SDK",
          image: `https://testnet.mirrornode.hedera.com/api/v1/files/${fileId}/contents`,
          attributes: [
            {
              trait_type: "File Type",
              value: nftFile.type,
            },
            {
              trait_type: "File Size",
              value: `${(nftFile.size / 1024).toFixed(2)} KB`,
            },
            {
              trait_type: "Created On",
              value: new Date().toISOString(),
            },
            {
              trait_type: "Creator",
              value: hederaAccountId,
            },
          ],
          external_url: `https://hashscan.io/testnet/token/${nftTokenId}`,
          hedera_file_id: fileId,
        };

        metadata = JSON.stringify(nftMetadataObj);
      }

      console.log(
        "🎨 Minting NFT with metadata:",
        metadata.substring(0, 100) + "..."
      );

      // Mint actual NFT on Hedera
      const mintTx = new TokenMintTransaction()
        .setTokenId(nftTokenId)
        .setMetadata([Buffer.from(metadata)])
        .setMaxTransactionFee(new Hbar(10));

      const mintSubmit = await mintTx.execute(realHederaClient);
      const mintRx = await mintSubmit.getReceipt(realHederaClient);
      const serialNumbers = mintRx.serials;

      if (serialNumbers && serialNumbers.length > 0) {
        const serialNumber = serialNumbers[0].toNumber();
        const newNFT: NFTInfo = {
          tokenId: nftTokenId,
          serialNumber,
          metadata,
        };

        setMintedNFTs((prev) => {
          const updated = [...prev, newNFT];
          console.log("✅ Real NFT added to state:", {
            newNFT,
            totalNFTs: updated.length,
          });
          return updated;
        });

        addTransaction(
          "nft_mint",
          "success",
          `Real NFT minted: Serial #${serialNumber}`,
          mintSubmit.transactionId.toString()
        );

        console.log("🎉 Real NFT successfully minted:", {
          tokenId: nftTokenId,
          serialNumber,
          transactionId: mintSubmit.transactionId.toString(),
        });

        // Clear form
        setNftMetadata("");
        setNftFile(null);
        setNftName("");
        setNftDescription("");
      } else {
        throw new Error("Failed to get serial number from receipt");
      }
    } catch (error: any) {
      console.error("NFT minting failed:", error);

      // Provide more specific error messages
      let errorMessage = "NFT minting failed";
      if (error.message.includes("INSUFFICIENT_PAYER_BALANCE")) {
        errorMessage =
          "❌ Insufficient HBAR balance. Please add more HBAR to your account.";
      } else if (error.message.includes("INVALID_ACCOUNT_ID")) {
        errorMessage =
          "❌ Invalid account ID. Please check your account credentials.";
      } else if (error.message.includes("INVALID_SIGNATURE")) {
        errorMessage = "❌ Invalid private key. Please check your private key.";
      } else if (error.message.includes("TOKEN_HAS_NO_SUPPLY_KEY")) {
        errorMessage =
          "❌ NFT collection not properly configured. Please recreate the collection.";
      } else if (error.message.includes("FILE_NOT_FOUND")) {
        errorMessage =
          "❌ File upload failed. Please try uploading the file again.";
      } else {
        errorMessage = `❌ NFT minting failed: ${error.message}`;
      }

      addTransaction("nft_mint", "error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Setup real Hedera client
  const setupRealHederaClient = async () => {
    if (!hederaAccountId || !hederaPrivateKey) {
      addTransaction(
        "hedera_setup",
        "error",
        "Please provide both Account ID and Private Key"
      );
      return;
    }

    try {
      setLoading(true);

      // Validate account ID format
      if (!/^\d+\.\d+\.\d+$/.test(hederaAccountId)) {
        throw new Error(
          "Invalid account ID format. Expected format: 0.0.123456"
        );
      }

      // Create client for testnet
      const client = Client.forTestnet();

      // Parse and validate private key
      let privateKey: PrivateKey;
      try {
        // Try different private key formats
        if (hederaPrivateKey.startsWith("302e020100300506032b657004220420")) {
          // DER-encoded format
          privateKey = PrivateKey.fromString(hederaPrivateKey);
        } else if (hederaPrivateKey.length === 64) {
          // Raw hex format - convert to DER
          const derKey = `302e020100300506032b657004220420${hederaPrivateKey}`;
          privateKey = PrivateKey.fromString(derKey);
        } else {
          // Try as-is
          privateKey = PrivateKey.fromString(hederaPrivateKey);
        }
      } catch (keyError) {
        throw new Error(
          "Invalid private key format. Please ensure it's in the correct DER-encoded format."
        );
      }

      // Set operator with validated credentials
      client.setOperator(AccountId.fromString(hederaAccountId), privateKey);

      // Test the connection by querying account balance
      const balanceQuery = new AccountBalanceQuery().setAccountId(
        AccountId.fromString(hederaAccountId)
      );

      const balance = await balanceQuery.execute(client);

      setRealHederaClient(client);
      setParsedPrivateKey(privateKey); // Store the parsed private key
      setIsRealAccount(true);
      setAccountBalance(balance.hbars.toString());
      setTokenBalances(balance.tokens);
      setShowHederaSetup(false);

      // Save credentials to localStorage if user wants to save them
      if (saveCredentials) {
        localStorage.setItem("hedera_account_id", hederaAccountId);
        localStorage.setItem("hedera_private_key", hederaPrivateKey);
        localStorage.setItem("hedera_save_credentials", "true");
        console.log("💾 Saved Hedera credentials to localStorage");
      } else {
        // Clear saved credentials if user doesn't want to save
        localStorage.removeItem("hedera_account_id");
        localStorage.removeItem("hedera_private_key");
        localStorage.removeItem("hedera_save_credentials");
      }

      addTransaction(
        "hedera_setup",
        "success",
        `Connected to real Hedera account: ${hederaAccountId}`,
        `setup-${Date.now()}`
      );

      console.log("✅ Real Hedera client connected:", {
        accountId: hederaAccountId,
        balance: balance.hbars.toString(),
      });
    } catch (error: any) {
      console.error("Failed to setup Hedera client:", error);

      let errorMessage = "Failed to connect";
      if (error.message.includes("INVALID_ACCOUNT_ID")) {
        errorMessage =
          "❌ Invalid Account ID format. Please check your account ID.";
      } else if (error.message.includes("INVALID_SIGNATURE")) {
        errorMessage =
          "❌ Invalid Private Key. Please check your private key format.";
      } else if (error.message.includes("INSUFFICIENT_PAYER_BALANCE")) {
        errorMessage =
          "❌ Insufficient HBAR balance. Please add HBAR to your account.";
      } else {
        errorMessage = `❌ Failed to connect: ${error.message}`;
      }

      addTransaction("hedera_setup", "error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Open transaction in explorer
  const openInExplorer = (txHash: string) => {
    const explorerUrl =
      currentWallet?.network === "mainnet"
        ? "https://hashscan.io/mainnet/transaction/"
        : "https://hashscan.io/testnet/transaction/";
    window.open(`${explorerUrl}${txHash}`, "_blank");
  };

  // Account Status Notification Component
  const AccountStatusNotification = () => {
    if (!accountCreationStatus.message) return null;

    return (
      <div
        className={`mb-6 p-4 rounded-lg border ${
          accountCreationStatus.isCreating
            ? "bg-blue-500/20 border-blue-500/30"
            : accountCreationStatus.isNew
            ? "bg-yellow-500/20 border-yellow-500/30"
            : "bg-green-500/20 border-green-500/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {accountCreationStatus.isCreating && (
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          )}
          {accountCreationStatus.isNew && !accountCreationStatus.isCreating && (
            <Shield className="w-5 h-5 text-yellow-400" />
          )}
          {!accountCreationStatus.isNew &&
            !accountCreationStatus.isCreating && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          <div className="flex-1">
            <p className="text-white font-medium">
              {accountCreationStatus.message}
            </p>
            {accountCreationStatus.isNew && (
              <div className="mt-2 space-y-2">
                <p className="text-white/70 text-sm">
                  This is a demo account for testing purposes. Limited
                  functionality may be available.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      window.open("https://portal.hedera.com", "_blank")
                    }
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium transition-colors"
                  >
                    Create Real Account
                  </button>
                  <button
                    onClick={() =>
                      window.open("https://faucet.testnet.hedera.com", "_blank")
                    }
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium transition-colors"
                  >
                    Use Faucet
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() =>
              setAccountCreationStatus({
                isCreating: false,
                isNew: false,
                message: "",
              })
            }
            className="text-white/50 hover:text-white transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case "connect":
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-white/70">
                Choose a wallet to connect to Hedera and start interacting with
                the network
              </p>
            </div>

            {/* Real Hedera Account Setup - More Prominent */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">
                  🔐 Professional Hedera Account
                </h3>
                {isRealAccount && (
                  <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full ml-auto">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Connected</span>
                  </div>
                )}
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-yellow-300 font-semibold">
                    Quick Start Option
                  </h4>
                </div>
                <p className="text-yellow-200 text-sm">
                  Don't have HashPack? No problem! You can connect directly with
                  your Hedera Account ID and Private Key. This is the fastest
                  way to get started with real Hedera transactions.
                </p>
              </div>

              {!isRealAccount ? (
                <div>
                  <p className="text-white/80 mb-4">
                    Connect with your real Hedera account credentials to create
                    actual NFTs that will appear on HashScan and be tradeable.
                  </p>

                  {/* Quick Demo Mode Option */}
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-blue-400" />
                      <h4 className="text-blue-300 font-semibold">
                        Try Demo Mode First
                      </h4>
                    </div>
                    <p className="text-blue-200 text-sm mb-3">
                      Want to explore the NFT features without connecting a
                      wallet? Try demo mode to see how everything works!
                    </p>
                    <button
                      onClick={() => {
                        // Create a demo wallet connection
                        const demoWallet = {
                          type: "hashpack" as const,
                          name: "Demo Account",
                          icon: "🎭",
                          isInstalled: true,
                          isConnected: true,
                          accountId: "0.0.123456", // Demo account ID
                          network: "testnet" as const,
                        };
                        setCurrentWallet(demoWallet);
                        setActiveTab("dashboard");
                        setAccountBalance("100.00000000");
                        addTransaction(
                          "demo_connect",
                          "success",
                          "Connected to demo account"
                        );
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Try Demo Mode
                    </button>
                  </div>

                  {!showHederaSetup ? (
                    <button
                      onClick={() => setShowHederaSetup(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Setup Real Hedera Account
                    </button>
                  ) : (
                    <div className="space-y-4 bg-white/5 rounded-lg p-4">
                      <div>
                        <label className="block text-white mb-2 font-medium">
                          Account ID
                        </label>
                        <input
                          type="text"
                          value={hederaAccountId}
                          onChange={(e) => setHederaAccountId(e.target.value)}
                          placeholder="0.0.123456"
                          className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-green-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-medium">
                          Private Key
                        </label>
                        <input
                          type="password"
                          value={hederaPrivateKey}
                          onChange={(e) => setHederaPrivateKey(e.target.value)}
                          placeholder="302e020100300506032b657004220420..."
                          className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-green-400 focus:outline-none"
                        />
                      </div>

                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded p-3">
                        <p className="text-yellow-300 text-sm">
                          ⚠️ Your private key is only stored locally and used to
                          sign transactions. Never share it with anyone.
                        </p>
                      </div>

                      <div className="bg-blue-500/20 border border-blue-500/30 rounded p-3">
                        <p className="text-blue-300 text-sm font-medium mb-2">
                          🔑 Private Key Format Help:
                        </p>
                        <div className="text-blue-200 text-xs space-y-1">
                          <p>
                            • <strong>DER format:</strong>{" "}
                            302e020100300506032b657004220420...
                          </p>
                          <p>
                            • <strong>Raw hex:</strong> 64-character hex string
                          </p>
                          <p>
                            • <strong>From portal.hedera.com:</strong> Copy the
                            full private key
                          </p>
                        </div>
                      </div>

                      {/* Save Credentials Checkbox */}
                      <div className="bg-green-500/20 border border-green-500/30 rounded p-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveCredentials}
                            onChange={(e) =>
                              setSaveCredentials(e.target.checked)
                            }
                            className="w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                          />
                          <div>
                            <p className="text-green-300 text-sm font-medium">
                              💾 Save Credentials
                            </p>
                            <p className="text-green-200 text-xs">
                              Remember my Account ID and Private Key for next
                              time
                            </p>
                          </div>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={setupRealHederaClient}
                          disabled={
                            loading || !hederaAccountId || !hederaPrivateKey
                          }
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Connect Account
                        </button>
                        <button
                          onClick={() => setShowHederaSetup(false)}
                          className="px-4 py-3 text-white/70 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Account ID:</span>
                    <span className="text-white font-mono">
                      {hederaAccountId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Balance:</span>
                    <span className="text-green-400 font-semibold">
                      {accountBalance} HBAR
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsRealAccount(false);
                      setRealHederaClient(null);
                      setParsedPrivateKey(null);
                      setHederaAccountId("");
                      setHederaPrivateKey("");
                      setNftTokenId("");
                      setSaveCredentials(false);
                      // Clear saved credentials from localStorage
                      localStorage.removeItem("hedera_account_id");
                      localStorage.removeItem("hedera_private_key");
                      localStorage.removeItem("hedera_save_credentials");
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Disconnect Real Account
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableWallets.map((wallet) => (
                <div
                  key={wallet.type}
                  className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 border-2 transition-all cursor-pointer ${
                    wallet.isInstalled
                      ? "border-white/20 hover:border-blue-400/50 hover:bg-white/20"
                      : "border-gray-500/30 opacity-50"
                  }`}
                  onClick={() =>
                    wallet.isInstalled && connectWallet(wallet.type)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{wallet.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">
                        {wallet.name}
                      </h3>
                      <p className="text-white/60">
                        {wallet.isInstalled
                          ? "Click to connect"
                          : "Not installed"}
                      </p>
                    </div>
                    {isConnecting && (
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    )}
                  </div>

                  {!wallet.isInstalled && (
                    <div className="mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (wallet.type === "metamask") {
                            window.open("https://metamask.io/", "_blank");
                          } else if (wallet.type === "hashpack") {
                            window.open("https://www.hashpack.app/", "_blank");
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Install {wallet.name}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Installation Guide */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Wallet Setup Guide
              </h3>
              <div className="space-y-3 text-white/70 text-sm">
                {/* MetaMask option commented out as requested */}
                {/*
                <div>
                  <strong className="text-white">MetaMask:</strong> Popular
                  Ethereum wallet with Hedera EVM support. After connecting,
                  you'll be prompted to add the Hedera network.
                </div>
                */}
                <div>
                  <strong className="text-white">HashPack:</strong> Native
                  Hedera wallet with full ecosystem support. Provides the best
                  experience for Hedera-specific features.
                </div>
              </div>
            </div>
          </div>
        );

      case "dashboard":
        return (
          <div className="space-y-6">
            <AccountStatusNotification />

            {!currentWallet && !isRealAccount ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <Wallet className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Wallet Connected
                </h3>
                <p className="text-white/70 mb-4">
                  Connect your wallet to view account information and balances
                </p>
                <button
                  onClick={() => setActiveTab("connect")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                {/* Wallet Info */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Wallet Information
                    </h3>
                    <button
                      onClick={handleDisconnect}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getWalletIcon(currentWallet?.type as WalletType)}
                        <span className="font-semibold text-white">
                          {currentWallet?.name}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm">Connected Wallet</p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="font-semibold text-white mb-2">
                        {currentWallet?.accountId || "Unknown"}
                      </div>
                      <p className="text-white/70 text-sm">Account ID</p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="font-semibold text-white mb-2 capitalize">
                        {currentWallet?.network || "Unknown"}
                      </div>
                      <p className="text-white/70 text-sm">Network</p>
                    </div>
                  </div>
                </div>

                {/* Account Balance */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Account Balance
                    </h3>
                    <button
                      onClick={() => queryAccountBalance()}
                      disabled={balanceLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          balanceLoading ? "animate-spin" : ""
                        }`}
                      />
                      {balanceLoading ? "Loading..." : "Refresh"}
                    </button>
                  </div>

                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {balanceLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      formatHBAR(accountBalance || "0")
                    )}
                  </div>

                  {!balanceLoading && !accountBalance && (
                    <div className="text-yellow-400 text-sm mb-2">
                      💡 Balance not loaded? Try clicking "Refresh" above
                    </div>
                  )}

                  {Object.keys(tokenBalances).length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white font-semibold mb-2">
                        Token Balances:
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(tokenBalances).map(
                          ([tokenId, balance]: [string, any]) => (
                            <div
                              key={tokenId}
                              className="text-white/70 text-sm"
                            >
                              {tokenId}: {balance}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case "tokens":
        return (
          <div className="space-y-6">
            {!currentWallet && !isRealAccount ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <Coins className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Token Management
                </h3>
                <p className="text-white/70 mb-4">
                  Connect your wallet to create and manage Hedera tokens
                </p>
                <button
                  onClick={() => setActiveTab("connect")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                {/* Demo Account Notice for Tokens */}
                {currentWallet &&
                  (currentWallet.accountId?.startsWith("0x") ||
                    (currentWallet.accountId?.includes("0.0.") &&
                      parseInt(currentWallet.accountId.split(".")[2]) >
                        1000000)) && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-yellow-400 font-medium">
                            Demo Mode Active
                          </p>
                          <p className="text-white/70 text-sm">
                            Transactions will be simulated. For real token
                            creation, use a proper Hedera account.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Create Fungible Token
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      placeholder="Token Name"
                      className="p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30"
                    />
                    <input
                      type="text"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value)}
                      placeholder="Symbol (e.g., STK)"
                      className="p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30"
                    />
                    <input
                      type="number"
                      value={tokenSupply}
                      onChange={(e) => setTokenSupply(e.target.value)}
                      placeholder="Initial Supply"
                      className="p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30"
                    />
                    <input
                      type="number"
                      value={tokenDecimals}
                      onChange={(e) => setTokenDecimals(e.target.value)}
                      placeholder="Decimals"
                      className="p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30"
                    />
                  </div>
                  <button
                    onClick={createToken}
                    disabled={
                      loading ||
                      (!currentWallet && !isRealAccount) ||
                      !tokenName ||
                      !tokenSymbol ||
                      !tokenSupply
                    }
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Coins className="w-4 h-4" />
                    )}
                    Create Token
                  </button>
                </div>

                {createdTokens.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Created Tokens
                    </h3>
                    <div className="space-y-3">
                      {createdTokens.map((token, index) => (
                        <div key={index} className="bg-white/10 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-white">
                                {token.name} ({token.symbol})
                              </h4>
                              <p className="text-white/70">
                                Supply: {token.totalSupply}
                              </p>
                              <p className="text-white/70">
                                Decimals: {token.decimals}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/50">
                                {token.tokenId}
                              </span>
                              <button
                                onClick={() => copyToClipboard(token.tokenId)}
                                className="text-white/50 hover:text-white"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "files":
        return (
          <div className="space-y-6">
            {!currentWallet && !isRealAccount ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <FileText className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  File Storage
                </h3>
                <p className="text-white/70 mb-4">
                  Connect your wallet to upload and manage files on Hedera File
                  Service
                </p>
                <button
                  onClick={() => setActiveTab("connect")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                {/* Demo Account Notice for Files */}
                {currentWallet &&
                  (currentWallet.accountId?.startsWith("0x") ||
                    (currentWallet.accountId?.includes("0.0.") &&
                      parseInt(currentWallet.accountId.split(".")[2]) >
                        1000000)) && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-yellow-400 font-medium">
                            Demo Mode Active
                          </p>
                          <p className="text-white/70 text-sm">
                            File uploads will be simulated. For real file
                            storage, use a proper Hedera account.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Upload File to Hedera File Service
                  </h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                      <input
                        type="file"
                        onChange={(e) =>
                          setSelectedFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
                        <p className="text-white/70">
                          {selectedFile
                            ? selectedFile.name
                            : "Click to select a file"}
                        </p>
                      </label>
                    </div>
                    <button
                      onClick={uploadFile}
                      disabled={
                        loading ||
                        (!currentWallet && !isRealAccount) ||
                        !selectedFile
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      Upload File
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "nfts":
        return (
          <div className="space-y-6">
            {!currentWallet && !isRealAccount ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <Upload className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  🎨 NFT Creation Studio
                </h3>
                <p className="text-white/70 mb-6">
                  Create and mint unique NFTs on the Hedera network. Upload your
                  digital artwork, add metadata, and bring your creativity to
                  life!
                </p>

                {/* Preview of NFT form */}
                <div className="bg-white/5 rounded-lg p-6 mb-6">
                  <h4 className="text-white font-semibold mb-4">
                    What you can do:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-blue-400" />
                      <span className="text-white/80">Upload media files</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-400" />
                      <span className="text-white/80">
                        Add name & description
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="text-white/80">Create collections</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Send className="w-5 h-5 text-purple-400" />
                      <span className="text-white/80">Mint real NFTs</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("connect")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
                >
                  Connect Wallet to Start Creating
                </button>
              </div>
            ) : (
              <>
                {/* Status Overview */}
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    NFT Creation Status
                  </h4>

                  {/* Step-by-step status */}
                  <div className="space-y-3">
                    {/* Step 1: Account Connection */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isRealAccount
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {isRealAccount ? "✓" : "1"}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            isRealAccount ? "text-green-300" : "text-red-300"
                          }`}
                        >
                          {isRealAccount
                            ? "Real Hedera Account Connected"
                            : "Connect Real Hedera Account"}
                        </p>
                        <p className="text-xs text-blue-200">
                          {isRealAccount
                            ? `Account: ${hederaAccountId}`
                            : "Required for real NFT creation"}
                        </p>
                      </div>
                    </div>

                    {/* Step 2: NFT Collection */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          nftTokenId
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-white"
                        }`}
                      >
                        {nftTokenId ? "✓" : "2"}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            nftTokenId ? "text-green-300" : "text-yellow-300"
                          }`}
                        >
                          {nftTokenId
                            ? "NFT Collection Created"
                            : "Create NFT Collection"}
                        </p>
                        <p className="text-xs text-blue-200">
                          {nftTokenId
                            ? `Token ID: ${nftTokenId}`
                            : "Required before minting NFTs (~20 HBAR)"}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: File Upload */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          nftFile
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {nftFile ? "✓" : "3"}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            nftFile ? "text-green-300" : "text-gray-300"
                          }`}
                        >
                          {nftFile ? "File Selected" : "Select NFT Media"}
                        </p>
                        <p className="text-xs text-blue-200">
                          {nftFile
                            ? `${nftFile.name} (${(nftFile.size / 1024).toFixed(
                                2
                              )} KB)`
                            : "Upload image, video, or audio file"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Current Status Summary */}
                  <div className="mt-4 pt-3 border-t border-blue-400/30">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">
                        Ready to mint:{" "}
                        {isRealAccount && nftTokenId && nftFile
                          ? "✅ Yes"
                          : "❌ No"}
                      </span>
                      <span className="text-blue-200 text-sm">
                        Minted NFTs: {mintedNFTs.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Help Guide */}
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    How to Create NFTs
                  </h4>
                  <div className="space-y-2 text-sm text-green-200">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">1.</span>
                      <span>
                        Connect your real Hedera account (not demo) using
                        Account ID and Private Key
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">2.</span>
                      <span>
                        Create an NFT collection first (~20 HBAR cost) - this is
                        required before minting
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">3.</span>
                      <span>
                        Upload your media file (image, video, audio) or provide
                        metadata
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">4.</span>
                      <span>
                        Click "Mint NFT" to create your unique NFT on Hedera
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-400/30">
                    <p className="text-green-200 text-xs">
                      💡 <strong>Need help?</strong> Get a testnet account at{" "}
                      <a
                        href="https://portal.hedera.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-green-100"
                      >
                        portal.hedera.com
                      </a>{" "}
                      and use the faucet to get free testnet HBAR.
                    </p>
                  </div>
                </div>

                {/* Demo Account Notice for NFTs */}
                {currentWallet &&
                  (currentWallet.accountId?.startsWith("0x") ||
                    (currentWallet.accountId?.includes("0.0.") &&
                      parseInt(currentWallet.accountId.split(".")[2]) >
                        1000000)) && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-1">
                            Demo Mode - NFT Creation
                          </h4>
                          <p className="text-yellow-300/90 text-sm">
                            You're in demo mode. NFTs created will be simulated.
                            For real NFT creation, create a proper Hedera
                            account at{" "}
                            <a
                              href="https://portal.hedera.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-yellow-200"
                            >
                              portal.hedera.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    NFT Operations
                  </h3>
                  <div className="space-y-4">
                    {/* Auto Collection Status */}
                    {nftTokenId && (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <div>
                            <h4 className="text-green-400 font-semibold">
                              NFT Collection Ready
                            </h4>
                            <p className="text-green-300 text-sm">
                              Token ID: {nftTokenId}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* NFT Upload Form - Always Visible */}
                    <div className="bg-white/5 rounded-lg p-6 space-y-6">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">
                          🎨 Create Your NFT
                        </h2>
                        <p className="text-white/70">
                          Upload your digital artwork and create a unique NFT on
                          Hedera
                        </p>
                      </div>

                      {/* File Upload Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">
                          📁 Upload NFT Media
                        </h3>

                        <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 transition-colors">
                          <input
                            type="file"
                            accept="image/*,video/*,audio/*,.json"
                            onChange={(e) =>
                              setNftFile(e.target.files?.[0] || null)
                            }
                            className="hidden"
                            id="nft-file-upload"
                          />
                          <label
                            htmlFor="nft-file-upload"
                            className="cursor-pointer block"
                          >
                            <Upload className="w-12 h-12 text-white/50 mx-auto mb-4" />
                            <p className="text-white/70 text-lg mb-2">
                              {nftFile
                                ? nftFile.name
                                : "Click to select NFT media"}
                            </p>
                            <p className="text-white/50 text-sm">
                              {nftFile
                                ? `Size: ${(nftFile.size / 1024).toFixed(2)} KB`
                                : "Supports: Images, Videos, Audio, JSON"}
                            </p>
                            {nftFile && (
                              <div className="mt-3">
                                <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                                  <CheckCircle className="w-4 h-4" />
                                  File ready for upload
                                </span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* NFT Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">
                          🏷️ NFT Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-white mb-2 font-medium">
                              NFT Name
                            </label>
                            <input
                              type="text"
                              value={nftName}
                              onChange={(e) => setNftName(e.target.value)}
                              placeholder="My Amazing NFT"
                              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-white mb-2 font-medium">
                              Creator Name
                            </label>
                            <input
                              type="text"
                              placeholder="Your name"
                              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-white mb-2 font-medium">
                            Description
                          </label>
                          <textarea
                            value={nftDescription}
                            onChange={(e) => setNftDescription(e.target.value)}
                            placeholder="Describe your NFT artwork, its story, or inspiration..."
                            rows={4}
                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-blue-400 focus:outline-none resize-none"
                          />
                        </div>
                      </div>

                      {/* Advanced Options */}
                      <details className="group">
                        <summary className="cursor-pointer text-white/80 font-medium mb-4 flex items-center gap-2">
                          <span className="transform group-open:rotate-90 transition-transform">
                            ▶
                          </span>
                          Advanced: Manual Metadata
                        </summary>
                        <div className="space-y-4">
                          <p className="text-white/60 text-sm">
                            Override automatic metadata generation with custom
                            JSON
                          </p>
                          <textarea
                            value={nftMetadata}
                            onChange={(e) => setNftMetadata(e.target.value)}
                            placeholder='{"name": "Custom NFT", "description": "Custom description", "attributes": [...]}'
                            rows={6}
                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-blue-400 focus:outline-none font-mono text-sm"
                          />
                        </div>
                      </details>

                      {/* Mint Button */}
                      <div className="pt-4 border-t border-white/20">
                        <button
                          onClick={mintNFT}
                          disabled={
                            loading ||
                            (!currentWallet && !isRealAccount) ||
                            (!nftFile && !nftMetadata)
                          }
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white p-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all"
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                          🎨 Mint NFT
                        </button>

                        {!nftFile && !nftMetadata && (
                          <p className="text-white/50 text-sm text-center mt-2">
                            Please upload a file or provide metadata to continue
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Keep existing content below */}
                    {nftTokenId && (
                      <div className="space-y-4">
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <p className="text-green-400 font-semibold">
                              NFT Collection Created (Demo Mode)
                            </p>
                          </div>
                          <p className="text-white/70 text-sm mb-2">
                            Token ID: {nftTokenId}
                          </p>
                          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded p-2">
                            <p className="text-yellow-300 text-xs">
                              ⚠️ This is a demo token ID. It won't appear on
                              HashScan since it's not a real Hedera token. For
                              real NFTs, connect with a proper Hedera account.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* NFT Display Section */}
                {nftTokenId && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Minted NFTs ({mintedNFTs.length})
                    </h3>

                    {mintedNFTs.length === 0 ? (
                      <p className="text-white/50 text-center py-8">
                        No NFTs minted yet. Upload a file or add metadata and
                        click "Mint NFT" to create your first NFT!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {mintedNFTs.map((nft, index) => {
                          console.log("🎨 Rendering NFT:", { index, nft });
                          let parsedMetadata = null;
                          try {
                            parsedMetadata = JSON.parse(nft.metadata);
                          } catch (e) {
                            // Metadata is not JSON, keep as string
                          }

                          return (
                            <div
                              key={index}
                              className="bg-white/10 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white mb-2">
                                    {parsedMetadata?.name ||
                                      `NFT Serial #${nft.serialNumber}`}
                                  </h4>
                                  <p className="text-white/70 text-sm">
                                    Token: {nft.tokenId}
                                  </p>

                                  {parsedMetadata ? (
                                    <div className="mt-2 space-y-1">
                                      {parsedMetadata.description && (
                                        <p className="text-white/60 text-sm">
                                          {parsedMetadata.description}
                                        </p>
                                      )}

                                      {parsedMetadata.image && (
                                        <div className="flex items-center gap-2 mt-2">
                                          <ExternalLink className="w-4 h-4 text-blue-400" />
                                          <a
                                            href={parsedMetadata.image}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm underline"
                                          >
                                            View Media
                                          </a>
                                        </div>
                                      )}

                                      {parsedMetadata.hedera_file_id && (
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-4 h-4 text-green-400" />
                                          <span className="text-green-400 text-sm">
                                            File ID:{" "}
                                            {parsedMetadata.hedera_file_id}
                                          </span>
                                          <button
                                            onClick={() =>
                                              copyToClipboard(
                                                parsedMetadata.hedera_file_id
                                              )
                                            }
                                            className="text-white/50 hover:text-white"
                                          >
                                            <Copy className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}

                                      {parsedMetadata.attributes && (
                                        <div className="mt-2">
                                          <p className="text-white/50 text-xs mb-1">
                                            Attributes:
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {parsedMetadata.attributes.map(
                                              (
                                                attr: any,
                                                attrIndex: number
                                              ) => (
                                                <span
                                                  key={attrIndex}
                                                  className="bg-white/10 text-white/70 text-xs px-2 py-1 rounded"
                                                >
                                                  {attr.trait_type}:{" "}
                                                  {attr.value}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-white/70 text-sm mt-2">
                                      {nft.metadata.substring(0, 100)}
                                      {nft.metadata.length > 100 ? "..." : ""}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        `${nft.tokenId}/${nft.serialNumber}`
                                      )
                                    }
                                    className="text-white/50 hover:text-white"
                                    title="Copy Token ID/Serial"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>

                                  {parsedMetadata?.external_url && (
                                    <a
                                      href={parsedMetadata.external_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-white/50 hover:text-white"
                                      title="View on HashScan"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "transactions":
        return (
          <div className="space-y-6">
            {!currentWallet && !isRealAccount ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <Settings className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Transaction History
                </h3>
                <p className="text-white/70 mb-4">
                  Connect your wallet to view your Hedera transaction history
                </p>
                <button
                  onClick={() => setActiveTab("connect")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Transaction History
                </h3>
                {transactions.length === 0 ? (
                  <p className="text-white/50">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {tx.status === "success" && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                              {tx.status === "error" && (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                              {tx.status === "pending" && (
                                <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                              )}
                              <span className="font-semibold text-white capitalize">
                                {tx.type.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-white/70 text-sm">
                              {tx.details}
                            </p>
                            <p className="text-white/50 text-xs mt-1">
                              {tx.timestamp.toLocaleString()}
                            </p>
                          </div>
                          {tx.txHash && (
                            <button
                              onClick={() => openInExplorer(tx.txHash!)}
                              className="text-white/50 hover:text-white ml-4"
                              title="View in Explorer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-white">
                Hedera Wallet Playground
              </h1>
              {currentWallet && (
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">
                    {currentWallet.name} Connected
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sticky top-8">
              <nav className="space-y-2">
                {[
                  { id: "connect", label: "Connect Wallet", icon: Wallet },
                  {
                    id: "dashboard",
                    label: "Dashboard",
                    icon: Eye,
                    disabled: false,
                  },
                  {
                    id: "tokens",
                    label: "Tokens",
                    icon: Coins,
                    disabled: false,
                  },
                  {
                    id: "files",
                    label: "Files",
                    icon: FileText,
                    disabled: false,
                  },
                  {
                    id: "nfts",
                    label: "NFTs",
                    icon: Upload,
                    disabled: false,
                  },
                  {
                    id: "transactions",
                    label: "History",
                    icon: Settings,
                    disabled: false,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && handleTabChange(tab.id)}
                    disabled={tab.disabled}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : tab.disabled
                        ? "text-white/30 cursor-not-allowed"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
