/**
 * User Color Picker - Maximally-spaced hue selection algorithm
 * 
 * Assigns colors to users by dividing the hue circle to maximize
 * angular distance between colors.
 */

export interface ColorAssignment {
  hue: number;        // 0-360 degrees
  saturation: number; // 0-100%
  lightness: number;  // 0-100%
}

export interface ColorPickerOptions {
  /** Initial hue for first user (0-360). If undefined, random. */
  initialHue?: number;
  /** Saturation percentage (0-100) */
  saturation?: number;
  /** Lightness percentage (0-100) */
  lightness?: number;
}

/**
 * Manages color assignment for users in a session
 */
export class UserColorPicker {
  private assignedHues: number[] = [];
  private readonly saturation: number;
  private readonly lightness: number;
  private readonly initialHue: number;

  constructor(options: ColorPickerOptions = {}) {
    this.saturation = options.saturation ?? 85;
    this.lightness = options.lightness ?? 55;
    this.initialHue = options.initialHue ?? Math.random() * 360;
  }

  /**
   * Get the next color for a new user
   */
  nextColor(): ColorAssignment {
    const hue = this.nextHue();
    this.assignedHues.push(hue);
    
    return {
      hue,
      saturation: this.saturation,
      lightness: this.lightness,
    };
  }

  /**
   * Get color as CSS HSL string
   */
  nextColorCSS(): string {
    const color = this.nextColor();
    return `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`;
  }

  /**
   * Reset the picker to initial state
   */
  reset(): void {
    this.assignedHues = [];
  }

  /**
   * Get all assigned hues
   */
  getAssignedHues(): readonly number[] {
    return [...this.assignedHues];
  }

  /**
   * Calculate the next hue based on existing assignments
   */
  private nextHue(): number {
    // First user: use initial hue
    if (this.assignedHues.length === 0) {
      return this.initialHue;
    }

    // Second user: 180° opposite
    if (this.assignedHues.length === 1) {
      return this.normalize(this.assignedHues[0] + 180);
    }

    // Subsequent users: find largest arc and use its midpoint
    const sortedHues = [...this.assignedHues].sort((a, b) => a - b);
    
    let largestArc = {
      start: 0,
      end: 0,
      size: 0,
    };

    // Check arcs between consecutive hues
    for (let i = 0; i < sortedHues.length; i++) {
      const start = sortedHues[i];
      const end = sortedHues[(i + 1) % sortedHues.length];
      
      // Calculate arc size (handling wraparound)
      const arcSize = i === sortedHues.length - 1
        ? 360 - start + end
        : end - start;

      if (arcSize > largestArc.size) {
        largestArc = { start, end, size: arcSize };
      }
    }

    // Return midpoint of largest arc
    const midpoint = largestArc.start + largestArc.size / 2;
    return this.normalize(midpoint);
  }

  /**
   * Normalize hue to 0-360 range
   */
  private normalize(hue: number): number {
    return ((hue % 360) + 360) % 360;
  }
}

/**
 * Convenience function to create a picker and get N colors
 */
export function generateColors(
  count: number,
  options?: ColorPickerOptions
): ColorAssignment[] {
  const picker = new UserColorPicker(options);
  const colors: ColorAssignment[] = [];
  
  for (let i = 0; i < count; i++) {
    colors.push(picker.nextColor());
  }
  
  return colors;
}

/**
 * Calculate minimum angular distance between any two hues
 */
export function minAngularDistance(hues: number[]): number {
  if (hues.length < 2) return 360;
  
  const sorted = [...hues].sort((a, b) => a - b);
  let minDist = 360;
  
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[(i + 1) % sorted.length];
    
    const dist = i === sorted.length - 1
      ? 360 - current + next
      : next - current;
    
    minDist = Math.min(minDist, dist);
  }
  
  return minDist;
}