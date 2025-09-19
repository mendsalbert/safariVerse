import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { ethers } from "ethers";

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
  console.log("Deployer:", wallet.address);

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

  // Fee recipient (default to deployer)
  const feeRecipient = process.env.MARKETPLACE_FEE_RECIPIENT || wallet.address;
  console.log("Fee recipient:", feeRecipient);

  const contract = await factory.deploy(feeRecipient);
  console.log("Deploy tx:", contract.deploymentTransaction()?.hash);
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

  // Save the contract address to a file for easy reference
  const envContent = `NEXT_PUBLIC_SV_MARKETPLACE_ADDRESS=${contractAddress}\n`;
  const fs = await import("fs");
  fs.writeFileSync(path.join(process.cwd(), ".env.local"), envContent, {
    flag: "a",
  });
  console.log("💾 Contract address saved to .env.local");

  console.log("\n🔧 NEXT STEPS:");
  console.log("1. Update your TypeScript library with the new address");
  console.log("2. Test the contract functions");
  console.log("3. Start creating products!");
  console.log("\n📋 IMPORTANT: Save this contract address:", contractAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
