import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { yCollab, yRemoteSelectionsTheme } from 'y-codemirror.next';
import { Awareness } from 'y-protocols/awareness';
import { Compartment, StateEffect } from '@codemirror/state';
import { EventEmitter } from 'events';
import type { EditorView } from '@codemirror/view';

const signaling = ['wss://yjs.ldlework.com'];

const userColors = [
  { color: '#30bced' },
  { color: '#6eeb83' },
  { color: '#ffbc42' },
  { color: '#ecd444' },
  { color: '#ee6352' },
  { color: '#9ac2c9' },
  { color: '#8acb88' },
  { color: '#1be7ff' }
];

const pickUserColor = () => userColors[Math.floor(Math.random() * userColors.length)];

const STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
} as const;

export type CollabStatus = typeof STATUS[keyof typeof STATUS];

export interface CollabConnectionInfo {
  status: CollabStatus;
  peerCount: number;
}

export interface CollabPeer {
  id: number;
  name: string;
  color: string;
  activeEditor?: 'strudel' | 'punctual';
}

/**
 * Dual-editor collaboration session using Yjs and WebRTC.
 * Manages two Y.Text fields (strudel, punctual) in a single Y.Doc with shared awareness.
 */
export class DualEditorCollabSession extends EventEmitter {
  private strudelEditor: EditorView | null = null;
  private punctualEditor: EditorView | null = null;
  private strudelCompartment: Compartment | null = null;
  private punctualCompartment: Compartment | null = null;
  
  private ydoc: Y.Doc | null = null;
  private ytextStrudel: Y.Text | null = null;
  private ytextPunctual: Y.Text | null = null;
  private ymeta: Y.Map<any> | null = null;
  private provider: WebrtcProvider | null = null;
  
  private status: CollabStatus = STATUS.DISCONNECTED;
  private peerCount = 0;
  private lastEvaluateTime = 0;
  private lobbyId: string | null = null;

  constructor() {
    super();
  }

  /**
   * Set the Strudel editor and its collab compartment
   */
  setStrudelEditor(editor: EditorView, compartment: Compartment) {
    this.strudelEditor = editor;
    this.strudelCompartment = compartment;
  }

  /**
   * Set the Punctual editor and its collab compartment
   */
  setPunctualEditor(editor: EditorView, compartment: Compartment) {
    this.punctualEditor = editor;
    this.punctualCompartment = compartment;
  }

  private initializeYjsDocument() {
    this.ydoc = new Y.Doc();
    this.ytextStrudel = this.ydoc.getText('strudel');
    this.ytextPunctual = this.ydoc.getText('punctual');
    this.ymeta = this.ydoc.getMap('meta');
  }

  private createAwareness(username: string) {
    if (!this.ydoc) throw new Error('Y.Doc not initialized');
    
    const awareness = new Awareness(this.ydoc);
    awareness.setLocalStateField('user', {
      ...pickUserColor(),
      name: username,
    });
    return awareness;
  }

  private createProvider(awareness: Awareness) {
    if (!this.ydoc || !this.lobbyId) throw new Error('Y.Doc or lobbyId not initialized');
    
    this.provider = new WebrtcProvider(this.lobbyId, this.ydoc, {
      signaling,
      awareness,
      password: undefined,
      filterBcConns: false,
    });
  }

  private handleInitialSync(strudelContent: string, punctualContent: string, myTicket: any) {
    if (!this.ymeta || !this.ytextStrudel || !this.ytextPunctual || !this.provider) return;

    console.log('[collab] Initial sync starting', {
      strudelContentLen: strudelContent.length,
      punctualContentLen: punctualContent.length,
      ytextStrudelLen: this.ytextStrudel.length,
      ytextPunctualLen: this.ytextPunctual.length,
    });

    // Find earliest ticket (winner gets to set initial content)
    let winner = myTicket;
    this.ymeta.forEach((value, key) => {
      if (key.startsWith('ticket_') && value.timestamp < winner.timestamp) {
        winner = value;
      }
    });
    
    console.log('[collab] Ticket winner:', winner.id === myTicket.id ? 'ME' : 'OTHER');
    
    // If we're the winner and Y.Text is empty, populate it with our local content
    if (winner.id === myTicket.id) {
      if (this.ytextStrudel.length === 0 && strudelContent.length > 0) {
        console.log('[collab] Populating Strudel Y.Text');
        this.ytextStrudel.insert(0, strudelContent);
      }
      if (this.ytextPunctual.length === 0 && punctualContent.length > 0) {
        console.log('[collab] Populating Punctual Y.Text');
        this.ytextPunctual.insert(0, punctualContent);
      }
    }
    
    // Replace local content with Y.Text content
    if (this.strudelEditor) {
      const strudelYContent = this.ytextStrudel.toString();
      console.log('[collab] Setting Strudel content from Y.Text:', strudelYContent.substring(0, 50));
      this.strudelEditor.dispatch({
        changes: { from: 0, to: this.strudelEditor.state.doc.length, insert: strudelYContent }
      });
    }
    
    if (this.punctualEditor) {
      const punctualYContent = this.ytextPunctual.toString();
      console.log('[collab] Setting Punctual content from Y.Text:', punctualYContent.substring(0, 50));
      this.punctualEditor.dispatch({
        changes: { from: 0, to: this.punctualEditor.state.doc.length, insert: punctualYContent }
      });
    }
    
    // Activate collab extensions
    if (this.strudelEditor && this.strudelCompartment && this.provider) {
      console.log('[collab] Activating Strudel yCollab', {
        ytextLen: this.ytextStrudel.length,
        awarenessStates: this.provider.awareness.getStates().size,
      });
      this.strudelEditor.dispatch({
        effects: this.strudelCompartment.reconfigure([
          yCollab(this.ytextStrudel, this.provider.awareness),
          yRemoteSelectionsTheme,
        ])
      });
      console.log('[collab] Strudel yCollab activated');
    }
    
    if (this.punctualEditor && this.punctualCompartment && this.provider) {
      console.log('[collab] Activating Punctual yCollab', {
        ytextLen: this.ytextPunctual.length,
        awarenessStates: this.provider.awareness.getStates().size,
      });
      this.punctualEditor.dispatch({
        effects: this.punctualCompartment.reconfigure([
          yCollab(this.ytextPunctual, this.provider.awareness),
          yRemoteSelectionsTheme,
        ])
      });
      console.log('[collab] Punctual yCollab activated');
    }
    
    console.log('[collab] Initial sync complete');
  }

