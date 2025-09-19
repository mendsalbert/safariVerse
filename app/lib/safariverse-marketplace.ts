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

// Import full ABI from build artifact
// NOTE: relative path from `app/lib/*` to `artifacts/*`
// Next.js supports importing JSON modules directly in TS.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import SafariVerseMarketplaceArtifact from "../../artifacts/contracts/SafariVerseMarketplace.sol/SafariVerseMarketplace.json";
const ABI = (SafariVerseMarketplaceArtifact as any).abi;

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
  "0x096ECFEfFD7499f3B61E2D9EED1863141736FF32"; // Will be set after deployment

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
  return new Contract(SV_MARKETPLACE_ADDRESS, ABI, provider);
}

export function getWriteContract(signer: JsonRpcSigner): Contract {
  return new Contract(SV_MARKETPLACE_ADDRESS, ABI, signer);
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
  const productId = (await contract.nextProductId()) - 1n; // Get the ID of the created product

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
  value: string // Payment amount as string
): Promise<{ txHash: string }> {
  const signer = await getSigner();
  const contract = getWriteContract(signer);

  const paymentInWei = parseUnits(value, 18);

  const tx = await contract.purchaseProduct(productId, {
    value: paymentInWei,
  });

  const receipt = await tx.wait();

  return {
    txHash: receipt?.hash || "",
  };
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

  const totalProducts = await contract.totalProducts();
  const products: Product[] = [];

  for (let i = 1n; i <= totalProducts; i++) {
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
    } catch (error) {
      // Skip products that don't exist or can't be accessed
      console.warn(`Could not fetch product ${i}:`, error);
    }
  }

  return products;
}

export async function getActiveProducts(
  offset: number = 0,
  limit: number = 20
): Promise<ProductListResult> {
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
    } catch (error) {
      console.warn(`Could not fetch product ${productId}:`, error);
    }
  }

  return products;
}

export async function getMyProducts(): Promise<Product[]> {
  const signer = await getSigner();
  const creatorAddress = await signer.getAddress();
  return getCreatorProducts(creatorAddress);
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
  const provider = new BrowserProvider(getWindowEthereum(), 296);
  const contract = getReadContract(provider);

  const [totalProducts, totalSales, totalRevenue] =
    await contract.getPlatformStats();

  return {
    totalProducts,
    totalSales,
    totalRevenue,
  };
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
