'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { X, Wallet, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    connectWallet,
    isConnectingWallet,
  } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-carbon-black/40 animate-fadeIn">
      <div className="relative w-full max-w-md surface-card p-8 overflow-hidden" style={{ borderRadius: '32px' }}>
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-btn bg-mist-gray hover:bg-ash text-smoke hover:text-carbon-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-card bg-carbon-black mx-auto flex items-center justify-center mb-4">
            <Wallet className="w-7 h-7 text-paper-white" />
          </div>
          <h2 className="font-display text-2xl text-carbon-black uppercase tracking-tight">
            Connect Wallet
          </h2>
          <p className="text-sm text-smoke mt-2 font-sans">
            Connect your Web3 wallet to sign graffiti & publish on Monad Testnet
          </p>
        </div>

        {/* Connect Web3 Wallet Button */}
        <div className="mb-5">
          <button
            onClick={connectWallet}
            disabled={isConnectingWallet}
            className="w-full flex items-center justify-center space-x-3 p-4 rounded-btn bg-carbon-black text-paper-white font-sans font-medium text-sm uppercase tracking-tight transition-opacity hover:opacity-85 disabled:opacity-50"
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
        <div className="p-4 rounded-card bg-mist-gray text-center space-y-1">
          <div className="text-xs font-mono text-smoke uppercase tracking-wide">Network Requirements</div>
          <div className="text-sm text-carbon-black font-mono">Monad Testnet (Chain ID: 10143)</div>
          <div className="text-xs text-smoke">Supported: MetaMask, Rabby, Phantom & Web3 Wallets</div>
        </div>
      </div>
    </div>
  );
};