  private handleProviderStatus({ connected }: { connected: boolean }) {
    const newStatus = connected ? STATUS.CONNECTED : STATUS.DISCONNECTED;
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.emit('statusChange');
    }
  }

  private handlePeerCountChange() {
    if (!this.provider) return;
    
    const states = this.provider.awareness.getStates();
    const newPeerCount = states.size - 1;
    
    if (this.peerCount !== newPeerCount) {
      this.peerCount = newPeerCount;
      this.emit('peerCountChange');
    }
  }

  private handlePeerEvaluate({ added, updated }: { added: number[], updated: number[] }) {
    if (!this.provider) return;
    
    [...added, ...updated].forEach(clientID => {
      if (clientID === this.provider!.awareness.clientID) return; // Skip self
      const state = this.provider!.awareness.getStates().get(clientID);
      if (state?.evaluate && state.evaluate !== this.lastEvaluateTime) {
        this.lastEvaluateTime = state.evaluate;
        this.emit('evaluate');
      }
    });
  }

  private registerTicket() {
    if (!this.ymeta) throw new Error('ymeta not initialized');
    
    const strudelContent = this.strudelEditor?.state?.doc?.toString() || '';
    const punctualContent = this.punctualEditor?.state?.doc?.toString() || '';
    
    const myTicket = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: Date.now()
    };
    
    this.ymeta.set(`ticket_${myTicket.id}`, myTicket);
    return { strudelContent, punctualContent, myTicket };
  }

  async connect(lobbyId: string, username = 'Anonymous') {
    if (!this.strudelEditor || !this.punctualEditor) {
      throw new Error('Both editors must be set before connecting');
    }
    if (!this.strudelCompartment || !this.punctualCompartment) {
      throw new Error('Both compartments must be set before connecting');
    }

    this.lobbyId = lobbyId;
    this.status = STATUS.CONNECTING;
    this.peerCount = 0;
    this.emit('statusChange');

    this.initializeYjsDocument();
    const awareness = this.createAwareness(username);
    this.createProvider(awareness);
    const { strudelContent, punctualContent, myTicket } = this.registerTicket();
    
    const connectionPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout: Unable to connect to signaling server. Please check your network connection.'));
      }, 10000);
      
      this.provider!.once('status', (e: any) => {
        if (e.connected) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
    
    if (this.provider) {
      this.provider.once('synced', () => this.handleInitialSync(strudelContent, punctualContent, myTicket));
      this.provider.on('status', (e: any) => this.handleProviderStatus(e));
      this.provider.awareness.on('change', () => this.handlePeerCountChange());
      this.provider.awareness.on('change', (e: any) => this.handlePeerEvaluate(e));
    }
    
    try {
      await connectionPromise;
    } catch (err) {
      this.disconnect();
      throw err;
    }
  }

  getConnectionInfo(): CollabConnectionInfo {
    return {
      status: this.status,
      peerCount: this.peerCount,
    };
  }

  getPeers(): CollabPeer[] {
    if (!this.provider) return [];
    
    const states = this.provider.awareness.getStates();
    const peers: CollabPeer[] = [];
    const myClientID = this.provider.awareness.clientID;
    
    states.forEach((state, clientID) => {
      if (clientID !== myClientID) {
        peers.push({
          id: clientID,
          name: state.user?.name || 'Anonymous',
          color: state.user?.color || '#888',
          activeEditor: state.activeEditor,
        });
      }
    });
    
    return peers;
  }

  setActiveEditor(editor: 'strudel' | 'punctual') {
    if (!this.provider) return;

    const currentState = this.provider.awareness.getLocalState() || {};
    this.provider.awareness.setLocalState({
      ...currentState,
      activeEditor: editor,
    });
  }

  broadcastEvaluate() {
    if (!this.provider) return;

    const currentState = this.provider.awareness.getLocalState() || {};
    this.provider.awareness.setLocalState({
      ...currentState,
      evaluate: Date.now(),
    });
  }

  disconnect() {
    // Deactivate collab extensions
    if (this.strudelEditor && this.strudelCompartment) {
      this.strudelEditor.dispatch({
        effects: this.strudelCompartment.reconfigure([])
      });
    }
    
    if (this.punctualEditor && this.punctualCompartment) {
      this.punctualEditor.dispatch({
        effects: this.punctualCompartment.reconfigure([])
      });
    }
    
    this.provider?.destroy();
    this.ydoc?.destroy();
    
    this.provider = null;
    this.ydoc = null;
    this.ytextStrudel = null;
    this.ytextPunctual = null;
    this.status = STATUS.DISCONNECTED;
    this.peerCount = 0;
    
    this.emit('statusChange');
    this.emit('peerCountChange');
  }

  isConnected(): boolean {
    return this.status === STATUS.CONNECTED;
  }
}
