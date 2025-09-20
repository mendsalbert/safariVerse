import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  console.log("🧪 Testing Simple Marketplace with Hedera workaround...");

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
    "artifacts/contracts/SimpleMarketplace.sol/SimpleMarketplace.json"
  );

  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  const contractAddress = "0x90401eBc52Bc071880495154f8D13a9104efbE38";

  const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

  try {
    // First, create a product
    console.log("📦 Creating a test product...");
    const createTx = await contract.createProduct(
      "Test Product",
      "A test product for Hedera workaround",
      "https://example.com/file.glb",
      10000000000, // 10 billion wei (minimum Hedera transaction value)
      "3d-model"
    );

    console.log("📤 Create transaction sent:", createTx.hash);
    const createReceipt = await createTx.wait();
    console.log("✅ Product created:", createReceipt.hash);

    // Get the product ID from the event
    const productId = 1; // First product

    // Now try to purchase using the receive function (data-stripped transaction)
    console.log("💰 Sending payment to receive function...");
    const paymentTx = await wallet.sendTransaction({
      to: contractAddress,
      value: 10000000000, // 10 billion wei (minimum Hedera transaction value)
      gasLimit: 100000,
    });

    console.log("📤 Payment transaction sent:", paymentTx.hash);
    const paymentReceipt = await paymentTx.wait();
    console.log("✅ Payment received:", paymentReceipt.hash);
    console.log("📊 Status:", paymentReceipt.status);

    if (paymentReceipt.status === 1) {
      console.log("🎉 SUCCESS! Payment was accepted by receive function!");

      // Check pending purchase
      const pendingPurchase = await contract.pendingPurchases(wallet.address);
      console.log(
        "📊 Pending purchase amount:",
        ethers.formatUnits(pendingPurchase, 8),
        "HBAR"
      );

      // Wait a bit and then process the purchase
      console.log("⏳ Waiting 2 seconds before processing purchase...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Process the pending purchase
      console.log("🔄 Processing pending purchase...");
      const processTx = await contract.processPendingPurchase(productId);
      console.log("📤 Process transaction sent:", processTx.hash);
      const processReceipt = await processTx.wait();
      console.log("✅ Purchase processed:", processReceipt.hash);
      console.log("📊 Status:", processReceipt.status);

      if (processReceipt.status === 1) {
        console.log("🎉 SUCCESS! Purchase completed successfully!");

        // Check product stats
        const product = await contract.getProduct(productId);
        console.log("📊 Product stats:", {
          itemsSold: product.itemsSold.toString(),
          totalRevenue: ethers.formatUnits(product.totalRevenue, 8),
        });
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
