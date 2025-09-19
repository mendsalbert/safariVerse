import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";

async function main() {
  console.log("🚀 Deploying SafariVerse Marketplace Contract...");

  // You'll need to set these values
  const rpcUrl = "https://testnet.hashio.io/api";
  const privateKey = "YOUR_PRIVATE_KEY_HERE"; // Replace with your private key
  const feeRecipient = "YOUR_FEE_RECIPIENT_ADDRESS"; // Replace with fee recipient address

  if (privateKey === "YOUR_PRIVATE_KEY_HERE") {
    console.error("❌ Please set your private key in the script");
    process.exit(1);
  }

  if (feeRecipient === "YOUR_FEE_RECIPIENT_ADDRESS") {
    console.error("❌ Please set your fee recipient address in the script");
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

  console.log("📝 Deployer:", wallet.address);
  console.log("💰 Fee Recipient:", feeRecipient);

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
  const contract = await factory.deploy(feeRecipient);
  console.log("📤 Deploy tx:", contract.deploymentTransaction()?.hash);

  console.log("⏳ Waiting for deployment...");
  const deployed = await contract.waitForDeployment();
  const contractAddress = await deployed.getAddress();

  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Contract Owner:", await deployed.owner());
  console.log("💰 Fee Recipient:", await deployed.feeRecipient());
  console.log(
    "📊 Platform Fee (basis points):",
    await deployed.platformFeeBps()
  );

  console.log("\n🔧 Next Steps:");
  console.log("1. Update your .env.local file with:");
  console.log(`   NEXT_PUBLIC_SV_MARKETPLACE_ADDRESS=${contractAddress}`);
  console.log("2. Update your TypeScript library with the new address");
  console.log("3. Test the contract functions");
}

main().catch((e) => {
  console.error("❌ Deployment failed:", e);
  process.exit(1);
});
