import React, { useState } from 'react';
import { Video, Link, Trash2, RefreshCw } from 'lucide-react';

interface VideoBlockProps {
  content: string;
  onChange: (url: string) => void;
  onDelete: () => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ content, onChange, onDelete }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState(content || '');

  // Helper to extract embed url from YouTube / Vimeo / Direct
  const getEmbedUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';

    // YouTube: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo: https://vimeo.com/VIDEO_ID
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return rawUrl;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      const clean = inputUrl.trim();
      setVideoUrl(clean);
      onChange(clean);
      setInputUrl('');
    }
  };

  const embedUrl = getEmbedUrl(videoUrl);

  if (!videoUrl) {
    return (
      <div className="my-3 p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-[#fbfbfa] dark:bg-[#202020] text-xs select-none">
        <div className="flex items-center gap-2 mb-2 text-neutral-700 dark:text-neutral-200 font-semibold">
          <Video size={16} className="text-red-500" />
          <span>Insertar Video (YouTube o Vimeo)</span>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#282828] rounded-lg border border-neutral-200 dark:border-neutral-700">
            <Link size={13} className="text-neutral-400" />
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Pega un enlace de YouTube (ej. https://www.youtube.com/watch?v=...)"
              className="w-full bg-transparent border-none outline-hidden text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
            />
          </div>
          <button
            type="submit"
            disabled={!inputUrl.trim()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-40 transition-colors shadow-xs"
          >
            Embeber Video
          </button>
        </form>

        <div className="mt-2 text-[11px] text-neutral-400">
          Soporta enlaces estándar de YouTube, shorts, Vimeo y URLs de video MP4.
        </div>
      </div>
    );
  }

  return (
    <div className="my-3 group relative select-none max-w-3xl mx-auto">
      <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-md bg-black aspect-video">
        <iframe
          src={embedUrl}
          title="Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-none"
        />

        {/* Hover Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setVideoUrl('')}
            title="Cambiar video"
            className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs shadow-md transition-colors"
          >
            <RefreshCw size={13} />
          </button>

          <button
            onClick={onDelete}
            title="Eliminar video"
            className="p-1.5 rounded-md bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-xs shadow-md transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
