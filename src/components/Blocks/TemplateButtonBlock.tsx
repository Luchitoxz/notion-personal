import React, { useState } from 'react';
import type { Block, TemplateButtonData } from '../../types';
import { PlusCircle, Settings } from 'lucide-react';

interface TemplateButtonBlockProps {
  templateData?: TemplateButtonData;
  onSpawnBlocks: (blocks: Block[]) => void;
  onUpdate: (data: TemplateButtonData) => void;
}

const DEFAULT_TEMPLATE: TemplateButtonData = {
  buttonText: 'Añadir nueva entrada de registro diario',
  templateBlocks: [
    { id: 't-1', type: 'h3', content: `📅 Registro del ${new Date().toLocaleDateString('es-ES')}` },
    { id: 't-2', type: 'callout', content: '¿Cuáles son las 3 prioridades del día de hoy?', icon: '🎯' },
    { id: 't-3', type: 'todo', content: 'Prioridad 1:', checked: false },
    { id: 't-4', type: 'todo', content: 'Prioridad 2:', checked: false },
    { id: 't-5', type: 'todo', content: 'Prioridad 3:', checked: false },
    { id: 't-6', type: 'p', content: '' },
  ],
};

export const TemplateButtonBlock: React.FC<TemplateButtonBlockProps> = ({
  templateData,
  onSpawnBlocks,
  onUpdate,
}) => {
  const data = templateData && templateData.buttonText ? templateData : DEFAULT_TEMPLATE;
  const [isEditing, setIsEditing] = useState(false);
  const [buttonText, setButtonText] = useState(data.buttonText);

  const handleSpawn = () => {
    // Generate fresh IDs for spawned blocks
    const cloned = data.templateBlocks.map((b) => ({
      ...b,
      id: 'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    }));
    onSpawnBlocks(cloned);
  };

  const handleSaveText = () => {
    onUpdate({
      ...data,
      buttonText,
    });
    setIsEditing(false);
  };

  return (
    <div className="my-3 select-none text-xs">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSpawn}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs transition-colors"
        >
          <PlusCircle size={15} />
          <span>{data.buttonText}</span>
        </button>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          title="Configurar texto del botón"
        >
          <Settings size={14} />
        </button>
      </div>

      {isEditing && (
        <div className="mt-2 p-3 bg-[#faf9f6] dark:bg-[#202020] rounded-xl border border-neutral-200 dark:border-neutral-700 max-w-md">
          <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
            Texto del botón de plantilla
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              className="flex-1 px-2.5 py-1 bg-white dark:bg-[#282828] border border-neutral-300 dark:border-neutral-700 rounded-md text-xs text-neutral-800 dark:text-neutral-100"
            />
            <button
              onClick={handleSaveText}
              className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-md font-medium text-xs"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
