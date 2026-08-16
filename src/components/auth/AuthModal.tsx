'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { X, Wallet, Loader2, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    connectWallet,
    isConnectingWallet,
  } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 border border-mon-border shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#161622] hover:bg-[#202030] text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#836EF9] to-[#FF5E97] mx-auto flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-white flex items-center justify-center gap-1.5">
            Connect Monad Wallet <Sparkles className="w-4 h-4 text-[#FF5E97]" />
          </h2>
          <p className="text-xs text-gray-400 mt-1.5">
            Connect your Web3 wallet to sign graffiti & publish on Monad Testnet
          </p>
        </div>

        {/* Connect Web3 Wallet Button */}
        <div className="mb-4">
          <button
            onClick={connectWallet}
            disabled={isConnectingWallet}
            className="w-full flex items-center justify-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-[#836EF9] via-[#FF5E97] to-[#836EF9] bg-[length:200%_auto] hover:bg-right text-white font-extrabold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all glow-purple border border-white/20 disabled:opacity-50"
          >
            {isConnectingWallet ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting Wallet...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet (Monad Testnet)</span>
              </>
            )}
          </button>
        </div>

        {/* Monad Network Details */}
        <div className="p-3.5 rounded-2xl bg-[#161622] border border-mon-border text-center space-y-1">
          <div className="text-[11px] font-semibold text-[#836EF9]">Network Requirements</div>
          <div className="text-xs text-gray-300 font-mono">Monad Testnet (Chain ID: 10143)</div>
          <div className="text-[10px] text-gray-400">Supported: MetaMask, Rabby, Phantom & Web3 Wallets</div>
        </div>
      </div>
    </div>
  );
};
