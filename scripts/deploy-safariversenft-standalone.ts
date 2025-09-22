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
    "../artifacts/contracts/SafariVerseNFT.sol/SafariVerseNFT.json"
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );
  const name = process.env.NFT_NAME || "SafariVerse NFT";
  const symbol = process.env.NFT_SYMBOL || "SVNFT";

  console.log("Deploying SafariVerseNFT...");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Owner:", wallet.address);

  const contract = await factory.deploy(name, symbol, wallet.address);
  console.log("Deploy tx:", contract.deploymentTransaction()?.hash);
  const deployed = await contract.waitForDeployment();
  const address = await deployed.getAddress();

  console.log("Contract deployed at:", address);

  // Verify deployment
  try {
    const nextTokenId = await deployed.nextTokenId();
    console.log("Next Token ID:", nextTokenId.toString());
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
  console.log(`NEXT_PUBLIC_SAFARIVERSENFT_ADDRESS=${address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
