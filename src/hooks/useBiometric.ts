
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export const useBiometric = () => {
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential && navigator.credentials) {
      setIsSupported(true);
    }
  }, []);

  const setupBiometric = async (username: string) => {
    if (!isSupported) {
      throw new Error('Biometric authentication is not supported');
    }

    try {
      // Create credential for biometric authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: "SecureChat",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(username),
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [{alg: -7, type: "public-key"}],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        }
      });

      if (credential) {
        // Store credential info in localStorage for demo purposes
        // In production, this should be stored securely on the server
        localStorage.setItem('biometric_credential', JSON.stringify({
          id: credential.id,
          username: username,
          created: new Date().toISOString()
        }));

        toast({
          title: 'Sukces',
          description: 'Logowanie biometryczne zostało skonfigurowane'
        });

        return true;
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się skonfigurować logowania biometrycznego',
        variant: 'destructive'
      });
      throw error;
    }

    return false;
  };

  const authenticateWithBiometric = async () => {
    if (!isSupported) {
      throw new Error('Biometric authentication is not supported');
    }

    try {
      const storedCredential = localStorage.getItem('biometric_credential');
      if (!storedCredential) {
        toast({
          title: 'Błąd',
          description: 'Nie znaleziono danych biometrycznych. Skonfiguruj je najpierw.',
          variant: 'destructive'
        });
        return false;
      }

      const credentialData = JSON.parse(storedCredential);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [{
            id: new TextEncoder().encode(credentialData.id),
            type: 'public-key'
          }],
          userVerification: "required",
          timeout: 60000,
        }
      });

      if (assertion) {
        toast({
          title: 'Sukces',
          description: 'Zalogowano pomyślnie za pomocą biometrii'
        });
        return true;
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zalogować za pomocą biometrii',
        variant: 'destructive'
      });
      throw error;
    }

    return false;
  };

  const removeBiometric = async () => {
    try {
      localStorage.removeItem('biometric_credential');
      toast({
        title: 'Sukces',
        description: 'Dane biometryczne zostały usunięte'
      });
    } catch (error) {
      console.error('Error removing biometric data:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć danych biometrycznych',
        variant: 'destructive'
      });
    }
  };

  return {
    isSupported,
    setupBiometric,
    authenticateWithBiometric,
    removeBiometric
  };
};
