import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  console.log("🧪 Testing with direct Hashio RPC call...");

  const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;

  if (!privateKey) {
    console.error(
      "❌ Please set HEDERA_TESTNET_PRIVATE_KEY environment variable"
    );
    process.exit(1);
  }

  const wallet = new ethers.Wallet(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
  );

  console.log("📝 Wallet:", wallet.address);

  const artifactPath = path.join(
    process.cwd(),
    "artifacts/contracts/SafariVerseMarketplace.sol/SafariVerseMarketplace.json"
  );

  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  const contractAddress = "0x8873076362C4D085d87C03165e46Af1b53C0bA45";

  // Try different RPC endpoints
  const rpcEndpoints = [
    "https://testnet.hashio.io/api",
    "https://testnet.hashio.io/api/v1",
    "https://testnet.hashio.io/api/v1/transactions",
  ];

  for (const rpcUrl of rpcEndpoints) {
    console.log(`\n🔍 Trying RPC: ${rpcUrl}`);

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl, {
        name: "hedera-testnet",
        chainId: 296,
      });

      const connectedWallet = wallet.connect(provider);
      const contract = new ethers.Contract(
        contractAddress,
        artifact.abi,
        connectedWallet
      );

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

      // Try with different gas settings
      const tx = await contract.purchaseProduct(1, {
        value: price,
        gasLimit: 1000000, // Higher gas limit
      });

      console.log("📤 Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);
      console.log("📊 Gas used:", receipt.gasUsed.toString());
      console.log("📊 Status:", receipt.status);

      if (receipt.status === 1) {
        console.log("🎉 SUCCESS! Purchase completed!");
        break;
      }
    } catch (error) {
      console.log(`❌ Failed with ${rpcUrl}:`, error.message);
    }
  }
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
