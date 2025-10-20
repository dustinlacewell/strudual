import { component$, useSignal, $ } from '@builder.io/qwik';

export const CollabSettingsTab = component$(() => {
  const username = useSignal('');
  const roomName = useSignal('');
  const status = useSignal<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const error = useSignal('');
  const peers = useSignal<Array<{ id: string; name: string; color: string }>>([]);

  const handleConnect = $(() => {
    if (!roomName.value) return;
    
    status.value = 'connecting';
    error.value = '';
    
    // TODO: Implement actual connection logic with Yjs
    setTimeout(() => {
      status.value = 'connected';
    }, 1000);
  });

  const handleDisconnect = $(() => {
    status.value = 'disconnected';
    peers.value = [];
    error.value = '';
  });

  const isConnected = status.value === 'connected';
  const isConnecting = status.value === 'connecting';

  const getStatusDisplay = () => {
    if (isConnected) return peers.value.length > 0 ? `Connected (${peers.value.length} peers)` : 'Connected';
    if (isConnecting) return 'Connecting...';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isConnected) return peers.value.length > 0 ? 'text-green-400' : 'text-neutral-400';
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
          value={username.value}
          onInput$={(e) => username.value = (e.target as HTMLInputElement).value}
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
          value={roomName.value}
          onInput$={(e) => roomName.value = (e.target as HTMLInputElement).value}
          placeholder="Enter room name..."
          disabled={isConnected}
          class="w-full px-3 py-2 bg-black text-neutral-300 border border-neutral-800 rounded focus:outline-none focus:ring-1 focus:ring-neutral-700 disabled:opacity-50"
        />
      </div>

      {/* Connect/Disconnect Button */}
      <div>
        {!isConnected ? (
          <button
            onClick$={handleConnect}
            disabled={!roomName.value || isConnecting}
            class="w-full px-4 py-2 bg-neutral-300 text-black rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
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
          {peers.value.length > 0 ? (
            <>
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm text-neutral-300">Active Peers</h4>
                <span class="text-xs text-neutral-500 font-mono">{peers.value.length}</span>
              </div>
              <ul class="space-y-2">
                {peers.value.map((peer) => (
                  <li key={peer.id} class="flex items-center gap-2">
                    <div
                      class="w-3 h-3 rounded-full"
                      style={{ backgroundColor: peer.color }}
                    />
                    <span class="text-sm text-neutral-400">{peer.name}</span>
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
