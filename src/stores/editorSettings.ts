/**
 * Layout settings
 * Control the application layout and visual structure
 */
export interface LayoutSettings {
  fontSize: number;
  theme: 'dark' | 'light';
  layoutOrientation: 'vertical' | 'horizontal' | 'auto';
  editorOrder: 'strudel-first' | 'punctual-first';
  splitRatio: '50-50' | '33-66' | '100-0';
  editorBackgroundOpacity: number; // 0-100, dims Punctual canvas behind editors
}

/**
 * Shared CodeMirror settings
 * Apply to both Strudel and Punctual editors
 */
export interface SharedEditorSettings {
  fontFamily: string;
  keybindings: 'codemirror' | 'emacs' | 'vim';
  lineNumbers: boolean;
  lineWrapping: boolean;
  bracketMatching: boolean;
  bracketClosing: boolean;
  activeLineHighlight: boolean;
  tabIndentation: boolean;
  multiCursor: boolean;
}

/**
 * Strudel-specific settings
 * Features unique to Strudel's live coding environment
 */
export interface StrudelSettings {
  patternHighlighting: boolean;
  flash: boolean;
  tooltip: boolean;
  autoCompletion: boolean;
}

/**
 * Punctual-specific settings
 * Features unique to Punctual (future)
 */
export interface PunctualSettings {
  // Future: Punctual-specific settings
}

/**
 * Combined settings for the entire application
 */
export interface EditorSettings extends LayoutSettings, SharedEditorSettings, StrudelSettings, PunctualSettings {}

export const defaultLayoutSettings: LayoutSettings = {
  fontSize: 12,
  theme: 'dark',
  layoutOrientation: 'auto',
  editorOrder: 'strudel-first',
  splitRatio: '50-50',
  editorBackgroundOpacity: 70, // 70% opacity = 30% dimming
};

export const defaultSharedEditorSettings: SharedEditorSettings = {
  fontFamily: 'monospace',
  keybindings: 'emacs',
  lineNumbers: true,
  lineWrapping: false,
  bracketMatching: true,
  bracketClosing: true,
  activeLineHighlight: false,
  tabIndentation: true,
  multiCursor: false,
};

export const defaultStrudelSettings: StrudelSettings = {
  patternHighlighting: true,
  flash: true,
  tooltip: false,
  autoCompletion: false,
};

export const defaultPunctualSettings: PunctualSettings = {};

export const defaultSettings: EditorSettings = {
  ...defaultLayoutSettings,
  ...defaultSharedEditorSettings,
  ...defaultStrudelSettings,
  ...defaultPunctualSettings,
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

/**
 * Convert our EditorSettings to the complete format Strudel expects
 * Combines layout, shared, and Strudel-specific settings
 */
export function toStrudelSettings(settings: EditorSettings) {
  return {
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    keybindings: settings.keybindings,
    isLineNumbersDisplayed: settings.lineNumbers,
    isLineWrappingEnabled: settings.lineWrapping,
    isBracketMatchingEnabled: settings.bracketMatching,
    isBracketClosingEnabled: settings.bracketClosing,
    isActiveLineHighlighted: settings.activeLineHighlight,
    isTabIndentationEnabled: settings.tabIndentation,
    isMultiCursorEnabled: settings.multiCursor,
    // Strudel-specific features
    isFlashEnabled: settings.flash,
    isPatternHighlightingEnabled: settings.patternHighlighting,
    isAutoCompletionEnabled: settings.autoCompletion,
    isTooltipEnabled: settings.tooltip,
    theme: 'strudelTheme',
  };
}
