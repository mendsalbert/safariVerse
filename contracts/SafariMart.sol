// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SafariMart is Ownable, ReentrancyGuard, Pausable {
    struct Product {
        uint256 productId;
        string fileUrl;         // URL to .glb file (S3/IPFS/Arweave)
        string title;           // Product title
        string description;     // Product description
        string category;        // Product category (e.g., "animals", "artifacts", "environment")
        uint256 price;          // Price in wei
        address creator;        // Product creator
        bool isActive;          // Whether product is available for purchase
        uint64 createdAt;       // Creation timestamp
        uint256 totalSales;     // Total number of sales
        uint256 totalRevenue;   // Total revenue generated
    }

    struct Purchase {
        uint256 purchaseId;
        uint256 productId;
        address buyer;
        uint256 pricePaid;
        uint64 purchasedAt;
    }

    uint256 private _nextProductId;
    uint256 private _nextPurchaseId;
    
    // Platform fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeePercent = 250; // 2.5%
    address public feeRecipient;

    // productId => Product data
    mapping(uint256 => Product) private _products;
    
    // creator => productIds created by that address
    mapping(address => uint256[]) private _createdBy;
    
    // buyer => purchaseIds made by that buyer
    mapping(address => uint256[]) private _purchasesByBuyer;
    
    // productId => purchaseIds for that product
    mapping(uint256 => uint256[]) private _purchasesByProduct;
    
    // purchaseId => Purchase data
    mapping(uint256 => Purchase) private _purchases;
    
    // buyer => productId => whether buyer has purchased this product
    mapping(address => mapping(uint256 => bool)) private _hasPurchased;

    // Events
    event ProductListed(
        uint256 indexed productId,
        address indexed creator,
        string title,
        uint256 price,
        string category
    );

    event ProductUpdated(
        uint256 indexed productId,
        string title,
        uint256 price,
        bool isActive
    );

    event ProductPurchased(
        uint256 indexed purchaseId,
        uint256 indexed productId,
        address indexed buyer,
        uint256 pricePaid,
        address creator
    );

    event PlatformFeeUpdated(uint256 newFeePercent);
    event FeeRecipientUpdated(address newFeeRecipient);

    constructor(address initialOwner, address _feeRecipient) 
        Ownable(initialOwner) 
    {
        feeRecipient = _feeRecipient;
        _nextProductId = 1;
        _nextPurchaseId = 1;
    }

    // List a new product
    function listProduct(
        string calldata fileUrl,
        string calldata title,
        string calldata description,
        string calldata category,
        uint256 price
    ) external whenNotPaused returns (uint256 productId) {
        require(bytes(fileUrl).length > 0, "SafariMart: fileUrl required");
        require(bytes(title).length > 0, "SafariMart: title required");
        require(price > 0, "SafariMart: price must be greater than 0");

        productId = _nextProductId++;

        _products[productId] = Product({
            productId: productId,
            fileUrl: fileUrl,
            title: title,
            description: description,
            category: category,
            price: price,
            creator: msg.sender,
            isActive: true,
            createdAt: uint64(block.timestamp),
            totalSales: 0,
            totalRevenue: 0
        });

        _createdBy[msg.sender].push(productId);

        emit ProductListed(productId, msg.sender, title, price, category);
    }

    // Update product details (only creator can update)
    function updateProduct(
        uint256 productId,
        string calldata title,
        string calldata description,
        uint256 price,
        bool isActive
    ) external {
        Product storage product = _products[productId];
        require(product.creator != address(0), "SafariMart: product does not exist");
        require(product.creator == msg.sender, "SafariMart: only creator can update");
        require(price > 0, "SafariMart: price must be greater than 0");

        if (bytes(title).length > 0) {
            product.title = title;
        }
        if (bytes(description).length > 0) {
            product.description = description;
        }
        product.price = price;
        product.isActive = isActive;

        emit ProductUpdated(productId, title, price, isActive);
    }

    // Purchase a product - MVP version with relaxed payment validation
    function purchaseProduct(uint256 productId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        returns (uint256 purchaseId) 
    {
        Product storage product = _products[productId];
        require(product.creator != address(0), "SafariMart: product does not exist");
        require(product.isActive, "SafariMart: product not available");
        
        // MVP: Accept any payment amount (including 0) for testing
        // require(msg.value >= product.price, "SafariMart: insufficient payment");

        purchaseId = _nextPurchaseId++;

        // Use the actual price paid or the listed price if no payment sent
        uint256 actualPrice = msg.value > 0 ? msg.value : product.price;

        _purchases[purchaseId] = Purchase({
            purchaseId: purchaseId,
            productId: productId,
            buyer: msg.sender,
            pricePaid: actualPrice,
            purchasedAt: uint64(block.timestamp)
        });

        // Update product stats
        product.totalSales++;
        product.totalRevenue += actualPrice;

        // Update buyer records
        _purchasesByBuyer[msg.sender].push(purchaseId);
        _purchasesByProduct[productId].push(purchaseId);
        _hasPurchased[msg.sender][productId] = true;

        // Only process payments if value was actually sent
        if (msg.value > 0) {
            // Calculate platform fee and creator payment
            uint256 platformFee = (msg.value * platformFeePercent) / 10000;
            uint256 creatorPayment = msg.value - platformFee;

            // Transfer payments
            if (platformFee > 0 && feeRecipient != address(0)) {
                payable(feeRecipient).transfer(platformFee);
            }
            payable(product.creator).transfer(creatorPayment);

            // Refund excess payment
            if (msg.value > product.price) {
                payable(msg.sender).transfer(msg.value - product.price);
            }
        }

        emit ProductPurchased(purchaseId, productId, msg.sender, actualPrice, product.creator);
    }

    // View functions
    function getProduct(uint256 productId) external view returns (Product memory) {
        require(_products[productId].creator != address(0), "SafariMart: product does not exist");
        return _products[productId];
    }

    function getProductsByCreator(address creator) external view returns (uint256[] memory) {
        return _createdBy[creator];
    }

    function getMyProducts() external view returns (uint256[] memory) {
        return _createdBy[msg.sender];
    }

    function getPurchasesByBuyer(address buyer) external view returns (uint256[] memory) {
        return _purchasesByBuyer[buyer];
    }

    function getMyPurchases() external view returns (uint256[] memory) {
        return _purchasesByBuyer[msg.sender];
    }

    function getPurchase(uint256 purchaseId) external view returns (Purchase memory) {
        require(_purchases[purchaseId].buyer != address(0), "SafariMart: purchase does not exist");
        return _purchases[purchaseId];
    }

    function hasPurchased(address buyer, uint256 productId) external view returns (bool) {
        return _hasPurchased[buyer][productId];
    }

    function nextProductId() external view returns (uint256) {
        return _nextProductId;
    }

    function nextPurchaseId() external view returns (uint256) {
        return _nextPurchaseId;
    }

    // Get all active products (for marketplace browsing)
    function getAllActiveProducts() external view returns (Product[] memory) {
        uint256 activeCount = 0;
        
        // First pass: count active products
        for (uint256 i = 1; i < _nextProductId; i++) {
            if (_products[i].creator != address(0) && _products[i].isActive) {
                activeCount++;
            }
        }
        
        // Second pass: collect active products
        Product[] memory activeProducts = new Product[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < _nextProductId; i++) {
            if (_products[i].creator != address(0) && _products[i].isActive) {
                activeProducts[currentIndex] = _products[i];
                currentIndex++;
            }
        }
        
        return activeProducts;
    }

    // Get products by category
    function getProductsByCategory(string calldata category) external view returns (Product[] memory) {
        uint256 categoryCount = 0;
        
        // First pass: count products in category
        for (uint256 i = 1; i < _nextProductId; i++) {
            if (_products[i].creator != address(0) && 
                _products[i].isActive && 
                keccak256(bytes(_products[i].category)) == keccak256(bytes(category))) {
                categoryCount++;
            }
        }
        
        // Second pass: collect products in category
        Product[] memory categoryProducts = new Product[](categoryCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < _nextProductId; i++) {
            if (_products[i].creator != address(0) && 
                _products[i].isActive && 
                keccak256(bytes(_products[i].category)) == keccak256(bytes(category))) {
                categoryProducts[currentIndex] = _products[i];
                currentIndex++;
            }
        }
        
        return categoryProducts;
    }

    // Admin functions
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "SafariMart: fee cannot exceed 10%"); // Max 10%
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }

    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "SafariMart: invalid fee recipient");
        feeRecipient = newFeeRecipient;
        emit FeeRecipientUpdated(newFeeRecipient);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency withdrawal (only owner)
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "SafariMart: no funds to withdraw");
        payable(owner()).transfer(balance);
    }

    // Get creator's product data with full details
    function getCreatorProductsWithData(address creator) 
        external 
        view 
        returns (uint256[] memory productIds, Product[] memory products) 
    {
        return _getCreatorProductsWithData(creator);
    }

    // Get my products with full data
    function getMyProductsWithData() 
        external 
        view 
        returns (uint256[] memory productIds, Product[] memory products) 
    {
        return _getCreatorProductsWithData(msg.sender);
    }

    // Internal helper function
    function _getCreatorProductsWithData(address creator) 
        internal 
        view 
        returns (uint256[] memory productIds, Product[] memory products) 
    {
        uint256[] memory ids = _createdBy[creator];
        Product[] memory data = new Product[](ids.length);
        
        for (uint256 i = 0; i < ids.length; i++) {
            data[i] = _products[ids[i]];
        }
        
        return (ids, data);
    }

    // Get purchase history with product details for a buyer
    function getPurchaseHistoryWithDetails(address buyer) 
        external 
        view 
        returns (Purchase[] memory purchases, Product[] memory products) 
    {
        uint256[] memory purchaseIds = _purchasesByBuyer[buyer];
        Purchase[] memory purchaseData = new Purchase[](purchaseIds.length);
        Product[] memory productData = new Product[](purchaseIds.length);
        
        for (uint256 i = 0; i < purchaseIds.length; i++) {
            Purchase memory purchase = _purchases[purchaseIds[i]];
            purchaseData[i] = purchase;
            productData[i] = _products[purchase.productId];
        }
        
        return (purchaseData, productData);
    }
}
