import React, { useRef, useState } from 'react';
import { useWorkspace } from '../../store/useWorkspace';
import {
  X,
  Sun,
  Moon,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Key,
  User,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, exportWorkspaceJSON, importWorkspaceJSON, resetWorkspace } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'profile'>('general');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importWorkspaceJSON(content);
        if (success) {
          setImportStatus('¡Espacio restaurado correctamente!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Error: formato de archivo inválido.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden text-sm flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="font-semibold text-neutral-800 dark:text-neutral-100">
            Configuración
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-xs">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            General & Apariencia
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2 px-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'ai'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Sparkles size={13} />
            <span>Inteligencia Artificial</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'profile'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <User size={13} />
            <span>Perfil & Colaboración</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'general' && (
            <>
              {/* Theme Mode */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Tema
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      settings.theme === 'light'
                        ? 'border-neutral-900 bg-neutral-100 dark:border-white text-neutral-900 dark:text-white'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Sun size={15} />
                    <span>Claro</span>
                  </button>
                  <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      settings.theme === 'dark'
                        ? 'border-neutral-900 bg-neutral-800 dark:border-white text-neutral-900 dark:text-white'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <Moon size={15} />
                    <span>Oscuro</span>
                  </button>
                </div>
              </div>

              {/* Typography */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Tipografía
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sans', 'serif', 'mono'] as const).map((font) => (
                    <button
                      key={font}
                      onClick={() => updateSettings({ fontStyle: font })}
                      className={`py-2 px-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                        settings.fontStyle === font
                          ? 'border-neutral-900 bg-neutral-100 dark:bg-neutral-800 dark:border-white text-neutral-900 dark:text-white'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {font === 'sans' ? 'Por defecto' : font === 'serif' ? 'Serifa' : 'Mono'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Width Toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                    Ancho completo
                  </span>
                  <p className="text-[11px] text-neutral-400">Expandir el lienzo de la página al 100%</p>
                </div>
                <button
                  onClick={() => updateSettings({ fullWidth: !settings.fullWidth })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    settings.fullWidth ? 'bg-amber-600' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      settings.fullWidth ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Backup & Restore */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-2">
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Copia de seguridad y Datos
                </label>

                <button
                  onClick={exportWorkspaceJSON}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-200"
                >
                  <div className="flex items-center gap-2">
                    <Download size={15} />
                    <span>Exportar espacio completo (JSON)</span>
                  </div>
                </button>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-200"
                  >
                    <div className="flex items-center gap-2">
                      <Upload size={15} />
                      <span>Importar copia de seguridad (JSON)</span>
                    </div>
                  </button>
                </div>

                {importStatus && (
                  <p className="text-xs text-center text-amber-600 dark:text-amber-400 pt-1 font-medium">
                    {importStatus}
                  </p>
                )}

                <button
                  onClick={() => {
                    if (window.confirm('¿Seguro que deseas reiniciar el espacio a la plantilla inicial? Se perderán las notas no guardadas en copia.')) {
                      resetWorkspace();
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs text-red-600 dark:text-red-400"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw size={15} />
                    <span>Restablecer a plantilla de fábrica</span>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* AI Settings Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Proveedor de Inteligencia Artificial
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'demo', label: 'Modo Demo', desc: 'Sin API Key requerida' },
                    { id: 'gemini', label: 'Google Gemini', desc: 'gemini-1.5-flash' },
                    { id: 'openai', label: 'OpenAI', desc: 'gpt-4o-mini / gpt-4o' },
                    { id: 'ollama', label: 'Ollama (Local)', desc: '100% privado en tu PC' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        updateSettings({
                          ai: { ...settings.ai, provider: p.id as any },
                        })
                      }
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        settings.ai.provider === p.id
                          ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-neutral-900 dark:text-neutral-100 shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <div className="font-medium text-xs">{p.label}</div>
                      <div className="text-[10px] text-neutral-400">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Input for Gemini or OpenAI */}
              {(settings.ai.provider === 'gemini' || settings.ai.provider === 'openai') && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-200">
                    API Key de {settings.ai.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60">
                    <Key size={14} className="text-neutral-400" />
                    <input
                      type="password"
                      value={settings.ai.apiKey}
                      onChange={(e) =>
                        updateSettings({
                          ai: { ...settings.ai, apiKey: e.target.value.trim() },
                        })
                      }
                      placeholder={settings.ai.provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                      className="w-full bg-transparent border-none outline-hidden text-xs text-neutral-800 dark:text-neutral-100 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {settings.ai.provider === 'gemini'
                      ? 'Tu clave se guarda únicamente en tu navegador (localStorage) y se llama directamente a Google.'
                      : 'Tu clave de OpenAI se almacena en local y no sale de tu equipo.'}
                  </p>
                </div>
              )}

              {/* Ollama Base URL */}
              {settings.ai.provider === 'ollama' && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-200">
                    URL de Ollama Local
                  </label>
                  <input
                    type="text"
                    value={settings.ai.baseUrl || 'http://localhost:11434/v1'}
                    onChange={(e) =>
                      updateSettings({
                        ai: { ...settings.ai, baseUrl: e.target.value.trim() },
                      })
                    }
                    placeholder="http://localhost:11434/v1"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-xs font-mono text-neutral-800 dark:text-neutral-100 outline-hidden"
                  />
                </div>
              )}

              {/* Model selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                  Nombre del modelo
                </label>
                <input
                  type="text"
                  value={settings.ai.model}
                  onChange={(e) =>
                    updateSettings({
                      ai: { ...settings.ai, model: e.target.value.trim() },
                    })
                  }
                  placeholder={
                    settings.ai.provider === 'gemini'
                      ? 'gemini-1.5-flash'
                      : settings.ai.provider === 'openai'
                      ? 'gpt-4o-mini'
                      : 'llama3'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-xs font-mono text-neutral-800 dark:text-neutral-100 outline-hidden"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-semibold block mb-0.5">Tip:</span>
                Puedes invocar al asistente de IA presionando el botón con destellos ✨ en la barra superior o seleccionando la opción en el menú de comandos con barra inclinada (`/ai`).
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                  Tu nombre de colaborador
                </label>
                <input
                  type="text"
                  value={settings.userName}
                  onChange={(e) => updateSettings({ userName: e.target.value })}
                  placeholder="Tu nombre (ej. Luchito)"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-800 dark:text-neutral-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                  Tu avatar
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl">
                    {settings.userAvatar}
                  </div>
                  <input
                    type="text"
                    value={settings.userAvatar}
                    onChange={(e) => updateSettings({ userAvatar: e.target.value })}
                    maxLength={2}
                    className="w-16 px-3 py-2 text-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-xs outline-hidden"
                  />
                  <span className="text-xs text-neutral-400">Escribe cualquier emoji como avatar</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
