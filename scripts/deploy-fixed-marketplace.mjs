import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";

async function main() {
  console.log("🚀 Deploying Fixed SafariVerse Marketplace Contract...");

  // Use environment variables or defaults
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

  console.log("📝 Deployer:", wallet.address);
  console.log("💰 Fee Recipient (will be deployer):", wallet.address);

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
