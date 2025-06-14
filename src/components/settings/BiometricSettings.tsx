
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Fingerprint, Shield, Trash2, RotateCcw } from 'lucide-react';
import { useBiometric } from '@/hooks/useBiometric';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const BiometricSettings: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { 
    isSupported, 
    setupBiometric, 
    removeBiometric, 
    updateBiometric, 
    isBiometricConfigured,
    authenticateWithBiometric 
  } = useBiometric();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const configured = isBiometricConfigured();
    setIsConfigured(configured);
    setIsEnabled(configured);
  }, []);

  const handleSetupBiometric = async () => {
    if (!user?.user_metadata?.username) {
      toast({
        title: 'Błąd',
        description: 'Brak nazwy użytkownika do konfiguracji biometrii',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await setupBiometric(user.user_metadata.username);
      setIsConfigured(true);
      setIsEnabled(true);
    } catch (error) {
      console.error('Setup biometric error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBiometric = async () => {
    setLoading(true);
    try {
      await removeBiometric();
      setIsConfigured(false);
      setIsEnabled(false);
    } catch (error) {
      console.error('Remove biometric error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBiometric = async () => {
    if (!user?.user_metadata?.username) {
      toast({
        title: 'Błąd',
        description: 'Brak nazwy użytkownika do aktualizacji biometrii',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await updateBiometric(user.user_metadata.username);
    } catch (error) {
      console.error('Update biometric error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestBiometric = async () => {
    setLoading(true);
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        toast({
          title: 'Test zakończony pomyślnie',
          description: 'Biometria działa poprawnie'
        });
      }
    } catch (error) {
      console.error('Test biometric error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (enabled && !isConfigured) {
      await handleSetupBiometric();
    } else if (!enabled && isConfigured) {
      await handleRemoveBiometric();
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Fingerprint className="w-5 h-5 mr-2" />
            Logowanie Biometryczne
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Biometria nie jest obsługiwana na tym urządzeniu</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Fingerprint className="w-5 h-5 mr-2" />
          Logowanie Biometryczne
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-white">Włącz logowanie biometryczne</Label>
            <p className="text-sm text-gray-400">
              Używaj odcisku palca lub Face ID do logowania
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggleBiometric}
            disabled={loading}
          />
        </div>

        {/* Status Information */}
        <div className="space-y-2">
          <Label className="text-white">Status</Label>
          <div className="flex items-center space-x-2">
            {isConfigured ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400">Skonfigurowane</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400">Nie skonfigurowane</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isConfigured && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleTestBiometric}
                disabled={loading}
                variant="outline"
                className="bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
              >
                <Shield className="w-4 h-4 mr-2" />
                Testuj
              </Button>
              
              <Button
                onClick={handleUpdateBiometric}
                disabled={loading}
                variant="outline"
                className="bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Aktualizuj
              </Button>
            </div>
            
            <Button
              onClick={handleRemoveBiometric}
              disabled={loading}
              variant="outline"
              className="w-full bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Usuń dane biometryczne
            </Button>
          </div>
        )}

        {!isConfigured && (
          <Button
            onClick={handleSetupBiometric}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Fingerprint className="w-4 h-4 mr-2" />
            {loading ? 'Konfigurowanie...' : 'Skonfiguruj biometrię'}
          </Button>
        )}

        {/* Information */}
        <div className="bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-400">
            <strong>Uwaga:</strong> Logowanie biometryczne jest przechowywane lokalnie na Twoim urządzeniu. 
            Jeśli zmienisz urządzenie, będziesz musiał skonfigurować biometrię ponownie.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiometricSettings;
