import type { AISettings } from '../types';

const SYSTEM_PROMPT = `Eres el asistente de inteligencia artificial integrado en un clon personal de Notion (estilo Notion AI).
Tu objetivo es ayudar al usuario a escribir notas claras, organizar ideas, resumir documentos, redactar tareas accionables y expandir conceptos de manera concisa, estructurada y profesional.
Responde directamente con el contenido solicitado, sin saludos innecesarios ni preámbulos, usando formato Markdown limpio.`;

export async function requestAICompletion(
  instruction: string,
  contextContent: string,
  settings: AISettings
): Promise<string> {
  const provider = settings.provider || 'demo';

  // 1. Google Gemini API
  if (provider === 'gemini') {
    if (!settings.apiKey) {
      throw new Error('Por favor, ingresa tu API Key de Google Gemini en la configuración de IA.');
    }

    const model = settings.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`;

    const promptText = `${SYSTEM_PROMPT}\n\n[CONTEXTO DE LA PÁGINA ACTUAL]:\n${contextContent || 'Página en blanco'}\n\n[INSTRUCCIÓN DEL USUARIO]:\n${instruction}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Error en la API de Gemini: ${response.statusText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('Gemini no generó ninguna respuesta para este prompt.');
    }
    return candidate.trim();
  }

  // 2. OpenAI / Ollama Compatible API
  if (provider === 'openai' || provider === 'ollama') {
    const isOllama = provider === 'ollama';
    const baseUrl = settings.baseUrl || (isOllama ? 'http://localhost:11434/v1' : 'https://api.openai.com/v1');
    const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

    if (!isOllama && !settings.apiKey) {
      throw new Error('Por favor, ingresa tu API Key de OpenAI en la configuración de IA.');
    }

    const model = settings.model || (isOllama ? 'llama3' : 'gpt-4o-mini');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (settings.apiKey) {
      headers['Authorization'] = `Bearer ${settings.apiKey}`;
    }

    const userContent = contextContent
      ? `[CONTEXTO DE LA NOTA]:\n${contextContent}\n\n[INSTRUCCIÓN]:\n${instruction}`
      : instruction;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Error de conexión con ${provider}: ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content;
    if (!message) {
      throw new Error(`El modelo no generó ninguna respuesta.`);
    }
    return message.trim();
  }

  // 3. Smart Demo Simulator (Works out-of-the-box without API keys)
  await new Promise((resolve) => setTimeout(resolve, 600)); // natural reading pause

  const lowerInst = instruction.toLowerCase();

  if (lowerInst.includes('resumir') || lowerInst.includes('resumen') || lowerInst.includes('summary')) {
    return `### 📌 Resumen Ejecutivo de la Nota\n\n- **Tema principal:** Síntesis estructurada y objetivos clave detectados en el documento.\n- **Puntos clave:**\n  1. Claridad en la ejecución y distribución de tareas.\n  2. Enfoque modular con iteraciones rápidas.\n  3. Consolidación de información en una única fuente de verdad.\n- **Conclusión:** La nota presenta un marco de trabajo sólido listo para pasar a la fase de acción.`;
  }

  if (lowerInst.includes('tarea') || lowerInst.includes('todo') || lowerInst.includes('checklist') || lowerInst.includes('accion')) {
    return `### ✅ Lista de Tareas Accionables\n\n- [ ] Definir el alcance mínimo viable (MVP) del entregable\n- [ ] Asignar responsables y fecha límite tentativa para cada fase\n- [ ] Revisar requerimientos técnicos y dependencias críticas\n- [ ] Ejecutar prueba de concepto y recopilar feedback inicial\n- [ ] Documentar aprendizajes en el espacio compartido`;
  }

  if (lowerInst.includes('traducir') || lowerInst.includes('translate')) {
    if (lowerInst.includes('ingles') || lowerInst.includes('english')) {
      return `This is a high-level summary of your document translated to English: Every project benefits from clean structure, continuous alignment, and fast feedback loops.`;
    }
    return `Esta es la traducción al español: Todo proyecto se beneficia de una estructura limpia, alineación constante y ciclos rápidos de retroalimentación.`;
  }

  if (lowerInst.includes('continuar') || lowerInst.includes('seguir')) {
    return `Continuando con el desarrollo de estas ideas, resulta fundamental establecer métricas cuantitativas que permitan validar el avance semana a semana. Además, la estandarización de procesos reduce la fricción operativa y garantiza que cualquier colaborador pueda retomar el trabajo sin dependencias críticas.`;
  }

  if (lowerInst.includes('idea') || lowerInst.includes('brainstorm')) {
    return `### 💡 Ideas y Líneas Estratégicas\n\n1. **Automatización temprana:** Identificar cuellos de botella manuales y sustituirlos por scripts ligeros.\n2. **Plantillas reutilizables:** Crear frameworks de notas estándar para reuniones y retrospectivas.\n3. **Base de conocimiento compartida:** Fomentar una cultura donde cada solución quede indexada para el equipo.`;
  }

  // Generic creative completion
  return `### 💡 Análisis y Respuesta de IA\n\nEn respuesta a **"${instruction}"**:\n\nPara abordar este punto con efectividad, se recomienda desglosarlo en tres etapas ordenadas:\n\n1. **Diagnóstico inicial:** Identificar variables críticas y objetivos prioritarios.\n2. **Ejecución iterativa:** Implementar mejoras incrementales manteniendo la visión general.\n3. **Revisión y ajuste:** Evaluar resultados y refinar según el feedback obtenido.\n\n> *Nota: Puedes conectar tu propia API Key de Google Gemini u OpenAI en la Configuración para obtener respuestas en vivo sin límites.*`;
}
