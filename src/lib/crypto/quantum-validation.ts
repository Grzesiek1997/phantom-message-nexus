
export interface QuantumValidationResult {
  isValid: boolean;
  confidence: number;
  threats: string[];
  recommendations: string[];
}

export interface AIThreatAnalysis {
  riskLevel: number;
  threatTypes: string[];
  confidence: number;
  recommendations: string[];
}

export interface ZKValidationContext {
  userId: string;
  sessionId: string;
  timestamp: number;
}

export interface ZKValidationResult {
  isValid: boolean;
  proofGenerated: boolean;
  confidence: number;
}

export interface InputPattern {
  frequency: number;
  timing: number[];
  contentType: string;
}

export interface BehaviorScore {
  anomalyLevel: number;
  riskScore: number;
  confidence: number;
}

export class QuantumValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuantumValidationError';
  }
}

export class AIValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIValidationError';
  }
}

export class ZKValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZKValidationError';
  }
}

export class QuantumBehaviorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuantumBehaviorError';
  }
}
