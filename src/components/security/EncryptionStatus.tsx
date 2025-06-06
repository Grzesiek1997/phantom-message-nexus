
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldAlert, Key, Eye, EyeOff, RefreshCw, Copy } from 'lucide-react';
import { useQuantumSecurity } from '@/hooks/useQuantumSecurity';
import { useToast } from '@/hooks/use-toast';

interface EncryptionStatusProps {
  contactId?: string;
  conversationId?: string;
}

const EncryptionStatus: React.FC<EncryptionStatusProps> = ({ contactId, conversationId }) => {
  const [showFingerprint, setShowFingerprint] = useState(false);
  const [keyVerified, setKeyVerified] = useState(false);
  const [encryptionDetails, setEncryptionDetails] = useState({
    protocol: 'Signal Protocol + Quantum-Safe',
    keyExchange: 'CRYSTALS-Kyber-1024',
    authentication: 'CRYSTALS-Dilithium',
    symmetricCipher: 'ChaCha20-Poly1305',
    fingerprint: 'A1B2 C3D4 E5F6 7890 1234 5678 9ABC DEF0',
    lastKeyRotation: new Date(Date.now() - 86400000), // 1 day ago
    messagesEncrypted: 1247,
    forwardSecrecy: true,
    quantumSafe: true
  });
  
  const { securityState, checkHardwareSecurity } = useQuantumSecurity();
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would fetch actual encryption status
    checkEncryptionStatus();
  }, [contactId, conversationId]);

  const checkEncryptionStatus = async () => {
    // Simulate checking encryption status
    const isHardwareSecure = await checkHardwareSecurity();
    console.log('Hardware security:', isHardwareSecure);
  };

  const handleVerifyKeys = () => {
    setKeyVerified(true);
    toast({
      title: '🔐 Klucze zweryfikowane',
      description: 'Połączenie jest bezpieczne i zweryfikowane'
    });
  };

  const handleRotateKeys = () => {
    setEncryptionDetails(prev => ({
      ...prev,
      lastKeyRotation: new Date(),
      fingerprint: generateNewFingerprint()
    }));
    
    toast({
      title: '🔄 Klucze odświeżone',
      description: 'Nowe klucze szyfrowania zostały wygenerowane'
    });
  };

  const generateNewFingerprint = () => {
    const chars = '0123456789ABCDEF';
    let fingerprint = '';
    for (let i = 0; i < 32; i++) {
      if (i > 0 && i % 4 === 0) fingerprint += ' ';
      fingerprint += chars[Math.floor(Math.random() * chars.length)];
    }
    return fingerprint;
  };

  const copyFingerprint = () => {
    navigator.clipboard.writeText(encryptionDetails.fingerprint);
    toast({
      title: '📋 Skopiowano',
      description: 'Odcisk palca klucza skopiowany do schowka'
    });
  };

  const getSecurityLevel = () => {
    if (securityState.quantumLevel > 0.9 && keyVerified) {
      return { level: 'Maksymalne', color: 'bg-green-500', icon: <ShieldCheck className="w-5 h-5" /> };
    } else if (securityState.quantumLevel > 0.7) {
      return { level: 'Wysokie', color: 'bg-blue-500', icon: <Shield className="w-5 h-5" /> };
    } else {
      return { level: 'Podstawowe', color: 'bg-yellow-500', icon: <ShieldAlert className="w-5 h-5" /> };
    }
  };

  const security = getSecurityLevel();

  return (
    <div className="space-y-4">
      {/* Main Security Status */}
      <Card className="glass border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              {security.icon}
              <span className="ml-2">Status Szyfrowania</span>
            </CardTitle>
            <Badge className={`${security.color} text-white`}>
              {security.level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">End-to-End</span>
                <ShieldCheck className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-white font-semibold">Aktywne</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Quantum-Safe</span>
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-white font-semibold">Chronione</p>
            </div>
          </div>

          {/* Encryption Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Protokół:</span>
              <span className="text-white font-mono text-sm">{encryptionDetails.protocol}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Wymiana kluczy:</span>
              <span className="text-white font-mono text-sm">{encryptionDetails.keyExchange}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Uwierzytelnianie:</span>
              <span className="text-white font-mono text-sm">{encryptionDetails.authentication}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Szyfrowanie:</span>
              <span className="text-white font-mono text-sm">{encryptionDetails.symmetricCipher}</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-600">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{encryptionDetails.messagesEncrypted}</p>
              <p className="text-xs text-gray-400">Zaszyfrowanych wiadomości</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {Math.floor((Date.now() - encryptionDetails.lastKeyRotation.getTime()) / (1000 * 60 * 60))}h
              </p>
              <p className="text-xs text-gray-400">Od ostatniej rotacji</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Verification */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Weryfikacja Kluczy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Fingerprint */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Odcisk palca klucza:</span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowFingerprint(!showFingerprint)}
                >
                  {showFingerprint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyFingerprint}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {showFingerprint && (
              <div className="font-mono text-sm text-white bg-gray-900 rounded p-2 break-all">
                {encryptionDetails.fingerprint}
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {keyVerified ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Klucze zweryfikowane</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400">Klucze niezweryfikowane</span>
                </>
              )}
            </div>
            
            {!keyVerified && (
              <Button
                size="sm"
                onClick={handleVerifyKeys}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Zweryfikuj
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4 border-t border-gray-600">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotateKeys}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Odśwież klucze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Funkcje Bezpieczeństwa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Perfect Forward Secrecy</span>
            <Badge className="bg-green-500 text-white">Aktywne</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Post-Quantum Crypto</span>
            <Badge className="bg-blue-500 text-white">Aktywne</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Zero-Knowledge Auth</span>
            <Badge className="bg-purple-500 text-white">Aktywne</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Disappearing Messages</span>
            <Badge className="bg-orange-500 text-white">Dostępne</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncryptionStatus;
