'use client';

import React from 'react';
import { Graffiti } from '@/lib/types';
import { Heart } from 'lucide-react';

interface CustomGraffitiMarkerProps {
  graffiti: Graffiti;
  onClick: () => void;
  isSelected?: boolean;
}

export const CustomGraffitiMarker: React.FC<CustomGraffitiMarkerProps> = ({
  graffiti,
  onClick,
  isSelected = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer transform transition-all duration-200 hover:scale-110 z-20 ${
        isSelected ? 'scale-110 z-30' : ''
      }`}
      title={`${graffiti.title} by ${graffiti.user_name}`}
    >
      {/* Marker Frame — flat white card */}
      <div className="relative p-1 rounded-card bg-paper-white graffiti-marker-animated">
        {/* Artwork Thumbnail */}
        <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl overflow-hidden bg-mist-gray flex items-center justify-center">
          <img
            src={graffiti.image_url}
            alt={graffiti.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Likes Pill — mint chip */}
        {graffiti.likes_count > 0 && (
          <div className="absolute -bottom-1.5 -right-1 px-1.5 py-0.5 rounded-tag bg-mint-chip text-[9px] font-bold text-carbon-black flex items-center space-x-0.5 font-mono">
            <Heart className="w-2.5 h-2.5" />
            <span>{graffiti.likes_count}</span>
          </div>
        )}
      </div>

      {/* Pin Stem */}
      <div className="w-1 h-3 bg-carbon-black mx-auto rounded-full" />

      {/* Tooltip on Hover */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
        <div className="px-3 py-1.5 rounded-card bg-paper-white text-xs font-sans whitespace-nowrap">
          <p className="text-carbon-black font-medium leading-tight">{graffiti.title}</p>
          <p className="text-[9px] text-smoke font-mono">by {graffiti.user_name}</p>
        </div>
      </div>
    </div>
  );
};
