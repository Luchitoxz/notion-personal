import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Network, Code2 } from 'lucide-react';

interface MermaidBlockProps {
  content: string;
  onChange: (val: string) => void;
}

const DEFAULT_CHART = `graph TD
  A[💡 Idea o Requerimiento] --> B[📐 Planificación & Diseño]
  B --> C{¿Aprobado?}
  C -->|Sí| D[💻 Desarrollo en React]
  C -->|No| B
  D --> E[🚀 Despliegue en Producción]`;

const PRESETS = [
  {
    label: 'Diagrama de Flujo',
    code: DEFAULT_CHART,
  },
  {
    label: 'Diagrama de Secuencia',
    code: `sequenceDiagram
  autonumber
  actor Usuario
  participant Notion as Notion Clone
  participant DB as LocalStorage / P2P
  Usuario->>Notion: Escribe nota o bloque
  Notion->>DB: Autoguardado instantáneo
  DB-->>Notion: Confirmado (0ms)
  Notion-->>Usuario: Estado sincronizado`,
  },
  {
    label: 'Arquitectura de Sistema',
    code: `graph LR
  Client[🌐 Navegador Web] --> App[⚡ React + Vite]
  App --> Editor[📝 Block Editor]
  App --> AI[✨ Notion AI]
  App --> P2P[👥 WebRTC P2P Room]`,
  },
];

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ content, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(content || DEFAULT_CHART);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const renderId = useRef('mermaid-' + Math.random().toString(36).slice(2, 8));

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      securityLevel: 'loose',
    });

    const renderDiagram = async () => {
      try {
        setRenderError(null);
        const { svg } = await mermaid.render(renderId.current, code || DEFAULT_CHART);
        setSvgHtml(svg);
      } catch (err: any) {
        setRenderError('Error de sintaxis en el diagrama Mermaid');
      }
    };

    renderDiagram();
  }, [code]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(code);
  };

  return (
    <div className="my-3 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#1f1f1f] select-none text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200/60 dark:border-neutral-800 text-neutral-500">
        <div className="flex items-center gap-2 font-medium">
          <Network size={15} className="text-amber-600 dark:text-amber-400" />
          <span className="font-semibold text-neutral-700 dark:text-neutral-200">
            Diagrama Interactivo (Mermaid.js)
          </span>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 font-medium transition-colors"
        >
          <Code2 size={12} />
          <span>{isEditing ? 'Ver diagrama' : 'Editar código'}</span>
        </button>
      </div>

      {/* Editor textarea */}
      {isEditing && (
        <div className="space-y-2 mb-3">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={handleBlur}
            rows={6}
            placeholder="Introduce la definición de Mermaid..."
            className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] font-mono text-xs text-neutral-800 dark:text-neutral-200 outline-hidden focus:border-amber-500"
            autoFocus
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-neutral-400 font-semibold uppercase">Plantillas:</span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setCode(p.code);
                  onChange(p.code);
                }}
                className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Diagram SVG Preview */}
      {renderError ? (
        <div className="p-3 text-center text-xs text-red-500 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-800">
          {renderError}
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="py-4 px-3 rounded-lg bg-white dark:bg-[#262626] border border-neutral-200/70 dark:border-neutral-800/80 overflow-x-auto flex items-center justify-center cursor-pointer hover:border-amber-500/50 transition-colors"
          title="Haz clic para editar el diagrama"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      )}
    </div>
  );
};
