'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Paintbrush, LogOut, Wallet, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, walletAddress, connectWallet, isConnectingWallet, logout, setIsAuthModalOpen } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 px-4 md:px-6 flex items-center justify-between glass-panel border-b border-mon-border bg-[#0E0E14]/80 backdrop-blur-md">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#836EF9] to-[#FF5E97] p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <div className="w-full h-full bg-[#0E0E14] rounded-[10px] flex items-center justify-center">
            <Paintbrush className="w-5 h-5 text-[#FF5E97]" />
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-lg md:text-xl tracking-tight text-white flex items-center gap-1.5">
            MON <span className="text-gradient">GRAFFITI</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-medium hidden sm:block">
            Multiplayer Map Artwork Canvas • Monad Testnet
          </p>
        </div>
      </div>

      {/* Wallet Status / Connect & Disconnect Wallet */}
      <div className="flex items-center space-x-3">
        {user ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#161622] border border-mon-border">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
                style={{ backgroundColor: user.avatar_color }}
              >
                {user.avatar_emoji}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                  {user.name}
                  <Sparkles className="w-3 h-3 text-[#FF5E97]" />
                </div>
                <div className="text-[10px] text-gray-400 font-mono leading-tight">
                  {walletAddress ? walletAddress : user.email}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-[#161622] hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-mon-border transition-colors"
              title="Disconnect Wallet"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            disabled={isConnectingWallet}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#836EF9] to-[#FF5E97] text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:brightness-110 transition-all"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
};
