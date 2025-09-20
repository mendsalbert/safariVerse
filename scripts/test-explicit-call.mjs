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

  console.log("Testing explicit function call...");

  try {
    // Get product 5 details
    const product = await contract.getProduct(5);
    console.log("Product 5 details:");
    console.log("  Price (raw):", product.price.toString());
    console.log("  Price (hex):", "0x" + product.price.toString(16));

    // Try calling the function with explicit value
    console.log("\nTrying explicit call...");
    const tx = await contract.purchaseProduct(5, {
      value: product.price,
      gasLimit: 500000
    });
    
    console.log("Transaction details:");
    console.log("  To:", tx.to);
    console.log("  Value:", tx.value?.toString());
    console.log("  Data:", tx.data);
    console.log("  Gas Limit:", tx.gasLimit?.toString());
    
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Receipt hash:", receipt.hash);
    console.log("Status:", receipt.status);

    console.log("\n✅ Purchase successful!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    
    // If it's a gas estimation error, try with a higher gas limit
    if (error.message.includes("insufficient payment")) {
      console.log("\nTrying with higher gas limit...");
      try {
        const tx = await contract.purchaseProduct(5, {
          value: product.price,
          gasLimit: 1000000
        });
        console.log("Transaction with higher gas limit:", tx.hash);
        const receipt = await tx.wait();
        console.log("Receipt:", receipt.hash);
        console.log("Status:", receipt.status);
      } catch (error2) {
        console.error("Still failed:", error2.message);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
