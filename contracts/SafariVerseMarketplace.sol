// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SafariVerseMarketplace is Ownable, ReentrancyGuard {
    // Product struct to store marketplace items
    struct Product {
        uint256 id;
        string name;
        string description;
        string fileUrl;
        uint256 price; // Price in wei (HBAR equivalent)
        address creator;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 itemsSold;
        uint256 totalRevenue;
        string category; // e.g., "3d-model", "texture", "audio", etc.
    }

    // Events
    event ProductCreated(
        uint256 indexed productId,
        address indexed creator,
        string name,
        uint256 price
    );
    
    event ProductUpdated(
        uint256 indexed productId,
        address indexed creator,
        string name,
        uint256 price
    );
    
    event ProductPurchased(
        uint256 indexed productId,
        address indexed buyer,
        address indexed creator,
        uint256 price,
        uint256 timestamp
    );
    
    event ProductDeactivated(
        uint256 indexed productId,
        address indexed creator
    );

    // State variables
    uint256 public nextProductId = 1;
    mapping(uint256 => Product) public products;
    mapping(address => uint256[]) public creatorProducts;
    mapping(address => uint256) public creatorStats; // Total revenue per creator
    mapping(address => uint256) public creatorItemsSold; // Total items sold per creator
    
    // Platform statistics
    uint256 public totalProducts;
    uint256 public totalSales;
    uint256 public totalRevenue;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeBps = 250; // 2.5% default
    address public feeRecipient;
    
    // Supported payment tokens (if any)
    mapping(address => bool) public supportedTokens;
    address public nativeToken; // For HBAR equivalent

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
        nativeToken = address(0); // Native token (HBAR equivalent)
        supportedTokens[nativeToken] = true;
    }

    // Modifiers
    modifier onlyProductCreator(uint256 _productId) {
        require(products[_productId].creator == msg.sender, "Not the product creator");
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(_productId > 0 && _productId < nextProductId, "Product does not exist");
        _;
    }
    
    modifier productActive(uint256 _productId) {
        require(products[_productId].isActive, "Product is not active");
        _;
    }

    // Create a new product
    function createProduct(
        string memory _name,
        string memory _description,
        string memory _fileUrl,
        uint256 _price,
        string memory _category
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_fileUrl).length > 0, "File URL cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_category).length > 0, "Category cannot be empty");

        uint256 productId = nextProductId++;
        
        products[productId] = Product({
            id: productId,
            name: _name,
            description: _description,
            fileUrl: _fileUrl,
            price: _price,
            creator: msg.sender,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            itemsSold: 0,
            totalRevenue: 0,
            category: _category
        });

        creatorProducts[msg.sender].push(productId);
        totalProducts++;

        emit ProductCreated(productId, msg.sender, _name, _price);
        return productId;
    }

    // Update an existing product
    function updateProduct(
        uint256 _productId,
        string memory _name,
        string memory _description,
        string memory _fileUrl,
        uint256 _price,
        string memory _category
    ) external 
        productExists(_productId)
        onlyProductCreator(_productId)
    {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_fileUrl).length > 0, "File URL cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_category).length > 0, "Category cannot be empty");

        Product storage product = products[_productId];
        product.name = _name;
        product.description = _description;
        product.fileUrl = _fileUrl;
        product.price = _price;
        product.category = _category;
        product.updatedAt = block.timestamp;

        emit ProductUpdated(_productId, msg.sender, _name, _price);
    }

    // Purchase a product
    function purchaseProduct(uint256 _productId) 
        external 
        payable 
        nonReentrant
        productExists(_productId)
        productActive(_productId)
    {
        Product storage product = products[_productId];
        require(msg.value >= product.price, "Insufficient payment");
        require(msg.sender != product.creator, "Cannot purchase your own product");

        // Calculate platform fee
        uint256 platformFee = (product.price * platformFeeBps) / 10000;
        uint256 creatorPayment = product.price - platformFee;

        // Update product statistics
        product.itemsSold++;
        product.totalRevenue += product.price;

        // Update creator statistics
        creatorStats[product.creator] += creatorPayment;
        creatorItemsSold[product.creator]++;

        // Update platform statistics
        totalSales++;
        totalRevenue += product.price;

        // Transfer payments
        if (platformFee > 0) {
            payable(feeRecipient).transfer(platformFee);
        }
        payable(product.creator).transfer(creatorPayment);

        // Refund excess payment
        if (msg.value > product.price) {
            payable(msg.sender).transfer(msg.value - product.price);
        }

        emit ProductPurchased(
            _productId,
            msg.sender,
            product.creator,
            product.price,
            block.timestamp
        );
    }

    // Deactivate a product
    function deactivateProduct(uint256 _productId) 
        external 
        productExists(_productId)
        onlyProductCreator(_productId)
    {
        products[_productId].isActive = false;
        emit ProductDeactivated(_productId, msg.sender);
    }

    // Reactivate a product
    function reactivateProduct(uint256 _productId) 
        external 
        productExists(_productId)
        onlyProductCreator(_productId)
    {
        products[_productId].isActive = true;
        products[_productId].updatedAt = block.timestamp;
    }

    // Get all products by a creator
    function getCreatorProducts(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorProducts[_creator];
    }

    // Get product details
    function getProduct(uint256 _productId) 
        external 
        view 
        productExists(_productId)
        returns (Product memory) 
    {
        return products[_productId];
    }

    // Get creator statistics
    function getCreatorStats(address _creator) 
        external 
        view 
        returns (uint256 creatorRevenue, uint256 itemsSold) 
    {
        return (creatorStats[_creator], creatorItemsSold[_creator]);
    }

    // Get platform statistics
    function getPlatformStats() 
        external 
        view 
        returns (uint256 _totalProducts, uint256 _totalSales, uint256 _totalRevenue) 
    {
        return (totalProducts, totalSales, totalRevenue);
    }

    // Get all active products (with pagination)
    function getActiveProducts(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (Product[] memory activeProducts, uint256 totalCount) 
    {
        uint256 count = 0;
        uint256 activeCount = 0;
        
        // First pass: count active products
        for (uint256 i = 1; i < nextProductId; i++) {
            if (products[i].isActive) {
                activeCount++;
            }
        }
        
        // Second pass: collect active products
        Product[] memory result = new Product[](_limit);
        uint256 resultIndex = 0;
        
        for (uint256 i = 1; i < nextProductId && resultIndex < _limit; i++) {
            if (products[i].isActive) {
                if (count >= _offset) {
                    result[resultIndex] = products[i];
                    resultIndex++;
                }
                count++;
            }
        }
        
        return (result, activeCount);
    }

    // Admin functions
    function setPlatformFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee cannot exceed 10%");
        platformFeeBps = _feeBps;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
    }

    function removeSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = false;
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function emergencyWithdrawToken(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}
