
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export const useBiometric = () => {
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential && navigator.credentials && window.isSecureContext) {
      setIsSupported(true);
    }
  }, []);

  const setupBiometric = async (username: string) => {
    if (!isSupported) {
      throw new Error('Biometric authentication is not supported');
    }

    try {
      // Generate a proper challenge
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = new TextEncoder().encode(username + Date.now());

      // Create credential for biometric authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "SecureChat",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [
            {alg: -7, type: "public-key"}, // ES256
            {alg: -257, type: "public-key"} // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: true
          },
          timeout: 60000,
          attestation: "direct"
        }
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential info securely
        const credentialData = {
          id: credential.id,
          username: username,
          userId: user?.id,
          created: new Date().toISOString(),
          rawId: Array.from(new Uint8Array(credential.rawId))
        };

        localStorage.setItem('biometric_credential', JSON.stringify(credentialData));

        toast({
          title: 'Sukces',
          description: 'Logowanie biometryczne zostało skonfigurowane'
        });

        return true;
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      let errorMessage = 'Nie udało się skonfigurować logowania biometrycznego';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Dostęp do biometrii został odrzucony';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Biometria nie jest obsługiwana na tym urządzeniu';
        }
      }

      toast({
        title: 'Błąd',
        description: errorMessage,
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
      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          allowCredentials: [{
            id: new Uint8Array(credentialData.rawId),
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
      let errorMessage = 'Nie udało się zalogować za pomocą biometrii';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Dostęp do biometrii został odrzucony';
        } else if (error.name === 'InvalidStateError') {
          errorMessage = 'Biometria jest już w użyciu';
        }
      }

      toast({
        title: 'Błąd',
        description: errorMessage,
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

  const updateBiometric = async (username: string) => {
    try {
      await removeBiometric();
      await setupBiometric(username);
      toast({
        title: 'Sukces',
        description: 'Dane biometryczne zostały zaktualizowane'
      });
    } catch (error) {
      console.error('Error updating biometric data:', error);
      throw error;
    }
  };

  const isBiometricConfigured = () => {
    return !!localStorage.getItem('biometric_credential');
  };

  return {
    isSupported,
    setupBiometric,
    authenticateWithBiometric,
    removeBiometric,
    updateBiometric,
    isBiometricConfigured
  };
};
