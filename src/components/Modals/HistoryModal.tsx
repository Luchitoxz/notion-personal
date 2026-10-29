import React from 'react';
import { useWorkspace } from '../../store/useWorkspace';
import { History, X, RotateCcw, Clock, Save } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const { activePage, updatePage } = useWorkspace();

  if (!isOpen || !activePage) return null;

  const history = activePage.history || [];

  const handleCreateSnapshot = () => {
    const newSnapshot = {
      timestamp: Date.now(),
      title: activePage.title || 'Sin título',
      blocks: JSON.parse(JSON.stringify(activePage.blocks)),
    };

    updatePage(activePage.id, {
      history: [newSnapshot, ...history.slice(0, 9)], // Keep up to 10 versions
    });
  };

  const handleRestore = (index: number) => {
    const target = history[index];
    if (!target) return;

    if (window.confirm(`¿Restaurar la versión del ${new Date(target.timestamp).toLocaleString()}?`)) {
      updatePage(activePage.id, {
        title: target.title,
        blocks: target.blocks,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden text-sm flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <History size={16} className="text-amber-600 dark:text-amber-400" />
            <h2 className="font-semibold text-neutral-800 dark:text-neutral-100">
              Historial de Versiones
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Guarda puntos de restauración de esta página para volver atrás en cualquier momento.
          </span>
          <button
            onClick={handleCreateSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium shrink-0 ml-2 shadow-xs transition-colors"
          >
            <Save size={13} />
            <span>Crear punto de guardado</span>
          </button>
        </div>

        {/* History list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {history.length > 0 ? (
            history.map((item, idx) => (
              <div
                key={item.timestamp}
                className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-neutral-400" />
                    <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    "{item.title}" — {item.blocks.length} bloques guardados
                  </p>
                </div>

                <button
                  onClick={() => handleRestore(idx)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors shadow-xs"
                >
                  <RotateCcw size={12} />
                  <span>Restaurar</span>
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-1">
              <Clock size={24} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
              <p>Aún no hay puntos de guardado para esta página.</p>
              <p className="text-[11px]">Haz clic en "Crear punto de guardado" para registrar el estado actual.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
