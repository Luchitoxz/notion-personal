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
  | 'board'
  | 'table'
  | 'pdf'
  | 'bookmark'
  | 'toc'
  | 'math'
  | 'mermaid'
  | 'video'
  | 'calendar'
  | 'columns'
  | 'page-link'
  | 'template-button';

export interface KanbanCard {
  id: string;
  title: string;
  tag?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cardIds: string[];
}

export interface KanbanBoardData {
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>;
}

export interface TableData {
  hasHeaderRow: boolean;
  columns: string[];
  rows: string[][];
  showCalculations?: boolean;
}

export interface FileData {
  name: string;
  size?: string;
  url: string;
  caption?: string;
  mimeType?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  color?: string;
}

export interface CalendarData {
  events: CalendarEvent[];
}

export interface ColumnsData {
  columns: Block[][];
}

export interface TemplateButtonData {
  buttonText: string;
  templateBlocks: Block[];
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
  language?: string;
  expanded?: boolean;
  icon?: string;
  boardData?: KanbanBoardData;
  tableData?: TableData;
  fileData?: FileData;
  calendarData?: CalendarData;
  columnsData?: ColumnsData;
  templateData?: TemplateButtonData;
  linkedPageId?: string;
}

export interface PageSnapshot {
  timestamp: number;
  title: string;
  blocks: Block[];
}

export interface Page {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  parentId?: string | null;
  isFavorite: boolean;
  isTrash: boolean;
  isLocked?: boolean;
  createdAt: number;
  updatedAt: number;
  blocks: Block[];
  history?: PageSnapshot[];
}

export interface AISettings {
  provider: 'demo' | 'gemini' | 'openai' | 'ollama';
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  lastActive: number;
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark';
  fontStyle: 'sans' | 'serif' | 'mono';
  sidebarOpen: boolean;
  fullWidth: boolean;
  userName: string;
  userAvatar: string;
  ai: AISettings;
}
