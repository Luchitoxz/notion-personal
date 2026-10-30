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
  MessageCircle,
  Clock,
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

  const [customRoomInput, setCustomRoomInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentShareUrl = roomId
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : '';

  const handleCreateRandomRoom = () => {
    const newRoomCode = 'sala-' + Math.floor(1000 + Math.random() * 9000);
    startCollaboration(newRoomCode, true);
  };

  const handleJoinCustomRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoomInput.trim()) return;

    let targetRoom = customRoomInput.trim();
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
    setCustomRoomInput('');
  };

  const handleCopyLink = () => {
    if (!currentShareUrl) return;
    navigator.clipboard.writeText(currentShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!currentShareUrl) return;
    const text = encodeURIComponent(
      `¡Hola! Entra aquí a nuestro Notion personal para que editemos juntos en tiempo real:\n${currentShareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const hasFriendConnected = collaborators.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden text-sm flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Users size={17} className="text-amber-600 dark:text-amber-400" />
            <h2 className="font-semibold text-neutral-800 dark:text-neutral-100">
              Colaboración en Tiempo Real
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
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Active Room View */}
          {isCollaborating ? (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  hasFriendConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          hasFriendConnected ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      ></span>
                      <span
                        className={`relative inline-flex rounded-full h-3 w-3 ${
                          hasFriendConnected ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      ></span>
                    </span>
                    <div>
                      <span
                        className={`text-xs font-bold ${
                          hasFriendConnected
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {hasFriendConnected
                          ? `¡Conectados en vivo (${collaborators.length} personas)!`
                          : 'Esperando a que tu amigo se una...'}
                      </span>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Sala: <span className="font-mono font-bold text-neutral-700 dark:text-neutral-200">{roomId}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={stopCollaboration}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-950/50 shadow-xs"
                  >
                    <LogOut size={13} />
                    <span>Desconectar</span>
                  </button>
                </div>
              </div>

              {/* Share actions */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/80 space-y-3">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                  Pásale este enlace a tu amigo para estar juntos:
                </label>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentShareUrl}
                    className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 rounded-lg text-xs font-mono text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors shrink-0 shadow-xs"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedLink ? '¡Copiado!' : 'Copiar enlace'}</span>
                  </button>
                </div>

                {/* Direct WhatsApp Share Button */}
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <MessageCircle size={15} />
                  <span>Compartir directamente por WhatsApp</span>
                </button>

                <p className="text-[11px] text-neutral-400 text-center">
                  Cualquier cambio, nota o bloque que escribas se reflejará al instante en su pantalla.
                </p>
              </div>

              {/* Connected Users List */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Participantes en la sala ({collaborators.length})
                </label>
                <div className="space-y-1.5">
                  {collaborators.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/70"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{c.avatar}</span>
                        <div>
                          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                            {c.name}
                          </span>
                          {c.isHost && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold">
                              Creador
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>En vivo</span>
                      </div>
                    </div>
                  ))}

                  {!hasFriendConnected && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-xs text-neutral-400">
                      <Clock size={14} className="text-neutral-400" />
                      <span>Esperando a tu amigo... En cuanto abra el link aparecerá aquí.</span>
                    </div>
                  )}
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
                  Edita tus notas junto a tu amigo en tiempo real
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                  Sincronización instantánea por WebSocket y P2P. Sin registros, privado y sin demoras.
                </p>
              </div>

              {/* Quick Connect / Create Room */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800/40 space-y-3">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
                  1. Elige un nombre de sala (o usa uno compartido)
                </span>
                <p className="text-[11px] text-neutral-400">
                  Si tu amigo y tú escriben el mismo nombre (ej: <span className="font-mono font-bold text-neutral-600 dark:text-neutral-300">luchito</span>), entrarán directamente al mismo espacio.
                </p>
                <form onSubmit={handleJoinCustomRoom} className="flex gap-2">
                  <input
                    type="text"
                    value={customRoomInput}
                    onChange={(e) => setCustomRoomInput(e.target.value)}
                    placeholder="Ejemplo: luchito o pega un enlace..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg text-xs text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={!customRoomInput.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-xs font-medium disabled:opacity-40 shrink-0"
                  >
                    <LogIn size={13} />
                    <span>Conectar</span>
                  </button>
                </form>
              </div>

              {/* Or Auto-Generate Room */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800/40">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                  2. O genera un enlace nuevo automático
                </span>
                <p className="text-[11px] text-neutral-400 mb-3">
                  Crea una sala nueva con código aleatorio y cópiale el link a tu amigo.
                </p>
                <button
                  onClick={handleCreateRandomRoom}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                >
                  <Sparkles size={14} />
                  <span>Crear nueva sala y generar enlace</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-neutral-400 justify-center">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>La sala es privada y exclusiva para quienes tengan el código.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
