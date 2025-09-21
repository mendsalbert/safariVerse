// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Safari Survival Token (ERC-20)
contract SafariSurvivalToken is ERC20, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18; // 10 million tokens
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 million initial
    
    mapping(address => bool) public gameContracts;
    mapping(address => uint256) public playerTotalEarned;
    mapping(address => uint256) public playerSessionsPlayed;
    
    event TokensRewarded(address indexed player, uint256 amount, string reason);
    event GameContractAdded(address indexed gameContract);
    event GameContractRemoved(address indexed gameContract);

    constructor(address initialOwner) 
        ERC20("Safari Survival Token", "SAFARI") 
        Ownable(initialOwner) 
    {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    modifier onlyGameContract() {
        require(gameContracts[msg.sender], "SafariToken: Only game contracts can call this");
        _;
    }

    function addGameContract(address gameContract) external onlyOwner {
        require(gameContract != address(0), "SafariToken: Invalid game contract address");
        gameContracts[gameContract] = true;
        emit GameContractAdded(gameContract);
    }

    function removeGameContract(address gameContract) external onlyOwner {
        gameContracts[gameContract] = false;
        emit GameContractRemoved(gameContract);
    }

    function rewardPlayer(address player, uint256 amount, string calldata reason) 
        external 
        onlyGameContract 
        whenNotPaused 
    {
        require(player != address(0), "SafariToken: Invalid player address");
        require(amount > 0, "SafariToken: Amount must be greater than 0");
        require(totalSupply() + amount <= MAX_SUPPLY, "SafariToken: Would exceed max supply");

        _mint(player, amount);
        playerTotalEarned[player] += amount;
        playerSessionsPlayed[player] += 1;

        emit TokensRewarded(player, amount, reason);
    }

    function getPlayerStats(address player) 
        external 
        view 
        returns (uint256 totalEarned, uint256 sessionsPlayed, uint256 currentBalance) 
    {
        return (
            playerTotalEarned[player],
            playerSessionsPlayed[player],
            balanceOf(player)
        );
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}

// Safari Achievement NFTs (ERC-721)
contract SafariAchievementNFT is ERC721URIStorage, Ownable, Pausable {
    struct Achievement {
        uint256 tokenId;
        string achievementType;
        uint256 survivalTime;
        uint256 score;
        uint256 timestamp;
        string rarity; // common, uncommon, rare, epic, legendary
        address player;
    }

    uint256 private _nextTokenId = 1;
    mapping(address => bool) public gameContracts;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public playerAchievements;
    mapping(string => uint256) public rarityCount;
    
    // Achievement type to rarity mapping
    mapping(string => string) public achievementRarities;
    
    event AchievementMinted(
        uint256 indexed tokenId,
        address indexed player,
        string achievementType,
        string rarity,
        uint256 survivalTime,
        uint256 score
    );
    
    event GameContractAdded(address indexed gameContract);
    event GameContractRemoved(address indexed gameContract);

    constructor(address initialOwner) 
        ERC721("Safari Adventure Achievements", "SAFNFT") 
        Ownable(initialOwner) 
    {
        // Set up achievement rarities
        achievementRarities["First Survivor"] = "common";
        achievementRarities["Speed Demon"] = "uncommon";
        achievementRarities["Collision Master"] = "rare";
        achievementRarities["Endurance Runner"] = "epic";
        achievementRarities["Safari Master"] = "legendary";
    }

    modifier onlyGameContract() {
        require(gameContracts[msg.sender], "SafariNFT: Only game contracts can call this");
        _;
    }

    function addGameContract(address gameContract) external onlyOwner {
        require(gameContract != address(0), "SafariNFT: Invalid game contract address");
        gameContracts[gameContract] = true;
        emit GameContractAdded(gameContract);
    }

    function removeGameContract(address gameContract) external onlyOwner {
        gameContracts[gameContract] = false;
        emit GameContractRemoved(gameContract);
    }

    function setAchievementRarity(string calldata achievementType, string calldata rarity) 
        external 
        onlyOwner 
    {
        achievementRarities[achievementType] = rarity;
    }

    function mintAchievement(
        address player,
        string calldata achievementType,
        uint256 survivalTime,
        uint256 score,
        string calldata tokenURI
    ) external onlyGameContract whenNotPaused returns (uint256) {
        require(player != address(0), "SafariNFT: Invalid player address");
        require(bytes(achievementType).length > 0, "SafariNFT: Achievement type required");

        uint256 tokenId = _nextTokenId++;
        string memory rarity = achievementRarities[achievementType];
        if (bytes(rarity).length == 0) {
            rarity = "common"; // Default rarity
        }

        _safeMint(player, tokenId);
        _setTokenURI(tokenId, tokenURI);

        achievements[tokenId] = Achievement({
            tokenId: tokenId,
            achievementType: achievementType,
            survivalTime: survivalTime,
            score: score,
            timestamp: block.timestamp,
            rarity: rarity,
            player: player
        });

        playerAchievements[player].push(tokenId);
        rarityCount[rarity]++;

        emit AchievementMinted(tokenId, player, achievementType, rarity, survivalTime, score);

        return tokenId;
    }

    function getPlayerAchievements(address player) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return playerAchievements[player];
    }

    function getAchievement(uint256 tokenId) 
        external 
        view 
        returns (Achievement memory) 
    {
        require(_exists(tokenId), "SafariNFT: Token does not exist");
        return achievements[tokenId];
    }

    function getRarityStats() 
        external 
        view 
        returns (
            uint256 common,
            uint256 uncommon,
            uint256 rare,
            uint256 epic,
            uint256 legendary
        ) 
    {
        return (
            rarityCount["common"],
            rarityCount["uncommon"],
            rarityCount["rare"],
            rarityCount["epic"],
            rarityCount["legendary"]
        );
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override
        whenNotPaused
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}

// Main Game Rewards Contract
contract SafariGameRewards is Ownable, ReentrancyGuard, Pausable {
    SafariSurvivalToken public survivalToken;
    SafariAchievementNFT public achievementNFT;
    
    struct GameSession {
        address player;
        uint256 survivalTime;
        uint256 score;
        uint256 tokensEarned;
        uint256[] achievementNFTs;
        uint256 timestamp;
        bool rewarded;
    }

    mapping(bytes32 => GameSession) public gameSessions;
    mapping(address => bytes32[]) public playerSessions;
    mapping(address => bool) public authorizedCallers;
    
    // Reward calculation parameters
    uint256 public constant TOKENS_PER_MINUTE = 100; // 1 SAFARI per minute
    uint256 public constant TOKENS_PER_100_SCORE = 10; // 0.1 SAFARI per 100 points
    uint256 public constant MIN_SURVIVAL_TIME = 30; // 30 seconds minimum to earn rewards

    event SessionStarted(bytes32 indexed sessionId, address indexed player);
    event SessionEnded(bytes32 indexed sessionId, address indexed player, uint256 tokensEarned, uint256 nftsEarned);
    event AuthorizedCallerAdded(address indexed caller);
    event AuthorizedCallerRemoved(address indexed caller);

    constructor(
        address _survivalToken,
        address _achievementNFT,
        address initialOwner
    ) Ownable(initialOwner) {
        survivalToken = SafariSurvivalToken(_survivalToken);
        achievementNFT = SafariAchievementNFT(_achievementNFT);
    }

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "SafariRewards: Not authorized");
        _;
    }

    function addAuthorizedCaller(address caller) external onlyOwner {
        require(caller != address(0), "SafariRewards: Invalid caller address");
        authorizedCallers[caller] = true;
        emit AuthorizedCallerAdded(caller);
    }

    function removeAuthorizedCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
        emit AuthorizedCallerRemoved(caller);
    }

    function startGameSession(address player) 
        external 
        onlyAuthorized 
        whenNotPaused 
        returns (bytes32 sessionId) 
    {
        require(player != address(0), "SafariRewards: Invalid player address");
        
        sessionId = keccak256(abi.encodePacked(player, block.timestamp, block.difficulty));
        
        gameSessions[sessionId] = GameSession({
            player: player,
            survivalTime: 0,
            score: 0,
            tokensEarned: 0,
            achievementNFTs: new uint256[](0),
            timestamp: block.timestamp,
            rewarded: false
        });

        playerSessions[player].push(sessionId);
        
        emit SessionStarted(sessionId, player);
        return sessionId;
    }

    function endGameSession(
        bytes32 sessionId,
        uint256 survivalTime,
        uint256 score,
        string[] calldata achievements
    ) external onlyAuthorized whenNotPaused nonReentrant {
        GameSession storage session = gameSessions[sessionId];
        require(session.player != address(0), "SafariRewards: Session does not exist");
        require(!session.rewarded, "SafariRewards: Session already rewarded");
        require(survivalTime >= MIN_SURVIVAL_TIME, "SafariRewards: Minimum survival time not met");

        session.survivalTime = survivalTime;
        session.score = score;
        session.rewarded = true;

        // Calculate token rewards
        uint256 tokenReward = calculateTokenReward(survivalTime, score, achievements.length);
        
        if (tokenReward > 0) {
            survivalToken.rewardPlayer(
                session.player,
                tokenReward,
                "Game session completion"
            );
            session.tokensEarned = tokenReward;
        }

        // Mint achievement NFTs
        uint256 nftCount = 0;
        for (uint256 i = 0; i < achievements.length; i++) {
            if (shouldMintNFT(achievements[i], survivalTime, score)) {
                string memory tokenURI = generateTokenURI(achievements[i], survivalTime, score);
                uint256 tokenId = achievementNFT.mintAchievement(
                    session.player,
                    achievements[i],
                    survivalTime,
                    score,
                    tokenURI
                );
                session.achievementNFTs.push(tokenId);
                nftCount++;
            }
        }

        emit SessionEnded(sessionId, session.player, tokenReward, nftCount);
    }

    function calculateTokenReward(
        uint256 survivalTime,
        uint256 score,
        uint256 achievementCount
    ) public pure returns (uint256) {
        uint256 baseReward = (survivalTime / 60) * TOKENS_PER_MINUTE; // Per minute
        uint256 scoreBonus = (score / 100) * TOKENS_PER_100_SCORE; // Per 100 points
        uint256 achievementBonus = achievementCount * 50; // 0.5 SAFARI per achievement

        return baseReward + scoreBonus + achievementBonus;
    }

    function shouldMintNFT(
        string memory achievementType,
        uint256 survivalTime,
        uint256 score
    ) public pure returns (bool) {
        bytes32 achievement = keccak256(abi.encodePacked(achievementType));
        
        // Safari Master: 5+ minutes
        if (achievement == keccak256(abi.encodePacked("Safari Master"))) {
            return survivalTime >= 300;
        }
        
        // Endurance Runner: 3+ minutes
        if (achievement == keccak256(abi.encodePacked("Endurance Runner"))) {
            return survivalTime >= 180;
        }
        
        // High score achievements
        if (score >= 500) {
            return true;
        }
        
        // Random chance for other achievements (10% for 2+ minute survivors)
        if (survivalTime >= 120) {
            return (uint256(keccak256(abi.encodePacked(achievementType, survivalTime))) % 100) < 10;
        }
        
        return false;
    }

    function generateTokenURI(
        string memory achievementType,
        uint256 survivalTime,
        uint256 score
    ) public pure returns (string memory) {
        // In a real implementation, this would generate proper JSON metadata
        return string(abi.encodePacked(
            "https://safariverse.app/api/nft-metadata/",
            achievementType,
            "?survival=", uint2str(survivalTime),
            "&score=", uint2str(score)
        ));
    }

    function getPlayerSessions(address player) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return playerSessions[player];
    }

    function getSession(bytes32 sessionId) 
        external 
        view 
        returns (GameSession memory) 
    {
        return gameSessions[sessionId];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Utility function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
