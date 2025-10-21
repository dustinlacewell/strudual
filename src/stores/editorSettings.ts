export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  keybindings: 'codemirror' | 'emacs' | 'vim';
  theme: 'dark' | 'light';
  lineNumbers: boolean;
  lineWrapping: boolean;
  bracketMatching: boolean;
  bracketClosing: boolean;
  activeLineHighlight: boolean;
  tabIndentation: boolean;
  multiCursor: boolean;
  layoutOrientation: 'vertical' | 'horizontal' | 'auto';
  editorOrder: 'strudel-first' | 'punctual-first';
  splitRatio: '50-50' | '33-66' | '100-0';
}

export const defaultSettings: EditorSettings = {
  fontSize: 12,
  fontFamily: 'monospace',
  keybindings: 'emacs',
  theme: 'dark',
  lineNumbers: true,
  lineWrapping: false,
  bracketMatching: true,
  bracketClosing: true,
  activeLineHighlight: false,
  tabIndentation: true,
  multiCursor: false,
  layoutOrientation: 'auto',
  editorOrder: 'strudel-first',
  splitRatio: '50-50',
};

// Load settings from localStorage (client-side only)
export function loadSettings(): EditorSettings {
  if (typeof window === 'undefined') return defaultSettings;
  
  try {
    const stored = localStorage.getItem('strudual-editor-settings');
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load editor settings:', e);
  }
  return defaultSettings;
}

// Save settings to localStorage (client-side only)
export function saveSettings(settings: EditorSettings) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('strudual-editor-settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save editor settings:', e);
  }
}
