/**
 * Punctual utility wrapper for container-based usage
 * 
 * This provides a clean API for creating Punctual instances
 * that render into specific containers instead of full-screen.
 */

export interface PunctualInstance {
  define(args: { zone: number; text: string; time: number }): Promise<{ info: string }>;
  clear(args: { zone: number }): void;
  preRender(args: { canDraw: boolean; nowTime: number }): void;
  render(args: { zone: number; canDraw: boolean; nowTime: number }): void;
  postRender(args: { canDraw: boolean; nowTime: number }): void;
  setTempo(tempo: any): void;
  setBrightness(brightness: number): void;
  setAudioInput(audioInputGetter: () => AudioNode): void;
}

export interface PunctualModule {
  Punctual: new (args?: { container?: HTMLElement; webAudioContext?: AudioContext | null }) => PunctualInstance;
}

let punctualModule: PunctualModule | null = null;

/**
 * Lazy load the Punctual module
 */
export async function loadPunctual(): Promise<PunctualModule> {
  if (punctualModule) {
    return punctualModule;
  }
  
  punctualModule = await import('@/lib/punctual/punctual.js');
  return punctualModule;
}

/**
 * Create a Punctual instance that renders into a specific container
 */
export async function createContainedPunctual(
  container: HTMLElement,
  options: { webAudioContext?: AudioContext | null } = {}
): Promise<PunctualInstance> {
  const P = await loadPunctual();
  
  return new P.Punctual({
    container,
    webAudioContext: options.webAudioContext ?? null,
  });
}

/**
 * Animation loop helper for Punctual instances
 */
export class PunctualAnimator {
  private animationId: number | null = null;
  private isRunning = false;
  
  constructor(private punctual: PunctualInstance, private zone: number = 0) {}
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    const animate = () => {
      if (!this.isRunning) return;
      
      const now = Date.now() / 1000.0;
      this.punctual.preRender({ canDraw: true, nowTime: now });
      this.punctual.render({ canDraw: true, zone: this.zone, nowTime: now });
      this.punctual.postRender({ canDraw: true, nowTime: now });
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  stop() {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  async evaluate(code: string): Promise<{ info: string }> {
    return this.punctual.define({
      zone: this.zone,
      text: code,
      time: Date.now() / 1000.0,
    });
  }
  
  clear() {
    this.punctual.clear({ zone: this.zone });
  }
}

/**
 * Complete setup helper - creates instance and animator
 */
export async function setupPunctual(
  container: HTMLElement,
  initialCode?: string,
  options: { webAudioContext?: AudioContext | null; autoStart?: boolean; audioInput?: () => AudioNode } = {}
): Promise<{ punctual: PunctualInstance; animator: PunctualAnimator }> {
  const punctual = await createContainedPunctual(container, options);
  const animator = new PunctualAnimator(punctual);
  
  // Connect audio input if provided
  if (options.audioInput) {
    punctual.setAudioInput(options.audioInput);
    console.log('[Punctual] Audio input connected');
  }
  
  if (initialCode) {
    await animator.evaluate(initialCode);
  }
  
  if (options.autoStart !== false) {
    animator.start();
  }
  
  return { punctual, animator };
}
