import React, { useState } from 'react';
import type { FileData } from '../../types';
import { Globe, ExternalLink, Link as LinkIcon, Trash2 } from 'lucide-react';

interface BookmarkBlockProps {
  fileData?: FileData;
  content?: string;
  onChange: (fileData: FileData) => void;
  onDelete: () => void;
}

export const BookmarkBlock: React.FC<BookmarkBlockProps> = ({ fileData, content, onChange, onDelete }) => {
  const [urlInput, setUrlInput] = useState('');
  const linkUrl = fileData?.url || content || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      let formattedUrl = urlInput.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }
      onChange({
        name: formattedUrl.replace(/^https?:\/\//, '').split('/')[0],
        url: formattedUrl,
        caption: formattedUrl,
      });
      setUrlInput('');
    }
  };

  if (!linkUrl) {
    return (
      <form
        onSubmit={handleSubmit}
        className="my-2 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-[#fcfbfa] dark:bg-[#202020] flex items-center gap-2 text-xs"
      >
        <LinkIcon size={14} className="text-neutral-400" />
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Pega un enlace web (ej. https://github.com)..."
          className="flex-1 bg-transparent border-none outline-hidden text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
        />
        <button
          type="submit"
          disabled={!urlInput.trim()}
          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium disabled:opacity-40"
        >
          Crear marcador
        </button>
      </form>
    );
  }

  const hostname = linkUrl.replace(/^https?:\/\//, '').split('/')[0];

  return (
    <div className="my-2 group relative">
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-amber-500/50 dark:hover:border-amber-500/50 bg-[#faf9f6] dark:bg-[#222222] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 shrink-0">
            <Globe size={15} />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
              {fileData?.name || hostname}
            </p>
            <p className="text-[11px] text-neutral-400 truncate">{linkUrl}</p>
          </div>
        </div>

        <ExternalLink size={14} className="text-neutral-400 group-hover:text-amber-600 shrink-0 ml-2" />
      </a>

      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
        title="Eliminar marcador"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};
