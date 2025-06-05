
// Global type definitions for PWA and advanced security features
declare global {
  interface Navigator {
    standalone?: boolean;
  }
  
  interface Window {
    // Quantum-safe encryption APIs
    quantumCrypto?: {
      generateQuantumKeys(): Promise<{publicKey: string, privateKey: string}>;
      encryptQuantum(data: string, publicKey: string): Promise<string>;
      decryptQuantum(data: string, privateKey: string): Promise<string>;
    };
    
    // Advanced WebAuthn
    webauthn?: {
      create(options: any): Promise<any>;
      get(options: any): Promise<any>;
    };
  }
}

export {};
