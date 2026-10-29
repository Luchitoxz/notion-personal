import React, { useState } from 'react';
import type { KanbanBoardData, KanbanCard } from '../../types';
import { Plus, Trash2, ArrowLeft, ArrowRight, Tag } from 'lucide-react';

interface KanbanBoardProps {
  boardData?: KanbanBoardData;
  onChange: (newData: KanbanBoardData) => void;
}

const DEFAULT_BOARD: KanbanBoardData = {
  columns: [
    { id: 'col-todo', title: 'Por hacer', cardIds: [] },
    { id: 'col-progress', title: 'En progreso', cardIds: [] },
    { id: 'col-done', title: 'Completado', cardIds: [] },
  ],
  cards: {},
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ boardData = DEFAULT_BOARD, onChange }) => {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [newCardColumnId, setNewCardColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  const data = boardData.columns ? boardData : DEFAULT_BOARD;

  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim()) {
      setNewCardColumnId(null);
      return;
    }

    const cardId = 'card-' + Date.now();
    const newCard: KanbanCard = {
      id: cardId,
      title: newCardTitle.trim(),
    };

    const nextColumns = data.columns.map((col) => {
      if (col.id === columnId) {
        return { ...col, cardIds: [...col.cardIds, cardId] };
      }
      return col;
    });

    onChange({
      columns: nextColumns,
      cards: { ...data.cards, [cardId]: newCard },
    });

    setNewCardTitle('');
    setNewCardColumnId(null);
  };

  const handleDeleteCard = (columnId: string, cardId: string) => {
    const nextColumns = data.columns.map((col) => {
      if (col.id === columnId) {
        return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
      }
      return col;
    });

    const nextCards = { ...data.cards };
    delete nextCards[cardId];

    onChange({
      columns: nextColumns,
      cards: nextCards,
    });
  };

  const handleMoveCard = (cardId: string, currentColId: string, direction: 'prev' | 'next') => {
    const colIndex = data.columns.findIndex((c) => c.id === currentColId);
    if (colIndex === -1) return;

    const targetColIndex = direction === 'next' ? colIndex + 1 : colIndex - 1;
    if (targetColIndex < 0 || targetColIndex >= data.columns.length) return;

    const targetColId = data.columns[targetColIndex].id;

    const nextColumns = data.columns.map((col) => {
      if (col.id === currentColId) {
        return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
      }
      if (col.id === targetColId) {
        return { ...col, cardIds: [...col.cardIds, cardId] };
      }
      return col;
    });

    onChange({
      ...data,
      columns: nextColumns,
    });
  };

  const handleUpdateCardTitle = (cardId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    onChange({
      ...data,
      cards: {
        ...data.cards,
        [cardId]: { ...data.cards[cardId], title: newTitle.trim() },
      },
    });
    setEditingCardId(null);
  };

  return (
    <div className="my-4 py-2 overflow-x-auto select-none">
      <div className="flex gap-4 min-w-[700px]">
        {data.columns.map((col, colIdx) => (
          <div
            key={col.id}
            className="flex-1 bg-[#f7f6f3] dark:bg-[#202020] rounded-xl p-3 border border-neutral-200/80 dark:border-neutral-800 flex flex-col min-h-[220px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-neutral-700 dark:text-neutral-200">
                  {col.title}
                </span>
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-neutral-500 font-medium">
                  {col.cardIds.length}
                </span>
              </div>
              <button
                onClick={() => {
                  setNewCardColumnId(col.id);
                  setNewCardTitle('');
                }}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500"
                title="Añadir tarjeta"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Cards List */}
            <div className="space-y-2 flex-1">
              {col.cardIds.map((cardId) => {
                const card = data.cards[cardId];
                if (!card) return null;

                const isEditing = editingCardId === cardId;

                return (
                  <div
                    key={cardId}
                    className="group relative bg-white dark:bg-[#282828] p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-700/60 shadow-xs hover:shadow-md transition-shadow duration-150"
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={card.title}
                        autoFocus
                        onBlur={(e) => handleUpdateCardTitle(cardId, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateCardTitle(cardId, (e.target as HTMLInputElement).value);
                          } else if (e.key === 'Escape') {
                            setEditingCardId(null);
                          }
                        }}
                        className="w-full text-xs bg-transparent border-b border-amber-500 outline-hidden pb-1"
                      />
                    ) : (
                      <div
                        onClick={() => setEditingCardId(cardId)}
                        className="text-xs text-neutral-800 dark:text-neutral-200 cursor-text font-normal leading-relaxed"
                      >
                        {card.title}
                      </div>
                    )}

                    {card.tag && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium">
                        <Tag size={10} />
                        <span>{card.tag}</span>
                      </div>
                    )}

                    {/* Quick navigation and delete arrows */}
                    <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        {colIdx > 0 && (
                          <button
                            onClick={() => handleMoveCard(cardId, col.id, 'prev')}
                            title="Mover a columna anterior"
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200"
                          >
                            <ArrowLeft size={12} />
                          </button>
                        )}
                        {colIdx < data.columns.length - 1 && (
                          <button
                            onClick={() => handleMoveCard(cardId, col.id, 'next')}
                            title="Mover a columna siguiente"
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200"
                          >
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteCard(col.id, cardId)}
                        title="Eliminar tarjeta"
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Card Form */}
              {newCardColumnId === col.id && (
                <div className="bg-white dark:bg-[#282828] p-2.5 rounded-lg border border-amber-500/70 shadow-xs">
                  <textarea
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="¿Qué tarea tienes pendiente?"
                    rows={2}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddCard(col.id);
                      } else if (e.key === 'Escape') {
                        setNewCardColumnId(null);
                      }
                    }}
                    className="w-full text-xs bg-transparent border-none outline-hidden resize-none text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
                  />
                  <div className="flex items-center justify-end gap-1.5 mt-2">
                    <button
                      onClick={() => setNewCardColumnId(null)}
                      className="px-2 py-1 text-[11px] rounded text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleAddCard(col.id)}
                      className="px-2.5 py-1 text-[11px] rounded bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick add bottom trigger */}
            {newCardColumnId !== col.id && (
              <button
                onClick={() => {
                  setNewCardColumnId(col.id);
                  setNewCardTitle('');
                }}
                className="mt-2 flex items-center gap-1.5 px-2 py-1.5 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors w-full"
              >
                <Plus size={14} />
                <span>Nueva tarjeta</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
