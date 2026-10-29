import React, { useState } from 'react';
import { Sparkles, Trash2, X } from 'lucide-react';

interface IconPickerProps {
  currentIcon?: string;
  onSelect: (emoji: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Frecuentes & Notas',
    emojis: ['📄', '📝', '🏠', '⚡', '💡', '🎯', '📚', '💻', '🚀', '📌', '✨', '🔥', '☕', '🧠', '🛠️', '💼'],
  },
  {
    name: 'Emociones & Símbolos',
    emojis: ['⭐', '🌟', '❤️', '✅', '❌', '⏳', '🔍', '📊', '📈', '🔑', '🏷️', '🎉', '🎨', '🧩', '🔒', '🔔'],
  },
  {
    name: 'Naturaleza & Objetos',
    emojis: ['🌱', '🌿', '🌲', '☀️', '🌙', '🌊', '🌎', '🚀', '🚲', '✈️', '🧭', '🔮', '📐', '📦', '🎁', '🎧'],
  },
];

const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap((c) => c.emojis);

export const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelect, onRemove, onClose }) => {
  const [filter, setFilter] = useState('');


  const handleRandom = () => {
    const randomEmoji = ALL_EMOJIS[Math.floor(Math.random() * ALL_EMOJIS.length)];
    onSelect(randomEmoji);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-12 left-0 z-50 w-72 bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-3 text-xs select-none">
        {/* Controls */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <button
            onClick={handleRandom}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors font-medium"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>Aleatorio</span>
          </button>

          {currentIcon && (
            <button
              onClick={() => {
                onRemove();
                onClose();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition-colors font-medium"
            >
              <Trash2 size={13} />
              <span>Quitar</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="my-2">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar emoji..."
            className="w-full px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md border-none outline-hidden text-xs text-neutral-800 dark:text-neutral-200"
          />
        </div>

        {/* Emoji Grid */}
        <div className="max-h-52 overflow-y-auto space-y-3 pt-1">
          {EMOJI_CATEGORIES.map((cat) => {
            const visible = filter ? cat.emojis.filter((e) => e.includes(filter)) : cat.emojis;
            if (visible.length === 0) return null;

            return (
              <div key={cat.name}>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 px-1">
                  {cat.name}
                </span>
                <div className="grid grid-cols-8 gap-1 mt-1">
                  {visible.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onSelect(emoji);
                        onClose();
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-base transition-transform hover:scale-115"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
