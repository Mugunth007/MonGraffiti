'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Paintbrush, LogOut, Wallet } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, walletAddress, connectWallet, isConnectingWallet, logout, setIsAuthModalOpen } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-32 px-6 flex items-center justify-center bg-warm-canvas">
      {/* Floating Nav Pill */}
      <div className="nav-pill flex items-center justify-between w-full max-w-5xl">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-btn bg-carbon-black flex items-center justify-center">
            <Paintbrush className="w-4 h-4 text-paper-white" />
          </div>
          <div>
            <h1 className="font-display text-xl tracking-tight text-carbon-black uppercase leading-none">
              MON GRAFFITI
            </h1>
            <p className="text-[10px] text-smoke font-mono hidden sm:block uppercase tracking-wide">
              Multiplayer Map Canvas · Monad
            </p>
          </div>
        </div>

        {/* Nav Links (center) */}
        <nav className="hidden md:flex items-center space-x-6">
          <span className="text-sm font-sans font-medium text-slate hover:text-carbon-black transition-colors cursor-pointer uppercase tracking-tight">
            Explore
          </span>
          <span className="text-sm font-sans font-medium text-slate hover:text-carbon-black transition-colors cursor-pointer uppercase tracking-tight">
            Create
          </span>
          <span className="text-sm font-sans font-medium text-slate hover:text-carbon-black transition-colors cursor-pointer uppercase tracking-tight">
            About
          </span>
        </nav>

        {/* Wallet Status / Connect & Disconnect Wallet */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-pill bg-mist-gray">
                <div
                  className="w-6 h-6 rounded-btn flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: user.avatar_color }}
                >
                  {user.avatar_emoji}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-medium text-carbon-black leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-smoke font-mono leading-tight">
                    {walletAddress ? walletAddress : user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-btn bg-mist-gray hover:bg-ash text-smoke hover:text-carbon-black transition-colors"
                title="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              disabled={isConnectingWallet}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-btn bg-carbon-black text-paper-white font-sans font-medium text-xs uppercase tracking-tight transition-opacity hover:opacity-85"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
