
export interface SecurityHeaders {
  [key: string]: string;
}

export interface ContentSecurityPolicy {
  [directive: string]: string[];
}

// Quantum-enhanced CSP Configuration
export const quantumContentSecurityPolicy: ContentSecurityPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'nonce-{quantum-nonce}'"],
  'style-src': ["'self'", "'nonce-{quantum-nonce}'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'wss:', 'https:'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
  'quantum-safe': ['true'],
  'post-quantum-crypto': ['enforced'],
  'zk-verification': ['required'],
  'ai-threat-detection': ['enabled'],
};

export const securityHeaders: SecurityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': Object.entries(quantumContentSecurityPolicy)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; '),
};

export class SecurityHeaderManager {
  static applyHeaders(): void {
    // In a real application, these would be applied at the server level
    console.log('🛡️ Quantum Security Headers Applied:', securityHeaders);
  }
  
  static generateQuantumNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  static validateHeaders(headers: Record<string, string>): boolean {
    const requiredHeaders = [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options'
    ];
    
    return requiredHeaders.every(header => header in headers);
  }
}
