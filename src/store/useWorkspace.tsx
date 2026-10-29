import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Page, Block, WorkspaceSettings, Collaborator } from '../types';
import { STARTER_PAGES } from '../utils/starterData';
import { collaboration } from '../services/collaborationService';

interface WorkspaceContextType {
  pages: Page[];
  activePageId: string;
  settings: WorkspaceSettings;
  activePage: Page | undefined;
  setActivePageId: (id: string) => void;
  createPage: (parentId?: string | null) => string;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  restorePage: (id: string) => void;
  permanentlyDeletePage: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updateBlocks: (pageId: string, blocks: Block[]) => void;
  updateSettings: (updates: Partial<WorkspaceSettings>) => void;
  exportWorkspaceJSON: () => void;
  exportPageMarkdown: (pageId: string) => void;
  importWorkspaceJSON: (jsonString: string) => boolean;
  resetWorkspace: () => void;
  trashPages: Page[];
  // Collaboration
  roomId: string | null;
  isCollaborating: boolean;
  collaborators: Collaborator[];
  startCollaboration: (roomId: string, isHost: boolean) => void;
  stopCollaboration: () => void;
}

const STORAGE_KEY_PAGES = 'notion_personal_pages_v1';
const STORAGE_KEY_SETTINGS = 'notion_personal_settings_v1';

