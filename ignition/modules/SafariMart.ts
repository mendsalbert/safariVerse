import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SafariMartModule = buildModule("SafariMartModule", (m) => {
  const initialOwner = m.getParameter("initialOwner", m.getAccount(0));
  const feeRecipient = m.getParameter("feeRecipient", m.getAccount(0));

  const marketplace = m.contract("SafariMart", [initialOwner, feeRecipient]);

  return { marketplace };
});

export default SafariMartModule;
