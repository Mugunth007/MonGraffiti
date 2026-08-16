import { ethers } from 'ethers';

export const MON_GRAFFITI_CONTRACT_ADDRESS = '0xCec8d979Ae7B13387D2981BE02ed2F5034ebAC43';
export const MON_GRAFFITI_NFT_CONTRACT_ADDRESS = '0x91118D0347894CAF37f1Fe3B2A210D54d2F3bE17';

export const MON_GRAFFITI_ABI = [
  'function publishGraffiti(string calldata _title, int256 _latitude, int256 _longitude, string calldata _imageUrl) external returns (uint256)',
  'function likeGraffiti(uint256 _id) external',
  'function tipArtist(uint256 _id) external payable',
  'function getGraffiti(uint256 _id) external view returns (tuple(uint256 id, address creator, string title, int256 latitude, int256 longitude, string imageUrl, uint256 likesCount, uint256 timestamp))',
  'function getTotalGraffitis() external view returns (uint256)',
];

export const MON_GRAFFITI_NFT_ABI = [
  'function mintGraffitiNFT(string memory _title, int256 _latitude, int256 _longitude, string memory _imageURI, uint256 _startingBid) external returns (uint256)',
  'function placeBid(uint256 _tokenId) external payable',
  'function buyGraffitiNFT(uint256 _tokenId) external payable',
  'function getAuction(uint256 _tokenId) external view returns (tuple(uint256 tokenId, address seller, address highestBidder, uint256 highestBid, uint256 minBid, bool active))',
  'function getTotalNFTs() external view returns (uint256)',
  'event NFTMinted(uint256 indexed tokenId, address indexed creator, string title, int256 latitude, int256 longitude, string imageURI)',
  'event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount)',
  'event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)',
];

/**
 * Get contract instance connected to browser Web3 signer
 */
export async function getContractWithSigner(address: string, abi: any[]): Promise<ethers.Contract> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('MetaMask or Web3 wallet not installed!');
  }

  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(address, abi, signer);
}

/**
 * Publish Graffiti Artwork On-Chain via MetaMask transaction on Monad Testnet
 */
export async function publishGraffitiOnChain(
  title: string,
  latitude: number,
  longitude: number,
  imageUrl: string
): Promise<{ txHash: string; onChainId: number }> {
  const contract = await getContractWithSigner(MON_GRAFFITI_CONTRACT_ADDRESS, MON_GRAFFITI_ABI);

  const latScaled = Math.round(latitude * 1e6);
  const lngScaled = Math.round(longitude * 1e6);

  const tx = await contract.publishGraffiti(title, latScaled, lngScaled, imageUrl);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    onChainId: 1,
  };
}

/**
 * Mint Graffiti as an ERC-721 NFT for auction on Monad Testnet
 */
export async function mintGraffitiNFTOnChain(
  title: string,
  latitude: number,
  longitude: number,
  imageUrl: string,
  startingBidMON: string = '0.01'
): Promise<{ txHash: string; tokenId: number }> {
  const contract = await getContractWithSigner(MON_GRAFFITI_NFT_CONTRACT_ADDRESS, MON_GRAFFITI_NFT_ABI);

  const latScaled = Math.round(latitude * 1e6);
  const lngScaled = Math.round(longitude * 1e6);
  const startingBidWei = ethers.parseEther(startingBidMON);

  const tx = await contract.mintGraffitiNFT(title, latScaled, lngScaled, imageUrl, startingBidWei);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    tokenId: 1,
  };
}

/**
 * Place MON token bid on a graffiti NFT
 */
export async function placeBidOnChain(tokenId: number | string, monAmount: string): Promise<string> {
  const contract = await getContractWithSigner(MON_GRAFFITI_NFT_CONTRACT_ADDRESS, MON_GRAFFITI_NFT_ABI);
  const numericTokenId = typeof tokenId === 'number' ? tokenId : 1;

  const valueWei = ethers.parseEther(monAmount && parseFloat(monAmount) > 0 ? monAmount : '0.01');

  const tx = await contract.placeBid(numericTokenId, {
    value: valueWei,
  });
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Buyout Graffiti NFT with MON tokens
 */
export async function buyGraffitiNFTOnChain(tokenId: number | string, monAmount: string): Promise<string> {
  const contract = await getContractWithSigner(MON_GRAFFITI_NFT_CONTRACT_ADDRESS, MON_GRAFFITI_NFT_ABI);
  const numericTokenId = typeof tokenId === 'number' ? tokenId : 1;

  const valueWei = ethers.parseEther(monAmount && parseFloat(monAmount) > 0 ? monAmount : '0.01');

  const tx = await contract.buyGraffitiNFT(numericTokenId, {
    value: valueWei,
  });
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Like Graffiti Artwork On-Chain via MetaMask transaction
 */
export async function likeGraffitiOnChain(id: number | string): Promise<string> {
  const contract = await getContractWithSigner(MON_GRAFFITI_CONTRACT_ADDRESS, MON_GRAFFITI_ABI);
  const numericId = typeof id === 'number' ? id : 1;

  const tx = await contract.likeGraffiti(numericId);
  const receipt = await tx.wait();
  return receipt.hash;
}
