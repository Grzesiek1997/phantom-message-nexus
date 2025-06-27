import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  quantumContentSecurityPolicy, 
  quantumSecurityHeaders, 
  QuantumSecureValidator,
  quantumValidator
} from '@/utils/quantumSecurity';

describe('Quantum Security Utils', () => {
  describe('quantumContentSecurityPolicy', () => {
    it('should have the expected security directives', () => {
      expect(quantumContentSecurityPolicy).toHaveProperty('default-src');
      expect(quantumContentSecurityPolicy).toHaveProperty('script-src');
      expect(quantumContentSecurityPolicy).toHaveProperty('style-src');
      expect(quantumContentSecurityPolicy).toHaveProperty('font-src');
      expect(quantumContentSecurityPolicy).toHaveProperty('img-src');
      expect(quantumContentSecurityPolicy).toHaveProperty('connect-src');
      expect(quantumContentSecurityPolicy).toHaveProperty('frame-ancestors');
      expect(quantumContentSecurityPolicy).toHaveProperty('base-uri');
      expect(quantumContentSecurityPolicy).toHaveProperty('form-action');
      expect(quantumContentSecurityPolicy).toHaveProperty('upgrade-insecure-requests');
      expect(quantumContentSecurityPolicy).toHaveProperty('quantum-safe');
      expect(quantumContentSecurityPolicy).toHaveProperty('post-quantum-crypto');
      expect(quantumContentSecurityPolicy).toHaveProperty('zk-verification');
      expect(quantumContentSecurityPolicy).toHaveProperty('ai-threat-detection');
    });

    it('should have the correct values for security directives', () => {
      expect(quantumContentSecurityPolicy['default-src']).toEqual(["'self'"]);
      expect(quantumContentSecurityPolicy['script-src']).toContain("'self'");
      expect(quantumContentSecurityPolicy['script-src']).toContain("'nonce-{quantum-nonce}'");
      expect(quantumContentSecurityPolicy['quantum-safe']).toBe(true);
      expect(quantumContentSecurityPolicy['post-quantum-crypto']).toBe('enforced');
      expect(quantumContentSecurityPolicy['zk-verification']).toBe('required');
      expect(quantumContentSecurityPolicy['ai-threat-detection']).toBe('enabled');
    });
  });

  describe('quantumSecurityHeaders', () => {
    it('should have the expected security headers', () => {
      expect(quantumSecurityHeaders).toHaveProperty('Strict-Transport-Security');
      expect(quantumSecurityHeaders).toHaveProperty('X-Content-Type-Options');
      expect(quantumSecurityHeaders).toHaveProperty('X-Frame-Options');
      expect(quantumSecurityHeaders).toHaveProperty('X-XSS-Protection');
      expect(quantumSecurityHeaders).toHaveProperty('Referrer-Policy');
      expect(quantumSecurityHeaders).toHaveProperty('Permissions-Policy');
      expect(quantumSecurityHeaders).toHaveProperty('Content-Security-Policy');
      expect(quantumSecurityHeaders).toHaveProperty('X-Quantum-Safe');
      expect(quantumSecurityHeaders).toHaveProperty('X-Zero-Knowledge');
      expect(quantumSecurityHeaders).toHaveProperty('X-Post-Quantum-Crypto');
    });

    it('should have the correct values for security headers', () => {
      expect(quantumSecurityHeaders['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains; preload');
      expect(quantumSecurityHeaders['X-Content-Type-Options']).toBe('nosniff');
      expect(quantumSecurityHeaders['X-Frame-Options']).toBe('DENY');
      expect(quantumSecurityHeaders['X-XSS-Protection']).toBe('1; mode=block');
      expect(quantumSecurityHeaders['X-Quantum-Safe']).toBe('true');
      expect(quantumSecurityHeaders['X-Zero-Knowledge']).toBe('enforced');
      expect(quantumSecurityHeaders['X-Post-Quantum-Crypto']).toBe('CRYSTALS-Kyber-1024');
    });

    it('should generate Content-Security-Policy from quantumContentSecurityPolicy', () => {
      expect(quantumSecurityHeaders['Content-Security-Policy']).toContain("default-src 'self'");
      expect(quantumSecurityHeaders['Content-Security-Policy']).toContain("script-src 'self' 'nonce-{quantum-nonce}'");
      expect(quantumSecurityHeaders['Content-Security-Policy']).toContain('quantum-safe true');
      expect(quantumSecurityHeaders['Content-Security-Policy']).toContain('post-quantum-crypto enforced');
    });
  });

  describe('QuantumSecureValidator', () => {
    let validator: QuantumSecureValidator;
    
    beforeEach(() => {
      validator = new QuantumSecureValidator();
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('validateQuantumSchema', () => {
      it('should validate string data against schema', async () => {
        const result = await validator.validateQuantumSchema('test', { type: 'string' });
        expect(result.isValid).toBe(true);
        expect(result.quantumProof).toBe(true);
        expect(result.threatLevel).toBeLessThan(0.5);
      });

      it('should reject data that does not match schema', async () => {
        const result = await validator.validateQuantumSchema(123, { type: 'string' });
        expect(result.isValid).toBe(false);
        expect(result.threatLevel).toBeGreaterThan(0.5);
      });

      it('should reject extremely long strings', async () => {
        const longString = 'a'.repeat(60000);
        const result = await validator.validateQuantumSchema(longString, { type: 'string' });
        expect(result.isValid).toBe(false);
        expect(result.threatLevel).toBeGreaterThan(0.5);
      });
    });

    describe('detectAISecurityThreats', () => {
      it('should detect script injection threats', async () => {
        const result = await validator.detectAISecurityThreats('<script>alert("XSS")</script>');
        expect(result.riskLevel).toBeGreaterThan(0.5);
        expect(result.threatTypes).toContain('script');
      });

      it('should detect SQL injection threats', async () => {
        const result = await validator.detectAISecurityThreats("' OR 1=1; DROP TABLE users;");
        expect(result.riskLevel).toBeGreaterThan(0.5);
        expect(result.threatTypes).toContain('DROP TABLE');
      });

      it('should consider safe input as low risk', async () => {
        const result = await validator.detectAISecurityThreats('Hello, this is a safe message!');
        expect(result.riskLevel).toBeLessThan(0.5);
        expect(result.threatTypes).toHaveLength(0);
      });
    });

    describe('detectQuantumSQLInjection', () => {
      it('should detect SQL injection patterns', async () => {
        expect(await validator.detectQuantumSQLInjection("SELECT * FROM users")).toBe(true);
        expect(await validator.detectQuantumSQLInjection("'; DROP TABLE users; --")).toBe(true);
        expect(await validator.detectQuantumSQLInjection("UNION SELECT username, password FROM users")).toBe(true);
      });

      it('should not flag safe SQL-like text', async () => {
        expect(await validator.detectQuantumSQLInjection("Let me select a book from the shelf")).toBe(false);
        expect(await validator.detectQuantumSQLInjection("I dropped my table manners")).toBe(false);
      });
    });

    describe('detectQuantumXSS', () => {
      it('should detect XSS patterns', async () => {
        expect(await validator.detectQuantumXSS("<script>alert('XSS')</script>")).toBe(true);
        expect(await validator.detectQuantumXSS("javascript:alert('XSS')")).toBe(true);
        expect(await validator.detectQuantumXSS("<img src='x' onerror='alert(1)'>")).toBe(true);
      });

      it('should not flag safe HTML-like text', async () => {
        expect(await validator.detectQuantumXSS("I learned about <div> tags today")).toBe(false);
        expect(await validator.detectQuantumXSS("This is a safe message")).toBe(false);
      });
    });

    describe('validateMessage', () => {
      it('should validate safe messages', async () => {
        const safeMessage = "Hello, this is a safe message!";
        const result = await validator.validateMessage(safeMessage, "user123");
        expect(result).toBe(safeMessage);
      });

      it('should sanitize messages with unsafe characters', async () => {
        const unsafeMessage = "Hello <script>alert('XSS')</script>";
        await expect(validator.validateMessage(unsafeMessage, "user123")).rejects.toThrow();
      });

      it('should reject extremely long messages', async () => {
        const longMessage = 'a'.repeat(60000);
        await expect(validator.validateMessage(longMessage, "user123")).rejects.toThrow();
      });

      it('should reject messages with SQL injection', async () => {
        const sqlMessage = "'; DROP TABLE users; --";
        await expect(validator.validateMessage(sqlMessage, "user123")).rejects.toThrow();
      });
    });
  });

  describe('quantumValidator singleton', () => {
    it('should be an instance of QuantumSecureValidator', () => {
      expect(quantumValidator).toBeInstanceOf(QuantumSecureValidator);
    });

    it('should have all the required methods', () => {
      expect(typeof quantumValidator.validateQuantumSchema).toBe('function');
      expect(typeof quantumValidator.detectAISecurityThreats).toBe('function');
      expect(typeof quantumValidator.detectQuantumSQLInjection).toBe('function');
      expect(typeof quantumValidator.detectQuantumXSS).toBe('function');
      expect(typeof quantumValidator.detectQuantumCommandInjection).toBe('function');
      expect(typeof quantumValidator.validateZKBusinessRules).toBe('function');
      expect(typeof quantumValidator.checkQuantumSubmissionRate).toBe('function');
      expect(typeof quantumValidator.analyzeBehaviorPattern).toBe('function');
      expect(typeof quantumValidator.validateMessage).toBe('function');
    });
  });
});