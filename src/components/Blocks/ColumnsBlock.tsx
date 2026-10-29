import React from 'react';
import type { ColumnsData, Block } from '../../types';
import { Columns2, Columns3, Plus, Trash2 } from 'lucide-react';

interface ColumnsBlockProps {
  columnsData?: ColumnsData;
  onChange: (newData: ColumnsData) => void;
}

const DEFAULT_COLUMNS: ColumnsData = {
  columns: [
    [
      { id: 'c1-1', type: 'h3', content: 'Columna Izquierda' },
      { id: 'c1-2', type: 'p', content: 'Texto descriptivo o notas rápidas de esta sección.' },
    ],
    [
      { id: 'c2-1', type: 'h3', content: 'Columna Derecha' },
      { id: 'c2-2', type: 'todo', content: 'Tarea en columna paralela', checked: false },
    ],
  ],
};

export const ColumnsBlock: React.FC<ColumnsBlockProps> = ({ columnsData, onChange }) => {
  const data = columnsData && columnsData.columns ? columnsData : DEFAULT_COLUMNS;

  const handleUpdateBlockInCol = (colIdx: number, blockIdx: number, newContent: string) => {
    const nextCols = data.columns.map((col, cIdx) => {
      if (cIdx === colIdx) {
        return col.map((b, bIdx) => {
          if (bIdx === blockIdx) {
            return { ...b, content: newContent };
          }
          return b;
        });
      }
      return col;
    });

    onChange({ columns: nextCols });
  };

  const handleAddBlockToCol = (colIdx: number) => {
    const newBlock: Block = {
      id: 'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      type: 'p',
      content: '',
    };

    const nextCols = data.columns.map((col, cIdx) => {
      if (cIdx === colIdx) {
        return [...col, newBlock];
      }
      return col;
    });

    onChange({ columns: nextCols });
  };

  const handleDeleteBlockInCol = (colIdx: number, blockIdx: number) => {
    const nextCols = data.columns.map((col, cIdx) => {
      if (cIdx === colIdx) {
        return col.filter((_, idx) => idx !== blockIdx);
      }
      return col;
    });
    onChange({ columns: nextCols });
  };

  const handleSetColumnsCount = (count: 2 | 3) => {
    if (count === 2 && data.columns.length === 3) {
      onChange({ columns: [data.columns[0], data.columns[1]] });
    } else if (count === 3 && data.columns.length === 2) {
      const thirdCol: Block[] = [
        { id: 'c3-1', type: 'h3', content: 'Tercera Columna' },
        { id: 'c3-2', type: 'p', content: 'Contenido adicional' },
      ];
      onChange({ columns: [...data.columns, thirdCol] });
    }
  };

  return (
    <div className="my-4 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6]/60 dark:bg-[#1e1e1e] select-none text-xs">
      {/* Header toolbar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200/60 dark:border-neutral-800 text-neutral-400">
        <span className="text-[11px] font-semibold uppercase text-neutral-500">
          Disposición en {data.columns.length} Columnas
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleSetColumnsCount(2)}
            className={`p-1 rounded ${
              data.columns.length === 2
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500'
            }`}
            title="2 columnas"
          >
            <Columns2 size={14} />
          </button>
          <button
            onClick={() => handleSetColumnsCount(3)}
            className={`p-1 rounded ${
              data.columns.length === 3
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500'
            }`}
            title="3 columnas"
          >
            <Columns3 size={14} />
          </button>
        </div>
      </div>

      {/* Columns Grid */}
      <div className={`grid gap-4 ${data.columns.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
        {data.columns.map((col, colIdx) => (
          <div
            key={'col-box-' + colIdx}
            className="p-3 bg-white dark:bg-[#252525] rounded-lg border border-neutral-200/70 dark:border-neutral-700/60 flex flex-col justify-between space-y-2 min-h-[140px]"
          >
            <div className="space-y-1.5 flex-1">
              {col.map((b, bIdx) => (
                <div key={b.id} className="group relative flex items-start gap-1">
                  <textarea
                    value={b.content}
                    onChange={(e) => handleUpdateBlockInCol(colIdx, bIdx, e.target.value)}
                    rows={1}
                    className={`w-full bg-transparent border-none outline-hidden resize-none leading-relaxed text-neutral-800 dark:text-neutral-100 ${
                      b.type === 'h3' ? 'font-bold text-sm text-neutral-900 dark:text-white' : 'text-xs'
                    }`}
                  />
                  <button
                    onClick={() => handleDeleteBlockInCol(colIdx, bIdx)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-500"
                    title="Eliminar elemento"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAddBlockToCol(colIdx)}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded transition-colors w-full"
            >
              <Plus size={12} />
              <span>Añadir línea</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
