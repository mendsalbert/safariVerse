// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SafariVerseNFT is ERC721URIStorage, Ownable {
    struct TokenData {
        string fileUrl;         // e.g. S3/Arweave/Pinata URL to .glb or media
        string title;           // human-readable title
        string description;     // human-readable description
        uint256 price;          // arbitrary price value (in wei or app-defined units)
        address minter;         // original minter address
        uint64 mintedAt;        // block timestamp
    }

    uint256 private _nextTokenId;

    // tokenId => on-chain data
    mapping(uint256 => TokenData) private _tokenData;

    // minter => tokenIds minted by that address
    mapping(address => uint256[]) private _mintedBy;

    event Minted(
        uint256 indexed tokenId,
        address indexed minter,
        string fileUrl,
        string title,
        uint256 price
    );

    constructor(string memory name_, string memory symbol_, address initialOwner)
        ERC721(name_, symbol_)
        Ownable(initialOwner)
    {}

    // Mint for caller, storing on-chain metadata fields and setting tokenURI.
    // - fileUrl: direct URL to the media (e.g., S3 .glb)
    // - title / description: simple strings stored on-chain
    // - price: stored for UI; no payment enforced by this contract
    // tokenURI will be set to fileUrl for compatibility with wallets, but the
    // dapp can also construct richer off-chain JSON using these fields.
    function mint(
        string calldata fileUrl,
        string calldata title,
        string calldata description,
        uint256 price
    ) external returns (uint256 tokenId) {
        tokenId = ++_nextTokenId;
        _safeMint(msg.sender, tokenId);

        // Set tokenURI to the file URL for discoverability
        _setTokenURI(tokenId, fileUrl);

        _tokenData[tokenId] = TokenData({
            fileUrl: fileUrl,
            title: title,
            description: description,
            price: price,
            minter: msg.sender,
            mintedAt: uint64(block.timestamp)
        });

        _mintedBy[msg.sender].push(tokenId);

        emit Minted(tokenId, msg.sender, fileUrl, title, price);
    }

    // Original owner-only mint to arbitrary address, for admin flows
    function mintTo(
        address to,
        string calldata fileUrl,
        string calldata title,
        string calldata description,
        uint256 price
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, fileUrl);

        _tokenData[tokenId] = TokenData({
            fileUrl: fileUrl,
            title: title,
            description: description,
            price: price,
            minter: to,
            mintedAt: uint64(block.timestamp)
        });

        _mintedBy[to].push(tokenId);

        emit Minted(tokenId, to, fileUrl, title, price);
    }

    // Allow the original minter to update the stored price for their token.
    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        TokenData storage data = _tokenData[tokenId];
        require(data.minter != address(0), "SVNFT: nonexistent token");
        require(data.minter == msg.sender, "SVNFT: only minter");
        data.price = newPrice;
    }

    // View helpers
    function nextTokenId() external view returns (uint256) {
        return _nextTokenId + 1;
    }

    function getTokenData(uint256 tokenId) external view returns (TokenData memory) {
        require(_ownerOf(tokenId) != address(0), "SVNFT: nonexistent token");
        return _tokenData[tokenId];
    }

    function tokensMintedBy(address minter) external view returns (uint256[] memory) {
        return _mintedBy[minter];
    }

    // Internal helper to assemble minted tokens and data
    function _collectMinted(address minter)
        internal
        view
        returns (uint256[] memory tokenIds, TokenData[] memory data)
    {
        uint256[] memory ids = _mintedBy[minter];
        TokenData[] memory out = new TokenData[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            out[i] = _tokenData[ids[i]];
        }
        return (ids, out);
    }

    // Returns all tokenIds and their TokenData minted by a given address
    function getMintedTokens(address minter)
        external
        view
        returns (uint256[] memory tokenIds, TokenData[] memory data)
    {
        return _collectMinted(minter);
    }

    // Convenience function for the caller
    function myMintedTokens()
        external
        view
        returns (uint256[] memory tokenIds, TokenData[] memory data)
    {
        return _collectMinted(msg.sender);
    }
}


