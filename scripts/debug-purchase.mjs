import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const rpcUrl =
    process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api";
  const pk = process.env.HEDERA_TESTNET_PRIVATE_KEY;
  if (!pk) throw new Error("HEDERA_TESTNET_PRIVATE_KEY not set");

  const provider = new ethers.JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const wallet = new ethers.Wallet(
    pk.startsWith("0x") ? pk : `0x${pk}`,
    provider
  );

  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/SafariMart.sol/SafariMart.json"
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  const contract = new ethers.Contract(
    "0x95b51De4dFD03087E22942c1b2B6D6f7e0b00604",
    artifact.abi,
    wallet
  );

  console.log("Debugging purchase issue...");

  // Get product 1 details
  const product = await contract.getProduct(1);
  console.log("Product 1 details:");
  console.log("  Product ID:", product.productId.toString());
  console.log("  Title:", product.title);
  console.log("  Price (raw):", product.price.toString());
  console.log("  Price (hex):", "0x" + product.price.toString(16));
  console.log("  Price (ETH):", ethers.formatEther(product.price));
  console.log("  Is Active:", product.isActive);
  console.log("  Creator:", product.creator);

  // Check if we have enough balance
  const balance = await provider.getBalance(wallet.address);
  console.log("\nWallet balance:");
  console.log("  Balance (wei):", balance.toString());
  console.log("  Balance (ETH):", ethers.formatEther(balance));

  // Try to call the function with static call to see what happens
  try {
    console.log("\nTrying static call...");
    const result = await contract.purchaseProduct.staticCall(1, {
      value: product.price
    });
    console.log("Static call result:", result.toString());
  } catch (error) {
    console.log("Static call failed:", error.message);
  }

  // Try with a different value (slightly higher)
  try {
    console.log("\nTrying with slightly higher value...");
    const higherValue = product.price + BigInt(1);
    console.log("Higher value:", higherValue.toString());
    const result = await contract.purchaseProduct.staticCall(1, {
      value: higherValue
    });
    console.log("Static call with higher value result:", result.toString());
  } catch (error) {
    console.log("Static call with higher value failed:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
