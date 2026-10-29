# Recon map: Notion (Web / Desktop Local-First)

Scope: Personal workspace, nested page tree, block-based modular rich text editor, slash commands, quick switcher (Cmd+K), light/dark themes, and local persistence.
For: Personal private use (self-hosted / local-first, zero-subscription, zero-latency, private).
Date: 2026-10-29

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Notion Help Center | https://notion.so/help | Block mechanics, hierarchy, slash commands |
| 2 | Notion Web App | https://notion.so | UX patterns, color palette, sidebar tree, block handles |
| 3 | Notion API Reference | https://developers.notion.com | Block types and page schema serialization |

## Core loop

Effortlessly capture notes, ideas, and tasks in a nested document hierarchy using block-based editing with keyboard-driven slash (`/`) commands and instant local search.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Workspace Shell & Sidebar | Default layout | Navigation tree, workspace switcher, quick actions | PageTreeItem, ActionButton, WorkspaceHeader, SearchTrigger | expanded, collapsed, empty tree, active page |
| S02 | Document Canvas & Editor | `/page/:id` or click in sidebar | Primary content creation and reading | CoverImage, IconPicker, Breadcrumbs, PageTitle, BlockList, SlashMenu, FloatingToolbar | empty page, populated document, cover active |
| S03 | Quick Switcher / Search Modal | `Cmd/Ctrl + K` or Search button | Fast keyboard-based page jumping & full-text search | SearchInput, ResultList, ResultItem, KeyboardBadge | initial recent, searching, empty results |
| S04 | Trash & Archive Drawer | Bottom of sidebar | Recover or permanently purge deleted pages | TrashList, RestoreButton, DeleteButton, EmptyNotice | empty trash, populated list |
| S05 | Settings & Preferences Modal | Sidebar Settings item | Appearance theme, typography styling, data export/import | ThemeToggle, FontPicker, ExportJSONBtn, ExportMDBtn, ImportBtn | modal open, saved toast |
| S06 | Embedded Board / Kanban View | Slash command `/board` or template | Task board with drag-and-drop columns (To Do, In Progress, Done) | KanbanBoard, KanbanColumn, KanbanCard, AddCardBtn | empty columns, populated cards |

## Flows

```
F01 Quick Note Capture
    S01 Sidebar "New Page" -> S02 Canvas focus -> Type title -> Enter -> Type content with slash command `/`
    happy path clicks: 1 click, then pure keyboard
    edge: untitled page defaults gracefully, auto-saves on every keystroke

F02 Slash Command Formatting
    S02 Canvas -> Press `/` on empty block -> S02 SlashMenu popup -> Type query (e.g. `todo`, `h2`, `callout`) -> Arrow keys -> Press Enter -> Block morphs instantly
    happy path clicks: 0 (pure keyboard)
    edge: Escape dismisses menu, backspace clears slash and returns to normal text

F03 Quick Switcher Navigation
    Any screen -> `Ctrl+K` -> S03 Modal appears -> Type page name -> Press Enter -> S02 jumps to target page
    happy path clicks: 0 (pure keyboard)
    edge: search queries match both page titles and inner block content

F04 Data Backup & Portability
    S01 Settings -> S05 Modal -> Click "Export Markdown / JSON" -> Browser downloads complete offline backup
    happy path clicks: 2
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| SidebarItem | regular page, page with children, action | default, hover, active, dragging | S01 |
| BlockRenderer | p, h1, h2, h3, todo, bullet, number, toggle, quote, callout, code, divider, image | default, focused, editing, checked (todo), expanded/collapsed (toggle) | S02 |
| BlockHandle | add button (+), drag/options handle (⠿) | hidden, visible on hover, menu open | S02 |
| SlashMenu | floating dropdown | active item highlighted, filtered list | S02 |
| FloatingToolbar | bold, italic, underline, strikethrough, code, color | active states for current selection | S02 |
| IconPicker | emoji grid, randomizer, remove | open, closed, search emoji | S02 |
| CoverPicker | preset gradients, minimalist photographic covers, custom URL | open, closed | S02 |
| QuickSearchModal | modal overlay | open, closed, keyboard navigating | S03 |
| KanbanBoard | To-do, In Progress, Done columns | card dragging, adding card | S06 |

## Inferred data model

```
Page {
  id: string (uuid)
  title: string
  icon?: string (emoji or icon name)
  coverImage?: string (url or gradient token)
  parentId?: string | null (for nesting in tree)
  isFavorite: boolean
  isTrash: boolean
  createdAt: number
  updatedAt: number
  blocks: Block[]
}

Block {
  id: string (uuid)
  type: 'p' | 'h1' | 'h2' | 'h3' | 'todo' | 'bullet' | 'number' | 'toggle' | 'quote' | 'callout' | 'code' | 'divider' | 'image'
  content: string
  checked?: boolean (for todo)
  language?: string (for code)
  expanded?: boolean (for toggle)
  childrenIds?: string[] (for nested blocks)
}
```

Relationships:
- Page 1-n Child Pages (`parentId`)
- Page 1-n Blocks (`blocks`)

## Feature matrix

See `features.csv`. Must: 12, Should: 6, Could: 3.

## Out of scope
- Multi-user real-time operational transformation / WebSocket server (this is a personal, private offline-first instance).
- Cloud billing / paid tiers.
