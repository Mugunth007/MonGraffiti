'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Graffiti, LocationCoordinates } from '@/lib/types';
import {
  fetchGraffitis,
  publishGraffitiToSupabase,
  uploadArtworkImage,
  incrementGraffitiLike,
  subscribeToRealtimeGraffitis,
} from '@/lib/supabase/client';
import { publishGraffitiOnChain, likeGraffitiOnChain } from '@/lib/web3/contract';
import { Header } from '@/components/ui/Header';
import { AuthModal } from '@/components/auth/AuthModal';
import { MapContainer } from '@/components/map/MapContainer';
import { DrawingCanvas } from '@/components/editor/DrawingCanvas';
import { GraffitiDetailSheet } from '@/components/map/GraffitiDetailSheet';
import { Plus } from 'lucide-react';

export default function Home() {
  const { user, setIsAuthModalOpen } = useAuth();

  // App State
  const [graffitis, setGraffitis] = useState<Graffiti[]>([]);
  const [selectedGraffiti, setSelectedGraffiti] = useState<Graffiti | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [targetLocation, setTargetLocation] = useState<LocationCoordinates | null>(null);
  const [remixTitle, setRemixTitle] = useState<string>('');

  // Initial Data Fetch & Supabase Realtime Subscription
  useEffect(() => {
    fetchGraffitis().then((data) => {
      setGraffitis(data);
    });

    const unsubscribe = subscribeToRealtimeGraffitis((newGraffiti) => {
      setGraffitis((prev) => {
        const index = prev.findIndex((g) => g.id === newGraffiti.id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = newGraffiti;
          return copy;
        }
        return [newGraffiti, ...prev];
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle clicking "Create Graffiti Here" on map
  const handleCreateGraffitiAt = (coords: LocationCoordinates) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setTargetLocation(coords);
    setRemixTitle('');
    setIsEditorOpen(true);
  };

  // Handle Quick Create button (defaults to Bengaluru / India coordinates)
  const handleQuickCreate = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setTargetLocation({
      lat: 12.9716 + (Math.random() - 0.5) * 0.05,
      lng: 77.5946 + (Math.random() - 0.5) * 0.05,
    });
    setRemixTitle('');
    setIsEditorOpen(true);
  };

  // Handle Publishing Artwork (MetaMask Web3 Transaction + Supabase Storage)
  const handlePublishArtwork = async (title: string, dataUrl: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const coords = targetLocation || { lat: 12.9716, lng: 77.5946 };

    try {
      // 1. Upload to Supabase Storage bucket
      const imageUrl = await uploadArtworkImage(dataUrl, title.replace(/\s+/g, '_'));

      // 2. Trigger MetaMask Web3 Transaction on Monad Testnet
      alert('Prompting MetaMask transaction... Please approve the transaction to publish on Monad Testnet.');
      const { txHash } = await publishGraffitiOnChain(title, coords.lat, coords.lng, imageUrl);
      console.log('On-chain transaction confirmed on Monad Testnet:', txHash);

      // 3. Save metadata to Supabase DB
      const published = await publishGraffitiToSupabase({
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        title,
        latitude: coords.lat,
        longitude: coords.lng,
        image_url: imageUrl,
      });

      setGraffitis((prev) => [published, ...prev]);
      setSelectedGraffiti(published);
      setIsEditorOpen(false);
      alert(`Success! Graffiti published on Monad Testnet!\nTx Hash: ${txHash.slice(0, 16)}...`);
    } catch (err: any) {
      console.error('Publish error:', err);
      alert(err.message || 'Transaction rejected or failed.');
    }
  };

  // Handle Like action (MetaMask Web3 Transaction)
  const handleLikeGraffiti = async (id: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      // Trigger MetaMask transaction for on-chain like
      await likeGraffitiOnChain(1);
      const updatedLikes = await incrementGraffitiLike(id);

      setGraffitis((prev) =>
        prev.map((g) => (g.id === id ? { ...g, likes_count: updatedLikes } : g))
      );

      if (selectedGraffiti?.id === id) {
        setSelectedGraffiti((prev) => (prev ? { ...prev, likes_count: updatedLikes } : null));
      }
    } catch (e: any) {
      console.warn('Like transaction notice:', e);
      // Fallback local update
      const updatedLikes = await incrementGraffitiLike(id);
      setGraffitis((prev) =>
        prev.map((g) => (g.id === id ? { ...g, likes_count: updatedLikes } : g))
      );
    }
  };

  // Handle Remix action
  const handleRemixGraffiti = (graffiti: Graffiti) => {
    setRemixTitle(`Remix of ${graffiti.title}`);
    setTargetLocation({
      lat: graffiti.latitude + 0.002,
      lng: graffiti.longitude + 0.002,
    });
    setSelectedGraffiti(null);
    setIsEditorOpen(true);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-warm-canvas">
      {/* Top Header */}
      <Header />

      {/* Main Interactive Map View centered over India */}
      <div className="w-full h-full pt-32">
        <MapContainer
          graffitis={graffitis}
          onSelectGraffiti={(g) => setSelectedGraffiti(g)}
          selectedGraffiti={selectedGraffiti}
          onCreateGraffitiAt={handleCreateGraffitiAt}
        />
      </div>

      {/* Floating Action Button: Quick Create */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={handleQuickCreate}
          className="px-8 py-4 rounded-btn bg-carbon-black text-paper-white font-sans font-medium text-sm flex items-center space-x-3 transition-opacity duration-150 hover:opacity-85 uppercase tracking-tight"
        >
          <Plus className="w-4 h-4" />
          <span>Create Graffiti</span>
        </button>
      </div>

      {/* Graffiti Drawing Canvas Editor Modal */}
      <DrawingCanvas
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialTitle={remixTitle}
        onPublish={handlePublishArtwork}
        locationCoordinates={targetLocation}
      />

      {/* Graffiti Detail Sheet */}
      <GraffitiDetailSheet
        graffiti={selectedGraffiti}
        onClose={() => setSelectedGraffiti(null)}
        onLike={handleLikeGraffiti}
        onRemix={handleRemixGraffiti}
      />

      {/* Auth Modal */}
      <AuthModal />
    </main>
  );
}
