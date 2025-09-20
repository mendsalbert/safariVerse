import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  console.log("🧪 Testing purchase function directly...");

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
    // Check if there are any products
    const totalProducts = await contract.totalProducts();
    console.log("📊 Total products:", totalProducts.toString());

    if (totalProducts > 0) {
      // Get first product
      const product = await contract.getProduct(1);
      console.log("📦 Product 1:", {
        id: product.id.toString(),
        name: product.name,
        price: product.price.toString(),
        creator: product.creator,
        isActive: product.isActive,
      });

      // Try to purchase
      const price = product.price;
      console.log(
        `💰 Attempting to purchase product 1 for ${price.toString()} wei`
      );

      const tx = await contract.purchaseProduct(1, {
        value: price,
        gasLimit: 500000,
      });

      console.log("📤 Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.hash);
      console.log("📊 Gas used:", receipt.gasUsed.toString());
    } else {
      console.log("❌ No products found to test with");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
