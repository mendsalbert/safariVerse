# Hedera Playground

A comprehensive playground for interacting with the Hedera Hashgraph network. This tool allows you to experiment with various Hedera services including token creation, file storage, NFT minting, and more.

## Features

### 🔧 Setup & Configuration

- Connect to Hedera Testnet or Mainnet
- Account balance monitoring
- Real-time transaction status

### 🪙 Token Operations

- Create fungible tokens with custom parameters
- Set token supply (finite/infinite)
- Configure decimals and initial supply
- View created tokens

### 📁 File Service

- Upload files to Hedera File Service
- Support for files up to several MB
- Automatic chunking for large files
- File expiration management

### 🎨 NFT Operations

- Create NFT collections
- Mint unique NFTs with metadata
- Support for various metadata formats
- Track minted NFTs

### 📊 Transaction History

- Real-time transaction monitoring
- Status tracking (pending/success/error)
- Transaction details and timestamps

## Getting Started

### Prerequisites

1. A Hedera testnet account (get one at [portal.hedera.com](https://portal.hedera.com))
2. Account ID (format: 0.0.123456)
3. Private key (DER-encoded hex string)

### Setup Instructions

1. Navigate to `/hedera` in your application
2. Enter your Hedera Account ID and Private Key
3. Click "Connect" to initialize the client
4. Start experimenting with different features!

### Testnet Resources

- **Portal**: [portal.hedera.com](https://portal.hedera.com) - Create testnet accounts
- **Faucet**: Get free testnet HBAR
- **Explorer**: [hashscan.io](https://hashscan.io) - View transactions and accounts
- **Documentation**: [docs.hedera.com](https://docs.hedera.com)

## Security Notes

⚠️ **Important Security Considerations:**

- Never use mainnet credentials in development
- Private keys are stored only in browser memory
- Clear browser data after testing
- Use testnet for all experiments

## Token Creation

### Fungible Tokens

Create custom tokens with:

- Custom name and symbol
- Configurable decimals (0-18)
- Initial supply
- Supply type (finite/infinite)

### NFT Collections

Create NFT collections with:

- Collection name and symbol
- Optional maximum supply
- Metadata support

## File Upload

Upload any file type to Hedera File Service:

- Automatic chunking for large files
- Configurable expiration time
- File ID tracking
- Size monitoring

## NFT Minting

Mint unique NFTs with:

- Custom metadata (JSON or text)
- Serial number tracking
- Collection management
- Metadata templates

## Utility Functions

The `hedera-utils.ts` file provides:

- `HederaService` class for all operations
- Validation utilities
- Formatting helpers
- NFT metadata templates
- Error handling

## Example Usage

```typescript
import { HederaService } from "./lib/hedera-utils";

const service = new HederaService({
  accountId: "0.0.123456",
  privateKey: "your-private-key",
  network: "testnet",
});

// Create a token
const result = await service.createFungibleToken({
  name: "My Token",
  symbol: "MTK",
  decimals: 2,
  initialSupply: 1000000,
});

console.log("Token created:", result.tokenId);
```

## Troubleshooting

### Common Issues

1. **Connection Failed**: Verify account ID and private key format
2. **Insufficient Balance**: Ensure account has enough HBAR for transactions
3. **Transaction Failed**: Check network status and try again

### Error Messages

- `INSUFFICIENT_PAYER_BALANCE`: Add more HBAR to your account
- `INVALID_ACCOUNT_ID`: Check account ID format (0.0.123456)
- `INVALID_SIGNATURE`: Verify private key is correct

## Network Information

### Testnet

- **Network**: Hedera Testnet
- **Mirror Node**: testnet.mirrornode.hedera.com
- **Explorer**: hashscan.io/testnet

### Mainnet (Production)

- **Network**: Hedera Mainnet
- **Mirror Node**: mainnet-public.mirrornode.hedera.com
- **Explorer**: hashscan.io/mainnet

## Support

For questions and support:

- [Hedera Documentation](https://docs.hedera.com)
- [Discord Community](https://hedera.com/discord)
- [Developer Portal](https://portal.hedera.com)

## License

This playground is part of the SafariVerse project and is provided for educational and development purposes.
