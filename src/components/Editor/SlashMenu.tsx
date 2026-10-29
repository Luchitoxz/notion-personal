import React, { useState, useEffect, useRef } from 'react';
import type { BlockType } from '../../types';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  ListOrdered,
  ChevronRight,
  Quote,
  AlertCircle,
  Code,
  Minus,
  KanbanSquare,
  Sparkles,
  Table,
  Image as ImageIcon,
  FileText,
  Globe,
  ListTree,
  Sigma,
  Network,
  Video,
  Calendar,
  Columns2,
  ArrowUpRight,
  PlusCircle,
} from 'lucide-react';

interface SlashCommandItem {
  type: BlockType | 'ai';
  label: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
}

const SLASH_ITEMS: SlashCommandItem[] = [
  {
    type: 'ai',
    label: 'Preguntar a la IA / Redactar',
    description: 'Pídele a la IA que redacte, resuma o genere ideas.',
    icon: <Sparkles size={16} className="text-amber-500" />,
    keywords: ['ai', 'ia', 'inteligencia', 'generar', 'prompt', 'escribir', 'ask'],
  },
  {
    type: 'p',
    label: 'Texto normal',
    description: 'Empieza a escribir con texto plano simple.',
    icon: <Type size={16} />,
    keywords: ['texto', 'parrafo', 'plain', 'text', 'p'],
  },
  {
    type: 'h1',
    label: 'Título 1',
    description: 'Encabezado de sección principal grande.',
    icon: <Heading1 size={16} />,
    keywords: ['titulo', 'h1', 'header', 'heading', 'grande'],
  },
  {
    type: 'h2',
    label: 'Título 2',
    description: 'Encabezado de subsección mediano.',
    icon: <Heading2 size={16} />,
    keywords: ['subtitulo', 'h2', 'header', 'heading', 'mediano'],
  },
  {
    type: 'h3',
    label: 'Título 3',
    description: 'Encabezado de subsección pequeño.',
    icon: <Heading3 size={16} />,
    keywords: ['subtitulo', 'h3', 'header', 'heading', 'pequeño'],
  },
  {
    type: 'todo',
    label: 'Lista de tareas',
    description: 'Haz seguimiento con casillas de verificación.',
    icon: <CheckSquare size={16} />,
    keywords: ['tarea', 'todo', 'check', 'checklist', 'checkbox'],
  },
  {
    type: 'bullet',
    label: 'Lista con viñetas',
    description: 'Crea una lista desordenada simple.',
    icon: <List size={16} />,
    keywords: ['lista', 'viñeta', 'bullet', 'unordered'],
  },
  {
    type: 'number',
    label: 'Lista numerada',
    description: 'Crea una lista ordenada secuencial.',
    icon: <ListOrdered size={16} />,
    keywords: ['lista', 'numero', 'ordenada', 'numbered'],
  },
  {
    type: 'toggle',
    label: 'Lista desplegable',
    description: 'Oculta o muestra contenido en un acordeón.',
    icon: <ChevronRight size={16} />,
    keywords: ['toggle', 'desplegable', 'acordeon', 'ocultar'],
  },
  {
    type: 'quote',
    label: 'Cita',
    description: 'Destaca una cita o frase inspiradora.',
    icon: <Quote size={16} />,
    keywords: ['cita', 'quote', 'frase'],
  },
  {
    type: 'callout',
    label: 'Llamada destacada',
    description: 'Resalta información importante con un icono.',
    icon: <AlertCircle size={16} />,
    keywords: ['aviso', 'callout', 'alerta', 'destacado', 'caja'],
  },
  {
    type: 'code',
    label: 'Bloque de código',
    description: 'Muestra código con tipografía monoespaciada.',
    icon: <Code size={16} />,
    keywords: ['codigo', 'code', 'snippet', 'programacion', 'js'],
  },
  {
    type: 'divider',
    label: 'Divisor',
    description: 'Separa visualmente tus bloques con una línea.',
    icon: <Minus size={16} />,
    keywords: ['linea', 'divisor', 'separador', 'hr', 'divider'],
  },
  {
    type: 'table',
    label: 'Tabla estilo Excel',
    description: 'Crea una tabla con filas, columnas y cálculos automáticos.',
    icon: <Table size={16} />,
    keywords: ['tabla', 'table', 'excel', 'filas', 'columnas', 'calculo', 'sheet'],
  },
  {
    type: 'board',
    label: 'Tablero Kanban',
    description: 'Embebe un tablero de tareas interactivo con columnas.',
    icon: <KanbanSquare size={16} />,
    keywords: ['tablero', 'board', 'kanban', 'tareas', 'columnas'],
  },
  {
    type: 'calendar',
    label: 'Vista Calendario mensual',
    description: 'Organiza eventos, entregas y tareas por fechas en un calendario.',
    icon: <Calendar size={16} className="text-blue-500" />,
    keywords: ['calendario', 'calendar', 'fechas', 'mes', 'agenda', 'evento'],
  },
  {
    type: 'toc',
    label: 'Tabla de Contenidos (Índice)',
    description: 'Genera un índice automático navegable con los títulos de la página.',
    icon: <ListTree size={16} className="text-amber-600" />,
    keywords: ['toc', 'indice', 'tabla de contenidos', 'outline', 'anclas'],
  },
  {
    type: 'columns',
    label: 'Columnas múltiples (2 o 3)',
    description: 'Organiza tus notas en columnas paralelas.',
    icon: <Columns2 size={16} />,
    keywords: ['columnas', 'columns', 'layout', 'dos columnas', 'paralelo'],
  },
  {
    type: 'image',
    label: 'Imagen',
    description: 'Sube una foto desde tu equipo o añade un enlace URL.',
    icon: <ImageIcon size={16} />,
    keywords: ['imagen', 'image', 'foto', 'picture', 'img', 'upload'],
  },
  {
    type: 'pdf',
    label: 'Documento PDF',
    description: 'Adjunta un archivo PDF con visor interactivo y descarga.',
    icon: <FileText size={16} className="text-red-500" />,
    keywords: ['pdf', 'documento', 'archivo', 'file', 'informe'],
  },
  {
    type: 'video',
    label: 'Video (YouTube / Vimeo)',
    description: 'Embebe y reproduce videos dentro de la página.',
    icon: <Video size={16} className="text-red-600" />,
    keywords: ['video', 'youtube', 'vimeo', 'reproductor', 'media'],
  },
  {
    type: 'math',
    label: 'Fórmula Matemática (LaTeX)',
    description: 'Escribe ecuaciones matemáticas con renderizado KaTeX.',
    icon: <Sigma size={16} className="text-purple-600" />,
    keywords: ['math', 'matematicas', 'latex', 'formula', 'ecuacion', 'katex'],
  },
  {
    type: 'mermaid',
    label: 'Diagrama Mermaid',
    description: 'Crea diagramas de flujo, de secuencia o arquitectura.',
    icon: <Network size={16} className="text-emerald-600" />,
    keywords: ['mermaid', 'diagrama', 'flujo', 'flowchart', 'arquitectura'],
  },
  {
    type: 'page-link',
    label: 'Enlace a página interna',
    description: 'Crea un vínculo directo a otra nota de tu espacio.',
    icon: <ArrowUpRight size={16} />,
    keywords: ['enlace', 'mencion', 'link', 'pagina', 'wiki', 'referencia'],
  },
  {
    type: 'template-button',
    label: 'Botón de plantilla reutilizable',
    description: 'Crea un botón que genera bloques preconfigurados al pulsar.',
    icon: <PlusCircle size={16} className="text-amber-600" />,
    keywords: ['plantilla', 'template', 'boton', 'generador', 'repetir'],
  },
  {
    type: 'bookmark',
    label: 'Marcador web / Enlace',
    description: 'Inserta un enlace visual hacia cualquier página web.',
    icon: <Globe size={16} />,
    keywords: ['enlace', 'link', 'bookmark', 'web', 'marcador', 'url'],
  },
];

interface SlashMenuProps {
  filterText: string;
  onSelect: (type: BlockType | 'ai') => void;
  onClose: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ filterText, onSelect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const cleanFilter = filterText.toLowerCase().trim();
  const items = SLASH_ITEMS.filter((item) => {
    if (!cleanFilter) return true;
    return (
      item.label.toLowerCase().includes(cleanFilter) ||
      item.keywords.some((k) => k.includes(cleanFilter))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          onSelect(items[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onSelect, onClose]);

  if (items.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 mt-1 w-76 bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 py-1.5 overflow-hidden text-xs max-h-72 overflow-y-auto select-none"
    >
      <div className="px-3 py-1 text-[10px] uppercase font-semibold text-neutral-400">
        Bloques & Herramientas ({items.length})
      </div>

      <div className="space-y-0.5 px-1">
        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={item.label}
              onClick={() => onSelect(item.type)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0">
                {item.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs truncate">{item.label}</div>
                <div className="text-[10px] text-neutral-400 truncate">{item.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
