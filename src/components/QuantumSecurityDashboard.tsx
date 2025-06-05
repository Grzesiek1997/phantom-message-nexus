
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Brain, Zap, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuantumSecurity } from '@/hooks/useQuantumSecurity';

const QuantumSecurityDashboard: React.FC = () => {
  const { securityLevel, threatDetection } = useQuantumSecurity();

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'QUANTUM_LEADING': return 'text-green-400';
      case 'QUANTUM_ADVANCED': return 'text-blue-400';
      case 'QUANTUM_IMPLEMENTING': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'QUANTUM_LEADING': return <Shield className="w-6 h-6 text-green-400" />;
      case 'QUANTUM_ADVANCED': return <Lock className="w-6 h-6 text-blue-400" />;
      default: return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {/* Security Level */}
      <Card className="p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🛡️ Quantum Security Level</h3>
          {getSecurityLevelIcon(securityLevel.level)}
        </div>
        <div className={`text-2xl font-bold ${getSecurityLevelColor(securityLevel.level)} mb-2`}>
          {securityLevel.level.replace('QUANTUM_', '')}
        </div>
        <div className="text-sm text-gray-300">
          Encryption: {securityLevel.encryption}
        </div>
        <div className="text-sm text-gray-300">
          Threat Level: {(securityLevel.threatLevel * 100).toFixed(1)}%
        </div>
      </Card>

      {/* AI Threat Detection */}
      <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🧠 AI Threat Monitor</h3>
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-purple-300 mb-2">
          {threatDetection.threats.length === 0 ? 'SECURE' : 'ALERT'}
        </div>
        <div className="text-sm text-gray-300 mb-2">
          Risk Score: {(threatDetection.riskScore * 100).toFixed(1)}%
        </div>
        <div className="text-sm text-gray-300">
          AI Confidence: {(threatDetection.aiConfidence * 100).toFixed(1)}%
        </div>
      </Card>

      {/* Quantum Encryption Status */}
      <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">⚡ Post-Quantum Crypto</h3>
          <Zap className="w-6 h-6 text-blue-400" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">CRYSTALS-Kyber Active</span>
          </div>
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">CRYSTALS-Dilithium Enabled</span>
          </div>
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">Zero-Knowledge Auth</span>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 col-span-full bg-gradient-to-r from-gray-900/20 to-slate-900/20 border-gray-500/30">
        <div className="flex items-center mb-4">
          <Eye className="w-5 h-5 text-cyan-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">🎯 AI Security Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {threatDetection.recommendations.map((rec, index) => (
            <div key={index} className="flex items-center text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
        
        {threatDetection.threats.length > 0 && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center text-red-400 mb-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="font-semibold">Active Threats Detected</span>
            </div>
            {threatDetection.threats.map((threat, index) => (
              <div key={index} className="text-sm text-red-300">
                • {threat}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuantumSecurityDashboard;
