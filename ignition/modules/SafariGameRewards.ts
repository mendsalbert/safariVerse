import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SafariGameRewardsModule = buildModule("SafariGameRewardsModule", (m) => {
  // Get the deployer account
  const deployer = m.getAccount(0);

  // Deploy Safari Survival Token (ERC-20)
  const safariSurvivalToken = m.contract("SafariSurvivalToken", [deployer], {
    id: "SafariSurvivalToken",
  });

  // Deploy Safari Achievement NFT (ERC-721)
  const safariAchievementNFT = m.contract("SafariAchievementNFT", [deployer], {
    id: "SafariAchievementNFT",
  });

  // Deploy Safari Game Rewards (Main contract)
  const safariGameRewards = m.contract(
    "SafariGameRewards",
    [safariSurvivalToken, safariAchievementNFT, deployer],
    {
      id: "SafariGameRewards",
    }
  );

  // Set up the game rewards contract as an authorized caller for both token contracts
  m.call(safariSurvivalToken, "addGameContract", [safariGameRewards], {
    id: "AddGameContractToToken",
  });

  m.call(safariAchievementNFT, "addGameContract", [safariGameRewards], {
    id: "AddGameContractToNFT",
  });

  return {
    safariSurvivalToken,
    safariAchievementNFT,
    safariGameRewards,
  };
});

export default SafariGameRewardsModule;
