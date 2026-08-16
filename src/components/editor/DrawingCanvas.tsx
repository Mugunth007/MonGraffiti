'use client';

import React, { useRef, useState, useEffect } from 'react';
import { DrawingTool, DrawLine } from '@/lib/types';
import {
  Paintbrush,
  Eraser,
  Type,
  Trash2,
  Undo,
  Palette,
  Eye,
  Send,
  X,
  Sparkles,
} from 'lucide-react';

interface DrawingCanvasProps {
  initialTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (title: string, dataUrl: string) => Promise<void>;
  locationCoordinates: { lat: number; lng: number } | null;
}

const PRESET_COLORS = [
  '#FF5E97', // Monad Pink
  '#836EF9', // Monad Purple
  '#00F2FE', // Neon Cyan
  '#4FACFE', // Electric Blue
  '#00FF87', // Neon Green
  '#FFD700', // Gold Yellow
  '#FF5722', // Neon Orange
  '#FFFFFF', // White
  '#161622', // Canvas Dark
];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  initialTitle = '',
  isOpen,
  onClose,
  onPublish,
  locationCoordinates,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<DrawingTool>('brush');
  const [color, setColor] = useState<string>('#FF5E97');
  const [brushSize, setBrushSize] = useState<number>(8);
  const [title, setTitle] = useState<string>(initialTitle);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');
  const [isAddingText, setIsAddingText] = useState<boolean>(false);
  const [textPos, setTextPos] = useState<{ x: number; y: number }>({ x: 150, y: 150 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Initialize canvas background
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 450;
    canvas.height = 450;

    // Fill dark background
    ctx.fillStyle = '#12121c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid guide lines (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Save initial state for undo
    saveHistoryState();
  }, [isOpen]);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), state]);
    updatePreviewUrl();
  };

  const updatePreviewUrl = () => {
    if (canvasRef.current) {
      setPreviewUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const handleUndo = () => {
    if (history.length <= 1 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current state
    const previousState = newHistory[newHistory.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
      updatePreviewUrl();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#12121c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (tool === 'text') {
      setTextPos({ x, y });
      setIsAddingText(true);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#12121c' : color;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveHistoryState();
  };

  const addTextToCanvas = () => {
    if (!textInput.trim() || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = `bold ${brushSize * 3 + 16}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Subtle text shadow/glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillText(textInput, textPos.x, textPos.y);
    ctx.shadowBlur = 0; // reset

    setTextInput('');
    setIsAddingText(false);
    saveHistoryState();
  };

  const handlePublishSubmit = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your graffiti artwork!');
      return;
    }

    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');

    setIsPublishing(true);
    try {
      await onPublish(title, dataUrl);
      onClose();
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish graffiti. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-modal rounded-3xl p-5 md:p-6 border border-mon-border shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-mon-border mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#836EF9] to-[#FF5E97] text-white">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-1.5">
                Create MON Graffiti <Sparkles className="w-4 h-4 text-[#FF5E97]" />
              </h2>
              <p className="text-[11px] text-gray-400">
                {locationCoordinates
                  ? `Location: ${locationCoordinates.lat.toFixed(4)}, ${locationCoordinates.lng.toFixed(4)}`
                  : 'Draw your artwork below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#161622] hover:bg-[#222234] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Graffiti Artwork Title <span className="text-[#FF5E97]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. MON Frog, Street Rocket, Neon Alien..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#161622] border border-mon-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#836EF9] transition-colors"
          />
        </div>

        {/* Toolbar Controls */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#161622] border border-mon-border">
          {/* Tool Selection */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setTool('brush')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                tool === 'brush'
                  ? 'bg-gradient-to-r from-[#836EF9] to-[#FF5E97] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#202030]'
              }`}
              title="Brush Tool"
            >
              <Paintbrush className="w-4 h-4" />
              <span className="hidden sm:inline">Brush</span>
            </button>

            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                tool === 'eraser'
                  ? 'bg-gradient-to-r from-[#836EF9] to-[#FF5E97] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#202030]'
              }`}
              title="Eraser Tool"
            >
              <Eraser className="w-4 h-4" />
              <span className="hidden sm:inline">Eraser</span>
            </button>

            <button
              onClick={() => setTool('text')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                tool === 'text'
                  ? 'bg-gradient-to-r from-[#836EF9] to-[#FF5E97] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-[#202030]'
              }`}
              title="Click on canvas to add text"
            >
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Text</span>
            </button>
          </div>

          {/* Brush Size Slider */}
          <div className="flex items-center space-x-2 px-2 py-1 bg-[#0E0E14] rounded-xl border border-mon-border">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Size:</span>
            <input
              type="range"
              min="2"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20 accent-[#FF5E97] cursor-pointer"
            />
            <span className="text-xs font-bold text-gray-200 w-4 text-center">{brushSize}</span>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#202030] disabled:opacity-40 transition-colors"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mb-4 flex items-center space-x-2 overflow-x-auto pb-1">
          <Palette className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex items-center space-x-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  if (tool === 'eraser') setTool('brush');
                }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c && tool !== 'eraser'
                    ? 'scale-125 border-white ring-2 ring-[#836EF9]'
                    : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            {/* Custom Color Input */}
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                if (tool === 'eraser') setTool('brush');
              }}
              className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer"
              title="Custom Color Picker"
            />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative flex justify-center items-center bg-[#09090E] rounded-2xl p-2 border border-mon-border shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full max-w-[450px] aspect-square rounded-xl cursor-crosshair touch-none shadow-lg"
          />

          {/* Text Input Prompt */}
          {isAddingText && (
            <div
              className="absolute glass-modal p-3 rounded-xl z-20 border border-[#836EF9] shadow-2xl flex flex-col space-y-2"
              style={{ left: Math.min(textPos.x, 250), top: Math.min(textPos.y, 300) }}
            >
              <span className="text-[10px] font-bold text-[#FF5E97]">Enter Text:</span>
              <input
                type="text"
                autoFocus
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTextToCanvas()}
                placeholder="Type text..."
                className="px-2 py-1 bg-[#161622] text-xs text-white border border-mon-border rounded-lg outline-none"
              />
              <div className="flex space-x-1 justify-end">
                <button
                  onClick={() => setIsAddingText(false)}
                  className="px-2 py-0.5 text-[10px] text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={addTextToCanvas}
                  className="px-2.5 py-0.5 text-[10px] bg-[#836EF9] text-white rounded-md font-bold"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions: Preview Modal & Publish */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              updatePreviewUrl();
              setShowPreview(!showPreview);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#161622] hover:bg-[#202030] border border-mon-border text-xs font-semibold text-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4 text-[#836EF9]" />
            <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
          </button>

          <button
            onClick={handlePublishSubmit}
            disabled={isPublishing}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#836EF9] to-[#FF5E97] text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isPublishing ? 'Publishing to Map...' : 'Publish Graffiti'}</span>
          </button>
        </div>

        {/* Live Preview Modal Overlay */}
        {showPreview && (
          <div className="mt-3 p-4 glass-panel rounded-2xl border border-[#FF5E97]/30 flex flex-col items-center">
            <span className="text-xs font-bold text-[#FF5E97] mb-2">Map Marker Preview</span>
            {previewUrl && (
              <div className="relative p-1.5 bg-gradient-to-tr from-[#836EF9] to-[#FF5E97] rounded-xl shadow-xl">
                <img
                  src={previewUrl}
                  alt="Graffiti Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-[#0E0E14]"
                />
                <span className="absolute -top-2 -right-2 text-xl">🎨</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
