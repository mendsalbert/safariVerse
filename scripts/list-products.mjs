import { readFileSync } from "fs";
import path from "path";
import { JsonRpcProvider, Contract, formatUnits } from "ethers";

async function main() {
  const RPC =
    process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api";
  const ADDRESS = "0x46B4C7b4D9DA1221F8C580f56A7831AA0b65BAD4";

  const provider = new JsonRpcProvider(RPC, {
    name: "hedera-testnet",
    chainId: 296,
  });

  const artifactPath = path.join(
    process.cwd(),
    "artifacts/contracts/SafariVerseMarketplace.sol/SafariVerseMarketplace.json"
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

  const contract = new Contract(ADDRESS, artifact.abi, provider);

  const [totalProducts] = await contract.getPlatformStats();
  const results = [];

  for (let i = 1n; i <= totalProducts; i++) {
    try {
      const p = await contract.getProduct(i);
      results.push({
        id: p.id.toString(),
        name: p.name,
        active: p.isActive,
        creator: p.creator,
        priceWei: p.price.toString(),
        priceHBAR: formatUnits(p.price, 18),
        createdAt: Number(p.createdAt),
        updatedAt: Number(p.updatedAt),
        itemsSold: p.itemsSold.toString(),
        totalRevenueWei: p.totalRevenue.toString(),
        category: p.category,
      });
    } catch (e) {
      // skip if product slot invalid
    }
  }

  console.log(
    JSON.stringify(
      {
        address: ADDRESS,
        totalProducts: totalProducts.toString(),
        products: results,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
