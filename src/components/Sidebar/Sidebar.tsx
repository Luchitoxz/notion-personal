import React, { useState } from 'react';
import { useWorkspace } from '../../store/useWorkspace';
import { PageTreeItem } from './PageTreeItem';
import {
  Search,
  Settings,
  PlusCircle,
  Trash2,
  ChevronsLeft,
  ChevronDown,
  Star,
  Plus,
  Users,
} from 'lucide-react';
import { QuickSearchModal } from '../Modals/QuickSearchModal';
import { SettingsModal } from '../Modals/SettingsModal';
import { TrashModal } from '../Modals/TrashModal';
import { ShareModal } from '../Modals/ShareModal';

export const Sidebar: React.FC = () => {
  const { pages, settings, updateSettings, createPage, trashPages, isCollaborating, collaborators } = useWorkspace();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!settings.sidebarOpen) {
    return null;
  }

  const rootPages = pages.filter((p) => !p.parentId && !p.isTrash);
  const favoritePages = pages.filter((p) => p.isFavorite && !p.isTrash);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        onClick={() => updateSettings({ sidebarOpen: false })}
      />

      <aside className="fixed inset-y-0 left-0 z-50 md:relative md:z-auto w-72 md:w-64 h-screen flex flex-col bg-[#f7f6f3] dark:bg-[#202020] border-r border-[#e9e9e7] dark:border-[#2e2e2e] select-none text-xs text-[#5f5e5b] dark:text-[#9b9a97] transition-all shadow-2xl md:shadow-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Workspace Header */}
        <div className="flex items-center justify-between px-3.5 py-3 hover:bg-[#efeeea] dark:hover:bg-[#282828] cursor-pointer transition-colors group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-center text-xs">
              {settings.userAvatar || 'N'}
            </div>
            <span className="font-semibold text-sm text-[#37352f] dark:text-[#e6e6e5] truncate">
              {settings.userName ? `Espacio de ${settings.userName}` : 'Mi Espacio Notion'}
            </span>
            <ChevronDown size={13} className="text-muted-foreground opacity-60" />
          </div>

          <button
            onClick={() => updateSettings({ sidebarOpen: false })}
            title="Ocultar barra lateral"
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity"
          >
            <ChevronsLeft size={16} />
          </button>
        </div>

        {/* Global Action Items */}
        <div className="px-2 space-y-0.5 mb-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[#efeeea] dark:hover:bg-[#282828] text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search size={15} />
              <span>Buscar</span>
            </div>
            <kbd className="text-[10px] bg-neutral-200/70 dark:bg-neutral-700/70 px-1.5 py-0.5 rounded text-neutral-500 dark:text-neutral-400">
              Ctrl+K
            </kbd>
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${
              isCollaborating
                ? collaborators.length > 1
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium'
                : 'hover:bg-[#efeeea] dark:hover:bg-[#282828] text-neutral-600 dark:text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={15} />
              <span>
                {isCollaborating
                  ? collaborators.length > 1
                    ? 'Juntos en vivo'
                    : 'Esperando amigo...'
                  : 'Invitar a un amigo'}
              </span>
            </div>
            {isCollaborating ? (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  collaborators.length > 1
                    ? 'bg-emerald-200 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-200 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}
              >
                {collaborators.length} en línea
              </span>
            ) : (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">En vivo</span>
            )}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[#efeeea] dark:hover:bg-[#282828] text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <Settings size={15} />
            <span>Configuración & IA</span>
          </button>

          <button
            onClick={() => createPage(null)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[#efeeea] dark:hover:bg-[#282828] text-neutral-600 dark:text-neutral-300 transition-colors font-medium text-amber-700 dark:text-amber-400"
          >
            <PlusCircle size={15} />
            <span>Nueva página</span>
          </button>
        </div>

        {/* Page Tree Content */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          {/* Favorites Section */}
          {favoritePages.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                <Star size={11} className="fill-neutral-400 text-neutral-400" />
                <span>Favoritos</span>
              </div>
              <div className="space-y-0.5 mt-0.5">
                {favoritePages.map((page) => (
                  <PageTreeItem key={'fav-' + page.id} page={page} />
                ))}
              </div>
            </div>
          )}

          {/* All Private Pages */}
          <div>
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider group">
              <span>Páginas</span>
              <button
                onClick={() => createPage(null)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-opacity"
                title="Nueva página"
              >
                <Plus size={13} />
              </button>
            </div>

            <div className="space-y-0.5 mt-0.5">
              {rootPages.map((page) => (
                <PageTreeItem key={page.id} page={page} />
              ))}

              {rootPages.length === 0 && (
                <div className="px-3 py-4 text-center text-neutral-400 text-xs">
                  No hay páginas aún. Haz clic en "Nueva página".
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-2 border-t border-[#e9e9e7] dark:border-[#2e2e2e] space-y-0.5">
          <button
            onClick={() => setIsTrashOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-[#efeeea] dark:hover:bg-[#282828] text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Trash2 size={15} />
              <span>Papelera</span>
            </div>
            {trashPages.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-semibold rounded-full">
                {trashPages.length}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Modals */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </>
  );
};
