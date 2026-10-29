import React, { useState, useRef } from 'react';
import type { FileData } from '../../types';
import {
  Image as ImageIcon,
  Upload,
  Link,
  Trash2,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';

interface ImageBlockProps {
  fileData?: FileData;
  content?: string;
  onChange: (fileData: FileData) => void;
  onDelete: () => void;
}

const PRESET_IMAGES = [
  { label: 'Minimalista', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tecnología', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
  { label: 'Naturaleza', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80' },
];

export const ImageBlock: React.FC<ImageBlockProps> = ({ fileData, content, onChange, onDelete }) => {
  const [urlInput, setUrlInput] = useState('');
  const [caption, setCaption] = useState(fileData?.caption || '');
  const [fullWidth, setFullWidth] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = fileData?.url || (content && content.startsWith('http') ? content : '');

  // Local File Upload -> Base64 Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          url: dataUrl,
          caption: caption || file.name,
          mimeType: file.type,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange({
        name: 'Imagen web',
        url: urlInput.trim(),
        caption: caption || '',
      });
      setUrlInput('');
    }
  };

  const handleCaptionBlur = () => {
    if (fileData) {
      onChange({
        ...fileData,
        caption,
      });
    }
  };

  // If no image is configured yet, render upload / URL picker card
  if (!imageUrl) {
    return (
      <div className="my-3 p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-[#fbfbfa] dark:bg-[#222222] text-xs select-none">
        <div className="flex items-center gap-2 mb-3 text-neutral-600 dark:text-neutral-300 font-medium">
          <ImageIcon size={16} className="text-amber-600 dark:text-amber-400" />
          <span>Insertar Imagen</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Upload from PC */}
          <div className="p-3 bg-white dark:bg-[#282828] rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium shadow-xs transition-colors"
            >
              <Upload size={14} />
              <span>Subir desde mi equipo</span>
            </button>
            <span className="text-[11px] text-neutral-400 mt-1.5">PNG, JPG, WEBP, GIF</span>
          </div>

          {/* Paste URL */}
          <form onSubmit={handleUrlSubmit} className="p-3 bg-white dark:bg-[#282828] rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700">
              <Link size={13} className="text-neutral-400" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Pega el enlace de la imagen..."
                className="w-full bg-transparent border-none outline-hidden text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="mt-2 w-full py-1.5 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 rounded-md font-medium text-xs disabled:opacity-40"
            >
              Insertar enlace
            </button>
          </form>
        </div>

        {/* Quick presets */}
        <div className="mt-3 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center gap-2">
          <span className="text-[11px] text-neutral-400">O elige una foto de muestra:</span>
          <div className="flex gap-1.5">
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.label}
                onClick={() =>
                  onChange({
                    name: preset.label,
                    url: preset.url,
                    caption: preset.label,
                  })
                }
                className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Image Preview
  return (
    <div className={`my-3 group relative select-none ${fullWidth ? 'w-full' : 'max-w-2xl mx-auto'}`}>
      <div className="relative rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-xs bg-neutral-50 dark:bg-neutral-900">
        <img
          src={imageUrl}
          alt={caption || 'Imagen'}
          className="w-full h-auto max-h-[500px] object-cover block"
        />

        {/* Overlay Action Buttons on Hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setFullWidth(!fullWidth)}
            title={fullWidth ? 'Reducir tamaño' : 'Ancho completo'}
            className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs shadow-md transition-colors"
          >
            {fullWidth ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Reemplazar imagen"
            className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs shadow-md transition-colors"
          >
            <RefreshCw size={13} />
          </button>

          <button
            onClick={onDelete}
            title="Eliminar imagen"
            className="p-1.5 rounded-md bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-xs shadow-md transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Editable Caption */}
      <div className="mt-1.5 text-center">
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={handleCaptionBlur}
          placeholder="Escribe un pie de foto opcional..."
          className="w-full text-center text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:text-neutral-800 dark:focus:text-neutral-100 bg-transparent border-none outline-hidden"
        />
      </div>
    </div>
  );
};
