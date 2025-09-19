import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SafariVerseMarketplaceModule = buildModule(
  "SafariVerseMarketplaceModule",
  (m) => {
    // Get the fee recipient address (default to deployer if not specified)
    const feeRecipient = m.getParameter("feeRecipient", m.getAccount(0));

    const marketplace = m.contract("SafariVerseMarketplace", [feeRecipient]);

    return { marketplace };
  }
);

export default SafariVerseMarketplaceModule;
