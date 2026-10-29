import React, { useState, useRef } from 'react';
import type { FileData } from '../../types';
import {
  FileText,
  Upload,
  Link,
  Trash2,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

interface PdfBlockProps {
  fileData?: FileData;
  content?: string;
  onChange: (fileData: FileData) => void;
  onDelete: () => void;
}

const SAMPLE_PDF = {
  name: 'Documento-Guia-Notion.pdf',
  size: '142 KB',
  url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  caption: 'Guía oficial de especificaciones y documentación de muestra',
};

export const PdfBlock: React.FC<PdfBlockProps> = ({ fileData, content, onChange, onDelete }) => {
  const [urlInput, setUrlInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pdfUrl = fileData?.url || (content && content.endsWith('.pdf') ? content : '');
  const fileName = fileData?.name || 'Documento PDF';
  const fileSize = fileData?.size || '';

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
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          url: dataUrl,
          caption: file.name,
          mimeType: 'application/pdf',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      const detectedName = urlInput.split('/').pop() || 'documento.pdf';
      onChange({
        name: detectedName,
        url: urlInput.trim(),
        caption: detectedName,
        mimeType: 'application/pdf',
      });
      setUrlInput('');
    }
  };

  // If no PDF attached yet, render selection card
  if (!pdfUrl) {
    return (
      <div className="my-3 p-4 rounded-xl border border-dashed border-red-300 dark:border-red-950 bg-red-50/30 dark:bg-red-950/20 text-xs select-none">
        <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-400 font-medium">
          <FileText size={16} />
          <span>Adjuntar o Enlazar Documento PDF</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Upload from PC */}
          <div className="p-3 bg-white dark:bg-[#282828] rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-xs transition-colors"
            >
              <Upload size={14} />
              <span>Subir PDF desde mi equipo</span>
            </button>
            <span className="text-[11px] text-neutral-400 mt-1.5">Archivos .pdf locales</span>
          </div>

          {/* Paste URL */}
          <form onSubmit={handleUrlSubmit} className="p-3 bg-white dark:bg-[#282828] rounded-lg border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700">
              <Link size={13} className="text-neutral-400" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Pega el enlace a un PDF web..."
                className="w-full bg-transparent border-none outline-hidden text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="mt-2 w-full py-1.5 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 rounded-md font-medium text-xs disabled:opacity-40"
            >
              Vincular PDF
            </button>
          </form>
        </div>

        {/* Preset sample */}
        <div className="mt-3 pt-2.5 border-t border-red-200/40 dark:border-red-900/40 flex items-center gap-2">
          <span className="text-[11px] text-neutral-500">O prueba con un documento de ejemplo:</span>
          <button
            onClick={() => onChange(SAMPLE_PDF)}
            className="px-2 py-0.5 rounded border border-red-200 dark:border-red-800 bg-white dark:bg-neutral-800 hover:bg-red-50 text-[11px] text-red-600 dark:text-red-400 font-medium"
          >
            PDF de Muestra
          </button>
        </div>
      </div>
    );
  }

  // Render Attached PDF Card with Viewer Toggle
  return (
    <div className="my-3 group select-none">
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-[#fcfbfa] dark:bg-[#222222] hover:shadow-xs transition-shadow">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 truncate">
                {fileName}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400">
                PDF
              </span>
            </div>
            {fileSize && <p className="text-[11px] text-neutral-400 mt-0.5">{fileSize}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#282828] hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-colors"
          >
            {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showPreview ? 'Ocultar visor' : 'Previsualizar'}</span>
          </button>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={fileName}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#282828] hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
            title="Abrir o Descargar PDF"
          >
            <Download size={14} />
          </a>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Reemplazar archivo PDF"
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#282828] hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={onDelete}
            title="Eliminar PDF"
            className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-white dark:bg-[#282828] hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Embedded PDF Viewer (Iframe) */}
      {showPreview && (
        <div className="mt-2 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-md bg-neutral-100 dark:bg-neutral-900">
          <iframe
            src={pdfUrl}
            title={fileName}
            className="w-full h-[520px] border-none"
          />
        </div>
      )}
    </div>
  );
};
