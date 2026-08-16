'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Graffiti, LocationCoordinates } from '@/lib/types';
import { CustomGraffitiMarker } from './CustomGraffitiMarker';
import { Search, MapPin, Plus, Navigation, Compass } from 'lucide-react';

interface MapContainerProps {
  graffitis: Graffiti[];
  onSelectGraffiti: (graffiti: Graffiti) => void;
  selectedGraffiti: Graffiti | null;
  onCreateGraffitiAt: (coords: LocationCoordinates) => void;
}

// Popular locations featuring Indian tech & culture hubs
const POPULAR_CITIES = [
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
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

    // Check if Google Maps API key is provided
    if (apiKey && apiKey !== 'your-google-maps-api-key-here') {
      if ((window as any).google?.maps) {
        initGoogleMap();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => initGoogleMap();
      script.onerror = () => initLeafletMap();
      document.head.appendChild(script);
      return;
    }

    // Default to Leaflet light map tiles
    initLeafletMap();
  }, []);

  // Leaflet Map Initialization with Light Tile Layer
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

      // CartoDB Positron (light) tiles for the brutalist-editorial canvas feel
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
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

  // Google Maps Initialization — light neutral palette
  const initGoogleMap = () => {
    if (!mapRef.current || !(window as any).google?.maps) return;
    setUseGoogleMaps(true);

    const gMap = new (window as any).google.maps.Map(mapRef.current, {
      center: center,
      zoom: zoom,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#444444' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c6c6c6' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f3f3f3' }] },
      ],
    });

    gMap.addListener('click', (e: any) => {
      setClickedLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    });

    googleMapInstance.current = gMap;
  };

  // Render Leaflet Markers
  const renderLeafletMarkers = (L: any, map: any) => {
    if (!map || !L) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    graffitis.forEach((g) => {
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="padding:3px;border-radius:16px;background:#ffffff;cursor:pointer;transition:transform 0.15s;">
                 <img src="${g.image_url}" style="width:40px;height:40px;border-radius:12px;object-fit:cover;display:block;" />
               </div>`,
        iconSize: [46, 46],
        iconAnchor: [23, 23],
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
    <div className="relative w-full h-full min-h-screen bg-warm-canvas overflow-hidden select-none">
      {/* Search Navbar */}
      <div className="absolute top-4 left-4 right-4 md:left-6 md:w-[450px] z-30 flex flex-col gap-2.5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search location (e.g., Bengaluru, Delhi, Mumbai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-card bg-paper-white text-sm text-carbon-black placeholder-smoke font-sans focus:outline-none focus:ring-2 focus:ring-carbon-black/10 transition-all"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-smoke" />
          <button
            type="submit"
            className="absolute right-2 top-2 p-1.5 rounded-btn bg-carbon-black text-paper-white transition-opacity hover:opacity-85"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick City Chips — mint tag pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-none">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => panToLocation(city.lat, city.lng, 10)}
              className="tag-mint whitespace-nowrap transition-opacity hover:opacity-75"
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
          className="z-40 pointer-events-auto"
        >
          <div className="relative flex flex-col items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateGraffitiAt(clickedLocation);
                setClickedLocation(null);
              }}
              className="px-5 py-3 rounded-btn bg-carbon-black text-paper-white font-sans font-medium text-xs flex items-center space-x-2 transition-opacity hover:opacity-85 whitespace-nowrap uppercase tracking-tight"
            >
              <Plus className="w-4 h-4" />
              <span>Create Graffiti Here ({clickedLocation.lat.toFixed(2)}, {clickedLocation.lng.toFixed(2)})</span>
            </button>
            <div className="w-3 h-3 bg-carbon-black rotate-45 -mt-1.5" />
            <MapPin className="w-6 h-6 text-carbon-black -mt-1" />
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col space-y-2">
        <button
          onClick={() => {
            if (leafletMapInstance.current) leafletMapInstance.current.zoomIn();
          }}
          className="w-10 h-10 rounded-card bg-paper-white text-carbon-black font-bold text-lg flex items-center justify-center transition-opacity hover:opacity-75"
        >
          +
        </button>
        <button
          onClick={() => {
            if (leafletMapInstance.current) leafletMapInstance.current.zoomOut();
          }}
          className="w-10 h-10 rounded-card bg-paper-white text-carbon-black font-bold text-lg flex items-center justify-center transition-opacity hover:opacity-75"
        >
          -
        </button>
        <button
          onClick={() => panToLocation(20.5937, 78.9629, 5)}
          className="w-10 h-10 rounded-card bg-paper-white text-carbon-black flex items-center justify-center transition-opacity hover:opacity-75"
          title="Center India Map"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Realtime Status Toast */}
      <div className="absolute bottom-6 left-6 z-30 hidden sm:flex items-center space-x-2 px-4 py-2 rounded-pill bg-paper-white text-sm text-smoke font-mono pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-carbon-black animate-pulse" />
        <span className="uppercase text-xs tracking-wide">Live · Monad Testnet</span>
      </div>
    </div>
  );
};
