# Architecture: Notion Personal (Clean-Room Rebuild)

## Stack

| layer | choice | why |
| --- | --- | --- |
| web frontend | React 19 + TypeScript + Vite | Lightning-fast HMR, type safety, sub-millisecond local boot, standalone |
| styling | Tailwind CSS v4 + Lucide Icons | Utility-first, precise Notion color tokens, minimalist iconography |
| persistence | LocalStorage / IndexedDB Engine | Local-first, zero-subscription, 100% private, instant sync, offline-ready |
| state management | Custom Reactive Store + Hooks | Zero external bundle bloat, predictable immutable state transitions |
| search engine | Client-Side Inverted Fuzzy Index | Blazingly fast instant search across all documents and blocks with zero server delay |

## Schema

```typescript
export type BlockType = 
  | 'p' 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'todo' 
  | 'bullet' 
  | 'number' 
  | 'toggle' 
  | 'quote' 
  | 'callout' 
  | 'code' 
  | 'divider' 
  | 'image'
  | 'board';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  language?: string;
  expanded?: boolean;
  color?: string;
  boardData?: KanbanBoardData;
}

export interface KanbanBoardData {
  columns: {
    id: string;
    title: string;
    cardIds: string[];
  }[];
  cards: Record<string, { id: string; title: string; description?: string; tag?: string }>;
}

export interface Page {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  parentId?: string | null;
  isFavorite: boolean;
  isTrash: boolean;
  createdAt: number;
  updatedAt: number;
  blocks: Block[];
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'system';
  fontStyle: 'sans' | 'serif' | 'mono';
  sidebarOpen: boolean;
  fullWidth: boolean;
}
```

## Build Order

1. **Phase 1: Foundation & Design Tokens**
   - Setup Tailwind v4 styling with authentic Notion color palette (light/dark modes).
   - Core data structures, mock templates (Personal Home, Quick Notes, Task Board, Reading List), and reactive persistence engine.
2. **Phase 2: Workspace & Navigation Shell**
   - Collapsible sidebar with workspace header, Quick Search trigger, Settings trigger, New Page action, Favorites section, nested page tree, and Trash drawer.
   - Top breadcrumb bar with title editing, favorite button, full-width toggle, font picker, and actions menu.
3. **Phase 3: Notion Block Editor Engine**
   - Editable page header: dynamic emoji icon picker, cover banner picker/randomizer.
   - Block stream: paragraphs, headings (H1-H3), interactive checkboxes (to-do), bulleted/numbered lists, callouts, blockquotes, code blocks with syntax styling & copy, dividers, toggles, images.
   - Live Slash (`/`) command menu with keyboard navigation (arrows, Enter, Escape) and filtering.
   - Hover block controls: `+` (insert block below) and `⠿` (drag/options handle: change block type, delete, duplicate).
   - Enter/Backspace intelligent block handling.
4. **Phase 4: Productivity Utilities & Databases**
   - Quick Switcher / Global Search modal (`Ctrl+K` / `Cmd+K`).
   - Interactive Kanban Board block/template.
   - Settings modal with theme switching, font switching, export (Markdown/JSON), and import.
   - Word counter and reading time estimator.
