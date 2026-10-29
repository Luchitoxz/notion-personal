import React, { useState } from 'react';
import type { Page } from '../../types';
import { ChevronRight, Plus, MoreHorizontal, Trash2, Star, Download } from 'lucide-react';
import { useWorkspace } from '../../store/useWorkspace';

interface PageTreeItemProps {
  page: Page;
  depth?: number;
}

export const PageTreeItem: React.FC<PageTreeItemProps> = ({ page, depth = 0 }) => {
  const {
    pages,
    activePageId,
    setActivePageId,
    createPage,
    deletePage,
    toggleFavorite,
    exportPageMarkdown,
    updateSettings,
  } = useWorkspace();
  const [isOpen, setIsOpen] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // Find child pages
  const childPages = pages.filter((p) => p.parentId === page.id && !p.isTrash);
  const hasChildren = childPages.length > 0;
  const isActive = activePageId === page.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePageId(page.id);
    if (window.innerWidth < 768) {
      updateSettings({ sidebarOpen: false });
    }
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
    createPage(page.id);
  };

  const handleToggleChevron = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="select-none text-sm">
      <div
        onClick={handleClick}
        style={{ paddingLeft: `${depth * 12 + 10}px` }}
        className={`group relative flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-colors duration-100 ${
          isActive
            ? 'bg-[#efeeea] dark:bg-[#2b2b2b] font-medium text-[#191919] dark:text-[#ffffff]'
            : 'text-[#5f5e5b] dark:text-[#9b9a97] hover:bg-[#f1f0ec] dark:hover:bg-[#272727]'
        }`}
      >
        <div className="flex items-center min-w-0 flex-1 gap-1.5">
          {hasChildren ? (
            <button
              onClick={handleToggleChevron}
              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-transform duration-150"
            >
              <ChevronRight
                size={14}
                className={`transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
              />
            </button>
          ) : (
            <span className="w-3.5" />
          )}

          <span className="text-base leading-none select-none">{page.icon || '📄'}</span>

          <span className="truncate text-xs font-normal">
            {page.title.trim() ? page.title : 'Sin título'}
          </span>
        </div>

        {/* Hover action buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddChild}
            title="Añadir subpágina"
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground"
          >
            <Plus size={13} />
          </button>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              title="Más opciones"
              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal size={13} />
            </button>

            {/* Context menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-6 z-50 w-44 py-1 bg-white dark:bg-[#252525] rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(page.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  >
                    <Star size={13} className={page.isFavorite ? 'text-amber-500 fill-amber-500' : ''} />
                    {page.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportPageMarkdown(page.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  >
                    <Download size={13} />
                    Exportar como Markdown
                  </button>
                  <div className="my-1 border-t border-neutral-200 dark:border-neutral-700" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(page.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                  >
                    <Trash2 size={13} />
                    Mover a la papelera
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Render children recursively */}
      {hasChildren && isOpen && (
        <div className="flex flex-col">
          {childPages.map((child) => (
            <PageTreeItem key={child.id} page={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
