import { Peer } from 'peerjs';
import type { Page, Collaborator } from '../types';

export interface CollaborationMessage {
  type: 'INIT_SYNC' | 'PAGES_UPDATE' | 'USER_JOIN' | 'USER_LEAVE' | 'PING';
  pages?: Page[];
  sender: Collaborator;
  timestamp: number;
}

export type SyncCallback = (pages: Page[], sender: Collaborator) => void;
export type CollaboratorsCallback = (collaborators: Collaborator[]) => void;

class CollaborationService {
  private peer: Peer | null = null;
  private connections: Map<string, any> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private onSyncCallback: SyncCallback | null = null;
  private onCollaboratorsCallback: CollaboratorsCallback | null = null;
  private localUser: Collaborator | null = null;
  private activeCollaborators: Map<string, Collaborator> = new Map();
  private roomId: string | null = null;
  private isHost: boolean = false;

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

  public init(
    roomId: string,
    isHost: boolean,
    user: Collaborator,
    onSync: SyncCallback,
    onCollaborators: CollaboratorsCallback
  ) {
    this.roomId = roomId;
    this.isHost = isHost;
    this.localUser = user;
    this.onSyncCallback = onSync;
    this.onCollaboratorsCallback = onCollaborators;

    this.activeCollaborators.clear();
    this.activeCollaborators.set(user.id, user);
    this.notifyCollaborators();

    // Clean up existing peer if any
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    // Standard sanitized PeerJS ID
    const sanitizedRoomId = roomId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const peerId = isHost ? `notion-host-${sanitizedRoomId}` : `notion-peer-${sanitizedRoomId}-${user.id.slice(0, 5)}`;

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on('open', () => {
        console.log(`[P2P] Peer conectado con ID: ${peerId}`);

        if (!isHost) {
          // As guest, connect to the host
          const hostPeerId = `notion-host-${sanitizedRoomId}`;
          this.connectToPeer(hostPeerId);
        }
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('[P2P] PeerJS notice:', err);
      });
    } catch (err) {
      console.error('[P2P] Error initializing PeerJS:', err);
    }

    // Announce join via BroadcastChannel for multi-tab testing
    this.broadcastMessage({
      type: 'USER_JOIN',
      sender: user,
      timestamp: Date.now(),
    });
  }

  private connectToPeer(targetPeerId: string) {
    if (!this.peer) return;
    const conn = this.peer.connect(targetPeerId);
    this.setupConnection(conn);
  }

  private setupConnection(conn: any) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);

      // Send join announcement
      if (this.localUser) {
        conn.send({
          type: 'USER_JOIN',
          sender: this.localUser,
          timestamp: Date.now(),
        });
      }
    });

    conn.on('data', (data: any) => {
      this.handleIncomingMessage(data);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
  }

  public broadcastPagesUpdate(pages: Page[]) {
    if (!this.localUser) return;

    const message: CollaborationMessage = {
      type: 'PAGES_UPDATE',
      pages,
      sender: this.localUser,
      timestamp: Date.now(),
    };

    this.broadcastMessage(message);
  }

  private broadcastMessage(message: CollaborationMessage) {
    // 1. Send via WebRTC peer data channels
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(message);
        } catch (e) {
          console.error('[P2P] Error sending via WebRTC', e);
        }
      }
    });

    // 2. Send via local BroadcastChannel (same machine tabs)
    try {
      this.broadcastChannel?.postMessage(message);
    } catch (e) {
      // ignore
    }
  }

  private handleIncomingMessage(msg: CollaborationMessage) {
    if (!msg || !msg.type || msg.sender?.id === this.localUser?.id) {
      return; // Ignore own messages
    }

    // Register active collaborator
    if (msg.sender) {
      this.activeCollaborators.set(msg.sender.id, msg.sender);
      this.notifyCollaborators();
    }

    if (msg.type === 'USER_JOIN' && this.isHost && this.onSyncCallback) {
      // Host replies with initial state if requested
    }

    if ((msg.type === 'PAGES_UPDATE' || msg.type === 'INIT_SYNC') && msg.pages) {
      if (this.onSyncCallback) {
        this.onSyncCallback(msg.pages, msg.sender);
      }
    }

    if (msg.type === 'USER_LEAVE') {
      this.activeCollaborators.delete(msg.sender.id);
      this.notifyCollaborators();
    }
  }

  private notifyCollaborators() {
    if (this.onCollaboratorsCallback) {
      this.onCollaboratorsCallback(Array.from(this.activeCollaborators.values()));
    }
  }

  public leave() {
    if (this.localUser) {
      this.broadcastMessage({
        type: 'USER_LEAVE',
        sender: this.localUser,
        timestamp: Date.now(),
      });
    }

    this.connections.forEach((c) => c.close());
    this.connections.clear();

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
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
