import { readFileSync } from "fs";
import path from "path";
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import "dotenv/config";

async function main() {
  console.log(
    "🚀 Deploying MVP SafariVerse Marketplace (no fees, self-buy allowed)..."
  );

  const RPC =
    process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api";
  const PRIVATE_KEY = process.env.HEDERA_TESTNET_PRIVATE_KEY;
  if (!PRIVATE_KEY) throw new Error("❌ Set HEDERA_TESTNET_PRIVATE_KEY in env");

  const provider = new JsonRpcProvider(RPC, {
    name: "hedera-testnet",
    chainId: 296,
  });
  const wallet = new Wallet(
    PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`,
    provider
  );

  console.log("📝 Deployer:", wallet.address);

  const artifactPath = path.join(
    process.cwd(),
    "artifacts/contracts/SafariVerseMarketplace.sol/SafariVerseMarketplace.json"
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
  console.log("⏳ Deploying...");
  const contract = await factory.deploy();
  console.log("📤 Deploy tx:", contract.deploymentTransaction()?.hash);
  const deployed = await contract.waitForDeployment();
  const address = await deployed.getAddress();
  console.log("✅ Deployed address:", address);
}

main().catch((e) => {
  console.error("❌ Deployment failed:", e);
  process.exit(1);
});