const DEFAULT_SETTINGS: WorkspaceSettings = {
  theme: 'light',
  fontStyle: 'sans',
  sidebarOpen: true,
  fullWidth: false,
  userName: 'Tú',
  userAvatar: '⚡',
  ai: {
    provider: 'demo',
    apiKey: '',
    model: 'gemini-1.5-flash',
    baseUrl: '',
  },
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAGES);
      if (saved) {
        const parsed: Page[] = JSON.parse(saved);
        // Merge any new starter pages that don't exist yet
        const existingIds = new Set(parsed.map((p) => p.id));
        const missing = STARTER_PAGES.filter((p) => !existingIds.has(p.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading pages from localStorage:', e);
    }
    return STARTER_PAGES;
  });

  const [activePageId, setActivePageId] = useState<string>(() => {
    return pages[0]?.id || 'page-home';
  });

  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          ai: { ...DEFAULT_SETTINGS.ai, ...parsed.ai },
        };
      }
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Collaboration State
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const isSyncingFromRemoteRef = useRef(false);

  // Auto-connect if URL has ?room=...
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      startCollaboration(roomParam, false);
    }
  }, []);

  const handleRemotePagesSync = useCallback((remotePages: Page[], _sender: Collaborator) => {
    isSyncingFromRemoteRef.current = true;
    setPages(remotePages);
    setTimeout(() => {
      isSyncingFromRemoteRef.current = false;
    }, 100);
  }, []);

  const handleCollaboratorsUpdate = useCallback((newCollaborators: Collaborator[]) => {
    setCollaborators(newCollaborators);
  }, []);

  const startCollaboration = (newRoomId: string, isHost: boolean) => {
    const localUser: Collaborator = {
      id: 'user-' + Math.random().toString(36).slice(2, 8),
      name: settings.userName || (isHost ? 'Anfitrión' : 'Amigo'),
      avatar: settings.userAvatar || '⚡',
      color: isHost ? '#ea580c' : '#2563eb',
      isHost,
      lastActive: Date.now(),
    };

    setRoomId(newRoomId);
    setIsCollaborating(true);

    collaboration.init(
      newRoomId,
      isHost,
      localUser,
      handleRemotePagesSync,
      handleCollaboratorsUpdate
    );

    // If host, announce initial pages
    if (isHost) {
      collaboration.broadcastPagesUpdate(pages);
    }
  };

  const stopCollaboration = () => {
    collaboration.leave();
    setRoomId(null);
    setIsCollaborating(false);
    setCollaborators([]);

    // Clear URL param if present
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url.toString());
  };

  // Save pages to localStorage & broadcast if collaborating
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
    } catch (e) {
      console.error('Error saving pages:', e);
    }

    if (isCollaborating && !isSyncingFromRemoteRef.current) {
      collaboration.broadcastPagesUpdate(pages);
    }
  }, [pages, isCollaborating]);

  // Save settings and update theme class
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }

    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const activePage =
    pages.find((p) => p.id === activePageId && !p.isTrash) ||
    pages.find((p) => !p.isTrash);

  const createPage = (parentId: string | null = null): string => {
    const newId = 'page-' + Date.now();
    const newPage: Page = {
      id: newId,
      title: 'Sin título',
      icon: '📄',
      parentId: parentId || null,
      isFavorite: false,
      isTrash: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blocks: [
        {
          id: 'b-' + Date.now(),
          type: 'p',
          content: '',
        },
      ],
    };

    setPages((prev) => [newPage, ...prev]);
    setActivePageId(newId);
    return newId;
  };

  const updatePage = (id: string, updates: Partial<Page>) => {
    setPages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, ...updates, updatedAt: Date.now() } : page))
    );
  };

  const deletePage = (id: string) => {
    setPages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, isTrash: true, updatedAt: Date.now() } : page))
    );

    if (activePageId === id) {
      const remaining = pages.filter((p) => p.id !== id && !p.isTrash);
      if (remaining.length > 0) {
        setActivePageId(remaining[0].id);
      }
    }
  };

  const restorePage = (id: string) => {
    setPages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, isTrash: false, updatedAt: Date.now() } : page))
    );
    setActivePageId(id);
  };

  const permanentlyDeletePage = (id: string) => {
    setPages((prev) => prev.filter((page) => page.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setPages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, isFavorite: !page.isFavorite } : page))
    );
  };

  const updateBlocks = (pageId: string, blocks: Block[]) => {
    setPages((prev) =>
      prev.map((page) => (page.id === pageId ? { ...page, blocks, updatedAt: Date.now() } : page))
    );
  };

  const updateSettings = (updates: Partial<WorkspaceSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const exportWorkspaceJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `notion-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportPageMarkdown = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;

    let md = `# ${page.icon ? page.icon + ' ' : ''}${page.title || 'Sin título'}\n\n`;

    page.blocks.forEach((block) => {
      switch (block.type) {
        case 'h1':
          md += `# ${block.content}\n\n`;
          break;
        case 'h2':
          md += `## ${block.content}\n\n`;
          break;
        case 'h3':
          md += `### ${block.content}\n\n`;
          break;
        case 'todo':
          md += `- [${block.checked ? 'x' : ' '}] ${block.content}\n`;
          break;
        case 'bullet':
          md += `- ${block.content}\n`;
          break;
        case 'number':
          md += `1. ${block.content}\n`;
          break;
        case 'quote':
          md += `> ${block.content}\n\n`;
          break;
        case 'callout':
          md += `> **${block.icon || '💡'}** ${block.content}\n\n`;
          break;
        case 'code':
          md += `\`\`\`${block.language || ''}\n${block.content}\n\`\`\`\n\n`;
          break;
        case 'divider':
          md += `---\n\n`;
          break;
        case 'table':
          if (block.tableData && block.tableData.columns) {
            md += `| ${block.tableData.columns.join(' | ')} |\n`;
            md += `| ${block.tableData.columns.map(() => '---').join(' | ')} |\n`;
            block.tableData.rows.forEach((r) => {
              md += `| ${r.join(' | ')} |\n`;
            });
            md += '\n';
          }
          break;
        case 'image':
          md += `![${block.fileData?.caption || 'Imagen'}](${block.fileData?.url || block.content})\n\n`;
          break;
        case 'pdf':
          md += `[📄 ${block.fileData?.name || 'Documento PDF'}](${block.fileData?.url || block.content})\n\n`;
          break;
        case 'bookmark':
          md += `[🔗 ${block.fileData?.name || block.content}](${block.fileData?.url || block.content})\n\n`;
          break;
        case 'p':
        default:
          if (block.content.trim()) {
            md += `${block.content}\n\n`;
          }
          break;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${page.title.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'pagina'}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const importWorkspaceJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].blocks) {
        setPages(parsed);
        if (parsed[0]?.id) {
          setActivePageId(parsed[0].id);
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON:', e);
    }
    return false;
  };

  const resetWorkspace = () => {
    setPages(STARTER_PAGES);
    setActivePageId(STARTER_PAGES[0].id);
  };

  const trashPages = pages.filter((p) => p.isTrash);

  return (
    <WorkspaceContext.Provider
      value={{
        pages,
        activePageId,
        settings,
        activePage,
        setActivePageId,
        createPage,
        updatePage,
        deletePage,
        restorePage,
        permanentlyDeletePage,
        toggleFavorite,
        updateBlocks,
        updateSettings,
        exportWorkspaceJSON,
        exportPageMarkdown,
        importWorkspaceJSON,
        resetWorkspace,
        trashPages,
        roomId,
        isCollaborating,
        collaborators,
        startCollaboration,
        stopCollaboration,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
