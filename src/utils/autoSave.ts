/**
 * Auto-save utilities using File System Access API
 */

export interface AutoSaveFile {
  name: string;
  strudelCode: string;
  punctualCode: string;
}

let fileHandle: FileSystemFileHandle | null = null;

/**
 * Check if File System Access API is available
 */
export function isAutoSaveAvailable(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
}

/**
 * Open file picker to load an existing file
 * Returns the loaded file content
 */
export async function loadAutoSaveFile(): Promise<AutoSaveFile | null> {
  if (!isAutoSaveAvailable()) {
    throw new Error('File System Access API not available');
  }

  try {
    // Show open file picker (only existing files)
    const [handle] = await (window as any).showOpenFilePicker({
      types: [{
        description: 'Strudual Files',
        accept: { 'application/json': ['.sdl'] },
      }],
      multiple: false,
    });

    fileHandle = handle;
    
    // Read file content
    const file = await handle.getFile();
    const content = await file.text();
    const data = JSON.parse(content) as AutoSaveFile;
    
    // Use filename as name if not in file
    if (!data.name) {
      data.name = handle.name.replace(/\.sdl$/, '');
    }
    
    return data;
  } catch (e) {
    // User cancelled
    if ((e as Error).name === 'AbortError') {
      return null;
    }
    throw e;
  }
}

/**
 * Open file picker and set up auto-save
 * Returns the loaded file content if file exists, or default content if new file
 */
export async function initAutoSave(): Promise<AutoSaveFile | null> {
  if (!isAutoSaveAvailable()) {
    throw new Error('File System Access API not available');
  }

  try {
    // Show save file picker (allows creating new files or selecting existing ones)
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: 'untitled.sdl',
      types: [{
        description: 'Strudual Files',
        accept: { 'application/json': ['.sdl'] },
      }],
    });

    fileHandle = handle;
    
    // Try to read existing content
    try {
      const file = await handle.getFile();
      const content = await file.text();
      const data = JSON.parse(content) as AutoSaveFile;
      
      // Use filename as name if not in file
      if (!data.name) {
        data.name = handle.name.replace(/\.sdl$/, '');
      }
      
      return data;
    } catch (e) {
      // File doesn't exist or is empty/invalid - return default with filename
      return {
        name: handle.name.replace(/\.sdl$/, ''),
        strudelCode: '',
        punctualCode: '',
      };
    }
  } catch (e) {
    // User cancelled
    if ((e as Error).name === 'AbortError') {
      return null;
    }
    throw e;
  }
}

/**
 * Write current content to the auto-save file
 */
export async function writeAutoSave(data: AutoSaveFile): Promise<void> {
  if (!fileHandle) {
    throw new Error('No file handle - call initAutoSave first');
  }

  try {
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  } catch (e) {
    console.error('[AutoSave] Write failed:', e);
    throw e;
  }
}

/**
 * Get the current filename (without extension)
 */
export function getAutoSaveFilename(): string | null {
  if (!fileHandle) return null;
  return fileHandle.name.replace(/\.sdl$/, '');
}

/**
 * Update the filename by renaming the file
 * Note: This only updates the name field in the file content, not the actual filename
 */
export async function renameAutoSaveFile(newName: string, strudelCode: string, punctualCode: string): Promise<void> {
  if (!fileHandle) {
    throw new Error('No file handle - call initAutoSave first');
  }

  // Write with new name
  await writeAutoSave({ name: newName, strudelCode, punctualCode });
}

/**
 * Disable auto-save and clear the file handle
 */
export function disableAutoSave(): void {
  fileHandle = null;
}

/**
 * Check if auto-save is currently active
 */
export function isAutoSaveActive(): boolean {
  return fileHandle !== null;
}
