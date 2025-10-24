/**
 * Simple automatic persistence of last editor session
 * Separate from pattern cache and autosave features
 */

const SESSION_KEY = 'strudual-last-session';

export interface SessionState {
  strudelCode: string | null;
  punctualCode: string | null;
  strudelCursor: number | null;
  punctualCursor: number | null;
  activeEditor: 'strudel' | 'punctual' | null;
}

export function loadLastSession(): SessionState {
  if (typeof window === 'undefined') {
    return { 
      strudelCode: null, 
      punctualCode: null, 
      strudelCursor: null, 
      punctualCursor: null,
      activeEditor: null,
    };
  }

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[SessionPersistence] Failed to load:', e);
  }
  
  return { 
    strudelCode: null, 
    punctualCode: null, 
    strudelCursor: null, 
    punctualCursor: null,
    activeEditor: null,
  };
}

function saveSession(state: Partial<SessionState>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const current = loadLastSession();
    const updated = { ...current, ...state };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[SessionPersistence] Failed to save:', e);
  }
}

export function saveStrudelCode(code: string, cursor?: number): void {
  saveSession({ strudelCode: code, strudelCursor: cursor ?? null });
}

export function savePunctualCode(code: string, cursor?: number): void {
  saveSession({ punctualCode: code, punctualCursor: cursor ?? null });
}

export function saveActiveEditor(editor: 'strudel' | 'punctual'): void {
  saveSession({ activeEditor: editor });
}


