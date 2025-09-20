"use client";

import {
  BrowserProvider,
  Contract,
  Eip1193Provider,
  JsonRpcSigner,
  JsonRpcProvider,
  parseUnits,
  formatUnits,
} from "ethers";
import { getHederaNetworkManager } from "./hedera-network";

// Import full ABI from build artifact
// NOTE: relative path from `app/lib/*` to `artifacts/*`
// Next.js supports importing JSON modules directly in TS.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import SafariVerseMarketplaceArtifact from "../../artifacts/contracts/SafariVerseMarketplace.sol/SafariVerseMarketplace.json";
const ABI = (SafariVerseMarketplaceArtifact as { abi: any[] }).abi;

export type Product = {
  id: bigint;
  name: string;
  description: string;
  fileUrl: string;
  price: bigint;
  creator: string;
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
  itemsSold: bigint;
  totalRevenue: bigint;
  category: string;
};

export type ProductInput = {
  name: string;
  description: string;
  fileUrl: string;
  price: string; // Price as string (will be converted to wei)
  category: string;
};

export type ProductUpdate = {
  name: string;
  description: string;
  fileUrl: string;
  price: string; // Price as string (will be converted to wei)
  category: string;
};

export type CreatorStats = {
  totalRevenue: bigint;
  totalItemsSold: bigint;
};

export type PlatformStats = {
  totalProducts: bigint;
  totalSales: bigint;
  totalRevenue: bigint;
};

export type ProductListResult = {
  products: Product[];
  totalCount: bigint;
};

export const SV_MARKETPLACE_ADDRESS: string =
  process.env.NEXT_PUBLIC_SV_MARKETPLACE_ADDRESS ||
  "0x5f190e7dbbaeFac2c1Bb328A6fB393dA53813988"; // Will be set after deployment

function getWindowEthereum(): Eip1193Provider {
  if (
    typeof window === "undefined" ||
    !(window as { ethereum?: Eip1193Provider }).ethereum
  ) {
    throw new Error("No injected wallet found (window.ethereum)");
  }
  return (window as { ethereum: Eip1193Provider }).ethereum;
}

// Enhanced provider creation with better error handling
export async function createBrowserProvider(): Promise<BrowserProvider> {
  try {
    const ethereum = getWindowEthereum();

    // Ensure we're on Hedera Testnet using the network manager
    const networkManager = getHederaNetworkManager();
    await networkManager.ensureHederaTestnet();

    // Create provider after ensuring correct network
    const provider = new BrowserProvider(ethereum, 296);

    // Test the provider connection
    const network = await provider.getNetwork();
    console.log("🔍 Browser Provider Network:", {
      chainId: network.chainId.toString(),
      name: network.name,
    });

    return provider;
  } catch (error: any) {
    console.error("❌ Failed to create browser provider:", error);
    throw error;
  }
}

// Create a reliable RPC provider for read operations
export function createReliableRPCProvider(): JsonRpcProvider {
  const rpcEndpoints = [
    "https://testnet.hashio.io/api",
    "https://hedera-testnet.rpc.thirdweb.com",
  ];

  // Try each endpoint until one works
  for (const rpcUrl of rpcEndpoints) {
    try {
      console.log(`🔄 Creating RPC provider with: ${rpcUrl}`);
      const provider = new JsonRpcProvider(rpcUrl, {
        name: "hedera-testnet",
        chainId: 296,
      });

      // Test the provider with a simple call
      provider
        .getBlockNumber()
        .then((blockNumber) => {
          console.log(`✅ RPC provider working - Block: ${blockNumber}`);
        })
        .catch((error) => {
          console.warn(`⚠️ RPC provider test failed: ${error.message}`);
        });

      return provider;
    } catch (error) {
      console.warn(`❌ Failed to create RPC provider with ${rpcUrl}:`, error);
      continue;
    }
  }

  throw new Error("All RPC endpoints failed");
}

