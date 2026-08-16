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
} from 'lucide-react';

interface DrawingCanvasProps {
  initialTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (title: string, dataUrl: string) => Promise<void>;
  locationCoordinates: { lat: number; lng: number } | null;
}

const PRESET_COLORS = [
  '#000000', // Carbon Black
  '#2f2f2f', // Graphite
  '#444444', // Slate
  '#979797', // Smoke
  '#c6c6c6', // Ash
  '#d1ffca', // Mint Chip
  '#fff100', // Voltage Yellow
  '#ffffff', // Paper White
  '#FF5722', // Warm accent
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
  const [color, setColor] = useState<string>('#000000');
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

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid guide lines (subtle warm canvas tone)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
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
    ctx.fillStyle = '#ffffff';
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
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
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
    ctx.fillText(textInput, textPos.x, textPos.y);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-carbon-black/40 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-paper-white rounded-card-lg p-6 md:p-8 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ash mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-btn bg-carbon-black text-paper-white">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl text-carbon-black uppercase tracking-tight">
                Create Graffiti
              </h2>
              <p className="text-xs text-smoke font-mono">
                {locationCoordinates
                  ? `Location: ${locationCoordinates.lat.toFixed(4)}, ${locationCoordinates.lng.toFixed(4)}`
                  : 'Draw your artwork below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-btn bg-mist-gray hover:bg-ash text-smoke hover:text-carbon-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title Input */}
        <div className="mb-5">
          <label className="block text-xs font-mono text-smoke mb-1.5 uppercase tracking-wide">
            Artwork Title <span className="text-carbon-black">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. MON Frog, Street Rocket, Neon Alien..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-mist-gray rounded-btn text-sm text-carbon-black placeholder-ash font-sans focus:outline-none focus:ring-2 focus:ring-carbon-black/10 transition-all"
          />
        </div>

        {/* Toolbar Controls */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 p-3 rounded-card bg-mist-gray">
          {/* Tool Selection */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setTool('brush')}
              className={`p-2 rounded-btn text-xs font-sans font-medium flex items-center space-x-1.5 transition-all ${
                tool === 'brush'
                  ? 'bg-carbon-black text-paper-white'
                  : 'text-smoke hover:text-carbon-black hover:bg-ash'
              }`}
              title="Brush Tool"
            >
              <Paintbrush className="w-4 h-4" />
              <span className="hidden sm:inline uppercase tracking-tight">Brush</span>
            </button>

            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-btn text-xs font-sans font-medium flex items-center space-x-1.5 transition-all ${
                tool === 'eraser'
                  ? 'bg-carbon-black text-paper-white'
                  : 'text-smoke hover:text-carbon-black hover:bg-ash'
              }`}
              title="Eraser Tool"
            >
              <Eraser className="w-4 h-4" />
              <span className="hidden sm:inline uppercase tracking-tight">Eraser</span>
            </button>

            <button
              onClick={() => setTool('text')}
              className={`p-2 rounded-btn text-xs font-sans font-medium flex items-center space-x-1.5 transition-all ${
                tool === 'text'
                  ? 'bg-carbon-black text-paper-white'
                  : 'text-smoke hover:text-carbon-black hover:bg-ash'
              }`}
              title="Click on canvas to add text"
            >
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline uppercase tracking-tight">Text</span>
            </button>
          </div>

          {/* Brush Size Slider */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-paper-white rounded-btn">
            <span className="text-[10px] text-smoke font-mono uppercase tracking-wide">Size:</span>
            <input
              type="range"
              min="2"
              max="40"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20 accent-carbon-black cursor-pointer"
            />
            <span className="text-xs font-bold text-carbon-black w-4 text-center font-mono">{brushSize}</span>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="p-2 rounded-btn text-smoke hover:text-carbon-black hover:bg-ash disabled:opacity-40 transition-colors"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-btn text-smoke hover:text-carbon-black hover:bg-ash transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mb-4 flex items-center space-x-2 overflow-x-auto pb-1">
          <Palette className="w-4 h-4 text-smoke flex-shrink-0" />
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
                    ? 'scale-125 border-carbon-black'
                    : 'border-ash hover:scale-110'
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
        <div className="relative flex justify-center items-center bg-mist-gray rounded-card p-2">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full max-w-[450px] aspect-square rounded-xl cursor-crosshair touch-none"
          />

          {/* Text Input Prompt */}
          {isAddingText && (
            <div
              className="absolute bg-paper-white p-3 rounded-card z-20 flex flex-col space-y-2"
              style={{ left: Math.min(textPos.x, 250), top: Math.min(textPos.y, 300) }}
            >
              <span className="text-[10px] font-mono text-smoke uppercase tracking-wide">Enter Text:</span>
              <input
                type="text"
                autoFocus
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTextToCanvas()}
                placeholder="Type text..."
                className="px-2 py-1.5 bg-mist-gray text-xs text-carbon-black rounded-btn outline-none font-sans"
              />
              <div className="flex space-x-1 justify-end">
                <button
                  onClick={() => setIsAddingText(false)}
                  className="px-2 py-0.5 text-[10px] text-smoke hover:text-carbon-black"
                >
                  Cancel
                </button>
                <button
                  onClick={addTextToCanvas}
                  className="px-3 py-0.5 text-[10px] bg-carbon-black text-paper-white rounded-btn font-bold uppercase"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions: Preview Modal & Publish */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              updatePreviewUrl();
              setShowPreview(!showPreview);
            }}
            className="flex items-center space-x-1.5 px-5 py-3 rounded-btn bg-mist-gray hover:bg-ash text-xs font-sans font-medium text-carbon-black transition-colors uppercase tracking-tight"
          >
            <Eye className="w-4 h-4 text-smoke" />
            <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
          </button>

          <button
            onClick={handlePublishSubmit}
            disabled={isPublishing}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-btn bg-carbon-black text-paper-white font-sans font-medium text-sm uppercase tracking-tight transition-opacity hover:opacity-85 active:scale-[0.99] disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isPublishing ? 'Publishing to Map...' : 'Publish Graffiti'}</span>
          </button>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="mt-4 p-4 rounded-card bg-mist-gray flex flex-col items-center">
            <span className="text-xs font-mono text-smoke mb-2 uppercase tracking-wide">Map Marker Preview</span>
            {previewUrl && (
              <div className="relative p-1 bg-paper-white rounded-card">
                <img
                  src={previewUrl}
                  alt="Graffiti Preview"
                  className="w-32 h-32 object-cover rounded-xl"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
