
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
  private static retryCount = 0;
  private static maxRetries = 3;

  // Load Turnstile script with proper error handling
  static async loadScript(): Promise<void> {
    if (this.isScriptLoaded) return;
    
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src="${TURNSTILE_CONFIG.SCRIPT_URL}"]`);
      if (existingScript) {
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = TURNSTILE_CONFIG.SCRIPT_URL;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('🔐 Turnstile script loaded successfully');
        this.isScriptLoaded = true;
        this.retryCount = 0;
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Turnstile script');
        this.retryCount++;
        if (this.retryCount < this.maxRetries) {
          setTimeout(() => {
            this.loadPromise = null;
            this.loadScript().then(resolve).catch(reject);
          }, 1000 * this.retryCount);
        } else {
          reject(new Error('Failed to load Turnstile script after multiple attempts'));
        }
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  // Wait for Turnstile to be available
  static async waitForTurnstile(timeout = 10000): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkTurnstile = () => {
        if (typeof window.turnstile !== 'undefined') {
          console.log('✅ Turnstile API ready');
          resolve(true);
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          console.error('⏰ Turnstile API timeout');
          resolve(false);
          return;
        }
        
        setTimeout(checkTurnstile, 100);
      };
      
      checkTurnstile();
    });
  }

  // Render Turnstile widget
  static async render(elementId: string, callback: (token: string) => void): Promise<string | null> {
    try {
      console.log('🔄 Starting Turnstile render process...');
      
      await this.loadScript();
      
      const isReady = await this.waitForTurnstile();
      if (!isReady) {
        throw new Error('Turnstile API not available');
      }

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID ${elementId} not found`);
      }

      // Clear any existing content
      element.innerHTML = '';

      console.log('🎯 Rendering Turnstile widget on element:', elementId);

      const widgetId = window.turnstile.render(element, {
        sitekey: TURNSTILE_CONFIG.SITE_KEY,
        callback: (token: string) => {
          console.log('✅ Turnstile verification successful');
          callback(token);
        },
        'error-callback': (error: string) => {
          console.error('❌ Turnstile error:', error);
        },
        'expired-callback': () => {
          console.warn('⏰ Turnstile token expired');
        },
        'timeout-callback': () => {
          console.warn('⏰ Turnstile timeout');
        },
        theme: 'auto',
        size: 'normal'
      });

      console.log('✅ Turnstile widget rendered with ID:', widgetId);
      return widgetId;
    } catch (error) {
      console.error('❌ Failed to render Turnstile:', error);
      return null;
    }
  }

  // Reset widget
  static reset(widgetId?: string): void {
    try {
      if (typeof window.turnstile !== 'undefined') {
        window.turnstile.reset(widgetId);
        console.log('🔄 Turnstile widget reset');
      }
    } catch (error) {
      console.error('❌ Failed to reset Turnstile:', error);
    }
  }

  // Get response token
  static getResponse(widgetId?: string): string | undefined {
    try {
      if (typeof window.turnstile !== 'undefined') {
        return window.turnstile.getResponse(widgetId);
      }
    } catch (error) {
      console.error('❌ Failed to get Turnstile response:', error);
    }
    return undefined;
  }
}

// Extend window object for TypeScript
declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement | string, options: any) => string;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}
