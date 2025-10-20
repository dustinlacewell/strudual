import { StreamLanguage } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * Simple Punctual language mode for CodeMirror
 * Based on Punctual's PureScript-like syntax
 */
export const punctualLanguage = StreamLanguage.define({
  name: 'punctual',
  
  token(stream, state) {
    // Skip whitespace
    if (stream.eatSpace()) return null;
    
    // Comments (-- style)
    if (stream.match('--')) {
      stream.skipToEnd();
      return 'comment';
    }
    
    // Numbers (including floats and negatives)
    if (stream.match(/^-?\d+\.?\d*/)) {
      return 'number';
    }
    
    // Operators
    if (stream.match(/^(>>|<<|\*\*|\+\+|\/\/|==|\/=|<=|>=|&&|\|\||<>|<\*|<\$|<\||>>|>-)/)) {
      return 'operator';
    }
    if (stream.match(/^[+\-*\/%<>=!&|^~]/)) {
      return 'operator';
    }
    
    // Brackets and delimiters
    if (stream.match(/^[\[\](){},:;]/)) {
      return 'bracket';
    }
    
    // Common Punctual functions and keywords
    const keywords = [
      'circle', 'rect', 'line', 'hline', 'vline', 'tri', 'saw', 'sqr', 'sin', 'cos', 'tan',
      'mono', 'rgb', 'rgba', 'hsv', 'add', 'mul', 'blend', 'over', 'fit', 'zoom', 'move',
      'spin', 'tile', 'fft', 'ifft', 'ilo', 'imid', 'ihi', 'fx', 'fy', 'fr', 'ft', 'fx2', 'fy2',
      'setfx', 'setfy', 'setfxy', 'audio', 'cam', 'vid', 'img', 'tex', 'fb', 'lpf', 'hpf',
      'unipolar', 'bipolar', 'abs', 'floor', 'ceil', 'round', 'fract', 'sqrt', 'exp', 'log',
      'min', 'max', 'clip', 'between', 'gate', 'step', 'smoothstep', 'prox', 'dist',
      'point', 'iline', 'mesh', 'seq', 'rep', 'early', 'late', 'slow', 'fast', 'every',
    ];
    
    const word = stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (word && Array.isArray(word)) {
      const w = word[0];
      if (keywords.includes(w)) {
        return 'keyword';
      }
      return 'variable';
    }
    
    // Fallback
    stream.next();
    return null;
  },
  
  languageData: {
    commentTokens: { line: '--' },
  },
});
