import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  FileCreateTransaction,
  FileAppendTransaction,
  TokenMintTransaction,
  TokenNftInfoQuery,
  AccountBalanceQuery,
  TransferTransaction,
  Hbar,
  TokenAssociateTransaction,
  TokenInfoQuery,
  FileInfoQuery,
  TokenId,
} from "@hashgraph/sdk";

export interface HederaConfig {
  accountId: string;
  privateKey: string;
  network: "testnet" | "mainnet";
}

export class HederaService {
  private client: Client;
  private accountId: AccountId;
  private privateKey: PrivateKey;

  constructor(config: HederaConfig) {
    this.accountId = AccountId.fromString(config.accountId);
    this.privateKey = PrivateKey.fromString(config.privateKey);

    if (config.network === "testnet") {
      this.client = Client.forTestnet();
    } else {
      this.client = Client.forMainnet();
    }

    this.client.setOperator(this.accountId, this.privateKey);
  }

  // Get account balance
  async getAccountBalance() {
    const balanceQuery = new AccountBalanceQuery().setAccountId(this.accountId);

    const balance = await balanceQuery.execute(this.client);
    return {
      hbars: balance.hbars.toString(),
      tokens: balance.tokens,
    };
  }

  // Create fungible token
  async createFungibleToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
    maxSupply?: number;
  }) {
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(params.name)
      .setTokenSymbol(params.symbol)
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(params.decimals)
      .setInitialSupply(params.initialSupply)
      .setTreasuryAccountId(this.accountId)
      .setSupplyType(
        params.maxSupply ? TokenSupplyType.Finite : TokenSupplyType.Infinite
      )
      .setAdminKey(this.privateKey)
      .setSupplyKey(this.privateKey);

    if (params.maxSupply) {
      tokenCreateTx.setMaxSupply(params.maxSupply);
    }

    const tokenCreateSubmit = await tokenCreateTx.execute(this.client);
    const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);

    return {
      tokenId: tokenCreateRx.tokenId?.toString(),
      transactionId: tokenCreateSubmit.transactionId.toString(),
    };
  }

  // Create NFT collection
  async createNFTCollection(params: {
    name: string;
    symbol: string;
    maxSupply?: number;
  }) {
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(params.name)
      .setTokenSymbol(params.symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(this.accountId)
      .setSupplyType(
        params.maxSupply ? TokenSupplyType.Finite : TokenSupplyType.Infinite
      )
      .setAdminKey(this.privateKey)
      .setSupplyKey(this.privateKey);

    if (params.maxSupply) {
      tokenCreateTx.setMaxSupply(params.maxSupply);
    }

    const tokenCreateSubmit = await tokenCreateTx.execute(this.client);
    const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);

    return {
      tokenId: tokenCreateRx.tokenId?.toString(),
      transactionId: tokenCreateSubmit.transactionId.toString(),
    };
  }

  // Mint NFT
  async mintNFT(tokenId: string, metadata: string[]) {
    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata(metadata.map((meta) => Buffer.from(meta)));

    const mintSubmit = await mintTx.execute(this.client);
    const mintRx = await mintSubmit.getReceipt(this.client);

    return {
      serials: mintRx.serials?.map((s) => s.toNumber()) || [],
      transactionId: mintSubmit.transactionId.toString(),
    };
  }

  // Upload file to Hedera File Service
  async uploadFile(fileBuffer: Uint8Array, expirationTime?: Date) {
    const expTime = expirationTime || new Date(Date.now() + 7890000000); // ~3 months default

    // Create file with first chunk (max 1KB per transaction)
    const firstChunk = fileBuffer.slice(0, 1024);
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([this.privateKey])
      .setContents(firstChunk)
      .setExpirationTime(expTime);

    const fileCreateSubmit = await fileCreateTx.execute(this.client);
    const fileCreateRx = await fileCreateSubmit.getReceipt(this.client);
    const fileId = fileCreateRx.fileId?.toString();

    if (!fileId) {
      throw new Error("Failed to create file");
    }

    // If file is larger than 1KB, append remaining chunks
    if (fileBuffer.length > 1024) {
      let offset = 1024;
      while (offset < fileBuffer.length) {
        const chunk = fileBuffer.slice(offset, offset + 1024);
        const fileAppendTx = new FileAppendTransaction()
          .setFileId(fileId)
          .setContents(chunk);

        await fileAppendTx.execute(this.client);
        offset += 1024;
      }
    }

    return {
      fileId,
      size: fileBuffer.length,
      expirationTime: expTime,
    };
  }

  // Get token info
  async getTokenInfo(tokenId: string) {
    const tokenInfoQuery = new TokenInfoQuery().setTokenId(tokenId);

    const tokenInfo = await tokenInfoQuery.execute(this.client);
    return tokenInfo;
  }

  // Get NFT info
  async getNFTInfo(tokenId: string, serialNumber: number) {
    const nftInfoQuery = new TokenNftInfoQuery()
      .setTokenId(tokenId)
      .setSerialNumber(serialNumber);

    const nftInfo = await nftInfoQuery.execute(this.client);
    return nftInfo;
  }

  // Transfer tokens
  async transferTokens(params: {
    tokenId: string;
    amount: number;
    recipientAccountId: string;
  }) {
    const transferTx = new TransferTransaction()
      .addTokenTransfer(params.tokenId, this.accountId, -params.amount)
      .addTokenTransfer(
        params.tokenId,
        AccountId.fromString(params.recipientAccountId),
        params.amount
      );

    const transferSubmit = await transferTx.execute(this.client);
    const transferRx = await transferSubmit.getReceipt(this.client);

    return {
      status: transferRx.status.toString(),
      transactionId: transferSubmit.transactionId.toString(),
    };
  }

  // Transfer HBAR
  async transferHBAR(params: { amount: number; recipientAccountId: string }) {
    const transferTx = new TransferTransaction()
      .addHbarTransfer(this.accountId, Hbar.fromTinybars(-params.amount))
      .addHbarTransfer(
        AccountId.fromString(params.recipientAccountId),
        Hbar.fromTinybars(params.amount)
      );

    const transferSubmit = await transferTx.execute(this.client);
    const transferRx = await transferSubmit.getReceipt(this.client);

    return {
      status: transferRx.status.toString(),
      transactionId: transferSubmit.transactionId.toString(),
    };
  }

  // Transfer NFT
  async transferNFT(params: {
    tokenId: string;
    serialNumber: number;
    recipientAccountId: string;
  }) {
    const transferTx = new TransferTransaction().addNftTransfer(
      TokenId.fromString(params.tokenId),
      params.serialNumber,
      this.accountId,
      AccountId.fromString(params.recipientAccountId)
    );

    const transferSubmit = await transferTx.execute(this.client);
    const transferRx = await transferSubmit.getReceipt(this.client);

    return {
      status: transferRx.status.toString(),
      transactionId: transferSubmit.transactionId.toString(),
    };
  }

  // Associate token with account
  async associateToken(tokenId: string) {
    const associateTx = new TokenAssociateTransaction()
      .setAccountId(this.accountId)
      .setTokenIds([tokenId]);

    const associateSubmit = await associateTx.execute(this.client);
    const associateRx = await associateSubmit.getReceipt(this.client);

    return {
      status: associateRx.status.toString(),
      transactionId: associateSubmit.transactionId.toString(),
    };
  }

  // Get file info
  async getFileInfo(fileId: string) {
    const fileInfoQuery = new FileInfoQuery().setFileId(fileId);

    const fileInfo = await fileInfoQuery.execute(this.client);
    return fileInfo;
  }

  // Close client connection
  close() {
    this.client.close();
  }
}

