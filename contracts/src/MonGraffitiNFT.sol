// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MonGraffitiNFT
 * @dev NFT Marketplace & Bidding Contract for MON Graffiti on Monad Testnet
 */
contract MonGraffitiNFT {
    string public name = "MON Graffiti NFT";
    string public symbol = "MONGRAF";

    struct GraffitiNFT {
        uint256 tokenId;
        address owner;
        address creator;
        string title;
        int256 latitude;
        int256 longitude;
        string imageURI;
        uint256 timestamp;
    }

    struct Auction {
        uint256 tokenId;
        address seller;
        address highestBidder;
        uint256 highestBid;
        uint256 minBid;
        bool active;
    }

    uint256 private _tokenCounter;

    mapping(uint256 => GraffitiNFT) public nfts;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => address) public tokenOwners;
    mapping(address => uint256) public balances;

    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        int256 latitude,
        int256 longitude,
        string imageURI
    );

    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );

    event NFTSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    /**
     * @notice Mint a graffiti artwork as an ERC721 NFT on Monad Testnet
     */
    function mintGraffitiNFT(
        string memory _title,
        int256 _latitude,
        int256 _longitude,
        string memory _imageURI,
        uint256 _startingBid
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_imageURI).length > 0, "Image URI required");

        _tokenCounter++;
        uint256 newTokenId = _tokenCounter;

        tokenOwners[newTokenId] = msg.sender;
        balances[msg.sender] += 1;

        nfts[newTokenId] = GraffitiNFT({
            tokenId: newTokenId,
            owner: msg.sender,
            creator: msg.sender,
            title: _title,
            latitude: _latitude,
            longitude: _longitude,
            imageURI: _imageURI,
            timestamp: block.timestamp
        });

        auctions[newTokenId] = Auction({
            tokenId: newTokenId,
            seller: msg.sender,
            highestBidder: address(0),
            highestBid: 0,
            minBid: _startingBid > 0 ? _startingBid : 0.001 ether,
            active: true
        });

        emit NFTMinted(
            newTokenId,
            msg.sender,
            _title,
            _latitude,
            _longitude,
            _imageURI
        );

        return newTokenId;
    }

    /**
     * @notice Place MON token bid on a graffiti NFT
     */
    function placeBid(uint256 _tokenId) external payable {
        Auction storage auction = auctions[_tokenId];
        
        // Auto-initialize auction if token not minted yet
        if (!auction.active) {
            auction.tokenId = _tokenId > 0 ? _tokenId : 1;
            auction.seller = msg.sender;
            auction.active = true;
            auction.minBid = 0.001 ether;
        }

        require(msg.value > auction.highestBid, "Bid must be higher than current bid");
        require(msg.value >= auction.minBid, "Bid below minimum required bid");

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        emit BidPlaced(_tokenId, msg.sender, msg.value);
    }

    /**
     * @notice Instant Buyout NFT with MON tokens
     */
    function buyGraffitiNFT(uint256 _tokenId) external payable {
        Auction storage auction = auctions[_tokenId];

        if (!auction.active) {
            auction.tokenId = _tokenId > 0 ? _tokenId : 1;
            auction.seller = msg.sender;
            auction.active = true;
            auction.minBid = 0.001 ether;
        }

        require(msg.value >= auction.minBid, "Insufficient payment for buyout");

        address seller = auction.seller;
        address buyer = msg.sender;
        uint256 salePrice = msg.value;

        auction.active = false;

        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        tokenOwners[_tokenId] = buyer;
        nfts[_tokenId].owner = buyer;

        if (seller != address(0) && seller != buyer) {
            payable(seller).transfer(salePrice);
        }

        emit NFTSold(_tokenId, seller, buyer, salePrice);
    }

    /**
     * @notice Get auction info for a token
     */
    function getAuction(uint256 _tokenId) external view returns (Auction memory) {
        return auctions[_tokenId];
    }

    /**
     * @notice Get total minted NFTs count
     */
    function getTotalNFTs() external view returns (uint256) {
        return _tokenCounter;
    }
}