export async function getSigner(): Promise<JsonRpcSigner> {
  try {
    // Use the enhanced provider creation
    const provider = await createBrowserProvider();
    await provider.send("eth_requestAccounts", []);

    // Debug: Check network and connection
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    console.log("🔍 Wallet Network Info:", {
      chainId: network.chainId.toString(),
      name: network.name,
      blockNumber: blockNumber,
    });

    return await provider.getSigner();
  } catch (error: any) {
    console.error("❌ Error getting signer:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      reason: error.reason,
    });

    // Check for common wallet connection issues
    if (error.message?.includes("User rejected")) {
      throw new Error(
        "User rejected wallet connection. Please connect your wallet to continue."
      );
    } else if (error.message?.includes("No injected wallet")) {
      throw new Error(
        "No wallet found. Please install MetaMask or another compatible wallet."
      );
    } else if (error.code === 4001) {
      throw new Error(
        "User rejected the request. Please approve the connection in your wallet."
      );
    } else if (error.code === -32002) {
      throw new Error(
        "Request already pending. Please check your wallet and approve the connection."
      );
    }

    throw error;
  }
}

export function getReadContract(
  provider: BrowserProvider | JsonRpcProvider
): Contract {
  return new Contract(SV_MARKETPLACE_ADDRESS, ABI, provider);
}

export function getWriteContract(signer: JsonRpcSigner): Contract {
  return new Contract(SV_MARKETPLACE_ADDRESS, ABI, signer);
}

// Utility function to test contract connectivity
export async function testContractConnection(): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  try {
    console.log("🔍 Testing contract connection...");

    // Test with reliable RPC provider first (more reliable than browser provider)
    try {
      const provider = createReliableRPCProvider();
      const contract = getReadContract(provider);

      // Test basic connectivity
      const blockNumber = await provider.getBlockNumber();

      console.log("✅ Reliable RPC provider connected:", {
        chainId: "296",
        blockNumber: blockNumber,
      });

      // Test contract call
      const [totalProducts] = await contract.getPlatformStats();

      return {
        success: true,
        details: {
          provider: "reliable-rpc",
          chainId: "296",
          blockNumber: blockNumber,
          totalProducts: totalProducts.toString(),
        },
      };
    } catch (rpcError: any) {
      console.warn(
        "⚠️ Reliable RPC provider failed, trying individual RPC endpoints:",
        rpcError.message
      );

      // Fallback to direct RPC with multiple endpoints
      const rpcEndpoints = [
        "https://testnet.hashio.io/api",
        "https://hedera-testnet.rpc.thirdweb.com",
      ];

      for (const rpcUrl of rpcEndpoints) {
        try {
          console.log(`🔄 Trying RPC fallback: ${rpcUrl}`);
          const rpcProvider = new JsonRpcProvider(rpcUrl, {
            name: "hedera-testnet",
            chainId: 296,
          });
          const rpcContract = new Contract(
            SV_MARKETPLACE_ADDRESS,
            ABI,
            rpcProvider
          );

          const blockNumber = await rpcProvider.getBlockNumber();
          const [totalProducts] = await rpcContract.getPlatformStats();

          return {
            success: true,
            details: {
              provider: "rpc",
              chainId: "296",
              blockNumber: blockNumber,
              totalProducts: totalProducts.toString(),
              rpcError: rpcError.message,
              rpcEndpoint: rpcUrl,
            },
          };
        } catch (rpcError: any) {
          console.warn(`❌ RPC endpoint ${rpcUrl} failed:`, rpcError.message);
          continue;
        }
      }

      throw new Error("All RPC endpoints failed");
    }
  } catch (error: any) {
    console.error("❌ Contract connection test failed:", error);
    return {
      success: false,
      error: error.message,
      details: {
        code: error.code,
        reason: error.reason,
        data: error.data,
      },
    };
  }
}

// Product Management Functions

export async function createProduct(
  productData: ProductInput
): Promise<{ txHash: string; productId: bigint }> {
  const signer = await getSigner();
  const contract = getWriteContract(signer);

  const priceInWei = parseUnits(productData.price, 18); // Assuming 18 decimals

  const tx = await contract.createProduct(
    productData.name,
    productData.description,
    productData.fileUrl,
    priceInWei,
    productData.category
  );

  const receipt = await tx.wait();
  const productId = (await contract.nextProductId()) - BigInt(1); // Get the ID of the created product

  return {
    txHash: receipt?.hash || "",
    productId: productId,
  };
}

