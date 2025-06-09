
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Fingerprint, Shield, AlertTriangle } from 'lucide-react';
import { useBiometric } from '@/hooks/useBiometric';
import { useAuth } from '@/hooks/useAuth';

const BiometricSettings: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isSupported, setupBiometric, removeBiometric } = useBiometric();
  const { user } = useAuth();

  useEffect(() => {
    // Check if biometric is already set up
    const credentialData = localStorage.getItem('biometric_credential');
    setIsEnabled(!!credentialData);
  }, []);

  const handleToggleBiometric = async (enabled: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      if (enabled) {
        await setupBiometric(user.email || 'user');
        setIsEnabled(true);
      } else {
        await removeBiometric();
        setIsEnabled(false);
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReconfigureBiometric = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await removeBiometric();
      await setupBiometric(user.email || 'user');
    } catch (error) {
      console.error('Biometric reconfiguration error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Fingerprint className="w-5 h-5" />
            <span>Logowanie Biometryczne</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3 text-gray-400">
            <AlertTriangle className="w-5 h-5" />
            <p>Logowanie biometryczne nie jest obsługiwane w tej przeglądarce</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Fingerprint className="w-5 h-5" />
          <span>Logowanie Biometryczne</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-white">Włącz logowanie biometryczne</Label>
            <p className="text-sm text-gray-400">
              Używaj odcisku palca lub rozpoznawania twarzy do logowania
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggleBiometric}
            disabled={loading}
          />
        </div>

        {isEnabled && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-300">
                  Logowanie biometryczne jest aktywne
                </p>
                <p className="text-xs text-green-400">
                  Możesz teraz logować się używając biometrii
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleReconfigureBiometric}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <Fingerprint className="w-4 h-4 mr-2" />
                {loading ? 'Konfigurowanie...' : 'Ponownie skonfiguruj biometrię'}
              </Button>
              
              <p className="text-xs text-gray-400">
                Użyj tej opcji jeśli chcesz zaktualizować swoje dane biometryczne
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Informacje o bezpieczeństwie</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Dane biometryczne są przechowywane lokalnie w Twojej przeglądarce</li>
            <li>• Żadne dane biometryczne nie są wysyłane na nasze serwery</li>
            <li>• Możesz wyłączyć tę funkcję w dowolnym momencie</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BiometricSettings;
