
import React, { useEffect } from 'react';
import InstallPrompt from './InstallPrompt';

// Extend Navigator interface for PWA support with TypeScript fix
interface ExtendedNavigator extends Navigator {
  standalone?: boolean;
}

const PWAComponents: React.FC = () => {
  useEffect(() => {
    // Service Worker registration
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

    // Check if app is installed
    let displayMode = 'browser';
    const extendedNavigator = navigator as ExtendedNavigator;
    if (extendedNavigator.standalone) {
      displayMode = 'standalone-ios';
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      displayMode = 'standalone';
    }
    
    // Add CSS class for standalone mode
    document.body.classList.add(`display-${displayMode}`);

    // Handle orientation change
    const handleOrientationChange = () => {
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