export async function updateProduct(
  productId: bigint,
  productData: ProductUpdate
): Promise<{ txHash: string }> {
  const signer = await getSigner();
  const contract = getWriteContract(signer);

  const priceInWei = parseUnits(productData.price, 18);

  const tx = await contract.updateProduct(
    productId,
    productData.name,
    productData.description,
    productData.fileUrl,
    priceInWei,
    productData.category
  );

  const receipt = await tx.wait();

  return {
    txHash: receipt?.hash || "",
  };
}

export async function deactivateProduct(
  productId: bigint
): Promise<{ txHash: string }> {
  const signer = await getSigner();
  const contract = getWriteContract(signer);

  const tx = await contract.deactivateProduct(productId);
  const receipt = await tx.wait();

  return {
    txHash: receipt?.hash || "",
  };
}

export async function reactivateProduct(
  productId: bigint
): Promise<{ txHash: string }> {
  const signer = await getSigner();
  const contract = getWriteContract(signer);

  const tx = await contract.reactivateProduct(productId);
  const receipt = await tx.wait();

  return {
    txHash: receipt?.hash || "",
  };
}

// Purchase Functions

export async function purchaseProduct(
  productId: bigint,
  value: string // Payment amount as string (already in wei)
): Promise<{ txHash: string }> {
  const signer = await getSigner();
  const contract = getWriteContract(signer);

  // The value is already in wei (smallest unit), so we don't need to convert it
  const paymentInWei = BigInt(value);

  console.log(`=== PURCHASE PRODUCT DEBUG ===`);
  console.log(`Product ID: ${productId}`);
  console.log(`Value string: ${value}`);
  console.log(`Payment in wei: ${paymentInWei}`);
  console.log(`Signer address: ${await signer.getAddress()}`);
  console.log(`Contract address: ${contract.target}`);
  console.log(
    `Contract has purchaseProduct: ${typeof contract.purchaseProduct}`
  );

  // Check user's balance
  const balance = await signer.provider.getBalance(await signer.getAddress());
  console.log(
    `User balance: ${balance} wei (${formatUnits(balance, 18)} HBAR)`
  );
  console.log(
    `Required payment: ${paymentInWei} wei (${formatUnits(
      paymentInWei,
      18
    )} HBAR)`
  );
  console.log(`Sufficient balance: ${balance >= paymentInWei}`);

  // Get the actual product price from the contract to compare
  try {
    const product = await contract.getProduct(productId);
    console.log(
      `Contract product price: ${product.price} wei (${formatUnits(
        product.price,
        18
      )} HBAR)`
    );
    console.log(`Price match: ${product.price === paymentInWei}`);
    console.log(`Price sufficient: ${paymentInWei >= product.price}`);
    console.log(`Product is active: ${product.isActive}`);
    console.log(`Product creator: ${product.creator}`);
    console.log(`Next product ID: ${await contract.nextProductId()}`);
    console.log(
      `Product ID valid: ${
        productId > 0 && productId < (await contract.nextProductId())
      }`
    );
  } catch (error: any) {
    console.log(
      `Could not fetch product from contract:`,
      error.message || error
    );
  }

  // Skip gas estimation to avoid high gas fee issues
  console.log(`Skipping gas estimation to prevent high gas fees`);

  // Test contract connection with a simple read
  try {
    console.log("🔍 Testing contract connection...");
    console.log("🔍 Contract address:", contract.target);
    console.log("🔍 Network:", await signer.provider.getNetwork());

    const [totalProducts] = await contract.getPlatformStats();
    console.log(
      `✅ Contract connection test - Total products: ${totalProducts}`
    );

    // Check if product ID is valid
    if (productId > totalProducts || productId < 1) {
      throw new Error(
        `Invalid product ID: ${productId}. Total products: ${totalProducts}`
      );
    }
  } catch (error: any) {
    console.error("❌ Contract connection test failed:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      reason: error.reason,
      data: error.data,
    });

    // Check if it's a CALL_EXCEPTION with missing revert data
    if (error.code === "CALL_EXCEPTION" && !error.reason) {
      console.log(
        "🔍 Detected CALL_EXCEPTION in purchaseProduct, trying RPC fallback..."
      );

      // Try RPC fallback for contract connection test
      const rpcEndpoints = [
        "https://testnet.hashio.io/api",
        "https://hedera-testnet.rpc.thirdweb.com",
      ];

      for (const rpcUrl of rpcEndpoints) {
        try {
          console.log(`🔄 Trying RPC fallback for contract test: ${rpcUrl}`);
          const rpcProvider = new JsonRpcProvider(rpcUrl, {
            name: "hedera-testnet",
            chainId: 296,
          });
          const rpcContract = new Contract(
            SV_MARKETPLACE_ADDRESS,
            ABI,
            rpcProvider
          );

          const [totalProducts] = await rpcContract.getPlatformStats();
          console.log(
            `✅ RPC fallback successful - Total products: ${totalProducts}`
          );

          // Check if product ID is valid
          if (productId > totalProducts || productId < 1) {
            throw new Error(
              `Invalid product ID: ${productId}. Total products: ${totalProducts}`
            );
          }

          // If we get here, the RPC fallback worked, so continue with the purchase
          break;
        } catch (rpcError: any) {
          console.warn(
            `❌ RPC endpoint ${rpcUrl} failed for contract test:`,
            rpcError.message
          );
          if (rpcUrl === rpcEndpoints[rpcEndpoints.length - 1]) {
            // This was the last endpoint, so all failed
            throw new Error(
              "All RPC endpoints failed for contract connection test"
            );
          }
          continue;
        }
      }
    } else {
      throw new Error("Contract is not accessible or not properly deployed");
    }
  }

  // Pre-validate the purchase conditions
  let product: any;
  try {
    product = await contract.getProduct(productId);
    const userAddress = await signer.getAddress();

    console.log(`Pre-purchase validation:`);
    console.log(`- Product exists: true`);
    console.log(`- Product active: ${product.isActive}`);
    console.log(`- Product creator: ${product.creator}`);
    console.log(`- User address: ${userAddress}`);
    console.log(
      `- Is own product: ${
        product.creator.toLowerCase() === userAddress.toLowerCase()
      }`
    );
    console.log(`- Product price: ${product.price} wei`);
    console.log(`- Payment amount: ${paymentInWei} wei`);
    console.log(`- Price sufficient: ${paymentInWei >= product.price}`);

    if (!product.isActive) {
      throw new Error("Product is not active");
    }
    if (product.creator.toLowerCase() === userAddress.toLowerCase()) {
      throw new Error("Cannot purchase your own product");
    }
    if (paymentInWei < product.price) {
      throw new Error(
        `Insufficient payment: need ${product.price} wei, sending ${paymentInWei} wei`
      );
    }
  } catch (validationError: any) {
    console.error("Pre-purchase validation failed:", validationError);

    // Check if it's a CALL_EXCEPTION with missing revert data
    if (validationError.code === "CALL_EXCEPTION" && !validationError.reason) {
      console.log(
        "🔍 Detected CALL_EXCEPTION in pre-validation, trying RPC fallback..."
      );

      // Try RPC fallback for product validation
      const rpcEndpoints = [
        "https://testnet.hashio.io/api",
        "https://hedera-testnet.rpc.thirdweb.com",
      ];

      for (const rpcUrl of rpcEndpoints) {
        try {
          console.log(
            `🔄 Trying RPC fallback for product validation: ${rpcUrl}`
          );
          const rpcProvider = new JsonRpcProvider(rpcUrl, {
            name: "hedera-testnet",
            chainId: 296,
          });
          const rpcContract = new Contract(
            SV_MARKETPLACE_ADDRESS,
            ABI,
            rpcProvider
          );

          product = await rpcContract.getProduct(productId);
          const userAddress = await signer.getAddress();

          console.log(`✅ RPC fallback successful for product validation`);
          console.log(`- Product active: ${product.isActive}`);
          console.log(`- Product creator: ${product.creator}`);
          console.log(`- User address: ${userAddress}`);
          console.log(`- Product price: ${product.price} wei`);

          if (!product.isActive) {
            throw new Error("Product is not active");
          }
          if (product.creator.toLowerCase() === userAddress.toLowerCase()) {
            throw new Error("Cannot purchase your own product");
          }
          if (paymentInWei < product.price) {
            throw new Error(
              `Insufficient payment: need ${product.price} wei, sending ${paymentInWei} wei`
            );
          }

          // If we get here, the RPC fallback worked
          break;
        } catch (rpcError: any) {
          console.warn(
            `❌ RPC endpoint ${rpcUrl} failed for product validation:`,
            rpcError.message
          );
          if (rpcUrl === rpcEndpoints[rpcEndpoints.length - 1]) {
            // This was the last endpoint, so all failed
            throw new Error("All RPC endpoints failed for product validation");
          }
          continue;
        }
      }
    } else {
      throw validationError;
    }
  }

  // Send the exact product price (not a test amount)
  console.log(
    `Attempting purchase with exact product price: ${paymentInWei} wei`
  );

  try {
    console.log(
      `Calling purchaseProduct with productId: ${productId}, value: ${paymentInWei}`
    );
    const tx = await contract.purchaseProduct(productId, {
      value: paymentInWei,
      gasLimit: 500000, // Set a reasonable gas limit
    });
    console.log(`Transaction sent: ${tx.hash}`);

    const receipt = await tx.wait();

    if (receipt.status === 0) {
      throw new Error("Transaction reverted - check contract conditions");
    }

    return {
      txHash: receipt?.hash || "",
    };
  } catch (error: any) {
    console.error("Purchase transaction failed:", error);

    // Try to get more details about the revert
    if (error.receipt && error.receipt.status === 0) {
      console.log("Transaction was included but reverted. Possible causes:");
      console.log("- Product doesn't exist or is inactive");
      console.log("- Trying to buy your own product");
      console.log("- Insufficient payment amount");
      console.log("- Contract logic error");
    }

    throw error;
  }
}

