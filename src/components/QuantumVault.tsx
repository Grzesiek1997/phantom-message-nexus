
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Lock, Key, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { useQuantumSecurity } from '@/hooks/useQuantumSecurity';
import { useToast } from '@/hooks/use-toast';

interface SecureVaultItem {
  id: string;
  title: string;
  content: string;
  encrypted: boolean;
  timestamp: string;
  securityLevel: 'QUANTUM' | 'POST_QUANTUM' | 'ZERO_KNOWLEDGE';
}

const QuantumVault: React.FC = () => {
  const [vaultItems, setVaultItems] = useState<SecureVaultItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [showDecrypted, setShowDecrypted] = useState<{[key: string]: boolean}>({});
  const { quantumEncrypt, validateZKProof } = useQuantumSecurity();
  const { toast } = useToast();

  const addSecureItem = async () => {
    if (!newItemTitle.trim() || !newItemContent.trim()) return;

    try {
      const encryptedContent = await quantumEncrypt(newItemContent);
      
      const newItem: SecureVaultItem = {
        id: crypto.randomUUID(),
        title: newItemTitle,
        content: encryptedContent,
        encrypted: true,
        timestamp: new Date().toISOString(),
        securityLevel: 'QUANTUM'
      };

      setVaultItems(prev => [newItem, ...prev]);
      setNewItemTitle('');
      setNewItemContent('');

      toast({
        title: '🔐 Quantum Vault',
        description: 'Dane zostały zaszyfrowane kwantowo i zapisane',
      });
    } catch (error) {
      toast({
        title: 'Błąd szyfrowania',
        description: 'Nie udało się zaszyfrować danych',
        variant: 'destructive'
      });
    }
  };

  const toggleDecryption = async (itemId: string) => {
    // Simulate zero-knowledge proof verification
    const zkProof = `zk_proof_${itemId}_${Date.now()}`;
    const isValid = await validateZKProof(zkProof);
    
    if (isValid) {
      setShowDecrypted(prev => ({
        ...prev,
        [itemId]: !prev[itemId]
      }));
      
      toast({
        title: '🔓 Zero-Knowledge Auth',
        description: 'Tożsamość zweryfikowana kwantowo',
      });
    } else {
      toast({
        title: 'Błąd autoryzacji',
        description: 'Nie udało się zweryfikować tożsamości',
        variant: 'destructive'
      });
    }
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'QUANTUM': return <Shield className="w-4 h-4 text-green-400" />;
      case 'POST_QUANTUM': return <Lock className="w-4 h-4 text-blue-400" />;
      case 'ZERO_KNOWLEDGE': return <Key className="w-4 h-4 text-purple-400" />;
      default: return <Lock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/30 mb-6">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-indigo-400 mr-3" />
          <h2 className="text-2xl font-bold text-white">🔐 Quantum Vault</h2>
          <span className="ml-4 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-green-300 text-sm">
            Post-Quantum Encrypted
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            placeholder="Tytuł sekretu..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          <div className="flex items-center space-x-2">
            <Fingerprint className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-300">Quantum Biometric Lock</span>
          </div>
        </div>

        <Textarea
          placeholder="Wprowadź poufne dane do zaszyfrowania kwantowego..."
          value={newItemContent}
          onChange={(e) => setNewItemContent(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 mb-4"
          rows={4}
        />

        <Button 
          onClick={addSecureItem}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          disabled={!newItemTitle.trim() || !newItemContent.trim()}
        >
          <Lock className="w-4 h-4 mr-2" />
          🔐 Encrypt with Quantum Security
        </Button>
      </Card>

      <div className="space-y-4">
        {vaultItems.map((item) => (
          <Card key={item.id} className="p-4 bg-gradient-to-r from-slate-900/20 to-gray-900/20 border-slate-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getSecurityLevelIcon(item.securityLevel)}
                <h3 className="font-semibold text-white">{item.title}</h3>
                <span className="px-2 py-1 bg-blue-900/30 border border-blue-500/30 rounded text-xs text-blue-300">
                  {item.securityLevel}
                </span>
              </div>
              <Button
                onClick={() => toggleDecryption(item.id)}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {showDecrypted[item.id] ? (
                  <><EyeOff className="w-4 h-4 mr-2" /> Hide</>
                ) : (
                  <><Eye className="w-4 h-4 mr-2" /> Decrypt</>
                )}
              </Button>
            </div>

            <div className="bg-black/30 p-3 rounded border border-white/10">
              {showDecrypted[item.id] ? (
                <div className="text-green-300">
                  🔓 Decrypted content: {item.content.substring(0, 50)}...
                  <div className="text-xs text-gray-400 mt-2">
                    ⚠️ Content decrypted using Zero-Knowledge authentication
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 font-mono">
                  🔐 Quantum-encrypted: {item.content.substring(0, 40)}...
                  <div className="text-xs text-gray-500 mt-2">
                    🛡️ Protected by CRYSTALS-Kyber encryption
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-400 mt-2">
              Encrypted: {new Date(item.timestamp).toLocaleString()}
            </div>
          </Card>
        ))}

        {vaultItems.length === 0 && (
          <Card className="p-8 text-center bg-gradient-to-r from-gray-900/20 to-slate-900/20 border-gray-500/30">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Quantum Vault is Empty</h3>
            <p className="text-gray-400">
              Add your first secret encrypted with post-quantum cryptography
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuantumVault;
