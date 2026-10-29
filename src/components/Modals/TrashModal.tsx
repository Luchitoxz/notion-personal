import React from 'react';
import { useWorkspace } from '../../store/useWorkspace';
import { X, Trash2, RotateCcw } from 'lucide-react';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({ isOpen, onClose }) => {
  const { trashPages, restorePage, permanentlyDeletePage } = useWorkspace();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden text-sm flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Trash2 size={17} className="text-neutral-500" />
            <h2 className="font-semibold text-neutral-800 dark:text-neutral-100">
              Papelera de reciclaje
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {trashPages.length > 0 ? (
            trashPages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base">{page.icon || '📄'}</span>
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {page.title.trim() ? page.title : 'Sin título'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => restorePage(page.id)}
                    title="Restaurar página"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
                  >
                    <RotateCcw size={13} />
                    <span>Restaurar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('¿Eliminar esta página de forma permanente? No se podrá recuperar.')) {
                        permanentlyDeletePage(page.id);
                      }
                    }}
                    title="Eliminar permanentemente"
                    className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400">
              La papelera está vacía.
            </div>
          )}
        </div>

        {/* Footer */}
        {trashPages.length > 0 && (
          <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1a1a1a] flex items-center justify-between text-xs text-neutral-500">
            <span>{trashPages.length} página(s) en papelera</span>
            <button
              onClick={() => {
                if (window.confirm('¿Deseas vaciar la papelera por completo?')) {
                  trashPages.forEach((p) => permanentlyDeletePage(p.id));
                }
              }}
              className="text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Vaciar papelera
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
