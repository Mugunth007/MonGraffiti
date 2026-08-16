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
      className={`group relative cursor-pointer transform transition-all duration-300 hover:scale-125 z-20 ${
        isSelected ? 'scale-125 z-30' : ''
      }`}
      title={`${graffiti.title} by ${graffiti.user_name}`}
    >
      {/* Outer Pulse Frame */}
      <div className="relative p-1 rounded-2xl bg-gradient-to-tr from-[#836EF9] via-[#FF5E97] to-[#00F2FE] shadow-lg shadow-purple-500/30 graffiti-marker-animated">
        {/* Artwork Thumbnail */}
        <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl overflow-hidden bg-[#0E0E14] border border-[#0E0E14] flex items-center justify-center">
          <img
            src={graffiti.image_url}
            alt={graffiti.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Emoji Badge */}
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#161622] border border-[#FF5E97] flex items-center justify-center text-[11px] shadow-sm">
          🎨
        </div>

        {/* Likes Pill */}
        {graffiti.likes_count > 0 && (
          <div className="absolute -bottom-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-[#836EF9] text-[9px] font-bold text-white flex items-center space-x-0.5 shadow-md">
            <Heart className="w-2.5 h-2.5 fill-current text-[#FF5E97]" />
            <span>{graffiti.likes_count}</span>
          </div>
        )}
      </div>

      {/* Pin Stem */}
      <div className="w-1 h-3 bg-gradient-to-b from-[#FF5E97] to-transparent mx-auto rounded-full shadow-sm" />

      {/* Tooltip on Hover */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
        <div className="px-2.5 py-1 rounded-lg glass-modal text-[11px] font-bold text-white whitespace-nowrap border border-mon-border shadow-xl">
          <p className="text-[#FF5E97] leading-tight">{graffiti.title}</p>
          <p className="text-[9px] text-gray-400 font-normal">by {graffiti.user_name}</p>
        </div>
      </div>
    </div>
  );
};
