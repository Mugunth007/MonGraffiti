'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from './types';

export const MONAD_TESTNET_CONFIG = {
  chainId: '0x279f', // 10143 in Hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadvision.com'],
};

interface AuthContextType {
  user: UserProfile | null;
  walletAddress: string | null;
  isConnectingWallet: boolean;
  connectWallet: () => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  walletAddress: null,
  isConnectingWallet: false,
  connectWallet: async () => {},
  logout: () => {},
  isAuthModalOpen: false,
  setIsAuthModalOpen: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check saved session or check connected wallet
    const savedUser = localStorage.getItem('mongraffiti_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed.email?.startsWith('0x')) {
          setWalletAddress(parsed.email);
        }
      } catch {
        // ignore
      }
    }

    // Listen to account changes in window.ethereum
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          handleSetWalletUser(accounts[0]);
        } else {
          logout();
        }
      });
    }
  }, []);

  const handleSetWalletUser = (address: string) => {
    const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    const walletUser: UserProfile = {
      id: address.toLowerCase(),
      email: address,
      name: formattedAddress,
      avatar_color: '#836EF9',
      avatar_emoji: '🦊',
    };
    setUser(walletUser);
    setWalletAddress(address);
    localStorage.setItem('mongraffiti_user', JSON.stringify(walletUser));
    setIsAuthModalOpen(false);
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('MetaMask or Web3 Wallet not detected! Please install MetaMask or open in a Web3 browser.');
      return;
    }

    setIsConnectingWallet(true);
    const ethereum = (window as any).ethereum;

    try {
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) return;

      // Switch or Add Monad Testnet Network
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET_CONFIG],
          });
        }
      }

      handleSetWalletUser(accounts[0]);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      alert(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const logout = () => {
    setUser(null);
    setWalletAddress(null);
    localStorage.removeItem('mongraffiti_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        walletAddress,
        isConnectingWallet,
        connectWallet,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
