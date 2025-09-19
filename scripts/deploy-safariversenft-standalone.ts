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

  const contract = await factory.deploy(name, symbol, wallet.address);
  console.log("Deploy tx:", contract.deploymentTransaction()?.hash);
  const deployed = await contract.waitForDeployment();
  console.log("Contract deployed at:", await deployed.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
