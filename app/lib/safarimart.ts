//ts-nocheck
//@ts-nocheck
"use client";

import {
  BrowserProvider,
  Contract,
  Eip1193Provider,
  JsonRpcSigner,
  JsonRpcProvider,
  parseUnits,
  formatEther,
} from "ethers";

// Import ABI from build artifact
// NOTE: relative path from `app/lib/*` to `artifacts/*`
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import SafariMartArtifact from "../../artifacts/contracts/SafariMart.sol/SafariMart.json";
const ABI = (SafariMartArtifact as any).abi;

export type ProductData = {
  productId: bigint;
  fileUrl: string;
  title: string;
  description: string;
  category: string;
  price: bigint;
  creator: string;
  isActive: boolean;
  createdAt: bigint;
  totalSales: bigint;
  totalRevenue: bigint;
};

export type PurchaseData = {
  purchaseId: bigint;
  productId: bigint;
  buyer: string;
  pricePaid: bigint;
  purchasedAt: bigint;
};

export type PurchaseWithProduct = {
  purchase: PurchaseData;
  product: ProductData;
};

// Contract address - deployed on Hedera Testnet
export const SAFARIMART_ADDRESS: string =
  process.env.NEXT_PUBLIC_SAFARIMART_ADDRESS ||
  "0x4f1266De96BE2B77996019f7061071e151Bc9A94"; // Latest deployed (MVP version)

function getWindowEthereum(): Eip1193Provider {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No injected wallet found (window.ethereum)");
  }
  return (window as any).ethereum as Eip1193Provider;
}

export async function getSigner(): Promise<JsonRpcSigner> {
  const provider = new BrowserProvider(getWindowEthereum(), 296);
  await provider.send("eth_requestAccounts", []);
  return await provider.getSigner();
}

export function getReadContract(provider: any): Contract {
  if (!SAFARIMART_ADDRESS) {
    throw new Error("SafariMart contract address not set");
  }
  return new Contract(SAFARIMART_ADDRESS, ABI, provider);
}

// Product Management Functions

export async function listProduct(params: {
  fileUrl: string;
  title: string;
  description: string;
  category: string;
  priceEth?: string; // price in ETH/HBAR
  priceWei?: string; // price in wei
}): Promise<{ txHash: string; productId: bigint }> {
  const signer = await getSigner();
  const contract = getReadContract(signer);

  const price: bigint = params.priceWei
    ? BigInt(params.priceWei)
    : params.priceEth
    ? parseUnits(params.priceEth, 18)
    : 0n;

  if (price === 0n) {
    throw new Error("Price must be greater than 0");
  }

  const tx = await contract.listProduct(
    params.fileUrl,
    params.title,
    params.description,
    params.category,
    price
  );

  const receipt = await tx.wait();

  // Extract productId from events
  let productId: bigint = 0n;
  if (receipt?.logs) {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === "ProductListed") {
          productId = parsed.args[0];
          break;
        }
      } catch {
        // Skip unparseable logs
      }
    }
  }

  return { txHash: receipt?.hash ?? tx.hash, productId };
}

export async function updateProduct(params: {
  productId: bigint;
  title?: string;
  description?: string;
  priceEth?: string;
  priceWei?: string;
  isActive?: boolean;
}): Promise<string> {
  const signer = await getSigner();
  const contract = getReadContract(signer);

  // Get current product data if fields are not provided
  const currentProduct = await contract.getProduct(params.productId);

  const price: bigint = params.priceWei
    ? BigInt(params.priceWei)
    : params.priceEth
    ? parseUnits(params.priceEth, 18)
    : currentProduct.price;

  const tx = await contract.updateProduct(
    params.productId,
    params.title || currentProduct.title,
    params.description || currentProduct.description,
    price,
    params.isActive !== undefined ? params.isActive : currentProduct.isActive
  );

  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

export async function purchaseProduct(
  productId: bigint,
  paymentEth?: string
): Promise<{ txHash: string; purchaseId: bigint }> {
  const signer = await getSigner();
  const contract = getReadContract(signer);

  // Get product price if payment not specified
  let value: bigint;
  if (paymentEth) {
    value = parseUnits(paymentEth, 18);
  } else {
    try {
      const product = await contract.getProduct(productId);
      value = product.price;
      console.log(
        `💰 Using product price: ${value.toString()} wei (${formatEther(
          value
        )} HBAR)`
      );
    } catch (error) {
      console.warn(
        "Could not get product price, using 0 value for MVP:",
        error
      );
      value = BigInt(0); // MVP: Allow 0 value transactions
    }
  }

  console.log(`💸 Sending transaction with value: ${value.toString()} wei`);

  const tx = await contract.purchaseProduct(productId, { value });
  const receipt = await tx.wait();

  // Extract purchaseId from events
  let purchaseId: bigint = 0n;
  if (receipt?.logs) {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === "ProductPurchased") {
          purchaseId = parsed.args[0];
          break;
        }
      } catch {
        // Skip unparseable logs
      }
    }
  }

  return { txHash: receipt?.hash ?? tx.hash, purchaseId };
}

// View Functions

export async function getProduct(productId: bigint): Promise<ProductData> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api";
  const provider = new JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const contract = getReadContract(provider);

  const product = await contract.getProduct(productId);
  return {
    productId: BigInt(product.productId.toString()),
    fileUrl: product.fileUrl,
    title: product.title,
    description: product.description,
    category: product.category,
    price: BigInt(product.price.toString()),
    creator: product.creator,
    isActive: product.isActive,
    createdAt: BigInt(product.createdAt.toString()),
    totalSales: BigInt(product.totalSales.toString()),
    totalRevenue: BigInt(product.totalRevenue.toString()),
  };
}

