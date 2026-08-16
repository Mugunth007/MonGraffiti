// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MonGraffiti
 * @dev Smart Contract for publishing & tipping graffiti artwork on Monad Testnet
 */
contract MonGraffiti {
    struct GraffitiItem {
        uint256 id;
        address creator;
        string title;
        int256 latitude; // scaled by 1e6 (e.g. 35.6762 -> 35676200)
        int256 longitude; // scaled by 1e6
        string imageUrl;
        uint256 likesCount;
        uint256 timestamp;
    }

    uint256 private _nextGraffitiId;
    mapping(uint256 => GraffitiItem) public graffitis;
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    event GraffitiPublished(
        uint256 indexed id,
        address indexed creator,
        string title,
        int256 latitude,
        int256 longitude,
        string imageUrl,
        uint256 timestamp
    );

    event GraffitiLiked(
        uint256 indexed id,
        address indexed liker,
        uint256 totalLikes
    );

    event TipSent(
        uint256 indexed graffitiId,
        address indexed tipper,
        address indexed creator,
        uint256 amount
    );

    /**
     * @notice Publish a new graffiti artwork to Monad Testnet
     */
    function publishGraffiti(
        string memory _title,
        int256 _latitude,
        int256 _longitude,
        string memory _imageUrl
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_imageUrl).length > 0, "Image URL required");

        _nextGraffitiId++;
        uint256 newId = _nextGraffitiId;

        graffitis[newId] = GraffitiItem({
            id: newId,
            creator: msg.sender,
            title: _title,
            latitude: _latitude,
            longitude: _longitude,
            imageUrl: _imageUrl,
            likesCount: 0,
            timestamp: block.timestamp
        });

        emit GraffitiPublished(
            newId,
            msg.sender,
            _title,
            _latitude,
            _longitude,
            _imageUrl,
            block.timestamp
        );

        return newId;
    }

    /**
     * @notice Like a graffiti entry on-chain
     */
    function likeGraffiti(uint256 _id) external {
        require(_id > 0 && _id <= _nextGraffitiId, "Graffiti does not exist");
        require(!hasLiked[_id][msg.sender], "Already liked");

        hasLiked[_id][msg.sender] = true;
        graffitis[_id].likesCount += 1;

        emit GraffitiLiked(_id, msg.sender, graffitis[_id].likesCount);
    }

    /**
     * @notice Tip MON tokens to a graffiti artist
     */
    function tipArtist(uint256 _id) external payable {
        require(_id > 0 && _id <= _nextGraffitiId, "Graffiti does not exist");
        require(msg.value > 0, "Tip amount must be > 0");

        address creator = graffitis[_id].creator;
        (bool success, ) = payable(creator).call{value: msg.value}("");
        require(success, "Transfer failed");

        emit TipSent(_id, msg.sender, creator, msg.value);
    }

    /**
     * @notice Get a single graffiti artwork details
     */
    function getGraffiti(uint256 _id) external view returns (GraffitiItem memory) {
        require(_id > 0 && _id <= _nextGraffitiId, "Graffiti does not exist");
        return graffitis[_id];
    }

    /**
     * @notice Get total graffitis published count
     */
    function getTotalGraffitis() external view returns (uint256) {
        return _nextGraffitiId;
    }

    /**
     * @notice Fetch all published graffitis
     */
    function getAllGraffitis() external view returns (GraffitiItem[] memory) {
        GraffitiItem[] memory fontList = new GraffitiItem[](_nextGraffitiId);
        for (uint256 i = 1; i <= _nextGraffitiId; i++) {
            fontList[i - 1] = graffitis[i];
        }
        return fontList;
    }
}
