import React, { useState, useRef, useEffect } from 'react';
import type { Block, BlockType } from '../../types';
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  Check,
  CopyCheck,
  Sparkles,
} from 'lucide-react';
import { SlashMenu } from './SlashMenu';
import { KanbanBoard } from '../Kanban/KanbanBoard';
import { TableBlock } from '../Blocks/TableBlock';
import { ImageBlock } from '../Blocks/ImageBlock';
import { PdfBlock } from '../Blocks/PdfBlock';
import { BookmarkBlock } from '../Blocks/BookmarkBlock';
import { TocBlock } from '../Blocks/TocBlock';
import { MathBlock } from '../Blocks/MathBlock';
import { MermaidBlock } from '../Blocks/MermaidBlock';
import { VideoBlock } from '../Blocks/VideoBlock';
import { CalendarBlock } from '../Blocks/CalendarBlock';
import { ColumnsBlock } from '../Blocks/ColumnsBlock';
import { PageLinkBlock } from '../Blocks/PageLinkBlock';
import { TemplateButtonBlock } from '../Blocks/TemplateButtonBlock';

interface BlockItemProps {
  block: Block;
  index: number;
  totalBlocks: number;
  allBlocks?: Block[];
  isLocked?: boolean;
  onUpdate: (updatedBlock: Block) => void;
  onInsertBelow: (type?: BlockType) => void;
  onDelete: () => void;
  onOpenAI?: () => void;
  onSpawnTemplateBlocks?: (blocks: Block[]) => void;
  onFocusPrevious?: () => void;
  onFocusNext?: () => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  totalBlocks,
  allBlocks = [],
  isLocked = false,
  onUpdate,
  onInsertBelow,
  onDelete,
  onOpenAI,
  onSpawnTemplateBlocks,
  onFocusPrevious,
  onFocusNext,
}) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit text without scrollbar
  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = `${textRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isLocked) return;
    const val = e.target.value;

    // Live Markdown shortcuts for paragraphs
    if (block.type === 'p') {
      if (val === '# ') {
        onUpdate({ ...block, type: 'h1', content: '' });
        return;
      }
      if (val === '## ') {
        onUpdate({ ...block, type: 'h2', content: '' });
        return;
      }
      if (val === '### ') {
        onUpdate({ ...block, type: 'h3', content: '' });
        return;
      }
      if (val === '[] ' || val === '[ ] ') {
        onUpdate({ ...block, type: 'todo', content: '', checked: false });
        return;
      }
      if (val === '- ' || val === '* ') {
        onUpdate({ ...block, type: 'bullet', content: '' });
        return;
      }
      if (val === '1. ') {
        onUpdate({ ...block, type: 'number', content: '' });
        return;
      }
      if (val === '> ') {
        onUpdate({ ...block, type: 'quote', content: '' });
        return;
      }
      if (val === '---' || val === '***') {
        onUpdate({ ...block, type: 'divider', content: '' });
        return;
      }
      if (val.startsWith('```')) {
        const lang = val.slice(3).trim();
        onUpdate({ ...block, type: 'code', content: '', language: lang || 'typescript' });
        return;
      }
    }

    // Check if user is typing a slash command
    if (val.startsWith('/')) {
      setShowSlashMenu(true);
      setSlashFilter(val.slice(1));
    } else {
      setShowSlashMenu(false);
      setSlashFilter('');
    }

    onUpdate({ ...block, content: val });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isLocked) return;

    if (showSlashMenu) {
      if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
        return; // Handled by SlashMenu
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onInsertBelow();
    } else if (e.key === 'Backspace' && block.content === '' && totalBlocks > 1) {
      e.preventDefault();
      onDelete();
      onFocusPrevious?.();
    } else if (e.key === 'ArrowUp' && textRef.current?.selectionStart === 0) {
      onFocusPrevious?.();
    } else if (
      e.key === 'ArrowDown' &&
      textRef.current?.selectionStart === block.content.length
    ) {
      onFocusNext?.();
    }
  };

  const handleSlashSelect = (newType: BlockType | 'ai') => {
    setShowSlashMenu(false);
    if (newType === 'ai') {
      onUpdate({ ...block, content: '' });
      onOpenAI?.();
      return;
    }
    onUpdate({
      ...block,
      type: newType,
      content: '',
    });
    setTimeout(() => textRef.current?.focus(), 50);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(block.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="group relative flex items-start gap-1 py-1 -ml-7 pl-7 rounded-sm">
      {/* Block Handle Controls (Visible on Hover if not locked) */}
      {!isLocked && (
        <div className="absolute left-0 top-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity select-none text-neutral-400">
          <button
            onClick={() => onInsertBelow()}
            title="Añadir bloque abajo"
            className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <Plus size={14} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              title="Opciones del bloque"
              className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-grab"
            >
              <GripVertical size={14} />
            </button>

            {/* Options Dropdown */}
            {showOptionsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowOptionsMenu(false)}
                />
                <div className="absolute left-6 top-0 z-50 w-48 bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 py-1 text-xs select-none">
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onOpenAI?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-amber-600 dark:text-amber-400 font-medium"
                  >
                    <Sparkles size={13} />
                    <span>Preguntar a la IA</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertBelow(block.type);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  >
                    <Copy size={13} />
                    <span>Duplicar</span>
                  </button>
                  <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                  <button
                    onClick={() => {
                      onDelete();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                  >
                    <Trash2 size={13} />
                    <span>Eliminar bloque</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Block Body Rendering */}
      <div className="flex-1 min-w-0 relative">
        {/* Paragraph */}
        {block.type === 'p' && (
          <textarea
            ref={textRef}
            readOnly={isLocked}
            value={block.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={index === 0 && !isLocked ? "Escribe algo, '#' para títulos o '/' para comandos..." : ''}
            className="w-full bg-transparent border-none outline-hidden resize-none text-sm text-[#37352f] dark:text-[#e6e6e5] placeholder-neutral-400/80 leading-relaxed overflow-hidden block py-0.5"
          />
        )}

        {/* Heading 1 */}
        {block.type === 'h1' && (
          <textarea
            id={`heading-${block.id}`}
            ref={textRef}
            readOnly={isLocked}
            value={block.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Título 1..."
            className="w-full bg-transparent border-none outline-hidden resize-none text-2xl md:text-3xl font-bold text-[#37352f] dark:text-[#e6e6e5] placeholder-neutral-400/80 leading-tight overflow-hidden block pt-3 pb-1"
          />
        )}

        {/* Heading 2 */}
        {block.type === 'h2' && (
          <textarea
            id={`heading-${block.id}`}
            ref={textRef}
            readOnly={isLocked}
            value={block.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Título 2..."
            className="w-full bg-transparent border-none outline-hidden resize-none text-xl md:text-2xl font-bold text-[#37352f] dark:text-[#e6e6e5] placeholder-neutral-400/80 leading-snug overflow-hidden block pt-2 pb-1"
          />
        )}

        {/* Heading 3 */}
        {block.type === 'h3' && (
          <textarea
            id={`heading-${block.id}`}
            ref={textRef}
            readOnly={isLocked}
            value={block.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Título 3..."
            className="w-full bg-transparent border-none outline-hidden resize-none text-lg font-bold text-[#37352f] dark:text-[#e6e6e5] placeholder-neutral-400/80 leading-snug overflow-hidden block pt-1.5 pb-0.5"
          />
        )}

        {/* To-Do Checklist */}
        {block.type === 'todo' && (
          <div className="flex items-start gap-2 py-0.5">
            <button
              disabled={isLocked}
              onClick={() => onUpdate({ ...block, checked: !block.checked })}
              className="mt-1 text-neutral-400 hover:text-amber-600 transition-colors disabled:cursor-default"
            >
              {block.checked ? (
                <div className="w-4 h-4 rounded bg-amber-600 text-white flex items-center justify-center">
                  <Check size={12} strokeWidth={3} />
                </div>
              ) : (
                <div className="w-4 h-4 rounded border border-neutral-400/80 hover:border-neutral-600 dark:hover:border-neutral-300" />
              )}
            </button>
            <textarea
              ref={textRef}
              readOnly={isLocked}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Tarea por hacer..."
              className={`flex-1 bg-transparent border-none outline-hidden resize-none text-sm leading-relaxed overflow-hidden py-0.5 transition-all ${
                block.checked
                  ? 'line-through text-neutral-400 dark:text-neutral-500'
                  : 'text-[#37352f] dark:text-[#e6e6e5]'
              }`}
            />
          </div>
        )}

        {/* Bullet List */}
        {block.type === 'bullet' && (
          <div className="flex items-start gap-2.5 py-0.5">
            <span className="text-base leading-relaxed select-none text-neutral-500">•</span>
            <textarea
              ref={textRef}
              readOnly={isLocked}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Elemento de lista..."
              className="flex-1 bg-transparent border-none outline-hidden resize-none text-sm text-[#37352f] dark:text-[#e6e6e5] leading-relaxed overflow-hidden py-0.5"
            />
          </div>
        )}

        {/* Numbered List */}
        {block.type === 'number' && (
          <div className="flex items-start gap-2 py-0.5">
            <span className="text-sm font-medium leading-relaxed select-none text-neutral-500 w-4">
              1.
            </span>
            <textarea
              ref={textRef}
              readOnly={isLocked}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Elemento numerado..."
              className="flex-1 bg-transparent border-none outline-hidden resize-none text-sm text-[#37352f] dark:text-[#e6e6e5] leading-relaxed overflow-hidden py-0.5"
            />
          </div>
        )}

        {/* Toggle List */}
        {block.type === 'toggle' && (
          <div className="py-0.5">
            <div className="flex items-start gap-1.5">
              <button
                onClick={() => onUpdate({ ...block, expanded: !block.expanded })}
                className="mt-1 p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-transform"
              >
                <ChevronRight
                  size={15}
                  className={`transition-transform duration-150 ${
                    block.expanded ? 'rotate-90' : ''
                  }`}
                />
              </button>
              <textarea
                ref={textRef}
                readOnly={isLocked}
                value={block.content}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Encabezado desplegable..."
                className="flex-1 font-medium bg-transparent border-none outline-hidden resize-none text-sm text-[#37352f] dark:text-[#e6e6e5] leading-relaxed overflow-hidden py-0.5"
              />
            </div>
            {block.expanded && (
              <div className="pl-6 pt-1 text-xs text-neutral-500 italic">
                (Contenido desplegado anidado)
              </div>
            )}
          </div>
        )}

        {/* Quote */}
        {block.type === 'quote' && (
          <div className="border-l-3 border-neutral-400 dark:border-neutral-600 pl-3.5 py-0.5 my-1">
            <textarea
              ref={textRef}
              readOnly={isLocked}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Escribe una cita..."
              className="w-full bg-transparent border-none outline-hidden resize-none text-sm italic text-[#37352f] dark:text-[#e6e6e5] leading-relaxed overflow-hidden py-0.5"
            />
          </div>
        )}

        {/* Callout */}
        {block.type === 'callout' && (
          <div className="flex items-start gap-3 p-3 my-1.5 rounded-xl bg-[#f7f6f3] dark:bg-[#242424] border border-neutral-200/60 dark:border-neutral-800">
            <span className="text-xl leading-none select-none mt-0.5">
              {block.icon || '💡'}
            </span>
            <textarea
              ref={textRef}
              readOnly={isLocked}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Nota destacada o recordatorio..."
              className="flex-1 bg-transparent border-none outline-hidden resize-none text-sm text-[#37352f] dark:text-[#e6e6e5] leading-relaxed overflow-hidden py-0.5"
            />
          </div>
        )}

        {/* Code Block */}
        {block.type === 'code' && (
          <div className="my-2 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[#f2f1ee] dark:bg-[#1f1f1f]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-200/50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 font-mono">
              <span>{block.language || 'typescript'}</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                {isCopied ? (
                  <>
                    <CopyCheck size={13} className="text-emerald-500" />
                    <span className="text-emerald-500 font-sans">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span className="font-sans">Copiar</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              ref={textRef}
              readOnly={isLocked}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="// Escribe o pega código aquí..."
              className="w-full p-3 font-mono text-xs bg-transparent border-none outline-hidden resize-none text-[#37352f] dark:text-[#e6e6e5] leading-relaxed overflow-hidden block"
            />
          </div>
        )}

        {/* Divider */}
        {block.type === 'divider' && (
          <div className="py-2">
            <hr className="border-t border-neutral-200 dark:border-neutral-800" />
          </div>
        )}

        {/* Kanban Board Block */}
        {block.type === 'board' && (
          <KanbanBoard
            boardData={block.boardData}
            onChange={(newBoard) => onUpdate({ ...block, boardData: newBoard })}
          />
        )}

        {/* Excel-Style Table Block */}
        {block.type === 'table' && (
          <TableBlock
            tableData={block.tableData}
            onChange={(newTable) => onUpdate({ ...block, tableData: newTable })}
          />
        )}

        {/* Image Block */}
        {block.type === 'image' && (
          <ImageBlock
            fileData={block.fileData}
            content={block.content}
            onChange={(newFile) => onUpdate({ ...block, fileData: newFile, content: newFile.url })}
            onDelete={onDelete}
          />
        )}

        {/* PDF Document Block */}
        {block.type === 'pdf' && (
          <PdfBlock
            fileData={block.fileData}
            content={block.content}
            onChange={(newFile) => onUpdate({ ...block, fileData: newFile, content: newFile.url })}
            onDelete={onDelete}
          />
        )}

        {/* Web Bookmark Block */}
        {block.type === 'bookmark' && (
          <BookmarkBlock
            fileData={block.fileData}
            content={block.content}
            onChange={(newFile) => onUpdate({ ...block, fileData: newFile, content: newFile.url })}
            onDelete={onDelete}
          />
        )}

        {/* Table of Contents Block */}
        {block.type === 'toc' && <TocBlock allBlocks={allBlocks} />}

        {/* Math LaTeX Formula Block */}
        {block.type === 'math' && (
          <MathBlock
            content={block.content}
            onChange={(val) => onUpdate({ ...block, content: val })}
          />
        )}

        {/* Mermaid Diagram Block */}
        {block.type === 'mermaid' && (
          <MermaidBlock
            content={block.content}
            onChange={(val) => onUpdate({ ...block, content: val })}
          />
        )}

        {/* Video / YouTube Player Block */}
        {block.type === 'video' && (
          <VideoBlock
            content={block.content}
            onChange={(url) => onUpdate({ ...block, content: url })}
            onDelete={onDelete}
          />
        )}

        {/* Monthly Calendar View Block */}
        {block.type === 'calendar' && (
          <CalendarBlock
            calendarData={block.calendarData}
            onChange={(cal) => onUpdate({ ...block, calendarData: cal })}
          />
        )}

        {/* Multi-Column Layout Block */}
        {block.type === 'columns' && (
          <ColumnsBlock
            columnsData={block.columnsData}
            onChange={(colData) => onUpdate({ ...block, columnsData: colData })}
          />
        )}

        {/* Internal Page Link / Mention */}
        {block.type === 'page-link' && (
          <PageLinkBlock
            linkedPageId={block.linkedPageId}
            onChange={(pageId) => onUpdate({ ...block, linkedPageId: pageId })}
          />
        )}

        {/* Template Button Block */}
        {block.type === 'template-button' && (
          <TemplateButtonBlock
            templateData={block.templateData}
            onSpawnBlocks={(spawned) => onSpawnTemplateBlocks?.(spawned)}
            onUpdate={(tmpl) => onUpdate({ ...block, templateData: tmpl })}
          />
        )}

        {/* Slash Command Dropdown Menu */}
        {showSlashMenu && !isLocked && (
          <SlashMenu
            filterText={slashFilter}
            onSelect={handleSlashSelect}
            onClose={() => setShowSlashMenu(false)}
          />
        )}
      </div>
    </div>
  );
};
