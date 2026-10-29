import React from 'react';
import type { TableData } from '../../types';
import {
  Plus,
  Trash2,
  Table as TableIcon,
  Download,
  Calculator,
} from 'lucide-react';

interface TableBlockProps {
  tableData?: TableData;
  onChange: (newData: TableData) => void;
}

const DEFAULT_TABLE: TableData = {
  hasHeaderRow: true,
  columns: ['Tarea / Concepto', 'Responsable', 'Presupuesto ($)', 'Estado'],
  rows: [
    ['Diseño de interfaz Figma', 'Luchito', '150', 'Completado'],
    ['Desarrollo frontend React', 'Amigo', '300', 'En progreso'],
    ['Pruebas y despliegue final', 'Equipo', '100', 'Pendiente'],
  ],
  showCalculations: true,
};

export const TableBlock: React.FC<TableBlockProps> = ({ tableData, onChange }) => {
  const data = tableData && tableData.columns ? tableData : DEFAULT_TABLE;

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
    onChange({
      ...data,
      columns: nextCols,
      rows: nextRows,
    });
  };

  // Delete column
  const handleDeleteColumn = (colIndex: number) => {
    if (data.columns.length <= 1) return;
    const nextCols = data.columns.filter((_, idx) => idx !== colIndex);
    const nextRows = data.rows.map((r) => r.filter((_, idx) => idx !== colIndex));
    onChange({
      ...data,
      columns: nextCols,
      rows: nextRows,
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

  // Export Table to CSV (Excel format)
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [data.columns.join(','), ...data.rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tabla-notion-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Calculate sum or statistics for a column if values are numeric
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

  return (
    <div className="my-4 py-1 select-none overflow-x-auto">
      {/* Table Top Toolbar */}
      <div className="flex items-center justify-between mb-1.5 px-1 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <TableIcon size={14} className="text-amber-600 dark:text-amber-400" />
          <span className="font-semibold text-neutral-700 dark:text-neutral-200">
            Tabla estilo Excel ({data.rows.length} filas × {data.columns.length} columnas)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              onChange({
                ...data,
                showCalculations: !data.showCalculations,
              })
            }
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
              data.showCalculations
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
            title="Alternar fila de cálculos automáticos"
          >
            <Calculator size={12} />
            <span>Cálculos</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Descargar como archivo CSV para Excel"
          >
            <Download size={12} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="inline-block min-w-full border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-[#1f1f1f] shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          {/* Header */}
          <thead>
            <tr className="bg-[#f7f6f3] dark:bg-[#252525] border-b border-neutral-200 dark:border-neutral-800">
              <th className="w-8 px-2 py-2 text-center text-neutral-400 font-normal border-r border-neutral-200 dark:border-neutral-800">
                #
              </th>
              {data.columns.map((col, cIdx) => (
                <th
                  key={'col-' + cIdx}
                  className="group relative px-2.5 py-1.5 font-semibold text-neutral-700 dark:text-neutral-200 border-r border-neutral-200 dark:border-neutral-800 min-w-[130px]"
                >
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                      className="w-full bg-transparent border-none outline-hidden font-semibold text-xs text-neutral-700 dark:text-neutral-200 focus:bg-white dark:focus:bg-[#2e2e2e] rounded px-1"
                    />
                    {data.columns.length > 1 && (
                      <button
                        onClick={() => handleDeleteColumn(cIdx)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-opacity"
                        title="Eliminar columna"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-9 px-1 text-center bg-[#f0efe9] dark:bg-[#282828]">
                <button
                  onClick={handleAddColumn}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                  title="Añadir columna"
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
                <td className="px-2 py-1.5 text-center text-[10px] text-neutral-400 font-mono border-r border-neutral-200 dark:border-neutral-800 relative">
                  <span className="group-hover:hidden">{rIdx + 1}</span>
                  <button
                    onClick={() => handleDeleteRow(rIdx)}
                    className="hidden group-hover:inline-flex p-0.5 text-neutral-400 hover:text-red-500 rounded"
                    title="Eliminar fila"
                  >
                    <Trash2 size={11} />
                  </button>
                </td>

                {/* Cells */}
                {data.columns.map((_, cIdx) => (
                  <td
                    key={'cell-' + rIdx + '-' + cIdx}
                    className="p-0 border-r border-neutral-200/70 dark:border-neutral-800/80"
                  >
                    <input
                      type="text"
                      value={row[cIdx] || ''}
                      onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                      placeholder=""
                      className="w-full px-2.5 py-1.5 bg-transparent border-none outline-hidden text-xs text-[#37352f] dark:text-[#e6e6e5] focus:bg-amber-500/10 focus:ring-1 focus:ring-amber-500/50"
                    />
                  </td>
                ))}
                <td className="w-9 bg-[#faf9f6]/40 dark:bg-neutral-900/20" />
              </tr>
            ))}

            {/* Calculations Row (Optional Excel style) */}
            {data.showCalculations && (
              <tr className="bg-neutral-100/70 dark:bg-[#252525] border-t-2 border-neutral-200 dark:border-neutral-700 font-medium text-[11px] text-neutral-500">
                <td className="px-2 py-1.5 text-center font-bold text-amber-600 dark:text-amber-400 border-r border-neutral-200 dark:border-neutral-800">
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
                <td className="w-9" />
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
        </div>
      </div>
    </div>
  );
};
