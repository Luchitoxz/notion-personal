import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import { Sigma, Code2 } from 'lucide-react';

interface MathBlockProps {
  content: string;
  onChange: (val: string) => void;
}

const PRESET_FORMULAS = [
  { label: 'Einstein', code: 'E = mc^2' },
  { label: 'Ecuación Cuadrática', code: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { label: 'Integral Gaussiana', code: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}' },
  { label: 'Sumatoria', code: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
];

export const MathBlock: React.FC<MathBlockProps> = ({ content, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formula, setFormula] = useState(content || 'f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(formula || 'E = mc^2', containerRef.current, {
          displayMode: true,
          throwOnError: false,
        });
      } catch (e) {
        // Handled by throwOnError: false
      }
    }
  }, [formula]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(formula);
  };

  return (
    <div className="my-3 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#1f1f1f] select-none text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200/60 dark:border-neutral-800 text-neutral-500">
        <div className="flex items-center gap-2 font-medium">
          <Sigma size={15} className="text-amber-600 dark:text-amber-400" />
          <span className="font-semibold text-neutral-700 dark:text-neutral-200">
            Fórmula Matemática (LaTeX / KaTeX)
          </span>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 font-medium transition-colors"
        >
          <Code2 size={12} />
          <span>{isEditing ? 'Ver resultado' : 'Editar código LaTeX'}</span>
        </button>
      </div>

      {/* Editor view */}
      {isEditing && (
        <div className="space-y-2 mb-3">
          <textarea
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            onBlur={handleBlur}
            rows={2}
            placeholder="Introduce código LaTeX aquí (ej. E = mc^2)..."
            className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] font-mono text-xs text-neutral-800 dark:text-neutral-200 outline-hidden focus:border-amber-500"
            autoFocus
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-neutral-400 font-semibold uppercase">Fórmulas rápidas:</span>
            {PRESET_FORMULAS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setFormula(preset.code);
                  onChange(preset.code);
                }}
                className="px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rendered Math View */}
      <div
        onClick={() => setIsEditing(true)}
        className="py-3 px-4 rounded-lg bg-white dark:bg-[#262626] border border-neutral-200/70 dark:border-neutral-800/80 overflow-x-auto text-center cursor-pointer hover:border-amber-500/50 transition-colors"
        title="Haz clic para editar la fórmula LaTeX"
      >
        <div ref={containerRef} className="text-base text-neutral-900 dark:text-neutral-100" />
      </div>
    </div>
  );
};
