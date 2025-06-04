
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Sprawdź czy to iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Nasłuchuj zdarzenia beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Sprawdź czy aplikacja już jest zainstalowana
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Nie pokazuj promptu jeśli użytkownik już zainstalował aplikację
  if (!showInstallPrompt && !isIOS) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 p-4 glass border-white/20">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">
            Zainstaluj SecureChat
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            {isIOS 
              ? 'Dodaj do ekranu głównego dla lepszego doświadczenia'
              : 'Zainstaluj aplikację na swoim urządzeniu'
            }
          </p>
          
          <div className="flex space-x-2 mt-3">
            {isIOS ? (
              <div className="text-xs text-gray-400">
                Naciśnij <span className="font-mono">⬆️</span> i wybierz "Dodaj do ekranu głównego"
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-3 h-3 mr-1" />
                Zainstaluj
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InstallPrompt;
