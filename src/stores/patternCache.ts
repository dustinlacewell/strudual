export interface CachedPattern {
  id: string;
  name: string;
  strudelCode: string;
  punctualCode: string;
}

const STORAGE_KEY = 'strudual-pattern-cache';

/**
 * Generate a random alphanumeric ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Load all cached patterns from localStorage
 */
export function loadPatterns(): CachedPattern[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load cached patterns:', e);
  }
  return [];
}

/**
 * Save all cached patterns to localStorage
 */
function savePatterns(patterns: CachedPattern[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  } catch (e) {
    console.warn('Failed to save cached patterns:', e);
  }
}

/**
 * Create a new pattern with current editor contents
 */
export function createPattern(strudelCode: string, punctualCode: string): CachedPattern {
  const pattern: CachedPattern = {
    id: generateId(),
    name: generateId(),
    strudelCode,
    punctualCode,
  };
  
  const patterns = loadPatterns();
  patterns.push(pattern);
  savePatterns(patterns);
  
  return pattern;
}

/**
 * Update an existing pattern's name
 */
export function updatePatternName(id: string, name: string): void {
  const patterns = loadPatterns();
  const pattern = patterns.find(p => p.id === id);
  if (pattern) {
    pattern.name = name;
    savePatterns(patterns);
  }
}

/**
 * Update an existing pattern's code
 */
export function updatePatternCode(id: string, strudelCode: string, punctualCode: string): void {
  const patterns = loadPatterns();
  const pattern = patterns.find(p => p.id === id);
  if (pattern) {
    pattern.strudelCode = strudelCode;
    pattern.punctualCode = punctualCode;
    savePatterns(patterns);
  }
}

/**
 * Delete a pattern
 */
export function deletePattern(id: string): void {
  const patterns = loadPatterns();
  const filtered = patterns.filter(p => p.id !== id);
  savePatterns(filtered);
}

/**
 * Get a single pattern by ID
 */
export function getPattern(id: string): CachedPattern | undefined {
  const patterns = loadPatterns();
  return patterns.find(p => p.id === id);
}

/**
 * Check if File System Access API is available
 */
export function isFileSystemApiAvailable(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

/**
 * Save pattern to disk using File System Access API
 */
export async function savePatternToDisk(pattern: CachedPattern): Promise<void> {
  if (!isFileSystemApiAvailable()) {
    throw new Error('File System Access API not available');
  }
  
  try {
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: `${pattern.name}.json`,
      types: [{
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] },
      }],
    });
    
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(pattern, null, 2));
    await writable.close();
  } catch (e) {
    // User cancelled or error occurred
    if ((e as Error).name !== 'AbortError') {
      throw e;
    }
  }
}
