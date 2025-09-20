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

  console.log("Testing with new product...");

  try {
    // Create a new product
    console.log("Creating new product...");
    const listTx = await contract.listProduct(
      "https://example.com/test-new.glb",
      "Test New Product",
      "A new test product for debugging",
      "test",
      ethers.parseEther("0.1") // 0.1 HBAR
    );
    console.log("List transaction:", listTx.hash);
    
    const listReceipt = await listTx.wait();
    console.log("List receipt:", listReceipt.hash);

    // Get the new product ID
    const nextProductId = await contract.nextProductId();
    const newProductId = nextProductId - 1n;
    console.log("New product ID:", newProductId.toString());

    // Get the new product details
    const newProduct = await contract.getProduct(newProductId);
    console.log("New product details:");
    console.log("  Product ID:", newProduct.productId.toString());
    console.log("  Title:", newProduct.title);
    console.log("  Price (raw):", newProduct.price.toString());
    console.log("  Price (hex):", "0x" + newProduct.price.toString(16));
    console.log("  Price (ETH):", ethers.formatEther(newProduct.price));
    console.log("  Is Active:", newProduct.isActive);
    console.log("  Creator:", newProduct.creator);

    // Try to purchase the new product
    console.log("\nTrying to purchase new product...");
    const purchaseTx = await contract.purchaseProduct(newProductId, {
      value: newProduct.price
    });
    console.log("Purchase transaction:", purchaseTx.hash);
    
    const purchaseReceipt = await purchaseTx.wait();
    console.log("Purchase receipt:", purchaseReceipt.hash);

    console.log("\n✅ Purchase successful!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