// Utility functions
export const formatHBAR = (amount: string | number): string => {
  const hbar = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${hbar.toFixed(8)} HBAR`;
};

export const formatTokenAmount = (amount: number, decimals: number): string => {
  return (amount / Math.pow(10, decimals)).toFixed(decimals);
};

export const validateAccountId = (accountId: string): boolean => {
  const regex = /^\d+\.\d+\.\d+$/;
  return regex.test(accountId);
};

export const validatePrivateKey = (privateKey: string): boolean => {
  try {
    PrivateKey.fromString(privateKey);
    return true;
  } catch {
    return false;
  }
};

export const shortenHash = (hash: string, length: number = 8): string => {
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
};

// Predefined metadata templates for NFTs
export const NFTMetadataTemplates = {
  artwork: (
    title: string,
    artist: string,
    description: string,
    imageUrl: string
  ) =>
    JSON.stringify({
      name: title,
      description,
      image: imageUrl,
      artist,
      attributes: [
        { trait_type: "Type", value: "Artwork" },
        { trait_type: "Artist", value: artist },
      ],
    }),

  collectible: (
    name: string,
    rarity: string,
    description: string,
    imageUrl: string
  ) =>
    JSON.stringify({
      name,
      description,
      image: imageUrl,
      attributes: [
        { trait_type: "Type", value: "Collectible" },
        { trait_type: "Rarity", value: rarity },
      ],
    }),

  certificate: (
    title: string,
    recipient: string,
    issuer: string,
    date: string
  ) =>
    JSON.stringify({
      name: title,
      description: `Certificate issued to ${recipient} by ${issuer}`,
      attributes: [
        { trait_type: "Type", value: "Certificate" },
        { trait_type: "Recipient", value: recipient },
        { trait_type: "Issuer", value: issuer },
        { trait_type: "Issue Date", value: date },
      ],
    }),
};
