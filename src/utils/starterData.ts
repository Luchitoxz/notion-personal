import type { Page } from '../types';

export const STARTER_PAGES: Page[] = [
  {
    id: 'page-home',
    title: 'Personal Dashboard',
    icon: '🏠',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    parentId: null,
    isFavorite: true,
    isTrash: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000,
    blocks: [
      {
        id: 'b-home-1',
        type: 'callout',
        content: 'Bienvenido a tu clon personal de Notion con IA, colaboración con amigos, tablas tipo Excel, PDFs e imágenes.',
        icon: '💡',
      },
      {
        id: 'b-home-2',
        type: 'h2',
        content: '🎯 Objetivos del Mes',
      },
      {
        id: 'b-home-3',
        type: 'todo',
        content: 'Configurar entorno de desarrollo local',
        checked: true,
      },
      {
        id: 'b-home-4',
        type: 'todo',
        content: 'Probar las tablas tipo Excel y vincular documentos PDF',
        checked: false,
      },
      {
        id: 'b-home-5',
        type: 'todo',
        content: 'Invitar a un amigo usando el botón "Compartir" de arriba',
        checked: false,
      },
      {
        id: 'b-home-6',
        type: 'divider',
        content: '',
      },
      {
        id: 'b-home-7',
        type: 'h3',
        content: '⚡ Accesos rápidos & Comandos',
      },
      {
        id: 'b-home-8',
        type: 'bullet',
        content: 'Escribe `/table` o `/excel` para insertar una hoja de cálculo con filas, columnas y sumas.',
      },
      {
        id: 'b-home-9',
        type: 'bullet',
        content: 'Escribe `/image` o `/pdf` para subir o vincular fotos y documentos con visor interactivo.',
      },
      {
        id: 'b-home-10',
        type: 'bullet',
        content: 'Haz clic en el botón "Notion AI" ✨ en la barra superior para resumir o redactar notas.',
      },
      {
        id: 'b-home-11',
        type: 'quote',
        content: '"El orden no es una restricción de la libertad, sino su cimiento más firme."',
      },
    ],
  },
  {
    id: 'page-tables-media',
    title: 'Tablas Excel, PDFs & Imágenes',
    icon: '📊',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    parentId: null,
    isFavorite: true,
    isTrash: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 1200000,
    blocks: [
      {
        id: 'b-media-callout',
        type: 'callout',
        content: 'Demostración de las nuevas tablas de cálculo estilo Excel, previsualización de PDFs y fotos locales o remotas.',
        icon: '📈',
      },
      {
        id: 'b-media-h2-table',
        type: 'h2',
        content: '📊 Presupuesto & Hoja de Cálculo',
      },
      {
        id: 'b-media-table',
        type: 'table',
        content: '',
        tableData: {
          hasHeaderRow: true,
          columns: ['Concepto / Recurso', 'Responsable', 'Costo ($)', 'Estado'],
          rows: [
            ['Hosting & Servidor Cloud', 'Luchito', '45', 'Aprobado'],
            ['Dominio web .com', 'Amigo', '14', 'Pagado'],
            ['Herramientas & Licencias', 'Equipo', '60', 'Pendiente'],
            ['Presupuesto Marketing Q1', 'Luchito', '150', 'Planificado'],
          ],
          showCalculations: true,
        },
      },
      {
        id: 'b-media-div-1',
        type: 'divider',
        content: '',
      },
      {
        id: 'b-media-h2-img',
        type: 'h2',
        content: '🖼️ Imagen Adjunta',
      },
      {
        id: 'b-media-img',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=80',
        fileData: {
          name: 'Minimalismo y Luz',
          caption: 'Arquitectura limpia y diseño de interfaces modernas',
          url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=80',
        },
      },
      {
        id: 'b-media-div-2',
        type: 'divider',
        content: '',
      },
      {
        id: 'b-media-h2-pdf',
        type: 'h2',
        content: '📄 Documento PDF con Visor Interactivo',
      },
      {
        id: 'b-media-pdf',
        type: 'pdf',
        content: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileData: {
          name: 'Especificaciones-Tecnicas-Guia.pdf',
          size: '142 KB',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          caption: 'Documentación técnica en PDF de muestra',
        },
      },
      {
        id: 'b-media-h2-link',
        type: 'h2',
        content: '🔗 Marcador Web Enlazado',
      },
      {
        id: 'b-media-bookmark',
        type: 'bookmark',
        content: 'https://github.com',
        fileData: {
          name: 'GitHub - Donde el mundo construye software',
          url: 'https://github.com',
          caption: 'https://github.com',
        },
      },
    ],
  },
  {
    id: 'page-kanban',
    title: 'Tablero de Tareas',
    icon: '⚡',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    parentId: null,
    isFavorite: false,
    isTrash: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 1800000,
    blocks: [
      {
        id: 'b-kanban-desc',
        type: 'callout',
        content: 'Gestiona el flujo de tus proyectos diarios moviendo tarjetas entre columnas.',
        icon: '📌',
      },
      {
        id: 'b-kanban-board',
        type: 'board',
        content: '',
        boardData: {
          columns: [
            { id: 'col-todo', title: 'Por hacer', cardIds: ['card-1', 'card-2'] },
            { id: 'col-in-progress', title: 'En progreso', cardIds: ['card-3'] },
            { id: 'col-done', title: 'Completado', cardIds: ['card-4'] },
          ],
          cards: {
            'card-1': { id: 'card-1', title: 'Investigar arquitectura de base de datos', tag: 'Arquitectura' },
            'card-2': { id: 'card-2', title: 'Redactar plan de marketing Q1', tag: 'Estrategia' },
            'card-3': { id: 'card-3', title: 'Implementar atajos de teclado', tag: 'Frontend' },
            'card-4': { id: 'card-4', title: 'Instalar skills de Antigravity', tag: 'Dev' },
          },
        },
      },
    ],
  },
  {
    id: 'page-notes',
    title: 'Notas de Ingeniería & Código',
    icon: '💻',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    parentId: null,
    isFavorite: false,
    isTrash: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 7200000,
    blocks: [
      {
        id: 'b-code-h1',
        type: 'h2',
        content: 'Snippets & Comandos Útiles',
      },
      {
        id: 'b-code-p1',
        type: 'p',
        content: 'Ejemplo de bloque de código con sintaxis preformateada y botón de copia:',
      },
      {
        id: 'b-code-block-1',
        type: 'code',
        content: `// Función debounce para autoguardado instantáneo\nfunction debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {\n  let timer: any;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}`,
        language: 'typescript',
      },
      {
        id: 'b-code-toggle',
        type: 'toggle',
        content: 'Preguntas Frecuentes sobre LocalStorage',
        expanded: false,
      },
      {
        id: 'b-code-quote',
        type: 'quote',
        content: 'El código limpio se lee como una prosa bien escrita.',
      },
    ],
  },
  {
    id: 'page-showcase-100',
    title: '🚀 Notion 100% — Todas las Funciones',
    icon: '🚀',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    parentId: null,
    isFavorite: true,
    isTrash: false,
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now(),
    blocks: [
      {
        id: 'b-sc-callout',
        type: 'callout',
        content: '¡Esta página demuestra el 100% de paridad con Notion! Incluye Índice de Contenidos (TOC), Fórmulas KaTeX, Diagramas Mermaid, Calendario interactivo de eventos, Video embebido, Layout multi-columnas, Enlaces internos a páginas y Botón de plantilla reutilizable.',
        icon: '🌟',
      },
      {
        id: 'b-sc-toc',
        type: 'toc',
        content: '',
      },
      {
        id: 'b-sc-h2-math',
        type: 'h2',
        content: '📐 Fórmulas Matemáticas y KaTeX',
      },
      {
        id: 'b-sc-math',
        type: 'math',
        content: 'f(x) = \\int_{-\\infty}^\\infty \\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi \\quad \\text{y} \\quad E = mc^2',
      },
      {
        id: 'b-sc-h2-mermaid',
        type: 'h2',
        content: '📊 Diagramas de Flujo y Arquitectura (Mermaid.js)',
      },
      {
        id: 'b-sc-mermaid',
        type: 'mermaid',
        content: 'graph TD\n  A[👤 Usuario en Navegador] -->|Escribe notas| B[📝 Editor Notion Clone]\n  B -->|Notion AI| C[✨ Gemini / OpenAI / Ollama]\n  B -->|WebRTC P2P| D[👥 Amigo en Tiempo Real]\n  B -->|Almacenamiento| E[(💾 LocalStorage Seguro)]',
      },
      {
        id: 'b-sc-h2-cal',
        type: 'h2',
        content: '📅 Calendario Mensual de Tareas y Eventos',
      },
      {
        id: 'b-sc-cal',
        type: 'calendar',
        content: '',
        calendarData: {
          events: [
            { id: 'ev-1', title: 'Lanzamiento Notion Clone 100%', date: new Date().toISOString().slice(0, 10), color: '#ea580c' },
            { id: 'ev-2', title: 'Sesión de trabajo con amigo', date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), color: '#2563eb' },
            { id: 'ev-3', title: 'Revisión y exportación PDF/Markdown', date: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10), color: '#16a34a' },
          ],
        },
      },
      {
        id: 'b-sc-h2-video',
        type: 'h2',
        content: '🎥 Reproductor de Video Embebido',
      },
      {
        id: 'b-sc-video',
        type: 'video',
        content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        id: 'b-sc-h2-columns',
        type: 'h2',
        content: '🏛️ Layout en Columnas Paralelas',
      },
      {
        id: 'b-sc-columns',
        type: 'columns',
        content: '',
        columnsData: {
          columns: [
            [
              { id: 'sc-c1-1', type: 'h3', content: 'Columna Izquierda: Documentación' },
              { id: 'sc-c1-2', type: 'p', content: 'Puedes estructurar contenido en 2 o 3 columnas paralelas con bloques de texto independientes.' },
              { id: 'sc-c1-3', type: 'bullet', content: 'Atajo Markdown: Escribe `# `, `- `, `[] `, `> ` al inicio de línea.' },
            ],
            [
              { id: 'sc-c2-1', type: 'h3', content: 'Columna Derecha: Checklist' },
              { id: 'sc-c2-2', type: 'todo', content: 'Bloquear página con candado 🔒 en la barra superior', checked: true },
              { id: 'sc-c2-3', type: 'todo', content: 'Crear punto de restauración en Historial ⏱️', checked: true },
              { id: 'sc-c2-4', type: 'todo', content: 'Añadir nuevo bloque con comando Slash /', checked: false },
            ],
          ],
        },
      },
      {
        id: 'b-sc-h2-link',
        type: 'h2',
        content: '🔗 Enlace a Página Interna',
      },
      {
        id: 'b-sc-page-link',
        type: 'page-link',
        content: '',
        linkedPageId: 'page-home',
      },
      {
        id: 'b-sc-h2-template',
        type: 'h2',
        content: '⚡ Botón de Plantilla Reutilizable',
      },
      {
        id: 'b-sc-template-button',
        type: 'template-button',
        content: '',
        templateData: {
          buttonText: 'Añadir nueva tarea con notas rápidas',
          templateBlocks: [
            { id: 'tb-spawn-1', type: 'todo', content: 'Nueva tarea generada por plantilla', checked: false },
            { id: 'tb-spawn-2', type: 'bullet', content: 'Nota de seguimiento de la tarea' },
          ],
        },
      },
    ],
  },
];