// Read Functions

export async function getProduct(productId: bigint): Promise<Product> {
  const provider = new BrowserProvider(getWindowEthereum(), 296);
  const contract = getReadContract(provider);

  const product = await contract.getProduct(productId);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    fileUrl: product.fileUrl,
    price: product.price,
    creator: product.creator,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    itemsSold: product.itemsSold,
    totalRevenue: product.totalRevenue,
    category: product.category,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const provider = new BrowserProvider(getWindowEthereum(), 296);
  const contract = getReadContract(provider);

  const [totalProducts] = await contract.getPlatformStats();
  const products: Product[] = [];

  for (let i = BigInt(1); i <= totalProducts; i++) {
    try {
      const product = await contract.getProduct(i);
      products.push({
        id: product.id,
        name: product.name,
        description: product.description,
        fileUrl: product.fileUrl,
        price: product.price,
        creator: product.creator,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        itemsSold: product.itemsSold,
        totalRevenue: product.totalRevenue,
        category: product.category,
      });
    } catch (error: any) {
      // Skip products that don't exist or can't be accessed
      console.warn(`Could not fetch product ${i}:`, error.message || error);
    }
  }

  return products;
}

export async function getActiveProducts(
  offset: number = 0,
  limit: number = 20
): Promise<ProductListResult> {
  try {
    const provider = new BrowserProvider(getWindowEthereum(), 296);
    const contract = getReadContract(provider);

    const [products, totalCount] = await contract.getActiveProducts(
      offset,
      limit
    );

    const productList: Product[] = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      fileUrl: product.fileUrl,
      price: product.price,
      creator: product.creator,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      itemsSold: product.itemsSold,
      totalRevenue: product.totalRevenue,
      category: product.category,
    }));

    return {
      products: productList,
      totalCount: totalCount,
    };
  } catch (error: any) {
    console.error("Error getting active products:", error.message || error);
    return { products: [], totalCount: BigInt(0) };
  }
}

