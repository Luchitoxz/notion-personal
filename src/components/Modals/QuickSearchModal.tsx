import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../store/useWorkspace';
import { Search, CornerDownLeft } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const { pages, setActivePageId } = useWorkspace();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const activePages = pages.filter((p) => !p.isTrash);

  // Filter pages and find matching snippets
  const results = activePages
    .map((page) => {
      const titleMatch = page.title.toLowerCase().includes(query.toLowerCase());
      const matchingBlock = page.blocks.find(
        (b) => b.content && b.content.toLowerCase().includes(query.toLowerCase())
      );
      return {
        page,
        titleMatch,
        matchingText: matchingBlock ? matchingBlock.content : null,
        score: titleMatch ? 2 : matchingBlock ? 1 : 0,
      };
    })
    .filter((res) => (query.trim() === '' ? true : res.score > 0))
    .sort((a, b) => b.score - a.score);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        setActivePageId(results[selectedIndex].page.id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div
        onKeyDown={handleKeyDown}
        className="relative z-10 w-full max-w-xl bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <Search size={18} className="text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o contenido de notas..."
            className="flex-1 bg-transparent border-none outline-hidden text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
          />
          <kbd className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {results.length > 0 ? (
            results.map((res, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={res.page.id}
                  onClick={() => {
                    setActivePageId(res.page.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <span className="text-lg leading-none mt-0.5">{res.page.icon || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {res.page.title.trim() ? res.page.title : 'Sin título'}
                      </span>
                    </div>
                    {res.matchingText && query.trim() !== '' && (
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-400 truncate mt-0.5">
                        {res.matchingText}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <CornerDownLeft size={14} className="text-neutral-400 self-center" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400">
              No se encontraron resultados para "{query}"
            </div>
          )}
        </div>

        {/* Keyboard Footer */}
        <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1a1a1a] flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span>↑↓ para navegar</span>
            <span>↵ para abrir</span>
          </div>
          <span>{results.length} notas encontradas</span>
        </div>
      </div>
    </div>
  );
};
