import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  const rpcUrl =
    process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api";
  const pk = process.env.HEDERA_TESTNET_PRIVATE_KEY;
  if (!pk) {
    throw new Error("HEDERA_TESTNET_PRIVATE_KEY not set in env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl, {
    name: "hedera-testnet",
    chainId: 296,
  });

  const wallet = new ethers.Wallet(
    pk.startsWith("0x") ? pk : `0x${pk}`,
    provider
  );
  console.log("Deployer:", wallet.address);

  const name = process.env.NFT_NAME || "SafariVerse NFT";
  const symbol = process.env.NFT_SYMBOL || "SVNFT";

  const SafariVerseNFT = await ethers.getContractFactory(
    "SafariVerseNFT",
    wallet
  );
  const contract = await SafariVerseNFT.deploy(name, symbol, wallet.address);
  console.log("Deploy tx:", contract.deploymentTransaction()?.hash);
  const deployed = await contract.waitForDeployment();
  console.log("Contract deployed at:", await deployed.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