export async function getCreatorProducts(
  creatorAddress: string
): Promise<Product[]> {
  const provider = new BrowserProvider(getWindowEthereum(), 296);
  const contract = getReadContract(provider);

  const productIds = await contract.getCreatorProducts(creatorAddress);
  const products: Product[] = [];

  for (const productId of productIds) {
    try {
      const product = await contract.getProduct(productId);
      products.push({
        id: product.id,
        name: product.name,
        description: product.description,
        fileUrl: product.fileUrl,
        price: product.price,
        creator: product.creator,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        itemsSold: product.itemsSold,
        totalRevenue: product.totalRevenue,
        category: product.category,
      });
    } catch (error: any) {
      console.warn(
        `Could not fetch product ${productId}:`,
        error.message || error
      );
    }
  }

  return products;
}

export async function getMyProducts(): Promise<Product[]> {
  try {
    const signer = await getSigner();
    const creatorAddress = await signer.getAddress();
    return getCreatorProducts(creatorAddress);
  } catch (error: any) {
    console.error("Error getting my products:", error.message || error);
    return [];
  }
}

// Statistics Functions

export async function getCreatorStats(
  creatorAddress: string
): Promise<CreatorStats> {
  const provider = new BrowserProvider(getWindowEthereum(), 296);
  const contract = getReadContract(provider);

  const [totalRevenue, totalItemsSold] = await contract.getCreatorStats(
    creatorAddress
  );

  return {
    totalRevenue,
    totalItemsSold,
  };
}