export async function getAllActiveProducts(): Promise<ProductData[]> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api";
  const provider = new JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const contract = getReadContract(provider);

  const products = await contract.getAllActiveProducts();
  return products.map((product: any) => ({
    productId: BigInt(product.productId.toString()),
    fileUrl: product.fileUrl,
    title: product.title,
    description: product.description,
    category: product.category,
    price: BigInt(product.price.toString()),
    creator: product.creator,
    isActive: product.isActive,
    createdAt: BigInt(product.createdAt.toString()),
    totalSales: BigInt(product.totalSales.toString()),
    totalRevenue: BigInt(product.totalRevenue.toString()),
  }));
}

export async function getProductsByCategory(
  category: string
): Promise<ProductData[]> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api";
  const provider = new JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const contract = getReadContract(provider);

  const products = await contract.getProductsByCategory(category);
  return products.map((product: any) => ({
    productId: BigInt(product.productId.toString()),
    fileUrl: product.fileUrl,
    title: product.title,
    description: product.description,
    category: product.category,
    price: BigInt(product.price.toString()),
    creator: product.creator,
    isActive: product.isActive,
    createdAt: BigInt(product.createdAt.toString()),
    totalSales: BigInt(product.totalSales.toString()),
    totalRevenue: BigInt(product.totalRevenue.toString()),
  }));
}

export async function getMyProducts(): Promise<{
  productIds: bigint[];
  products: ProductData[];
}> {
  const signer = await getSigner();
  const contract = getReadContract(signer);

  const result = await contract.getMyProductsWithData();
  const productIds: bigint[] = result[0].map((id: any) =>
    BigInt(id.toString())
  );
  const products: ProductData[] = result[1].map((product: any) => ({
    productId: BigInt(product.productId.toString()),
    fileUrl: product.fileUrl,
    title: product.title,
    description: product.description,
    category: product.category,
    price: BigInt(product.price.toString()),
    creator: product.creator,
    isActive: product.isActive,
    createdAt: BigInt(product.createdAt.toString()),
    totalSales: BigInt(product.totalSales.toString()),
    totalRevenue: BigInt(product.totalRevenue.toString()),
  }));

  return { productIds, products };
}

export async function getProductsByCreator(creator: string): Promise<{
  productIds: bigint[];
  products: ProductData[];
}> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api";
  const provider = new JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const contract = getReadContract(provider);

  const result = await contract.getCreatorProductsWithData(creator);
  const productIds: bigint[] = result[0].map((id: any) =>
    BigInt(id.toString())
  );
  const products: ProductData[] = result[1].map((product: any) => ({
    productId: BigInt(product.productId.toString()),
    fileUrl: product.fileUrl,
    title: product.title,
    description: product.description,
    category: product.category,
    price: BigInt(product.price.toString()),
    creator: product.creator,
    isActive: product.isActive,
    createdAt: BigInt(product.createdAt.toString()),
    totalSales: BigInt(product.totalSales.toString()),
    totalRevenue: BigInt(product.totalRevenue.toString()),
  }));

  return { productIds, products };
}

export async function getMyPurchases(): Promise<PurchaseWithProduct[]> {
  const signer = await getSigner();
  const contract = getReadContract(signer);

  const signerAddress = await signer.getAddress();
  const result = await contract.getPurchaseHistoryWithDetails(signerAddress);

  const purchases: PurchaseData[] = result[0].map((purchase: any) => ({
    purchaseId: BigInt(purchase.purchaseId.toString()),
    productId: BigInt(purchase.productId.toString()),
    buyer: purchase.buyer,
    pricePaid: BigInt(purchase.pricePaid.toString()),
    purchasedAt: BigInt(purchase.purchasedAt.toString()),
  }));

  const products: ProductData[] = result[1].map((product: any) => ({
    productId: BigInt(product.productId.toString()),
    fileUrl: product.fileUrl,
    title: product.title,
    description: product.description,
    category: product.category,
    price: BigInt(product.price.toString()),
    creator: product.creator,
    isActive: product.isActive,
    createdAt: BigInt(product.createdAt.toString()),
    totalSales: BigInt(product.totalSales.toString()),
    totalRevenue: BigInt(product.totalRevenue.toString()),
  }));

  return purchases.map((purchase, index) => ({
    purchase,
    product: products[index],
  }));
}

export async function hasPurchased(
  buyer: string,
  productId: bigint
): Promise<boolean> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api";
  const provider = new JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const contract = getReadContract(provider);

  return await contract.hasPurchased(buyer, productId);
}

export async function getPurchase(purchaseId: bigint): Promise<PurchaseData> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api";
  const provider = new JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const contract = getReadContract(provider);

  const purchase = await contract.getPurchase(purchaseId);
  return {
    purchaseId: BigInt(purchase.purchaseId.toString()),
    productId: BigInt(purchase.productId.toString()),
    buyer: purchase.buyer,
    pricePaid: BigInt(purchase.pricePaid.toString()),
    purchasedAt: BigInt(purchase.purchasedAt.toString()),
  };
}

// Utility functions

export function formatPrice(priceWei: bigint): string {
  return formatEther(priceWei);
}

export function parsePrice(priceEth: string): bigint {
  return parseUnits(priceEth, 18);
}

// Categories for the marketplace
export const PRODUCT_CATEGORIES = [
  "animals",
  "artifacts",
  "environment",
  "art-gallery",
  "tools",
  "decorations",
  "vehicles",
  "buildings",
  "nature",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Helper function to validate category
export function isValidCategory(category: string): category is ProductCategory {
  return PRODUCT_CATEGORIES.includes(category as ProductCategory);
}
