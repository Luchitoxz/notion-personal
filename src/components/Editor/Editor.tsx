import React, { useState } from 'react';
import { useWorkspace } from '../../store/useWorkspace';
import { BlockItem } from './BlockItem';
import type { Block, BlockType } from '../../types';
import {
  Menu,
  Star,
  Download,
  MoreHorizontal,
  Smile,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  Minimize2,
  Sparkles,
  Users,
  Lock,
  Unlock,
  History,
} from 'lucide-react';
import { IconPicker } from './IconPicker';
import { CoverPicker } from './CoverPicker';
import { AIAssistantModal } from '../AI/AIAssistantModal';
import { ShareModal } from '../Modals/ShareModal';
import { HistoryModal } from '../Modals/HistoryModal';

export const Editor: React.FC = () => {
  const {
    activePage,
    updatePage,
    updateBlocks,
    deletePage,
    toggleFavorite,
    exportPageMarkdown,
    settings,
    updateSettings,
    pages,
    isCollaborating,
    collaborators,
  } = useWorkspace();

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showPageMenu, setShowPageMenu] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiTargetBlockIndex, setAiTargetBlockIndex] = useState<number | undefined>(undefined);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  if (!activePage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400 text-sm select-none">
        <p>No hay ninguna página seleccionada.</p>
      </div>
    );
  }

  // Parent page for breadcrumbs
  const parentPage = activePage.parentId
    ? pages.find((p) => p.id === activePage.parentId)
    : null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updatePage(activePage.id, { title: e.target.value });
  };

  const handleUpdateBlock = (index: number, updatedBlock: Block) => {
    const nextBlocks = [...activePage.blocks];
    nextBlocks[index] = updatedBlock;
    updateBlocks(activePage.id, nextBlocks);
  };

  const handleInsertBelow = (index: number, type: BlockType = 'p') => {
    const nextBlocks = [...activePage.blocks];
    const newBlock: Block = {
      id: 'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      type,
      content: '',
    };
    nextBlocks.splice(index + 1, 0, newBlock);
    updateBlocks(activePage.id, nextBlocks);
  };

  const handleDeleteBlock = (index: number) => {
    if (activePage.blocks.length <= 1) {
      handleUpdateBlock(0, {
        id: 'b-' + Date.now(),
        type: 'p',
        content: '',
      });
      return;
    }
    const nextBlocks = activePage.blocks.filter((_, i) => i !== index);
    updateBlocks(activePage.id, nextBlocks);
  };

  const handleAppendBlock = () => {
    const lastBlock = activePage.blocks[activePage.blocks.length - 1];
    if (lastBlock && lastBlock.content === '' && lastBlock.type === 'p') {
      return;
    }
    const newBlock: Block = {
      id: 'b-' + Date.now(),
      type: 'p',
      content: '',
    };
    updateBlocks(activePage.id, [...activePage.blocks, newBlock]);
  };

  const fontClass =
    settings.fontStyle === 'serif'
      ? 'font-serif-notion'
      : settings.fontStyle === 'mono'
      ? 'font-mono-notion'
      : 'font-sans-notion';

  return (
    <div className={`flex-1 flex flex-col h-screen overflow-y-auto bg-white dark:bg-[#191919] transition-colors ${fontClass}`}>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-3 md:px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] bg-white/90 dark:bg-[#191919]/90 backdrop-blur-xs border-b border-neutral-100 dark:border-neutral-800/60 select-none text-xs text-neutral-500">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={() => updateSettings({ sidebarOpen: !settings.sidebarOpen })}
            title="Menú de navegación"
            className={`p-1.5 mr-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors ${
              settings.sidebarOpen ? 'md:hidden' : ''
            }`}
          >
            <Menu size={16} />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 truncate text-neutral-400">
            <span>Espacio</span>
            {parentPage && (
              <>
                <span>/</span>
                <span className="truncate max-w-[120px]">{parentPage.title || 'Sin título'}</span>
              </>
            )}
            <span>/</span>
            <span className="text-neutral-700 dark:text-neutral-200 font-medium truncate max-w-[160px]">
              {activePage.icon ? `${activePage.icon} ` : ''}
              {activePage.title || 'Sin título'}
            </span>
            {activePage.isLocked && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full ml-1 shrink-0 select-none">
                <Lock size={10} /> Bloqueada
              </span>
            )}
          </div>
        </div>

        {/* Action icons & AI/Share triggers */}
        <div className="flex items-center gap-1.5">
          {/* Notion AI Assistant Trigger */}
          <button
            onClick={() => {
              setAiTargetBlockIndex(undefined);
              setIsAiOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium transition-colors"
            title="Asistente de Inteligencia Artificial (Notion AI)"
          >
            <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Notion AI</span>
          </button>

          {/* P2P Live Collaboration Trigger */}
          <button
            onClick={() => setIsShareOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
              isCollaborating
                ? collaborators.length > 1
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/60'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
            title="Compartir y colaborar en tiempo real con un amigo"
          >
            <Users size={14} />
            <span className="hidden sm:inline">
              {isCollaborating
                ? collaborators.length > 1
                  ? `Juntos en vivo (${collaborators.length})`
                  : 'Esperando amigo...'
                : 'Conectar amigo'}
            </span>
            {isCollaborating && (
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  collaborators.length > 1 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            )}
          </button>

          <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

          {/* History Modal Trigger */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            title="Historial de versiones y puntos de guardado"
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <History size={15} />
          </button>

          {/* Page Lock Toggle */}
          <button
            onClick={() => updatePage(activePage.id, { isLocked: !activePage.isLocked })}
            title={activePage.isLocked ? 'Desbloquear página' : 'Bloquear página contra edición'}
            className={`p-1.5 rounded-md transition-colors ${
              activePage.isLocked
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            {activePage.isLocked ? <Lock size={15} /> : <Unlock size={15} />}
          </button>

          <button
            onClick={() => toggleFavorite(activePage.id)}
            title={activePage.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Star
              size={15}
              className={activePage.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-neutral-400'}
            />
          </button>

          <button
            onClick={() => exportPageMarkdown(activePage.id)}
            title="Exportar como Markdown"
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <Download size={15} />
          </button>

          <button
            onClick={() => updateSettings({ fullWidth: !settings.fullWidth })}
            title={settings.fullWidth ? 'Vista estándar' : 'Ancho completo'}
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            {settings.fullWidth ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowPageMenu(!showPageMenu)}
              title="Más acciones"
              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>

            {showPageMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPageMenu(false)} />
                <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-[#252525] rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 text-xs select-none">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-neutral-400">
                    Estilo de fuente
                  </div>
                  {(['sans', 'serif', 'mono'] as const).map((font) => (
                    <button
                      key={font}
                      onClick={() => updateSettings({ fontStyle: font })}
                      className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 capitalize ${
                        settings.fontStyle === font ? 'font-semibold text-amber-600 dark:text-amber-400' : ''
                      }`}
                    >
                      <span>{font === 'sans' ? 'Por defecto' : font === 'serif' ? 'Serifa' : 'Mono'}</span>
                    </button>
                  ))}
                  <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                  <button
                    onClick={() => {
                      deletePage(activePage.id);
                      setShowPageMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 size={13} />
                    <span>Mover a papelera</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Cover Image Banner */}
      {activePage.coverImage && (
        <div className="group relative w-full h-48 md:h-64 overflow-hidden select-none">
          <img
            src={activePage.coverImage}
            alt="Portada"
            className="w-full h-full object-cover"
          />
          {!activePage.isLocked && (
            <div className="absolute bottom-2 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowCoverPicker(true)}
                className="px-2.5 py-1 rounded-md bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 shadow-md"
              >
                <ImageIcon size={13} />
                <span>Cambiar portada</span>
              </button>
              <button
                onClick={() => updatePage(activePage.id, { coverImage: undefined })}
                className="px-2.5 py-1 rounded-md bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-xs shadow-md"
              >
                Quitar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Page Container */}
      <main
        className={`flex-1 mx-auto w-full px-6 md:px-12 pt-6 pb-32 transition-all ${
          settings.fullWidth ? 'max-w-6xl' : 'max-w-3xl'
        }`}
      >
        {/* Header Controls: Add Icon / Add Cover buttons */}
        <div className="relative group/header mb-2 select-none">
          {/* Page Icon */}
          {activePage.icon ? (
            <div className="relative inline-block mb-3">
              <button
                disabled={Boolean(activePage.isLocked)}
                onClick={() => !activePage.isLocked && setShowIconPicker(!showIconPicker)}
                className={`text-5xl md:text-6xl ${
                  activePage.isLocked ? 'cursor-default' : 'hover:opacity-80'
                } transition-opacity ${
                  activePage.coverImage ? '-mt-12 relative z-10 p-1 rounded-2xl bg-white dark:bg-[#191919] shadow-xs' : ''
                }`}
              >
                {activePage.icon}
              </button>

              {showIconPicker && !activePage.isLocked && (
                <IconPicker
                  currentIcon={activePage.icon}
                  onSelect={(emoji) => updatePage(activePage.id, { icon: emoji })}
                  onRemove={() => updatePage(activePage.id, { icon: undefined })}
                  onClose={() => setShowIconPicker(false)}
                />
              )}
            </div>
          ) : (
            !activePage.isLocked && (
              <div className="h-6 flex items-center gap-2 opacity-0 group-hover/header:opacity-100 transition-opacity text-xs text-neutral-400">
                <button
                  onClick={() => setShowIconPicker(true)}
                  className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  <Smile size={14} />
                  <span>Añadir icono</span>
                </button>
                {!activePage.coverImage && (
                  <button
                    onClick={() => setShowCoverPicker(true)}
                    className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    <ImageIcon size={14} />
                    <span>Añadir portada</span>
                  </button>
                )}
              </div>
            )
          )}

          {activePage.icon && !activePage.coverImage && !activePage.isLocked && (
            <div className="opacity-0 group-hover/header:opacity-100 transition-opacity text-xs text-neutral-400 flex items-center gap-3 mb-2">
              <button
                onClick={() => setShowCoverPicker(true)}
                className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <ImageIcon size={14} />
                <span>Añadir portada</span>
              </button>
            </div>
          )}

          {showCoverPicker && !activePage.isLocked && (
            <div className="relative">
              <CoverPicker
                currentCover={activePage.coverImage}
                onSelect={(url) => updatePage(activePage.id, { coverImage: url })}
                onRemove={() => updatePage(activePage.id, { coverImage: undefined })}
                onClose={() => setShowCoverPicker(false)}
              />
            </div>
          )}

          {/* Page Title */}
          <textarea
            value={activePage.title}
            onChange={handleTitleChange}
            readOnly={Boolean(activePage.isLocked)}
            rows={1}
            placeholder={activePage.isLocked ? 'Página bloqueada' : 'Sin título'}
            className={`w-full bg-transparent border-none outline-hidden resize-none text-3xl md:text-4xl font-extrabold text-[#37352f] dark:text-[#e6e6e5] placeholder-neutral-300 dark:placeholder-neutral-600 leading-tight overflow-hidden block py-1 ${
              activePage.isLocked ? 'cursor-default select-text' : ''
            }`}
            style={{ height: 'auto' }}
          />
        </div>

        {/* Blocks Stream */}
        <div className="mt-4 space-y-0.5">
          {activePage.blocks.map((block, idx) => (
            <BlockItem
              key={block.id}
              block={block}
              index={idx}
              totalBlocks={activePage.blocks.length}
              allBlocks={activePage.blocks}
              isLocked={Boolean(activePage.isLocked)}
              onUpdate={(updated) => handleUpdateBlock(idx, updated)}
              onInsertBelow={(type) => handleInsertBelow(idx, type)}
              onDelete={() => handleDeleteBlock(idx)}
              onOpenAI={() => {
                setAiTargetBlockIndex(idx);
                setIsAiOpen(true);
              }}
              onSpawnTemplateBlocks={(spawned) => {
                if (activePage.isLocked) return;
                updateBlocks(activePage.id, [...activePage.blocks, ...spawned]);
              }}
            />
          ))}
        </div>

        {/* Clickable bottom zone to add more blocks */}
        {!activePage.isLocked && (
          <div
            onClick={handleAppendBlock}
            className="min-h-[160px] cursor-text mt-4"
          />
        )}
      </main>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        targetBlockIndex={aiTargetBlockIndex}
      />

      {/* P2P Share & Collaboration Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Version History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};
