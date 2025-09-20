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

  const contract = new ethers.Contract(
    "0x95b51De4dFD03087E22942c1b2B6D6f7e0b00604",
    artifact.abi,
    wallet
  );

  console.log("Testing SafariMart contract...");

  try {
    // Test basic contract functions
    const nextProductId = await contract.nextProductId();
    console.log("Next Product ID:", nextProductId.toString());

    const platformFee = await contract.platformFeePercent();
    console.log("Platform Fee:", platformFee.toString(), "basis points");

    const feeRecipient = await contract.feeRecipient();
    console.log("Fee Recipient:", feeRecipient);

    // Test getting a product (should fail if no products exist)
    try {
      const product = await contract.getProduct(1);
      console.log("Product 1:", {
        productId: product.productId.toString(),
        title: product.title,
        price: product.price.toString(),
        isActive: product.isActive,
        creator: product.creator,
      });
    } catch (error) {
      console.log("Product 1 does not exist (expected if no products listed)");
    }

    // Test listing a product
    console.log("\nTesting product listing...");
    const listTx = await contract.listProduct(
      "https://example.com/test.glb",
      "Test Product",
      "A test product for debugging",
      "test",
      ethers.parseEther("0.1") // 0.1 HBAR
    );
    console.log("List transaction:", listTx.hash);
    
    const listReceipt = await listTx.wait();
    console.log("List receipt:", listReceipt.hash);

    // Now test getting the product
    const newProduct = await contract.getProduct(1);
    console.log("New Product 1:", {
      productId: newProduct.productId.toString(),
      title: newProduct.title,
      price: newProduct.price.toString(),
      priceHex: "0x" + newProduct.price.toString(16),
      isActive: newProduct.isActive,
      creator: newProduct.creator,
    });

    // Test purchasing the product
    console.log("\nTesting product purchase...");
    console.log("Sending value:", newProduct.price.toString(), "wei");
    console.log("Sending value hex:", "0x" + newProduct.price.toString(16));
    
    // Convert to BigInt explicitly
    const priceValue = BigInt(newProduct.price.toString());
    console.log("Price as BigInt:", priceValue.toString());
    
    // Try to estimate gas first
    try {
      const gasEstimate = await contract.purchaseProduct.estimateGas(1, {
        value: priceValue
      });
      console.log("Gas estimate:", gasEstimate.toString());
    } catch (error) {
      console.log("Gas estimation failed:", error.message);
    }
    
    // Try calling the function directly with ethers
    const purchaseTx = await contract.purchaseProduct(1, {
      value: priceValue,
      gasLimit: 500000
    });
    
    console.log("Transaction details:", {
      to: purchaseTx.to,
      value: purchaseTx.value?.toString(),
      data: purchaseTx.data,
      gasLimit: purchaseTx.gasLimit?.toString()
    });
    console.log("Purchase transaction:", purchaseTx.hash);
    
    const purchaseReceipt = await purchaseTx.wait();
    console.log("Purchase receipt:", purchaseReceipt.hash);

    console.log("\n✅ All tests passed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
