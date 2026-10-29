import React, { useState } from 'react';
import { Image, Trash2, X, Link as LinkIcon } from 'lucide-react';

interface CoverPickerProps {
  currentCover?: string;
  onSelect: (url: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

const PRESET_COVERS = [
  {
    name: 'Gradiente Minimalista',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Montañas y Niebla',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Océano Serena',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Biblioteca Clásica',
    url: 'https://images.unsplash.com/photo-1507842229452-7833215582c3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Matrix Cyberpunk',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Arquitectura Zen',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  },
];

export const CoverPicker: React.FC<CoverPickerProps> = ({ currentCover, onSelect, onRemove, onClose }) => {
  const [customUrl, setCustomUrl] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelect(customUrl.trim());
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-12 right-0 z-50 w-80 bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4 text-xs select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
            <Image size={15} />
            <span>Seleccionar Portada</span>
          </div>

          <div className="flex items-center gap-1">
            {currentCover && (
              <button
                onClick={() => {
                  onRemove();
                  onClose();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium"
              >
                <Trash2 size={13} />
                <span>Quitar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="mt-3">
          <span className="text-[10px] uppercase font-semibold text-neutral-400">
            Galería Destacada
          </span>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {PRESET_COVERS.map((cover) => (
              <button
                key={cover.name}
                onClick={() => {
                  onSelect(cover.url);
                  onClose();
                }}
                className="group relative h-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:opacity-90 transition-transform hover:scale-103"
              >
                <img
                  src={cover.url}
                  alt={cover.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Custom URL Input */}
        <form onSubmit={handleCustomSubmit} className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[10px] uppercase font-semibold text-neutral-400">
            Enlace de imagen personalizado
          </span>
          <div className="flex gap-2 mt-1.5">
            <div className="flex-1 flex items-center gap-1.5 px-2 bg-neutral-100 dark:bg-neutral-800 rounded-md">
              <LinkIcon size={12} className="text-neutral-400" />
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://..."
                className="w-full py-1.5 bg-transparent border-none outline-hidden text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