export async function getMyStats(): Promise<CreatorStats> {
  const signer = await getSigner();
  const creatorAddress = await signer.getAddress();
  return getCreatorStats(creatorAddress);
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    // Use reliable RPC provider instead of browser provider for read operations
    const provider = createReliableRPCProvider();
    const contract = getReadContract(provider);

    console.log("🔍 Platform Stats Debug Info:");
    console.log("- Using reliable RPC provider");
    console.log("- Contract address:", contract.target);

    const [totalProducts, totalSales, totalRevenue] =
      await contract.getPlatformStats();

    console.log("✅ Platform stats retrieved:", {
      totalProducts: totalProducts.toString(),
      totalSales: totalSales.toString(),
      totalRevenue: totalRevenue.toString(),
    });

    return {
      totalProducts,
      totalSales,
      totalRevenue,
    };
  } catch (error: any) {
    console.error("❌ Error getting platform stats:", error);

    // Return default values if all attempts fail
    return {
      totalProducts: BigInt(0),
      totalSales: BigInt(0),
      totalRevenue: BigInt(0),
    };
  }
}

// Utility Functions

export function formatPrice(price: bigint, decimals: number = 18): string {
  return formatUnits(price, decimals);
}

export function parsePrice(price: string, decimals: number = 18): bigint {
  return parseUnits(price, decimals);
}

export function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export function isProductActive(product: Product): boolean {
  return product.isActive;
}

export function getProductRevenue(product: Product): string {
  return formatPrice(product.totalRevenue);
}

export function getProductSales(product: Product): number {
  return Number(product.itemsSold);
}

// Category helpers
export const PRODUCT_CATEGORIES = [
  "3d-model",
  "texture",
  "audio",
  "animation",
  "material",
  "shader",
  "script",
  "template",
  "asset-pack",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isValidCategory(category: string): category is ProductCategory {
  return PRODUCT_CATEGORIES.includes(category as ProductCategory);
}

// Search and filter helpers
export function filterProductsByCategory(
  products: Product[],
  category: string
): Product[] {
  return products.filter((product) => product.category === category);
}

export function filterActiveProducts(products: Product[]): Product[] {
  return products.filter((product) => product.isActive);
}

export function sortProductsByPrice(
  products: Product[],
  ascending: boolean = true
): Product[] {
  return products.sort((a, b) => {
    const comparison = a.price < b.price ? -1 : a.price > b.price ? 1 : 0;
    return ascending ? comparison : -comparison;
  });
}

export function sortProductsBySales(
  products: Product[],
  ascending: boolean = true
): Product[] {
  return products.sort((a, b) => {
    const comparison =
      a.itemsSold < b.itemsSold ? -1 : a.itemsSold > b.itemsSold ? 1 : 0;
    return ascending ? comparison : -comparison;
  });
}

export function sortProductsByRevenue(
  products: Product[],
  ascending: boolean = true
): Product[] {
  return products.sort((a, b) => {
    const comparison =
      a.totalRevenue < b.totalRevenue
        ? -1
        : a.totalRevenue > b.totalRevenue
        ? 1
        : 0;
    return ascending ? comparison : -comparison;
  });
}
