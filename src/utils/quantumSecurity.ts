// Re-export main functionality for backward compatibility
export { quantumSecureValidator } from '../lib/validation/input-validator';
export { QuantumKeyManager } from '../lib/crypto/key-management';
export { QuantumCrypto } from '../lib/crypto/quantum-algorithms';
export { SecurityHeaderManager, securityHeaders, quantumContentSecurityPolicy } from '../lib/security/security-headers';
export type { 
  QuantumValidationResult, 
  AIThreatAnalysis, 
  ZKValidationContext, 
  ZKValidationResult 
} from '../lib/crypto/quantum-validation';

// Main validator export (keeping the original interface)
export const quantumValidator = {
  validateMessage: quantumSecureValidator.validateMessage,
  deriveKey: QuantumKeyManager.deriveQuantumKey,
  generateNonce: QuantumKeyManager.generateQuantumNonce,
  encrypt: QuantumCrypto.encryptQuantumSafe,
  decrypt: QuantumCrypto.decryptQuantumSafe,
};
