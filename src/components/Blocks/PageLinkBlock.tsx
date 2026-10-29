import React from 'react';
import { useWorkspace } from '../../store/useWorkspace';
import { ArrowUpRight, FileText } from 'lucide-react';

interface PageLinkBlockProps {
  linkedPageId?: string;
  onChange: (pageId: string) => void;
}

export const PageLinkBlock: React.FC<PageLinkBlockProps> = ({ linkedPageId, onChange }) => {
  const { pages, setActivePageId } = useWorkspace();
  const activePages = pages.filter((p) => !p.isTrash);
  const targetPage = activePages.find((p) => p.id === linkedPageId);

  if (!targetPage) {
    return (
      <div className="my-2 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40 text-xs flex items-center gap-2">
        <FileText size={14} className="text-neutral-400" />
        <span className="text-neutral-500">Enlazar a página:</span>
        <select
          value={linkedPageId || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-white dark:bg-[#252525] p-1 rounded border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 outline-hidden"
        >
          <option value="">Selecciona una página de tu espacio...</option>
          {activePages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon || '📄'} {p.title || 'Sin título'}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="my-2 inline-block">
      <button
        onClick={() => setActivePageId(targetPage.id)}
        className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-amber-500/60 bg-white dark:bg-[#222222] shadow-xs hover:shadow-md text-xs transition-all group"
      >
        <span className="text-base">{targetPage.icon || '📄'}</span>
        <span className="font-semibold text-neutral-800 dark:text-neutral-100 group-hover:underline">
          {targetPage.title || 'Sin título'}
        </span>
        <ArrowUpRight size={13} className="text-neutral-400 group-hover:text-amber-600 transition-colors" />
      </button>
    </div>
  );
};
