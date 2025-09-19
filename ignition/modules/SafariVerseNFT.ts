import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SafariVerseNFTModule = buildModule("SafariVerseNFTModule", (m) => {
  const name = m.getParameter("name", "SafariVerse NFT");
  const symbol = m.getParameter("symbol", "SVNFT");

  const nft = m.contract("SafariVerseNFT", [name, symbol, m.getAccount(0)]);

  return { nft };
});

export default SafariVerseNFTModule;
