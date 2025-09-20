import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    __dirname,
    "../artifacts/contracts/SafariMart.sol/SafariMart.json"
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  // Use deployer address as both owner and fee recipient for simplicity
  const feeRecipient = process.env.FEE_RECIPIENT || wallet.address;

  console.log("Deploying SafariMart...");
  console.log("Owner:", wallet.address);
  console.log("Fee Recipient:", feeRecipient);

  const contract = await factory.deploy(wallet.address, feeRecipient);
  console.log("Deploy tx:", contract.deploymentTransaction()?.hash);

  const deployed = await contract.waitForDeployment();
  const address = await deployed.getAddress();

  console.log("Contract deployed at:", address);

  // Verify deployment by calling some view functions
  try {
    const platformFee = await deployed.platformFeePercent();
    const nextProductId = await deployed.nextProductId();

    console.log("Platform Fee:", platformFee.toString(), "basis points");
    console.log("Next Product ID:", nextProductId.toString());
  } catch (error) {
    console.log(
      "Note: Could not verify contract functions, but deployment succeeded"
    );
  }

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Contract Address:", address);
  console.log("Network: Hedera Testnet");
  console.log("Chain ID: 296");

  // Save deployment info
  console.log("\nAdd this to your .env file:");
  console.log(`NEXT_PUBLIC_SAFARIMART_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
