'use client';

import React, { useState } from 'react';
import { Graffiti } from '@/lib/types';
import {
  X,
  Heart,
  Paintbrush,
  MapPin,
  Clock,
  Share2,
  Check,
  Tag,
  Coins,
  Gavel,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { placeBidOnChain, buyGraffitiNFTOnChain, mintGraffitiNFTOnChain } from '@/lib/web3/contract';
import { useAuth } from '@/lib/auth-context';

interface GraffitiDetailSheetProps {
  graffiti: Graffiti | null;
  onClose: () => void;
  onLike: (id: string) => Promise<void>;
  onRemix: (graffiti: Graffiti) => void;
}

export const GraffitiDetailSheet: React.FC<GraffitiDetailSheetProps> = ({
  graffiti,
  onClose,
  onLike,
  onRemix,
}) => {
  const { user, setIsAuthModalOpen } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);

  // NFT Bidding & Sale State
  const [bidAmount, setBidAmount] = useState<string>('0.05');
  const [isBidding, setIsBidding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [highestBid, setHighestBid] = useState<string>('0.05');
  const [highestBidder, setHighestBidder] = useState<string>('None yet');
  const [isMintedNFT, setIsMintedNFT] = useState(true);

  if (!graffiti) return null;

  const handleLikeClick = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#000000', '#d1ffca', '#fff100'],
      });
    } catch {
      // ignore
    }

    await onLike(graffiti.id);
    setIsLiking(false);
  };

  const handlePlaceBid = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsBidding(true);
    try {
      alert(`Prompting MetaMask transaction to place a ${bidAmount} MON bid on Monad Testnet...`);
      const txHash = await placeBidOnChain(1, bidAmount);
      setHighestBid(bidAmount);
      setHighestBidder(`${user.name}`);
      alert(`Success! Bid placed on-chain!\nTx Hash: ${txHash.slice(0, 16)}...`);
    } catch (err: any) {
      console.error('Bid error:', err);
      alert(err.message || 'Bid transaction cancelled or failed.');
    } finally {
      setIsBidding(false);
    }
  };

  const handleBuyNFT = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsBuying(true);
    try {
      alert(`Prompting MetaMask transaction to buyout NFT for ${bidAmount} MON on Monad Testnet...`);
      const txHash = await buyGraffitiNFTOnChain(1, bidAmount);
      alert(`Congratulations! You bought this Graffiti NFT!\nTx Hash: ${txHash.slice(0, 16)}...`);
    } catch (err: any) {
      console.error('Buy error:', err);
      alert(err.message || 'Buyout transaction failed.');
    } finally {
      setIsBuying(false);
    }
  };

  const handleMintNFT = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsMinting(true);
    try {
      alert(`Prompting MetaMask transaction to mint "${graffiti.title}" as an NFT on Monad Testnet...`);
      const { txHash } = await mintGraffitiNFTOnChain(
        graffiti.title,
        graffiti.latitude,
        graffiti.longitude,
        graffiti.image_url,
        '0.01'
      );
      setIsMintedNFT(true);
      alert(`NFT Minted Successfully on Monad Testnet!\nTx Hash: ${txHash.slice(0, 16)}...`);
    } catch (err: any) {
      console.error('Mint error:', err);
      alert(err.message || 'Minting transaction failed.');
    } finally {
      setIsMinting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(graffiti.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-6 md:top-36 md:bottom-6 z-40 w-full md:w-[420px] bg-paper-white rounded-t-card-lg md:rounded-card-lg p-6 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-ash mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="font-display text-xl text-carbon-black uppercase tracking-tight truncate max-w-[220px]">
              {graffiti.title}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleShare}
              className="p-2 rounded-btn bg-mist-gray hover:bg-ash text-smoke hover:text-carbon-black transition-colors"
              title="Share Link"
            >
              {copied ? <Check className="w-4 h-4 text-carbon-black" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-btn bg-mist-gray hover:bg-ash text-smoke hover:text-carbon-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Artwork Image View */}
        <div className="relative rounded-card overflow-hidden bg-mist-gray p-2 mb-4">
          <img
            src={graffiti.image_url}
            alt={graffiti.title}
            className="w-full aspect-square object-contain rounded-xl"
          />
          <div className="absolute top-4 right-4 tag-mint flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-tag bg-carbon-black text-paper-white text-[10px] font-mono uppercase tracking-wide flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>NFT Auction Live</span>
          </div>
        </div>

        {/* NFT Bidding & Buying Section */}
        <div className="mb-4 p-4 rounded-card bg-mist-gray space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-sans font-medium text-carbon-black uppercase tracking-tight">
              <Gavel className="w-4 h-4" />
              <span>NFT Bidding (Monad)</span>
            </div>
            <div className="tag-mint text-[10px] font-bold">
              Current: {highestBid} MON
            </div>
          </div>

          <div className="text-xs text-smoke flex items-center justify-between font-sans">
            <span>Highest Bidder: <strong className="text-carbon-black">{highestBidder}</strong></span>
            <span>Min Bid: <strong className="text-carbon-black">0.01 MON</strong></span>
          </div>

          {/* Bid Input & Actions */}
          <div className="flex items-center space-x-2 pt-1">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full pl-3 pr-12 py-2.5 bg-paper-white rounded-btn text-sm text-carbon-black font-mono focus:outline-none focus:ring-2 focus:ring-carbon-black/10"
              />
              <span className="absolute right-3 top-3 text-[10px] font-bold text-smoke font-mono">MON</span>
            </div>

            <button
              onClick={handlePlaceBid}
              disabled={isBidding}
              className="px-4 py-2.5 rounded-btn bg-carbon-black text-paper-white font-sans font-medium text-xs uppercase tracking-tight transition-opacity hover:opacity-85 disabled:opacity-50 flex items-center space-x-1"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>{isBidding ? 'Bidding...' : 'Place Bid'}</span>
            </button>

            <button
              onClick={handleBuyNFT}
              disabled={isBuying}
              className="px-4 py-2.5 rounded-btn bg-carbon-black text-paper-white font-sans font-medium text-xs uppercase tracking-tight transition-opacity hover:opacity-85 disabled:opacity-50 flex items-center space-x-1"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{isBuying ? 'Buying...' : 'Buy Now'}</span>
            </button>
          </div>
        </div>

        {/* Creator Details */}
        <div className="space-y-2 mb-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-card bg-mist-gray">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-btn bg-carbon-black flex items-center justify-center font-bold text-paper-white text-xs font-sans">
                {graffiti.user_name.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-smoke font-mono uppercase tracking-wide">Artist / NFT Owner</p>
                <p className="font-medium text-carbon-black font-mono">{graffiti.user_name}</p>
              </div>
            </div>
            <div className="tag-mint flex items-center space-x-1 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>NFT Ready</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 py-2.5 rounded-card bg-mist-gray text-smoke">
            <MapPin className="w-4 h-4 text-carbon-black flex-shrink-0" />
            <span className="font-mono text-xs">
              {graffiti.latitude.toFixed(4)}°, {graffiti.longitude.toFixed(4)}°
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-ash">
        {/* Like Button (On-Chain) */}
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-mist-gray hover:bg-ash text-carbon-black transition-colors active:scale-95"
        >
          <div className="flex items-center space-x-1">
            <Heart className={`w-4 h-4 ${isLiking ? 'animate-bounce' : ''}`} />
            <span className="font-bold text-xs">{graffiti.likes_count}</span>
          </div>
          <span className="text-[10px] text-smoke mt-0.5 font-mono uppercase">Like</span>
        </button>

        {/* Remix Button */}
        <button
          onClick={() => onRemix(graffiti)}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-mist-gray hover:bg-ash text-carbon-black transition-colors active:scale-95"
        >
          <Paintbrush className="w-4 h-4" />
          <span className="text-[10px] text-smoke mt-0.5 font-mono uppercase">Remix</span>
        </button>

        {/* Mint as NFT Button */}
        <button
          onClick={handleMintNFT}
          disabled={isMinting}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-mint-chip hover:opacity-75 text-carbon-black transition-all active:scale-95"
        >
          <Coins className="w-4 h-4" />
          <span className="text-[10px] text-carbon-black mt-0.5 font-mono uppercase font-bold">
            {isMinting ? 'Minting...' : 'Mint NFT'}
          </span>
        </button>
      </div>
    </div>
  );
};
