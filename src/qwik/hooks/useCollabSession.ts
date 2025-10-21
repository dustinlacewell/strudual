import { useSignal, useVisibleTask$, useContext, $ } from '@builder.io/qwik';
import { DualEditorCollabSession } from '@/utils/collabSession';
import type { CollabPeer, CollabStatus } from '@/utils/collabSession';
import { StrudelContext } from '@/contexts/strudelContext';
import { PunctualContext } from '@/contexts/punctualContext';
import { Compartment, StateEffect } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { getCollabParams, setCollabParams } from '@/utils/urlParams';

export function useCollabSession() {
  const { strudelRef, strudelEditorRef, strudelCollabCompartmentRef } = useContext(StrudelContext);
  const { punctualAnimatorRef, punctualEditorRef, punctualCollabCompartmentRef } = useContext(PunctualContext);
  
  const session = useSignal<DualEditorCollabSession | null>(null);
  const status = useSignal<CollabStatus>('disconnected');
  const peerCount = useSignal(0);
  const peers = useSignal<CollabPeer[]>([]);
  const isReady = useSignal(false);
  const username = useSignal('');
  const roomName = useSignal('');

  // Initialize from URL params on client side
  useVisibleTask$(() => {
    const urlParams = getCollabParams();
    if (urlParams.username) username.value = urlParams.username;
    if (urlParams.room) roomName.value = urlParams.room;
  });
  
  // Return URL params for external use
  const hasUrlParams = useSignal(false);
  useVisibleTask$(() => {
    const urlParams = getCollabParams();
    hasUrlParams.value = !!urlParams.room;
  });

  // Initialize session when both editors are ready
  useVisibleTask$(({ track, cleanup }) => {
    // Track editor refs so this runs when they change
    track(() => strudelEditorRef.value);
    track(() => punctualEditorRef.value);
    
    if (!strudelEditorRef.value || !punctualEditorRef.value || 
        !strudelCollabCompartmentRef.value || !punctualCollabCompartmentRef.value) {
      isReady.value = false;
      return;
    }

    // Get the EditorView instances (both refs now contain EditorView directly)
    const strudelEditor = strudelEditorRef.value;
    const punctualEditor = punctualEditorRef.value;

    console.log('[collab] Using existing compartments from editors');
    
    // Don't create a new session if one already exists
    if (session.value) {
      console.log('[collab] Session already exists, cleaning up old one');
      session.value.disconnect();
    }
    
    const collabSession = new DualEditorCollabSession();
    
    // Store session immediately so it doesn't get garbage collected
    session.value = collabSession;
    
    // Use the existing compartments that are already in the editors
    collabSession.setStrudelEditor(strudelEditor, strudelCollabCompartmentRef.value);
    collabSession.setPunctualEditor(punctualEditor, punctualCollabCompartmentRef.value);
    
    console.log('[collab] Session created and configured');
    
    // Event handlers
    const handleStatusChange = () => {
      const info = collabSession.getConnectionInfo();
      status.value = info.status;
    };
    
    const handlePeerCountChange = () => {
      const info = collabSession.getConnectionInfo();
      peerCount.value = info.peerCount;
      peers.value = collabSession.getPeers();
    };
    
    const handleRemoteEvaluate = async () => {
      console.log('[collab] Received remote evaluation request', {
        strudelPlaying: strudelRef.value?.isPlaying?.(),
        hasPunctualAnimator: !!punctualAnimatorRef.value,
        hasPunctualEditor: !!punctualEditorRef.value,
      });
      
      // Only evaluate if Strudel is already playing (don't start sound on remote eval)
      if (strudelRef.value?.isPlaying?.() && strudelEditorRef.value) {
        console.log('[collab] Strudel is playing, evaluating...');
        try {
          const strudelCode = strudelEditorRef.value.state.doc.toString();
          await strudelRef.value.evaluate(strudelCode);
        } catch (err) {
          console.warn('[collab] Remote Strudel evaluation failed:', (err as Error).message);
        }
      } else {
        console.log('[collab] Skipping Strudel eval - not playing');
      }
      
      // Always evaluate Punctual (visuals only, no sound)
      if (punctualAnimatorRef.value && punctualEditorRef.value) {
        console.log('[collab] Evaluating Punctual...');
        try {
          const punctualCode = punctualEditorRef.value.state.doc.toString();
          await punctualAnimatorRef.value.evaluate(punctualCode);
        } catch (err) {
          console.warn('[collab] Remote Punctual evaluation failed:', (err as Error).message);
        }
      } else {
        console.log('[collab] Skipping Punctual eval - missing animator or editor');
      }
    };
    
    collabSession.on('statusChange', handleStatusChange);
    collabSession.on('peerCountChange', handlePeerCountChange);
    collabSession.on('evaluate', handleRemoteEvaluate);
    
    session.value = collabSession;
    status.value = collabSession.getConnectionInfo().status;
    peerCount.value = collabSession.getConnectionInfo().peerCount;
    isReady.value = true;
    
    // Auto-connect if URL params are present
    const params = getCollabParams();
    if (params.room && params.username) {
      console.log('[collab] Auto-connecting from URL params:', params);
      setTimeout(async () => {
        try {
          await collabSession.connect(params.room!, params.username!);
        } catch (err) {
          console.error('[collab] Auto-connect failed:', err);
        }
      }, 500); // Small delay to ensure everything is initialized
    }
    
    cleanup(() => {
      collabSession.off('statusChange', handleStatusChange);
      collabSession.off('peerCountChange', handlePeerCountChange);
      collabSession.off('evaluate', handleRemoteEvaluate);
      collabSession.disconnect();
      session.value = null;
      isReady.value = false;
    });
  });

  const connect = $(async (lobbyId: string, user: string) => {
    if (!session.value) {
      throw new Error('Collaboration session not initialized. Please refresh the page.');
    }
    username.value = user;
    roomName.value = lobbyId;
    await session.value.connect(lobbyId, user);
    
    // Update URL
    setCollabParams(lobbyId, user);
  });

  const disconnect = $(() => {
    session.value?.disconnect();
    
    // Clear URL params
    setCollabParams('');
  });

  const setActiveEditor = $((editor: 'strudel' | 'punctual') => {
    session.value?.setActiveEditor(editor);
  });

  const broadcastEvaluate = $(() => {
    session.value?.broadcastEvaluate();
  });

  return {
    session,
    status,
    peerCount,
    peers,
    isReady,
    username,
    roomName,
    hasUrlParams,
    connect,
    disconnect,
    setActiveEditor,
    broadcastEvaluate,
  };
}
