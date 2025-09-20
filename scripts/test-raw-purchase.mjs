import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  console.log("🧪 Testing raw transaction with explicit data encoding...");

  const rpcUrl =
    process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api";
  const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;

  if (!privateKey) {
    console.error(
      "❌ Please set HEDERA_TESTNET_PRIVATE_KEY environment variable"
    );
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });

  const wallet = new ethers.Wallet(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
    provider
  );

  console.log("📝 Wallet:", wallet.address);

  const artifactPath = path.join(
    process.cwd(),
    "artifacts/contracts/SafariVerseMarketplace.sol/SafariVerseMarketplace.json"
  );

  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  const contractAddress = "0x8873076362C4D085d87C03165e46Af1b53C0bA45";

  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

  try {
    // Get product details
    const product = await contract.getProduct(1);
    console.log("📦 Product 1:", {
      id: product.id.toString(),
      name: product.name,
      price: product.price.toString(),
      creator: product.creator,
      isActive: product.isActive,
    });

    const price = product.price;
    console.log(
      `💰 Attempting to purchase product 1 for ${price.toString()} wei`
    );

    // Encode the function call manually
    const iface = new ethers.Interface(artifact.abi);
    const data = iface.encodeFunctionData("purchaseProduct", [1]);
    console.log("🔍 Encoded data:", data);
    console.log("🔍 Data length:", data.length);

    // Send raw transaction
    const tx = await wallet.sendTransaction({
      to: contractAddress,
      data: data,
      value: price,
      gasLimit: 500000,
    });

    console.log("📤 Raw transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt.hash);
    console.log("📊 Gas used:", receipt.gasUsed.toString());
    console.log("📊 Status:", receipt.status);
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
