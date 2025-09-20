import { ethers } from "ethers";

async function main() {
  console.log("🔧 Fixing fee recipient to resolve purchase issues...");

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

  const contractAddress = "0xBcE13976A22e64FA9ce63bf0c06f4F7657655e86";

  // Contract ABI for the functions we need
  const abi = [
    "function setFeeRecipient(address _feeRecipient) external",
    "function feeRecipient() external view returns (address)",
    "function owner() external view returns (address)",
  ];

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  console.log("📝 Current owner:", await contract.owner());
  console.log("💰 Current fee recipient:", await contract.feeRecipient());
  console.log("👤 Wallet address:", wallet.address);

  // Check if we're the owner
  const owner = await contract.owner();
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.error(
      "❌ You are not the contract owner. Cannot change fee recipient."
    );
    process.exit(1);
  }

  // Set a different fee recipient (use a different address)
  // For now, let's use a simple address that's different from the current one
  const newFeeRecipient = "0x0000000000000000000000000000000000000001"; // A simple different address

  console.log("🔄 Setting new fee recipient to:", newFeeRecipient);

  try {
    const tx = await contract.setFeeRecipient(newFeeRecipient);
    console.log("📤 Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt.hash);

    console.log("💰 New fee recipient:", await contract.feeRecipient());
    console.log("🎉 Fee recipient updated successfully!");
  } catch (error) {
    console.error("❌ Failed to update fee recipient:", error);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
