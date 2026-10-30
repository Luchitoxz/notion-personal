import mqtt, { type MqttClient } from 'mqtt';
import type { Page, Collaborator } from '../types';

export interface CollaborationMessage {
  type: 'REQUEST_SYNC' | 'FULL_SYNC' | 'PAGES_UPDATE' | 'USER_JOIN' | 'USER_LEAVE' | 'HEARTBEAT';
  pages?: Page[];
  sender: Collaborator;
  timestamp: number;
}

export type SyncCallback = (pages: Page[], sender: Collaborator) => void;
export type CollaboratorsCallback = (collaborators: Collaborator[]) => void;

const BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

class CollaborationService {
  private client: MqttClient | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private onSyncCallback: SyncCallback | null = null;
  private onCollaboratorsCallback: CollaboratorsCallback | null = null;
  private localUser: Collaborator | null = null;
  private activeCollaborators: Map<string, Collaborator> = new Map();
  private roomId: string | null = null;
  private heartbeatInterval: any = null;
  private cleanupInterval: any = null;
  private latestPages: Page[] = [];
  private currentBrokerIndex = 0;

  constructor() {
    try {
      this.broadcastChannel = new BroadcastChannel('notion_p2p_channel');
      this.broadcastChannel.onmessage = (event) => {
        this.handleIncomingMessage(event.data);
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this browser environment', e);
    }
  }

  public setLatestPages(pages: Page[]) {
    this.latestPages = pages;
  }

  public init(
    roomId: string,
    _isHost: boolean,
    user: Collaborator,
    onSync: SyncCallback,
    onCollaborators: CollaboratorsCallback
  ) {
    this.leave();

    this.roomId = roomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    this.localUser = user;
    this.onSyncCallback = onSync;
    this.onCollaboratorsCallback = onCollaborators;

    this.activeCollaborators.clear();
    this.activeCollaborators.set(user.id, user);
    this.notifyCollaborators();

    this.connectMqtt();
    this.startHeartbeat();
    this.startCleanupTimer();

    // Broadcast on local channel too
    this.broadcastLocal({
      type: 'USER_JOIN',
      sender: user,
      timestamp: Date.now(),
    });
  }

  private connectMqtt() {
    const brokerUrl = BROKERS[this.currentBrokerIndex % BROKERS.length];
    const clientId = `notion_${Math.random().toString(36).slice(2, 10)}`;

    try {
      this.client = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 8000,
        reconnectPeriod: 3000,
        keepalive: 30,
      });

      const presenceTopic = `notion_p2p/${this.roomId}/presence`;
      const syncTopic = `notion_p2p/${this.roomId}/sync`;

      this.client.on('connect', () => {
        console.log(`[P2P] Conectado al broker de colaboración (${brokerUrl}) en sala: ${this.roomId}`);
        
        this.client?.subscribe([presenceTopic, syncTopic], (err) => {
          if (!err && this.localUser) {
            // Anunciar entrada inmediatamente
            this.sendPresence('USER_JOIN');

            // Si somos invitados o acabamos de conectar, pedir el estado actual de las notas
            this.publishMessage(syncTopic, {
              type: 'REQUEST_SYNC',
              sender: this.localUser,
              timestamp: Date.now(),
            });
          }
        });
      });

      this.client.on('message', (_topic, payload) => {
        try {
          const parsed = JSON.parse(payload.toString()) as CollaborationMessage;
          this.handleIncomingMessage(parsed);
        } catch (e) {
          console.warn('[P2P] Error parseando mensaje entrante:', e);
        }
      });

      this.client.on('error', (err) => {
        console.warn('[P2P] MQTT error:', err);
        // Fallback to next broker if connection fails
        this.client?.end(true);
        this.currentBrokerIndex++;
        setTimeout(() => {
          if (this.roomId) this.connectMqtt();
        }, 2000);
      });
    } catch (e) {
      console.error('[P2P] Error al iniciar conexión MQTT:', e);
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      this.sendPresence('HEARTBEAT');
    }, 3000);
  }

  private startCleanupTimer() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let changed = false;

      this.activeCollaborators.forEach((collaborator, id) => {
        if (id !== this.localUser?.id && now - collaborator.lastActive > 9000) {
          this.activeCollaborators.delete(id);
          changed = true;
        }
      });

      if (changed) {
        this.notifyCollaborators();
      }
    }, 4000);
  }

  private sendPresence(type: 'USER_JOIN' | 'HEARTBEAT') {
    if (!this.localUser || !this.roomId) return;
    this.localUser.lastActive = Date.now();

    const msg: CollaborationMessage = {
      type,
      sender: this.localUser,
      timestamp: Date.now(),
    };

    const topic = `notion_p2p/${this.roomId}/presence`;
    this.publishMessage(topic, msg);
    this.broadcastLocal(msg);
  }

  public broadcastPagesUpdate(pages: Page[]) {
    if (!this.localUser || !this.roomId) return;
    this.latestPages = pages;

    const message: CollaborationMessage = {
      type: 'PAGES_UPDATE',
      pages,
      sender: this.localUser,
      timestamp: Date.now(),
    };

    const topic = `notion_p2p/${this.roomId}/sync`;
    this.publishMessage(topic, message);
    this.broadcastLocal(message);
  }

  private publishMessage(topic: string, message: CollaborationMessage) {
    if (this.client && this.client.connected) {
      try {
        this.client.publish(topic, JSON.stringify(message), { qos: 1 });
      } catch (e) {
        console.error('[P2P] Error publicando mensaje MQTT:', e);
      }
    }
  }

  private broadcastLocal(message: CollaborationMessage) {
    try {
      this.broadcastChannel?.postMessage(message);
    } catch (e) {
      // Ignorar
    }
  }

  private handleIncomingMessage(msg: CollaborationMessage) {
    if (!msg || !msg.sender || msg.sender.id === this.localUser?.id) {
      return; // Ignorar nuestros propios mensajes
    }

    // Registrar o actualizar presencia del colaborador
    this.activeCollaborators.set(msg.sender.id, {
      ...msg.sender,
      lastActive: Date.now(),
    });
    this.notifyCollaborators();

    // Si otro usuario se une o solicita sync y tenemos notas, le enviamos una copia completa
    if ((msg.type === 'REQUEST_SYNC' || msg.type === 'USER_JOIN') && this.latestPages.length > 0) {
      if (this.localUser && this.roomId) {
        const syncMsg: CollaborationMessage = {
          type: 'FULL_SYNC',
          pages: this.latestPages,
          sender: this.localUser,
          timestamp: Date.now(),
        };
        const topic = `notion_p2p/${this.roomId}/sync`;
        this.publishMessage(topic, syncMsg);
      }
    }

    // Si recibimos una actualización o sincronización completa de páginas
    if ((msg.type === 'PAGES_UPDATE' || msg.type === 'FULL_SYNC') && msg.pages && msg.pages.length > 0) {
      if (this.onSyncCallback) {
        this.onSyncCallback(msg.pages, msg.sender);
      }
    }

    // Si el colaborador se desconecta voluntariamente
    if (msg.type === 'USER_LEAVE') {
      this.activeCollaborators.delete(msg.sender.id);
      this.notifyCollaborators();
    }
  }

  private notifyCollaborators() {
    if (this.onCollaboratorsCallback) {
      const list = Array.from(this.activeCollaborators.values());
      this.onCollaboratorsCallback(list);
    }
  }

  public leave() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);

    if (this.localUser && this.roomId) {
      const leaveMsg: CollaborationMessage = {
        type: 'USER_LEAVE',
        sender: this.localUser,
        timestamp: Date.now(),
      };
      const topic = `notion_p2p/${this.roomId}/presence`;
      this.publishMessage(topic, leaveMsg);
      this.broadcastLocal(leaveMsg);
    }

    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {
        // Ignorar
      }
      this.client = null;
    }

    this.roomId = null;
    this.activeCollaborators.clear();
    this.notifyCollaborators();
  }

  public getRoomId(): string | null {
    return this.roomId;
  }
}

export const collaboration = new CollaborationService();
