import React from 'react';
import type { Block } from '../../types';
import { ListTree, Hash } from 'lucide-react';

interface TocBlockProps {
  allBlocks: Block[];
}

export const TocBlock: React.FC<TocBlockProps> = ({ allBlocks }) => {
  const headings = allBlocks.filter(
    (b) => (b.type === 'h1' || b.type === 'h2' || b.type === 'h3') && b.content.trim() !== ''
  );

  const scrollToHeading = (headingId: string) => {
    const el = document.getElementById(`heading-${headingId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="my-3 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#202020] select-none text-xs">
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-neutral-200/60 dark:border-neutral-800 font-semibold text-neutral-700 dark:text-neutral-200">
        <ListTree size={15} className="text-amber-600 dark:text-amber-400" />
        <span>Tabla de Contenidos (Índice)</span>
      </div>

      {headings.length > 0 ? (
        <div className="space-y-1">
          {headings.map((h) => {
            const indentClass =
              h.type === 'h1'
                ? 'pl-1 font-semibold text-neutral-800 dark:text-neutral-200 text-xs'
                : h.type === 'h2'
                ? 'pl-4 text-neutral-600 dark:text-neutral-400 text-xs'
                : 'pl-8 text-neutral-500 dark:text-neutral-500 text-[11px]';

            return (
              <button
                key={h.id}
                onClick={() => scrollToHeading(h.id)}
                className={`w-full text-left py-1 px-1.5 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 transition-colors flex items-center gap-1.5 truncate ${indentClass}`}
              >
                <Hash size={11} className="opacity-40 shrink-0" />
                <span className="truncate">{h.content}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-neutral-400 text-[11px] italic py-1">
          Crea títulos (H1, H2 o H3) en esta página para que aparezcan automáticamente aquí.
        </p>
      )}
    </div>
  );
};
