import { readFileSync } from "fs";
import path from "path";
import {
  JsonRpcProvider,
  Wallet,
  Contract,
  Interface,
  formatUnits,
} from "ethers";
import "dotenv/config";

async function main() {
  const RPC =
    process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api";
  const PRIVATE_KEY = process.env.HEDERA_TESTNET_PRIVATE_KEY;
  if (!PRIVATE_KEY) throw new Error("Set HEDERA_TESTNET_PRIVATE_KEY in env");

  // Product id from CLI (default 1)
  const argId = process.argv.find((a) => a.startsWith("--id="));
  const productId = BigInt(argId ? argId.split("=")[1] : "1");

  const ADDRESS = "0x46B4C7b4D9DA1221F8C580f56A7831AA0b65BAD4";
  const provider = new JsonRpcProvider(RPC, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const wallet = new Wallet(
    PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`,
    provider
  );

  const artifactPath = path.join(
    process.cwd(),
    "artifacts/contracts/SafariVerseMarketplace.sol/SafariVerseMarketplace.json"
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  const contract = new Contract(ADDRESS, artifact.abi, wallet);

  console.log("Buyer:", wallet.address);
  console.log("Contract:", ADDRESS);
  const [totalProducts] = await contract.getPlatformStats();
  console.log("Total products:", totalProducts.toString());

  const p = await contract.getProduct(productId);
  console.log("Product:", {
    id: p.id.toString(),
    name: p.name,
    active: p.isActive,
    creator: p.creator,
    priceWei: p.price.toString(),
    priceHBAR: formatUnits(p.price, 18),
  });

  if (!p.isActive) throw new Error("Product is not active");
  if (p.creator.toLowerCase() === wallet.address.toLowerCase()) {
    throw new Error("Cannot buy your own product");
  }

  console.log(
    `Sending purchase tx for product ${productId} with value`,
    p.price.toString(),
    `(${formatUnits(p.price, 18)} HBAR)`
  );
  // Encode call manually to avoid empty-data raw transfers
  const iface = new Interface(artifact.abi);
  const data = iface.encodeFunctionData("purchaseProduct", [productId]);
  const tx = await wallet.sendTransaction({
    to: ADDRESS,
    data,
    value: p.price,
    gasLimit: 500000,
  });
  console.log("Tx sent:", tx.hash);
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) throw new Error("Tx reverted");
  console.log("✅ Purchase confirmed:", receipt.hash);
}

main().catch((e) => {
  console.error("❌ Buy failed:", e);
  process.exit(1);
});
