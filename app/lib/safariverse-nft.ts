"use client";

import {
  BrowserProvider,
  Contract,
  Eip1193Provider,
  JsonRpcSigner,
  JsonRpcProvider,
  parseUnits,
} from "ethers";

// Import full ABI from build artifact
// NOTE: relative path from `app/lib/*` to `artifacts/*`
// Next.js supports importing JSON modules directly in TS.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import SafariVerseNFTArtifact from "../../artifacts/contracts/SafariVerseNFT.sol/SafariVerseNFT.json";
const ABI = (SafariVerseNFTArtifact as any).abi;

export type TokenData = {
  fileUrl: string;
  title: string;
  description: string;
  price: bigint;
  minter: string;
  mintedAt: bigint;
};

export type OwnershipHistory = string[];

export const SV_NFT_ADDRESS: string =
  process.env.NEXT_PUBLIC_SV_NFT_ADDRESS ||
  "0xDC6788388f31d6f2dEaA4d97D50dC171822a74a5"; // latest deployed

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
  return new Contract(SV_NFT_ADDRESS, ABI, provider);
}

export async function mintNft(params: {
  fileUrl: string;
  title: string;
  description: string;
  priceEth?: string; // optional helper in HBAR as ETH-wei equivalent for display; pass as ether string
  priceWei?: string; // raw wei string
}): Promise<{ txHash: string; tokenId: bigint }> {
  const signer = await getSigner();
  const contract = getReadContract(signer);
  const price: bigint = params.priceWei
    ? BigInt(params.priceWei)
    : params.priceEth
    ? parseUnits(params.priceEth, 18)
    : 0n;
  const tx = await contract.mint(
    params.fileUrl,
    params.title,
    params.description,
    price
  );
  const receipt = await tx.wait();
  // tokenId is returned, ethers v6 populates via logs or return value; fetch by callStatic pattern if needed
  const tokenId: bigint = (await tx.wait()).logs?.length ? 0n : 0n; // fallback
  return { txHash: receipt?.hash ?? tx.hash, tokenId };
}

// Mint directly to a recipient using onlyOwner mintTo (caller must be contract owner)
export async function mintNftTo(
  to: string,
  params: {
    fileUrl: string;
    title: string;
    description: string;
    priceEth?: string;
    priceWei?: string;
  }
): Promise<{ txHash: string; tokenId: bigint }> {
  const signer = await getSigner();
  const contract = getReadContract(signer);
  const price: bigint = params.priceWei
    ? BigInt(params.priceWei)
    : params.priceEth
    ? parseUnits(params.priceEth, 18)
    : 0n;
  const tx = await contract.mintTo(
    to,
    params.fileUrl,
    params.title,
    params.description,
    price
  );
  const receipt = await tx.wait();
  const tokenId: bigint = (await tx.wait()).logs?.length ? 0n : 0n;
  return { txHash: receipt?.hash ?? tx.hash, tokenId };
}

export async function listMyMinted(): Promise<{
  tokenIds: bigint[];
  data: TokenData[];
}> {
  const signer = await getSigner();
  const contract = getReadContract(signer);
  const res = await contract.myMintedTokens();
  const tokenIds: bigint[] = res[0] as bigint[];
  const data: TokenData[] = (res[1] as any[]).map((d) => ({
    fileUrl: d.fileUrl as string,
    title: d.title as string,
    description: d.description as string,
    price: BigInt(d.price.toString()),
    minter: d.minter as string,
    mintedAt: BigInt(d.mintedAt.toString()),
  }));
  return { tokenIds, data };
}

export async function listMintedBy(
  address: string
): Promise<{ tokenIds: bigint[]; data: TokenData[] }> {
  const signer = await getSigner();
  const contract = getReadContract(signer);
  const res = await contract.getMintedTokens(address);
  const tokenIds: bigint[] = res[0] as bigint[];
  const data: TokenData[] = (res[1] as any[]).map((d) => ({
    fileUrl: d.fileUrl as string,
    title: d.title as string,
    description: d.description as string,
    price: BigInt(d.price.toString()),
    minter: d.minter as string,
    mintedAt: BigInt(d.mintedAt.toString()),
  }));
  return { tokenIds, data };
}

// Scan all tokenIds from 1..nextTokenId-1 and return existing tokens
export async function listAllTokens(): Promise<{
  tokenIds: bigint[];
  data: TokenData[];
}> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api";
  const provider = new JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const contract = getReadContract(provider);
  const nextId: bigint = await contract.nextTokenId();
  const ids: bigint[] = [];
  const data: TokenData[] = [];
  for (let i = 1n; i < nextId; i++) {
    try {
      // Ensure token exists by checking owner
      // If it reverts, skip
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _owner: string = await contract.ownerOf(i);
      const d = await contract.getTokenData(i);
      ids.push(i);
      data.push({
        fileUrl: d.fileUrl as string,
        title: d.title as string,
        description: d.description as string,
        price: BigInt(d.price.toString()),
        minter: d.minter as string,
        mintedAt: BigInt(d.mintedAt.toString()),
      });
    } catch {
      // skip non-existent ids
    }
  }
  return { tokenIds: ids, data };
}

export async function getOwnershipHistory(
  tokenId: bigint
): Promise<OwnershipHistory> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api";
  const provider = new JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const contract = getReadContract(provider);
  const owners: string[] = await contract.getOwnershipHistory(tokenId);
  return owners;
}

// User collection (bookmark)
export async function collect(tokenId: bigint): Promise<string> {
  const signer = await getSigner();
  const contract = getReadContract(signer);
  const tx = await contract.collect(tokenId);
  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

export async function myCollectedWithData(): Promise<{
  tokenIds: bigint[];
  data: TokenData[];
}> {
  const signer = await getSigner();
  const contract = getReadContract(signer);
  const ids: bigint[] = await contract.myCollected();
  const rpcUrl =
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api";
  const provider = new JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const read = getReadContract(provider);
  const data: TokenData[] = [];
  for (const id of ids) {
    try {
      const d = await read.getTokenData(id);
      data.push({
        fileUrl: d.fileUrl as string,
        title: d.title as string,
        description: d.description as string,
        price: BigInt(d.price.toString()),
        minter: d.minter as string,
        mintedAt: BigInt(d.mintedAt.toString()),
      });
    } catch {}
  }
  return { tokenIds: ids, data };
}
