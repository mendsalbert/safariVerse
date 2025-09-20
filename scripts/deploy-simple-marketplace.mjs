import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";
import "dotenv/config";

async function main() {
  console.log("🚀 Deploying Simple Marketplace (Hedera workaround)...");

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

  const artifactPath = path.join(
    process.cwd(),
    "artifacts/contracts/SimpleMarketplace.sol/SimpleMarketplace.json"
  );

  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  console.log("⏳ Deploying...");
  const contract = await factory.deploy();
  const deployed = await contract.waitForDeployment();
  const contractAddress = await deployed.getAddress();

  console.log("✅ Deployed address:", contractAddress);
}

main().catch((e) => {
  console.error("❌ Deployment failed:", e);
  process.exit(1);
});
