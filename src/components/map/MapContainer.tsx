'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Graffiti, LocationCoordinates } from '@/lib/types';
import { CustomGraffitiMarker } from './CustomGraffitiMarker';
import { Search, MapPin, Plus, Sparkles, Navigation, Compass } from 'lucide-react';

interface MapContainerProps {
  graffitis: Graffiti[];
  onSelectGraffiti: (graffiti: Graffiti) => void;
  selectedGraffiti: Graffiti | null;
  onCreateGraffitiAt: (coords: LocationCoordinates) => void;
}

// Popular locations featuring Indian tech & culture hubs
const POPULAR_CITIES = [
  { name: 'Bengaluru 🇮🇳', lat: 12.9716, lng: 77.5946 },
  { name: 'New Delhi 🇮🇳', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai 🇮🇳', lat: 19.0760, lng: 72.8777 },
  { name: 'Chennai 🇮🇳', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad 🇮🇳', lat: 17.3850, lng: 78.4867 },
  { name: 'Kolkata 🇮🇳', lat: 22.5726, lng: 88.3639 },
  { name: 'Tokyo 🇯🇵', lat: 35.6762, lng: 139.6503 },
  { name: 'San Francisco 🇺🇸', lat: 37.7749, lng: -122.4194 },
];

export const MapContainer: React.FC<MapContainerProps> = ({
  graffitis,
  onSelectGraffiti,
  selectedGraffiti,
  onCreateGraffitiAt,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Default Map center over India (lat: 20.5937, lng: 78.9629) with zoom 5
  const [center, setCenter] = useState<LocationCoordinates>({ lat: 20.5937, lng: 78.9629 });
  const [zoom, setZoom] = useState<number>(5);
  const [clickedLocation, setClickedLocation] = useState<LocationCoordinates | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize Watermark-Free Leaflet Dark Map Tile Engine
  useEffect(() => {
    if (typeof window === 'undefined') return;
    initLeafletMap();
  }, []);

  const initLeafletMap = async () => {
    if (!mapRef.current || leafletMapInstance.current) return;

    try {
      const L = (await import('leaflet')).default;

      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Dark Matter tile layer for high-resolution watermark-free dark map
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Handle map click to drop graffiti location pin
      map.on('click', (e: any) => {
        setClickedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      leafletMapInstance.current = map;
      renderLeafletMarkers(L, map);
    } catch (e) {
      console.warn('Leaflet map error:', e);
    }
  };

  // Render Markers
  const renderLeafletMarkers = (L: any, map: any) => {
    if (!map || !L) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    graffitis.forEach((g) => {
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div class="relative p-1 rounded-2xl bg-gradient-to-tr from-[#836EF9] to-[#FF5E97] shadow-2xl hover:scale-125 transition-all cursor-pointer">
                 <img src="${g.image_url}" class="w-11 h-11 rounded-xl object-cover border border-[#0E0E14]" />
                 <span class="absolute -top-1.5 -right-1.5 text-xs">🎨</span>
               </div>`,
        iconSize: [46, 46],
        iconAnchor: [23, 23],
      });

      const marker = L.marker([g.latitude, g.longitude], { icon: customIcon }).addTo(map);
      marker.on('click', () => onSelectGraffiti(g));
      markersRef.current.push(marker);
    });
  };

  // Update Leaflet markers when graffitis update in real time
  useEffect(() => {
    if (leafletMapInstance.current && typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        renderLeafletMarkers(L.default, leafletMapInstance.current);
      });
    }
  }, [graffitis]);

  // Handle location search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const foundCity = POPULAR_CITIES.find((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundCity) {
      panToLocation(foundCity.lat, foundCity.lng, 10);
    } else {
      const hash = searchQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const mockLat = 15 + ((hash % 150) / 10);
      const mockLng = 72 + ((hash % 160) / 10);
      panToLocation(mockLat, mockLng, 8);
    }
  };

  const panToLocation = (lat: number, lng: number, targetZoom = 8) => {
    setCenter({ lat, lng });
    setZoom(targetZoom);

    if (leafletMapInstance.current) {
      leafletMapInstance.current.setView([lat, lng], targetZoom);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#05050A] overflow-hidden select-none">
      {/* Search Navbar Aligned Below Top Header */}
      <div className="absolute top-20 left-4 right-4 md:left-6 md:w-[450px] z-30 flex flex-col gap-2.5">
        <form onSubmit={handleSearchSubmit} className="relative shadow-2xl">
          <input
            type="text"
            placeholder="Search location in India (e.g., Bengaluru, Delhi, Mumbai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-2xl glass-panel text-xs text-white placeholder-gray-400 border border-mon-border focus:outline-none focus:border-[#836EF9] shadow-2xl backdrop-blur-xl"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#836EF9]" />
          <button
            type="submit"
            className="absolute right-2 top-2 p-1.5 rounded-xl bg-gradient-to-r from-[#836EF9] to-[#FF5E97] text-white hover:brightness-110 transition-all shadow-md"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick City Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-none">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => panToLocation(city.lat, city.lng, 10)}
              className="px-3 py-1.5 rounded-xl glass-panel text-[11px] font-semibold text-gray-200 hover:text-white hover:border-[#FF5E97] whitespace-nowrap transition-all border border-mon-border shadow-md"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Renderer Container (Watermark-Free Map Tiles) */}
      <div ref={mapRef} className="w-full h-full min-h-screen z-10" />

      {/* Render Clicked Location Pin with "Create Graffiti Here" */}
      {clickedLocation && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '45%',
            transform: 'translate(-50%, -50%)',
          }}
          className="z-40 animate-bounce pointer-events-auto"
        >
          <div className="relative flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateGraffitiAt(clickedLocation);
                setClickedLocation(null);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#836EF9] via-[#FF5E97] to-[#836EF9] text-white font-extrabold text-xs shadow-2xl flex items-center space-x-2 hover:scale-105 transition-all whitespace-nowrap glow-pink border border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Graffiti Here ({clickedLocation.lat.toFixed(2)}, {clickedLocation.lng.toFixed(2)})</span>
            </button>
            <div className="w-3.5 h-3.5 bg-[#FF5E97] rotate-45 -mt-1.5 shadow-lg" />
            <MapPin className="w-7 h-7 text-[#FF5E97] -mt-1" />
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col space-y-2">
        <button
          onClick={() => {
            if (leafletMapInstance.current) leafletMapInstance.current.zoomIn();
          }}
          className="w-10 h-10 rounded-2xl glass-panel text-white font-bold text-lg flex items-center justify-center hover:bg-[#836EF9]/20 transition-all border border-mon-border shadow-xl"
        >
          +
        </button>
        <button
          onClick={() => {
            if (leafletMapInstance.current) leafletMapInstance.current.zoomOut();
          }}
          className="w-10 h-10 rounded-2xl glass-panel text-white font-bold text-lg flex items-center justify-center hover:bg-[#836EF9]/20 transition-all border border-mon-border shadow-xl"
        >
          -
        </button>
        <button
          onClick={() => panToLocation(20.5937, 78.9629, 5)}
          className="w-10 h-10 rounded-2xl glass-panel text-[#FF5E97] flex items-center justify-center hover:bg-[#FF5E97]/20 transition-all border border-mon-border shadow-xl"
          title="Center India Map"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Realtime Status Toast */}
      <div className="absolute bottom-6 left-6 z-30 hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-2xl glass-panel border border-mon-border text-xs text-gray-300 shadow-xl pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <Sparkles className="w-4 h-4 text-[#836EF9]" />
        <span>Live India Map • Watermark Free • Monad Testnet</span>
      </div>
    </div>
  );
};
