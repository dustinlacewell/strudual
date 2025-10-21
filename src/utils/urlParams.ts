export interface CollabParams {
  room?: string;
  username?: string;
}

export function getCollabParams(): CollabParams {
  if (typeof window === 'undefined') {
    return {};
  }

  const search = window.location.search;
  
  // Try compact format: ?room:username (note: no slash after ?)
  if (search.startsWith('?') && search.includes(':')) {
    const compact = search.slice(1); // Remove the '?'
    const [room, username] = compact.split(':');
    if (room) {
      return { room, username: username || undefined };
    }
  }
  
  // Fallback to standard query params
  const params = new URLSearchParams(search);
  return {
    room: params.get('room') || undefined,
    username: params.get('username') || undefined,
  };
}

export function setCollabParams(room: string, username?: string): void {
  if (typeof window === 'undefined') return;

  if (!room) {
    // Clear params
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }

  // Use compact format: /?room:username
  const compact = username ? `${room}:${username}` : `${room}:`;
  const newUrl = `${window.location.pathname}?${compact}`;
  window.history.replaceState({}, '', newUrl);
}
