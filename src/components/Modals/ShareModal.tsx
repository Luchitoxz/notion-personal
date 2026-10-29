import React, { useState } from 'react';
import { useWorkspace } from '../../store/useWorkspace';
import {
  X,
  Users,
  Copy,
  Check,
  Radio,
  LogIn,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const {
    roomId,
    isCollaborating,
    collaborators,
    startCollaboration,
    stopCollaboration,
  } = useWorkspace();

  const [joinInput, setJoinInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentShareUrl = roomId
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : '';

  const handleCreateRoom = () => {
    const newRoomCode = 'sala-' + Math.floor(1000 + Math.random() * 9000);
    startCollaboration(newRoomCode, true);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInput.trim()) return;

    let targetRoom = joinInput.trim();
    // If user pasted a full URL
    if (targetRoom.includes('room=')) {
      try {
        const url = new URL(targetRoom);
        const param = url.searchParams.get('room');
        if (param) targetRoom = param;
      } catch (e) {
        // use as is
      }
    }

    startCollaboration(targetRoom, false);
    setJoinInput('');
  };

  const handleCopyLink = () => {
    if (!currentShareUrl) return;
    navigator.clipboard.writeText(currentShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden text-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Users size={17} className="text-amber-600 dark:text-amber-400" />
            <h2 className="font-semibold text-neutral-800 dark:text-neutral-100">
              Colaboración en Vivo (P2P con un Amigo)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Active Room View */}
          {isCollaborating ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Sala de colaboración activa
                    </span>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      Código: <span className="font-mono font-bold">{roomId}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={stopCollaboration}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  <LogOut size={13} />
                  <span>Salir</span>
                </button>
              </div>

              {/* Share link box */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Enlace para tu amigo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentShareUrl}
                    className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-mono text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedLink ? '¡Copiado!' : 'Copiar Enlace'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Tu amigo solo necesita abrir este enlace en su navegador para sincronizarse en vivo.
                </p>
              </div>

              {/* Connected Users List */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Participantes conectados ({collaborators.length})
                </label>
                <div className="space-y-1.5">
                  {collaborators.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.avatar}</span>
                        <div>
                          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                            {c.name}
                          </span>
                          {c.isHost && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold">
                              Anfitrión
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>En línea</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Not Collaborating: Options to Host or Join */
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                  <Radio size={24} />
                </div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 text-sm">
                  Comparte tu espacio en tiempo real
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                  Funciona punto a punto (WebRTC P2P) y mediante canales directos. Sin bases de datos externas obligatorias ni registros.
                </p>
              </div>

              {/* Host Option */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/30">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 block mb-1">
                  1. Crear una sala para invitar a alguien
                </span>
                <p className="text-[11px] text-neutral-400 mb-3">
                  Genera una sala con tus notas actuales para que tu amigo pueda verlas y editarlas contigo.
                </p>
                <button
                  onClick={handleCreateRoom}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                >
                  <Sparkles size={14} />
                  <span>Crear nueva sala de colaboración</span>
                </button>
              </div>

              {/* Join Option */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/30">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 block mb-1">
                  2. Unirme a la sala de mi amigo
                </span>
                <p className="text-[11px] text-neutral-400 mb-2">
                  Pega el código de sala o el enlace completo que te compartió tu amigo.
                </p>
                <form onSubmit={handleJoinRoom} className="flex gap-2">
                  <input
                    type="text"
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value)}
                    placeholder="Ejemplo: sala-4829 o pega el enlace..."
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-neutral-800 rounded-lg text-xs text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={!joinInput.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-xs font-medium disabled:opacity-40"
                  >
                    <LogIn size={13} />
                    <span>Unirse</span>
                  </button>
                </form>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>La sincronización es cifrada y directa entre navegadores.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
