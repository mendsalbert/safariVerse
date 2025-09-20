# SafariMart Marketplace

SafariMart is a decentralized marketplace built on Hedera Testnet where creators can list and sell their 3D products in GLB format. The marketplace supports the entire product lifecycle from listing to purchasing.

## Features

### For Creators

- **List Products**: Upload GLB files with metadata (title, description, category, price)
- **Manage Listings**: Update product details, pricing, and availability
- **Track Sales**: View total sales and revenue for each product
- **Earn Revenue**: Receive payments automatically (minus platform fee)

### For Buyers

- **Browse Products**: View all active products or filter by category
- **Purchase Products**: Buy products with HBAR/ETH equivalent
- **Purchase History**: Track all purchases with product details
- **Access Control**: Check if you've already purchased a product

### Platform Features

- **Platform Fee**: Configurable fee (default 2.5%)
- **Categories**: Organized product categories (animals, artifacts, environment, etc.)
- **Security**: Built-in reentrancy protection and pause functionality
- **Admin Controls**: Owner can manage fees, pause/unpause, and emergency withdraw

## Smart Contract

### Contract Address

- **Hedera Testnet**: `0x95b51De4dFD03087E22942c1b2B6D6f7e0b00604`

### Key Functions

#### Product Management

- `listProduct()` - Create a new product listing
- `updateProduct()` - Update existing product details
- `purchaseProduct()` - Buy a product

#### View Functions

- `getAllActiveProducts()` - Get all available products
- `getProductsByCategory()` - Get products by category
- `getMyProducts()` - Get creator's products
- `getMyPurchases()` - Get buyer's purchase history

## Frontend Integration

### Library Usage

```typescript
import {
  listProduct,
  getAllActiveProducts,
  purchaseProduct,
  getMyProducts,
  getMyPurchases,
  PRODUCT_CATEGORIES,
} from "@/lib/safarimart";

// List a product
const { txHash, productId } = await listProduct({
  fileUrl: "https://example.com/model.glb",
  title: "African Elephant",
  description: "High-quality 3D model of an African elephant",
  category: "animals",
  priceEth: "0.1", // 0.1 HBAR equivalent
});

// Get all products
const products = await getAllActiveProducts();

// Purchase a product
const { txHash, purchaseId } = await purchaseProduct(productId);
```

### Product Categories

- `animals` - Wildlife and animal models
- `artifacts` - Cultural artifacts and historical items
- `environment` - Environmental elements (trees, rocks, etc.)
- `art-gallery` - Art pieces and sculptures
- `tools` - Utility items and tools
- `decorations` - Decorative elements
- `vehicles` - Transportation models
- `buildings` - Architectural structures
- `nature` - Natural elements
- `other` - Miscellaneous items

## Deployment

### Prerequisites

- Node.js and npm/yarn
- Hedera Testnet account with HBAR
- Environment variables set

### Environment Variables

```bash
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
HEDERA_TESTNET_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_SAFARIMART_ADDRESS=0x95b51De4dFD03087E22942c1b2B6D6f7e0b00604
```

### Deploy New Instance

```bash
# Compile contracts
npx hardhat compile

# Deploy to Hedera Testnet
npx tsx scripts/deploy-safarimart.ts
```

## Technical Details

### Contract Architecture

- **SafariMart.sol**: Main marketplace contract
- **OpenZeppelin**: Uses Ownable, ReentrancyGuard, and Pausable
- **Solidity**: Version 0.8.28 with optimization

### Data Structures

```solidity
struct Product {
    uint256 productId;
    string fileUrl;
    string title;
    string description;
    string category;
    uint256 price;
    address creator;
    bool isActive;
    uint64 createdAt;
    uint256 totalSales;
    uint256 totalRevenue;
}

struct Purchase {
    uint256 purchaseId;
    uint256 productId;
    address buyer;
    uint256 pricePaid;
    uint64 purchasedAt;
}
```

### Events

- `ProductListed` - New product created
- `ProductUpdated` - Product details changed
- `ProductPurchased` - Product sold
- `PlatformFeeUpdated` - Fee structure changed

## Integration with SafariVerse

SafariMart integrates seamlessly with the SafariVerse ecosystem:

- **GLB Models**: All products are 3D models compatible with the game engine
- **Wallet Integration**: Uses the same wallet connection as SafariVerse NFTs
- **Hedera Network**: Deployed on the same network for consistency
- **Categories**: Aligned with SafariVerse content types

## Security Features

- **Reentrancy Protection**: Prevents double-spending attacks
- **Access Control**: Only creators can update their products
- **Pausable**: Admin can pause the contract in emergencies
- **Fee Validation**: Platform fee capped at 10%
- **Input Validation**: All inputs are validated before processing

## Future Enhancements

- **Royalties**: Secondary sales royalties for creators
- **Discounts**: Bulk purchase discounts
- **Reviews**: Product rating and review system
- **Collections**: Grouped product collections
- **Auctions**: Time-based auction functionality
