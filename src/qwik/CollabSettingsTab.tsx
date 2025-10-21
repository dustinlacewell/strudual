import { component$, useSignal, $, useContext } from '@builder.io/qwik';
import { CollabContext } from '@/contexts/collabContext';

export const CollabSettingsTab = component$(() => {
  const collab = useContext(CollabContext);
  const error = useSignal('');

  const handleConnect = $(async () => {
    if (!collab.roomName.value) return;
    if (!collab.isReady.value) {
      error.value = 'Editors not ready yet. Please wait a moment and try again.';
      return;
    }
    
    error.value = '';
    
    try {
      await collab.connect(collab.roomName.value, collab.username.value || 'Anonymous');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Connection failed';
    }
  });

  const handleDisconnect = $(() => {
    collab.disconnect();
    error.value = '';
  });

  const isConnected = collab.status.value === 'connected';
  const isConnecting = collab.status.value === 'connecting';

  const getStatusDisplay = () => {
    if (isConnected) return collab.peerCount.value > 0 ? `Connected (${collab.peerCount.value} peers)` : 'Connected';
    if (isConnecting) return 'Connecting...';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isConnected) return collab.peerCount.value > 0 ? 'text-green-400' : 'text-neutral-400';
    if (isConnecting) return 'text-yellow-400';
    return 'text-neutral-500';
  };

  return (
    <div class="space-y-4">
      {/* Status Badge */}
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-neutral-300">Collaborative Editing</h3>
        <span class={`text-xs ${getStatusColor()}`}>
          {getStatusDisplay()}
        </span>
      </div>

      {/* Username Input */}
      <div class="space-y-2">
        <label class="block text-sm text-neutral-300">Your Username</label>
        <input
          type="text"
          bind:value={collab.username}
          placeholder="Enter your name..."
          disabled={isConnected}
          class="w-full px-3 py-2 bg-black text-neutral-300 border border-neutral-800 rounded focus:outline-none focus:ring-1 focus:ring-neutral-700 disabled:opacity-50"
        />
      </div>

      {/* Room Name Input */}
      <div class="space-y-2">
        <label class="block text-sm text-neutral-300">Room Name</label>
        <p class="text-xs text-neutral-500">
          Anyone with the same room name will join your session
        </p>
        <input
          type="text"
          bind:value={collab.roomName}
          placeholder="Enter room name..."
          disabled={isConnected}
          class="w-full px-3 py-2 bg-black text-neutral-300 border border-neutral-800 rounded focus:outline-none focus:ring-1 focus:ring-neutral-700 disabled:opacity-50"
        />
      </div>

      {/* Debug Info */}
      <div class="text-xs text-neutral-500 font-mono">
        <div>roomName: "{collab.roomName.value}" (len: {collab.roomName.value.length})</div>
        <div>status: {collab.status.value}</div>
        <div>isReady: {String(collab.isReady.value)}</div>
        <div>disabled: {String(collab.roomName.value.length === 0 || collab.status.value === 'connecting')}</div>
      </div>

      {/* Connect/Disconnect Button */}
      <div>
        {collab.status.value !== 'connected' ? (
          <button
            onClick$={handleConnect}
            disabled={collab.roomName.value.length === 0 || collab.status.value === 'connecting'}
            class="w-full px-4 py-2 bg-neutral-300 text-black rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {collab.status.value === 'connecting' ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            onClick$={handleDisconnect}
            class="w-full px-4 py-2 bg-red-900 text-red-200 rounded hover:bg-red-800 transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Error Message */}
      {error.value && (
        <div class="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">
          <div class="font-semibold mb-1">Connection Error</div>
          <div>{error.value}</div>
        </div>
      )}

      {/* Peer List */}
      {isConnected && (
        <div class="pt-4 border-t border-neutral-800">
          {collab.peers.value.length > 0 ? (
            <>
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm text-neutral-300">Active Peers</h4>
                <span class="text-xs text-neutral-500 font-mono">{collab.peers.value.length}</span>
              </div>
              <ul class="space-y-2">
                {collab.peers.value.map((peer) => (
                  <li key={peer.id} class="flex items-center gap-2">
                    <div
                      class="w-3 h-3 rounded-full"
                      style={{ backgroundColor: peer.color }}
                    />
                    <span class="text-sm text-neutral-400">
                      {peer.name}
                      {peer.activeEditor && (
                        <span class="text-xs text-neutral-600 ml-2">
                          ({peer.activeEditor})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p class="text-sm text-neutral-500">No other users connected</p>
          )}
        </div>
      )}
    </div>
  );
});
