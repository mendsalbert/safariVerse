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

  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/SafariMart.sol/SafariMart.json"
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  const contract = new ethers.Contract(
    "0x95b51De4dFD03087E22942c1b2B6D6f7e0b00604",
    artifact.abi,
    wallet
  );

  console.log("Checking contract state...");

  try {
    // Check if contract is paused
    const isPaused = await contract.paused();
    console.log("Contract paused:", isPaused);

    // Check owner
    const owner = await contract.owner();
    console.log("Contract owner:", owner);

    // Check platform fee
    const platformFee = await contract.platformFeePercent();
    console.log("Platform fee:", platformFee.toString(), "basis points");

    // Check fee recipient
    const feeRecipient = await contract.feeRecipient();
    console.log("Fee recipient:", feeRecipient);

    // Check next product ID
    const nextProductId = await contract.nextProductId();
    console.log("Next product ID:", nextProductId.toString());

    // Check if we can call a simple view function
    const product = await contract.getProduct(1);
    console.log("Product 1 exists:", product.creator !== ethers.ZeroAddress);

    // Try to call a function that doesn't require payment
    try {
      const hasPurchased = await contract.hasPurchased(wallet.address, 1);
      console.log("Has purchased product 1:", hasPurchased);
    } catch (error) {
      console.log("Error checking purchase status:", error.message);
    }

  } catch (error) {
    console.error("Error checking contract state:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
