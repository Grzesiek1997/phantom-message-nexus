
// Cloudflare Turnstile integration
export const TURNSTILE_CONFIG = {
  SITE_KEY: '0x4AAAAAABgZNgx1YcJclinW',
  SCRIPT_URL: 'https://challenges.cloudflare.com/turnstile/v0/api.js'
};

export interface TurnstileResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export class TurnstileManager {
  private static isScriptLoaded = false;
  private static loadPromise: Promise<void> | null = null;

  // Load Turnstile script
  static async loadScript(): Promise<void> {
    if (this.isScriptLoaded) return;
    
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = TURNSTILE_CONFIG.SCRIPT_URL;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Turnstile script'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  // Render Turnstile widget
  static async render(elementId: string, callback: (token: string) => void): Promise<string | null> {
    try {
      await this.loadScript();
      
      // Wait for turnstile to be available
      if (typeof window.turnstile === 'undefined') {
        throw new Error('Turnstile not available');
      }

      const widgetId = window.turnstile.render(`#${elementId}`, {
        sitekey: TURNSTILE_CONFIG.SITE_KEY,
        callback: callback,
        'error-callback': (error: string) => {
          console.error('Turnstile error:', error);
        }
      });

      return widgetId;
    } catch (error) {
      console.error('Failed to render Turnstile:', error);
      return null;
    }
  }

  // Reset widget
  static reset(widgetId?: string): void {
    if (typeof window.turnstile !== 'undefined') {
      window.turnstile.reset(widgetId);
    }
  }

  // Get response token
  static getResponse(widgetId?: string): string | undefined {
    if (typeof window.turnstile !== 'undefined') {
      return window.turnstile.getResponse(widgetId);
    }
    return undefined;
  }
}

// Extend window object for TypeScript
declare global {
  interface Window {
    turnstile: {
      render: (element: string, options: any) => string;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}
