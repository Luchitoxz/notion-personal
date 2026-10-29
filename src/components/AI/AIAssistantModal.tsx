import React, { useState } from 'react';
import { useWorkspace } from '../../store/useWorkspace';
import { requestAICompletion } from '../../services/aiService';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  FileText,
  CheckSquare,
  Languages,
  PenTool,
  Lightbulb,
  PlusCircle,
  Copy,
  Check,
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBlockIndex?: number;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  targetBlockIndex,
}) => {
  const { activePage, settings, updateBlocks } = useWorkspace();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !activePage) return null;

  // Build document context string
  const contextContent = activePage.blocks
    .map((b) => b.content)
    .filter(Boolean)
    .join('\n');

  const handleRunAI = async (customPrompt?: string) => {
    const instruction = customPrompt || prompt;
    if (!instruction.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await requestAICompletion(
        instruction.trim(),
        contextContent,
        settings.ai
      );
      setResult(response);
    } catch (err: any) {
      setError(err?.message || 'Error al comunicarse con el proveedor de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertResult = () => {
    if (!result || !activePage) return;

    // Convert result into blocks: split by lines or headings
    const lines = result.split('\n').filter((l) => l.trim() !== '');
    const newBlocks = lines.map((line) => {
      let type: any = 'p';
      let content = line;

      if (line.startsWith('### ')) {
        type = 'h3';
        content = line.replace('### ', '');
      } else if (line.startsWith('## ')) {
        type = 'h2';
        content = line.replace('## ', '');
      } else if (line.startsWith('# ')) {
        type = 'h1';
        content = line.replace('# ', '');
      } else if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        type = 'todo';
        content = line.replace(/- \[[ x]\] /, '');
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        type = 'bullet';
        content = line.replace(/^[-*] /, '');
      } else if (/^\d+\.\s/.test(line)) {
        type = 'number';
        content = line.replace(/^\d+\.\s/, '');
      } else if (line.startsWith('> ')) {
        type = 'quote';
        content = line.replace('> ', '');
      }

      return {
        id: 'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        type,
        content,
      };
    });

    const nextBlocks = [...activePage.blocks];
    if (typeof targetBlockIndex === 'number' && targetBlockIndex >= 0) {
      nextBlocks.splice(targetBlockIndex + 1, 0, ...newBlocks);
    } else {
      nextBlocks.push(...newBlocks);
    }

    updateBlocks(activePage.id, nextBlocks);
    onClose();
  };

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden text-sm flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-amber-500/10 via-transparent to-purple-500/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles size={15} />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                Asistente de IA (Notion AI)
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 dark:bg-neutral-800 font-normal uppercase text-neutral-500">
                  {settings.ai.provider === 'demo' ? 'Modo Demo Activo' : settings.ai.provider}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Prompt Input Form */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAI();
            }}
            className="flex items-center gap-2 bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700 rounded-lg p-1.5 shadow-xs focus-within:border-amber-500"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="¿Qué deseas que la IA haga con esta nota o escriba?"
              className="flex-1 bg-transparent border-none outline-hidden px-2 text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="p-2 rounded-md bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white transition-opacity"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>

          {/* Quick preset actions */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {[
              { label: 'Resumir página', icon: <FileText size={12} />, cmd: 'Resume los puntos clave de esta página en viñetas claras' },
              { label: 'Generar tareas', icon: <CheckSquare size={12} />, cmd: 'Extrae una lista de tareas pendientes accionables basadas en esta nota' },
              { label: 'Continuar escribiendo', icon: <PenTool size={12} />, cmd: 'Continúa desarrollando el tema de esta nota con dos párrafos detallados' },
              { label: 'Lluvia de ideas', icon: <Lightbulb size={12} />, cmd: 'Genera 5 ideas creativas y estratégicas relacionadas con esta nota' },
              { label: 'Traducir al inglés', icon: <Languages size={12} />, cmd: 'Traduce el contenido principal de esta página al inglés profesional' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  setPrompt(action.cmd);
                  handleRunAI(action.cmd);
                }}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#282828] hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-[11px] transition-colors"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area / Result Display */}
        <div className="p-4 overflow-y-auto flex-1 min-h-[160px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-400 text-xs gap-2">
              <Loader2 size={24} className="animate-spin text-amber-600" />
              <span>Pensando y generando respuesta...</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs">
              <p className="font-medium">Ocurrió un error:</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-[#242424] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                {result}
              </div>

              {/* Result Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleCopyResult}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300"
                >
                  {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleInsertResult}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs"
                >
                  <PlusCircle size={14} />
                  <span>Insertar en la página</span>
                </button>
              </div>
            </div>
          )}

          {!result && !isLoading && !error && (
            <div className="text-center py-10 text-neutral-400 text-xs">
              <Sparkles size={28} className="mx-auto mb-2 text-amber-500/70" />
              <p className="font-medium text-neutral-600 dark:text-neutral-300">
                Pídele a la IA que redacte, resuma o mejore tus notas.
              </p>
              <p className="text-[11px] mt-1 text-neutral-400">
                Funciona sin configuración con el motor inteligente integrado, o puedes conectar tu propia API Key en Configuración.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
