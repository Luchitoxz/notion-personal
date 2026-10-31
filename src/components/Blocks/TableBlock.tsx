import React, { useState, useEffect, useCallback } from 'react';
import type { TableData } from '../../types';
import {
  Plus,
  Trash2,
  Table as TableIcon,
  Download,
  Calculator,
  WrapText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

interface TableBlockProps {
  tableData?: TableData;
  onChange: (newData: TableData) => void;
}

const DEFAULT_WIDTH = 200;
const MIN_COL_WIDTH = 80;

const DEFAULT_TABLE: TableData = {
  hasHeaderRow: true,
  columns: ['Tarea / Concepto', 'Responsable', 'Presupuesto ($)', 'Estado'],
  columnWidths: [260, 160, 140, 150],
  rows: [
    ['Diseño de interfaz Figma y prototipo interactivo para la aplicación móvil', 'Luchito', '150', 'Completado'],
    ['Desarrollo frontend React con componentes modulares y sincronización en tiempo real', 'Amigo', '300', 'En progreso'],
    ['Pruebas de conectividad, exportación y despliegue final en la nube', 'Equipo', '100', 'Pendiente'],
  ],
  showCalculations: true,
  wrapCells: true,
};

export const TableBlock: React.FC<TableBlockProps> = ({ tableData, onChange }) => {
  const data = tableData && tableData.columns ? tableData : DEFAULT_TABLE;

  // Initialize or align column widths
  const getColWidths = useCallback((): number[] => {
    const existing = data.columnWidths || [];
    return data.columns.map((_, i) => existing[i] || DEFAULT_WIDTH);
  }, [data.columns, data.columnWidths]);

  const [widths, setWidths] = useState<number[]>(getColWidths);

  // Sync internal widths if columns length changes
  useEffect(() => {
    setWidths(getColWidths());
  }, [getColWidths]);

  // Resizing state
  const [resizing, setResizing] = useState<{
    colIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Auto-resize textarea heights
  const adjustTextareaHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(34, el.scrollHeight)}px`;
  };

  // Handle Drag Resizing (Mouse & Touch)
  const handleStartResize = (colIndex: number, clientX: number) => {
    setResizing({
      colIndex,
      startX: clientX,
      startWidth: widths[colIndex] || DEFAULT_WIDTH,
    });
  };

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const newWidth = Math.max(MIN_COL_WIDTH, resizing.startWidth + delta);
      setWidths((prev) => {
        const next = [...prev];
        next[resizing.colIndex] = newWidth;
        return next;
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const delta = e.touches[0].clientX - resizing.startX;
      const newWidth = Math.max(MIN_COL_WIDTH, resizing.startWidth + delta);
      setWidths((prev) => {
        const next = [...prev];
        next[resizing.colIndex] = newWidth;
        return next;
      });
    };

    const handleEndResize = () => {
      if (resizing) {
        onChange({
          ...data,
          columnWidths: widths,
        });
        setResizing(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEndResize);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEndResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndResize);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndResize);
    };
  }, [resizing, widths, data, onChange]);

  // Double click separator to auto-fit column to widest text content
  const handleAutoFitColumn = (colIndex: number) => {
    let maxLen = (data.columns[colIndex] || '').length;
    data.rows.forEach((r) => {
      const cellText = r[colIndex] || '';
      if (cellText.length > maxLen) {
        maxLen = cellText.length;
      }
    });

    // Approximate width: ~8.5px per character + padding, clamped between 120 and 500
    const estimatedWidth = Math.min(500, Math.max(120, maxLen * 8.5 + 32));
    const nextWidths = [...widths];
    nextWidths[colIndex] = Math.round(estimatedWidth);

    setWidths(nextWidths);
    onChange({
      ...data,
      columnWidths: nextWidths,
    });
  };

  // Adjust all column widths by a step (+40px or -40px)
  const handleZoomColumns = (delta: number) => {
    const nextWidths = widths.map((w) => Math.max(MIN_COL_WIDTH, w + delta));
    setWidths(nextWidths);
    onChange({
      ...data,
      columnWidths: nextWidths,
    });
  };

  // Reset columns to default width
  const handleResetWidths = () => {
    const nextWidths = data.columns.map(() => DEFAULT_WIDTH);
    setWidths(nextWidths);
    onChange({
      ...data,
      columnWidths: nextWidths,
    });
  };

  // Toggle wrap text mode
  const handleToggleWrap = () => {
    onChange({
      ...data,
      wrapCells: data.wrapCells === false ? true : false,
    });
  };

  // Handle cell text change
  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    const nextRows = data.rows.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const nextRow = [...row];
        nextRow[colIndex] = val;
        return nextRow;
      }
      return row;
    });

    onChange({
      ...data,
      rows: nextRows,
    });
  };

  // Handle column header change
  const handleHeaderChange = (colIndex: number, val: string) => {
    const nextCols = [...data.columns];
    nextCols[colIndex] = val;
    onChange({
      ...data,
      columns: nextCols,
    });
  };

  // Add new column
  const handleAddColumn = () => {
    const newColName = `Columna ${data.columns.length + 1}`;
    const nextCols = [...data.columns, newColName];
    const nextRows = data.rows.map((r) => [...r, '']);
    const nextWidths = [...widths, DEFAULT_WIDTH];

    setWidths(nextWidths);
    onChange({
      ...data,
      columns: nextCols,
      rows: nextRows,
      columnWidths: nextWidths,
    });
  };

  // Delete column
  const handleDeleteColumn = (colIndex: number) => {
    if (data.columns.length <= 1) return;
    const nextCols = data.columns.filter((_, idx) => idx !== colIndex);
    const nextRows = data.rows.map((r) => r.filter((_, idx) => idx !== colIndex));
    const nextWidths = widths.filter((_, idx) => idx !== colIndex);

    setWidths(nextWidths);
    onChange({
      ...data,
      columns: nextCols,
      rows: nextRows,
      columnWidths: nextWidths,
    });
  };

  // Add new row
  const handleAddRow = () => {
    const emptyRow = new Array(data.columns.length).fill('');
    onChange({
      ...data,
      rows: [...data.rows, emptyRow],
    });
  };

  // Delete row
  const handleDeleteRow = (rowIndex: number) => {
    if (data.rows.length <= 1) return;
    const nextRows = data.rows.filter((_, idx) => idx !== rowIndex);
    onChange({
      ...data,
      rows: nextRows,
    });
  };

  // Export Table to CSV
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [data.columns.join(','), ...data.rows.map((e) => e.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tabla-notion-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Calculate sum or statistics for a column
  const calculateColumnSummary = (colIndex: number) => {
    let sum = 0;
    let numericCount = 0;

    data.rows.forEach((row) => {
      const val = parseFloat((row[colIndex] || '').replace(/[^0-9.-]/g, ''));
      if (!isNaN(val)) {
        sum += val;
        numericCount++;
      }
    });

    if (numericCount > 0) {
      return `Total: ${sum.toLocaleString()}`;
    }
    return `Recuento: ${data.rows.length}`;
  };

  const isWrapEnabled = data.wrapCells !== false;
  const totalTableWidth = 40 + widths.reduce((acc, w) => acc + w, 0) + 40;

  return (
    <div className="my-4 py-1 select-none">
      {/* Table Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <TableIcon size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Tabla estilo Excel ({data.rows.length} filas × {data.columns.length} columnas)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Toggle Wrap Cells */}
          <button
            onClick={handleToggleWrap}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors shadow-2xs ${
              isWrapEnabled
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60'
                : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
            title="Ajustar texto en celdas (expansión vertical sin cortes)"
          >
            <WrapText size={12} />
            <span>{isWrapEnabled ? 'Ajuste de texto activo' : 'Ajustar texto'}</span>
          </button>

          {/* Enlarge / Shrink all columns */}
          <div className="flex items-center rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-0.5 shadow-2xs">
            <button
              onClick={() => handleZoomColumns(40)}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
              title="Agrandar ancho de columnas (+40px)"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={() => handleZoomColumns(-40)}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
              title="Reducir ancho de columnas (-40px)"
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={handleResetWidths}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              title="Restablecer anchos por defecto (200px)"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Toggle Calculations */}
          <button
            onClick={() =>
              onChange({
                ...data,
                showCalculations: !data.showCalculations,
              })
            }
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors shadow-2xs ${
              data.showCalculations
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
            title="Alternar fila de cálculos automáticos (SUM / Recuento)"
          >
            <Calculator size={12} />
            <span>Cálculos</span>
          </button>

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors shadow-2xs"
            title="Descargar como archivo CSV para abrir en Excel o Google Sheets"
          >
            <Download size={12} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Grid Container with smooth horizontal scrolling */}
      <div className="w-full overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f] shadow-xs">
        <table
          className="text-left text-xs border-collapse table-fixed"
          style={{ width: `${Math.max(600, totalTableWidth)}px` }}
        >
          {/* Column Group for strict pixel-perfect widths */}
          <colgroup>
            <col style={{ width: '40px' }} />
            {data.columns.map((_, cIdx) => (
              <col key={'col-width-' + cIdx} style={{ width: `${widths[cIdx] || DEFAULT_WIDTH}px` }} />
            ))}
            <col style={{ width: '40px' }} />
          </colgroup>

          {/* Header */}
          <thead>
            <tr className="bg-[#f7f6f3] dark:bg-[#252525] border-b border-neutral-200 dark:border-neutral-800">
              <th className="w-10 px-2 py-2 text-center text-neutral-400 font-normal border-r border-neutral-200 dark:border-neutral-800 select-none">
                #
              </th>

              {data.columns.map((col, cIdx) => (
                <th
                  key={'col-' + cIdx}
                  className="group relative px-2.5 py-1.5 font-semibold text-neutral-700 dark:text-neutral-200 border-r border-neutral-200 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between gap-1 pr-2">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                      className="w-full bg-transparent border-none outline-hidden font-semibold text-xs text-neutral-800 dark:text-neutral-200 focus:bg-white dark:focus:bg-[#2e2e2e] rounded px-1"
                    />

                    {data.columns.length > 1 && (
                      <button
                        onClick={() => handleDeleteColumn(cIdx)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-opacity shrink-0"
                        title="Eliminar columna"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Draggable Column Width Handle */}
                  <div
                    onMouseDown={(e) => handleStartResize(cIdx, e.clientX)}
                    onTouchStart={(e) => e.touches[0] && handleStartResize(cIdx, e.touches[0].clientX)}
                    onDoubleClick={() => handleAutoFitColumn(cIdx)}
                    title="Arrastra para cambiar el ancho (o doble clic para auto-ajustar)"
                    className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10 hover:bg-amber-500/50 transition-colors ${
                      resizing?.colIndex === cIdx ? 'bg-amber-500' : 'bg-transparent'
                    }`}
                  >
                    <div className="w-[1px] h-full bg-neutral-200 dark:bg-neutral-700 mx-auto group-hover:bg-amber-500" />
                  </div>
                </th>
              ))}

              {/* Add column th */}
              <th className="w-10 px-1 text-center bg-[#f0efe9] dark:bg-[#282828] select-none">
                <button
                  onClick={handleAddColumn}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
                  title="Añadir nueva columna"
                >
                  <Plus size={14} />
                </button>
              </th>
            </tr>
          </thead>

          {/* Rows */}
          <tbody>
            {data.rows.map((row, rIdx) => (
              <tr
                key={'row-' + rIdx}
                className="group border-b border-neutral-200/70 dark:border-neutral-800/80 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
              >
                {/* Row Number & Delete handle */}
                <td className="px-2 py-2 text-center text-[10px] text-neutral-400 font-mono border-r border-neutral-200 dark:border-neutral-800 align-top select-none relative">
                  <span className="group-hover:hidden">{rIdx + 1}</span>
                  <button
                    onClick={() => handleDeleteRow(rIdx)}
                    className="hidden group-hover:inline-flex p-0.5 text-neutral-400 hover:text-red-500 rounded"
                    title="Eliminar fila"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>

                {/* Cells with multiline auto-expanding textarea */}
                {data.columns.map((_, cIdx) => (
                  <td
                    key={'cell-' + rIdx + '-' + cIdx}
                    className="p-0 border-r border-neutral-200/70 dark:border-neutral-800/80 align-top"
                  >
                    <textarea
                      value={row[cIdx] || ''}
                      onChange={(e) => {
                        handleCellChange(rIdx, cIdx, e.target.value);
                        adjustTextareaHeight(e.target);
                      }}
                      onFocus={(e) => adjustTextareaHeight(e.target)}
                      rows={1}
                      placeholder=""
                      className={`w-full px-2.5 py-1.5 bg-transparent border-none outline-hidden text-xs text-[#37352f] dark:text-[#e6e6e5] resize-none focus:bg-amber-500/10 focus:ring-1 focus:ring-amber-500/50 leading-relaxed block overflow-hidden transition-all ${
                        isWrapEnabled
                          ? 'whitespace-pre-wrap break-words'
                          : 'truncate whitespace-nowrap'
                      }`}
                      style={{
                        minHeight: '34px',
                      }}
                      ref={(el) => adjustTextareaHeight(el)}
                    />
                  </td>
                ))}

                <td className="w-10 bg-[#faf9f6]/40 dark:bg-neutral-900/20" />
              </tr>
            ))}

            {/* Calculations Row (Optional Excel style) */}
            {data.showCalculations && (
              <tr className="bg-neutral-100/70 dark:bg-[#252525] border-t-2 border-neutral-200 dark:border-neutral-700 font-medium text-[11px] text-neutral-500">
                <td className="px-2 py-1.5 text-center font-bold text-amber-600 dark:text-amber-400 border-r border-neutral-200 dark:border-neutral-800 select-none">
                  ∑
                </td>
                {data.columns.map((_, cIdx) => (
                  <td
                    key={'calc-' + cIdx}
                    className="px-2.5 py-1.5 border-r border-neutral-200 dark:border-neutral-800 font-mono text-[11px] text-neutral-600 dark:text-neutral-300"
                  >
                    {calculateColumnSummary(cIdx)}
                  </td>
                ))}
                <td className="w-10" />
              </tr>
            )}
          </tbody>
        </table>

        {/* Bottom row adder */}
        <div className="p-1.5 bg-[#faf9f6] dark:bg-[#202020] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition-colors font-medium"
          >
            <Plus size={13} />
            <span>Añadir fila</span>
          </button>

          <span className="text-[11px] text-neutral-400 pr-2">
            Tip: Arrastra el borde derecho de cualquier encabezado para agrandar la columna.
          </span>
        </div>
      </div>
    </div>
  );
};
