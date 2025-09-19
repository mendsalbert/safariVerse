import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";

async function main() {
  console.log("🚀 Deploying SafariVerse Marketplace Contract...");

  // Test configuration - you'll need to replace these with real values
  const rpcUrl = "https://testnet.hashio.io/api";

  // For testing, we'll use a placeholder - you need to replace this with your actual private key
  const privateKey =
    "0x0000000000000000000000000000000000000000000000000000000000000000"; // PLACEHOLDER

  console.log("⚠️  WARNING: This is using a placeholder private key!");
  console.log(
    "📝 To deploy with your own key, edit the script and replace the privateKey variable"
  );
  console.log(
    "🔑 Your private key should start with 0x and be 64 characters long"
  );

  if (
    privateKey ===
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  ) {
    console.log("\n❌ DEPLOYMENT CANCELLED");
    console.log("🔧 To deploy the contract:");
    console.log("1. Get your private key from your wallet");
    console.log("2. Edit this script and replace the privateKey variable");
    console.log("3. Run: node scripts/deploy-marketplace-test.mjs");
    console.log("\n📋 Example private key format: 0x1234567890abcdef...");
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });

  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("📝 Deployer:", wallet.address);

  const artifactPath = path.join(
    process.cwd(),
    "artifacts/contracts/SafariVerseMarketplace.sol/SafariVerseMarketplace.json"
  );

  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  console.log("⏳ Deploying contract...");
  const contract = await factory.deploy(wallet.address); // Use deployer as fee recipient
  console.log("📤 Deploy tx:", contract.deploymentTransaction()?.hash);

  console.log("⏳ Waiting for deployment...");
  const deployed = await contract.waitForDeployment();
  const contractAddress = await deployed.getAddress();

  console.log("\n" + "=".repeat(60));
  console.log("🎉 SAFARIVERSE MARKETPLACE DEPLOYED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log("📍 CONTRACT ADDRESS:", contractAddress);
  console.log("👤 Contract Owner:", await deployed.owner());
  console.log("💰 Fee Recipient:", await deployed.feeRecipient());
  console.log(
    "📊 Platform Fee (basis points):",
    await deployed.platformFeeBps()
  );
  console.log("=".repeat(60));

  // Save to .env.local
  const envContent = `NEXT_PUBLIC_SV_MARKETPLACE_ADDRESS=${contractAddress}\n`;
  require("fs").writeFileSync(
    path.join(process.cwd(), ".env.local"),
    envContent,
    { flag: "a" }
  );
  console.log("💾 Contract address saved to .env.local");

  console.log("\n🔧 NEXT STEPS:");
  console.log("1. Update your TypeScript library with the new address");
  console.log("2. Test the contract functions");
  console.log("3. Start creating products!");
  console.log("\n📋 IMPORTANT: Save this contract address:", contractAddress);
}

main().catch((e) => {
  console.error("❌ Deployment failed:", e);
  process.exit(1);
});
