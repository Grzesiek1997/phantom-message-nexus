
import React, { useEffect } from 'react';
import InstallPrompt from './InstallPrompt';

// Extend Navigator interface for PWA support
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const PWAComponents: React.FC = () => {
  useEffect(() => {
    // Rejestracja Service Workera
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Sprawdź czy aplikacja została zainstalowana
    let displayMode = 'browser';
    if (navigator.standalone) {
      displayMode = 'standalone-ios';
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      displayMode = 'standalone';
    }
    
    // Dodaj klasę CSS dla trybu standalone
    document.body.classList.add(`display-${displayMode}`);

    // Obsługa orientacji urządzenia
    const handleOrientationChange = () => {
      // Dodatkowa logika dla zmiany orientacji
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 500);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return <InstallPrompt />;
};

export default PWAComponents;
