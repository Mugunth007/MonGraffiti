'use client';

import React, { useState } from 'react';
import { Graffiti } from '@/lib/types';
import {
  X,
  Heart,
  Paintbrush,
  MapPin,
  Clock,
  Sparkles,
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
        colors: ['#836EF9', '#FF5E97', '#00F2FE'],
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
      alert(`🎉 Congratulations! You bought this Graffiti NFT!\nTx Hash: ${txHash.slice(0, 16)}...`);
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
      alert(`🎨 NFT Minted Successfully on Monad Testnet!\nTx Hash: ${txHash.slice(0, 16)}...`);
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
    <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-6 md:top-20 md:bottom-6 z-40 w-full md:w-[420px] glass-modal rounded-t-3xl md:rounded-3xl p-5 border border-mon-border shadow-2xl flex flex-col justify-between max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-mon-border mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎨</span>
            <h3 className="font-extrabold text-base text-white truncate max-w-[220px]">
              {graffiti.title}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-[#161622] hover:bg-[#202030] text-gray-400 hover:text-white transition-colors"
              title="Share Link"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#161622] hover:bg-[#202030] text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Artwork Image View */}
        <div className="relative rounded-2xl overflow-hidden bg-[#09090E] border border-mon-border shadow-inner p-2 mb-3">
          <img
            src={graffiti.image_url}
            alt={graffiti.title}
            className="w-full aspect-square object-contain rounded-xl"
          />
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-gray-300 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#836EF9]" />
            {formattedDate}
          </div>
          <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded-full bg-[#836EF9]/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
            <Tag className="w-3 h-3" />
            <span>NFT Auction Live</span>
          </div>
        </div>

        {/* NFT Bidding & Buying Section */}
        <div className="mb-4 p-3.5 rounded-2xl bg-[#161622] border border-mon-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
              <Gavel className="w-4 h-4 text-[#FF5E97]" />
              <span>NFT Bidding (Monad Testnet)</span>
            </div>
            <div className="text-[10px] font-bold text-[#836EF9] bg-[#836EF9]/10 px-2 py-0.5 rounded-md">
              Current Bid: {highestBid} MON
            </div>
          </div>

          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Highest Bidder: <strong className="text-gray-200">{highestBidder}</strong></span>
            <span>Min Bid: <strong className="text-[#FF5E97]">0.01 MON</strong></span>
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
                className="w-full pl-3 pr-12 py-2 bg-[#0E0E14] border border-mon-border rounded-xl text-xs text-white focus:outline-none focus:border-[#836EF9]"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400">MON</span>
            </div>

            <button
              onClick={handlePlaceBid}
              disabled={isBidding}
              className="px-3.5 py-2 rounded-xl bg-[#836EF9] hover:bg-[#725cf5] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center space-x-1"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>{isBidding ? 'Bidding...' : 'Place Bid'}</span>
            </button>

            <button
              onClick={handleBuyNFT}
              disabled={isBuying}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF5E97] to-[#836EF9] text-white font-bold text-xs shadow-md hover:brightness-110 transition-all disabled:opacity-50 flex items-center space-x-1"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{isBuying ? 'Buying...' : 'Buy Now'}</span>
            </button>
          </div>
        </div>

        {/* Creator Details */}
        <div className="space-y-2 mb-4 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161622] border border-mon-border">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#836EF9] to-[#FF5E97] flex items-center justify-center font-bold text-white text-xs">
                {graffiti.user_name.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Artist / NFT Owner</p>
                <p className="font-semibold text-white font-mono">{graffiti.user_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>NFT Ready</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#161622] text-gray-300">
            <MapPin className="w-4 h-4 text-[#FF5E97] flex-shrink-0" />
            <span className="font-mono text-[11px] truncate">
              {graffiti.latitude.toFixed(4)}°, {graffiti.longitude.toFixed(4)}°
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-mon-border">
        {/* ❤️ Like Button (On-Chain) */}
        <button
          onClick={handleLikeClick}
          disabled={isLiking}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#161622] hover:bg-red-500/10 border border-mon-border hover:border-red-500/30 text-red-400 transition-all active:scale-95"
        >
          <div className="flex items-center space-x-1">
            <Heart className={`w-4 h-4 fill-current ${isLiking ? 'animate-bounce' : ''}`} />
            <span className="font-bold text-xs">{graffiti.likes_count}</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">Like</span>
        </button>

        {/* 🎨 Remix Button */}
        <button
          onClick={() => onRemix(graffiti)}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#161622] hover:bg-[#836EF9]/10 border border-mon-border hover:border-[#836EF9]/40 text-[#836EF9] transition-all active:scale-95"
        >
          <div className="flex items-center space-x-1">
            <Paintbrush className="w-4 h-4" />
            <Sparkles className="w-3 h-3 text-[#FF5E97]" />
          </div>
          <span className="text-[10px] text-gray-300 mt-0.5 font-semibold">Remix</span>
        </button>

        {/* Mint as NFT Button */}
        <button
          onClick={handleMintNFT}
          disabled={isMinting}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#161622] hover:bg-purple-500/10 border border-mon-border hover:border-[#FF5E97]/40 text-[#FF5E97] transition-all active:scale-95"
        >
          <Coins className="w-4 h-4 text-[#FF5E97]" />
          <span className="text-[10px] text-gray-300 mt-0.5 font-semibold">
            {isMinting ? 'Minting...' : 'Mint NFT'}
          </span>
        </button>
      </div>
    </div>
  );
};
