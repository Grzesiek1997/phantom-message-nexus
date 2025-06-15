
import React, { useState } from 'react';
import { Shield, Smartphone, Key, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const TwoFactorSettings: React.FC = () => {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleEnable2FA = () => {
    setShowSetup(true);
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      setIsEnabled(true);
      setShowSetup(false);
      toast({
        title: 'Weryfikacja dwuetapowa włączona',
        description: 'Twoje konto jest teraz lepiej zabezpieczone'
      });
    } else {
      toast({
        title: 'Nieprawidłowy kod',
        description: 'Wprowadź 6-cyfrowy kod z aplikacji',
        variant: 'destructive'
      });
    }
  };

  const handleDisable2FA = () => {
    setIsEnabled(false);
    toast({
      title: 'Weryfikacja dwuetapowa wyłączona',
      description: 'Funkcja została pomyślnie wyłączona'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-green-400" />
        <h2 className="text-xl font-bold text-white">Weryfikacja dwuetapowa</h2>
      </div>

      {!isEnabled ? (
        <div className="space-y-6">
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-white font-medium mb-2">Dodatkowe zabezpieczenie</h3>
            <p className="text-gray-400 text-sm mb-4">
              Weryfikacja dwuetapowa dodaje dodatkową warstwę bezpieczeństwa do Twojego konta. 
              Oprócz hasła będziesz potrzebować kodu z aplikacji mobilnej.
            </p>
            <Button
              onClick={handleEnable2FA}
              className="bg-green-600 hover:bg-green-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Włącz weryfikację 2FA
            </Button>
          </div>

          {showSetup && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-white font-medium mb-4">Konfiguracja 2FA</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center p-6 bg-white rounded-lg">
                  <QrCode className="w-32 h-32 text-gray-800" />
                </div>
                
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-2">
                    Zeskanuj kod QR aplikacją Google Authenticator lub podobną
                  </p>
                  <code className="text-xs text-blue-400 bg-white/10 px-2 py-1 rounded">
                    ABCD-EFGH-IJKL-MNOP-QRST-UVWX
                  </code>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kod weryfikacyjny
                  </label>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="bg-white/10 border-white/20 text-white text-center"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleVerify}
                    disabled={verificationCode.length !== 6}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Weryfikuj i włącz
                  </Button>
                  <Button
                    onClick={() => setShowSetup(false)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Anuluj
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-medium">Weryfikacja 2FA aktywna</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Twoje konto jest zabezpieczone weryfikacją dwuetapową
            </p>
            <Button
              onClick={handleDisable2FA}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/10"
            >
              Wyłącz 2FA
            </Button>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-white font-medium mb-2">Kody zapasowe</h3>
            <p className="text-gray-400 text-sm mb-3">
              Wygeneruj kody zapasowe na wypadek utraty dostępu do aplikacji
            </p>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Key className="w-4 h-4 mr-2" />
              Generuj kody zapasowe
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;
