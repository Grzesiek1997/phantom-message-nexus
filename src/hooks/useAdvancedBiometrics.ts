import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface BiometricSettings {
  enabled: boolean;
  requiredForLogin: boolean;
  requiredForSensitiveActions: boolean;
  requiredForEncryptedMessages: boolean;
  allowMultipleDevices: boolean;
  deviceVerificationRequired: boolean;
  failedAttemptsLimit: number;
  lockoutDuration: number; // w minutach
  biometricTypes: BiometricType[];
}

interface BiometricData {
  id: string;
  userId: string;
  biometricType: BiometricType;
  biometricValue: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed: Date | null;
}

interface BiometricVerificationResult {
  success: boolean;
  message: string;
  attemptId?: string;
  lockoutUntil?: Date;
}

type BiometricType = 'fingerprint' | 'face' | 'voice' | 'iris' | 'behavioral';

export function useAdvancedBiometrics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<BiometricSettings>({
    enabled: false,
    requiredForLogin: false,
    requiredForSensitiveActions: false,
    requiredForEncryptedMessages: false,
    allowMultipleDevices: true,
    deviceVerificationRequired: true,
    failedAttemptsLimit: 5,
    lockoutDuration: 30,
    biometricTypes: ['fingerprint', 'face'],
  });
  const [biometricData, setBiometricData] = useState<BiometricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

  // Sprawdzanie, czy urządzenie obsługuje biometrię
  const checkBiometricSupport = useCallback(async () => {
    try {
      // Sprawdzanie, czy przeglądarka obsługuje Web Authentication API
      if (window.PublicKeyCredential) {
        // Sprawdzanie, czy urządzenie obsługuje biometrię
        // @ts-ignore - PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable nie jest jeszcze w typach TS
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
        return available;
      }
      
      setIsSupported(false);
      return false;
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setIsSupported(false);
      return false;
    }
  }, []);

  // Pobieranie ustawień biometrycznych
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('biometric_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching biometric settings:', error);
        return;
      }

      if (data) {
        setSettings({
          enabled: data.enabled,
          requiredForLogin: data.required_for_login,
          requiredForSensitiveActions: data.required_for_sensitive_actions,
          requiredForEncryptedMessages: data.required_for_encrypted_messages,
          allowMultipleDevices: data.allow_multiple_devices,
          deviceVerificationRequired: data.device_verification_required,
          failedAttemptsLimit: data.failed_attempts_limit,
          lockoutDuration: data.lockout_duration,
          biometricTypes: data.biometric_types || ['fingerprint', 'face'],
        });
      }

      // Sprawdzanie, czy użytkownik jest zablokowany
      const { data: lockoutData, error: lockoutError } = await supabase
        .from('biometric_lockouts')
        .select('lockout_until')
        .eq('user_id', user.id)
        .gt('lockout_until', new Date().toISOString())
        .maybeSingle();

      if (lockoutError) {
        console.error('Error fetching biometric lockout:', lockoutError);
      } else if (lockoutData) {
        setIsLocked(true);
        setLockoutUntil(new Date(lockoutData.lockout_until));
      } else {
        setIsLocked(false);
        setLockoutUntil(null);
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Pobieranie danych biometrycznych
  const fetchBiometricData = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('biometric_data')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching biometric data:', error);
        return;
      }

      const formattedData = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        biometricType: item.biometric_type as BiometricType,
        biometricValue: item.biometric_value,
        deviceId: item.device_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        lastUsed: item.last_used ? new Date(item.last_used) : null,
      }));

      setBiometricData(formattedData);
    } catch (error) {
      console.error('Error in fetchBiometricData:', error);
    }
  }, [user]);

  // Aktualizacja ustawień biometrycznych
  const updateSettings = useCallback(async (newSettings: Partial<BiometricSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('biometric_settings')
        .upsert({
          user_id: user.id,
          enabled: newSettings.enabled !== undefined ? newSettings.enabled : settings.enabled,
          required_for_login: newSettings.requiredForLogin !== undefined ? newSettings.requiredForLogin : settings.requiredForLogin,
          required_for_sensitive_actions: newSettings.requiredForSensitiveActions !== undefined ? newSettings.requiredForSensitiveActions : settings.requiredForSensitiveActions,
          required_for_encrypted_messages: newSettings.requiredForEncryptedMessages !== undefined ? newSettings.requiredForEncryptedMessages : settings.requiredForEncryptedMessages,
          allow_multiple_devices: newSettings.allowMultipleDevices !== undefined ? newSettings.allowMultipleDevices : settings.allowMultipleDevices,
          device_verification_required: newSettings.deviceVerificationRequired !== undefined ? newSettings.deviceVerificationRequired : settings.deviceVerificationRequired,
          failed_attempts_limit: newSettings.failedAttemptsLimit !== undefined ? newSettings.failedAttemptsLimit : settings.failedAttemptsLimit,
          lockout_duration: newSettings.lockoutDuration !== undefined ? newSettings.lockoutDuration : settings.lockoutDuration,
          biometric_types: newSettings.biometricTypes !== undefined ? newSettings.biometricTypes : settings.biometricTypes,
          last_updated: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating biometric settings:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się zaktualizować ustawień biometrycznych',
          variant: 'destructive',
        });
        return;
      }

      setSettings(prev => ({
        ...prev,
        ...newSettings,
      }));

      toast({
        title: 'Sukces',
        description: 'Ustawienia biometryczne zostały zaktualizowane',
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
    }
  }, [user, settings, toast]);

  // Rejestracja danych biometrycznych
  const registerBiometricData = useCallback(async (
    biometricType: BiometricType,
    biometricValue: string,
    deviceId: string
  ) => {
    if (!user || !settings.enabled) return null;

    try {
      // Sprawdzanie, czy użytkownik może zarejestrować więcej urządzeń
      if (!settings.allowMultipleDevices) {
        const existingDevices = biometricData.filter(data => data.biometricType === biometricType);
        if (existingDevices.length > 0) {
          toast({
            title: 'Błąd',
            description: 'Nie możesz zarejestrować więcej urządzeń. Usuń istniejące dane biometryczne, aby kontynuować.',
            variant: 'destructive',
          });
          return null;
        }
      }

      const { data, error } = await supabase
        .from('biometric_data')
        .insert({
          user_id: user.id,
          biometric_type: biometricType,
          biometric_value: biometricValue,
          device_id: deviceId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering biometric data:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się zarejestrować danych biometrycznych',
          variant: 'destructive',
        });
        return null;
      }

      // Dodawanie wpisu do dziennika bezpieczeństwa
      await supabase
        .from('security_logs')
        .insert({
          user_id: user.id,
          event_type: 'biometric_registration',
          resource_type: 'biometric_data',
          resource_id: data.id,
          metadata: {
            biometric_type: biometricType,
            device_id: deviceId,
            timestamp: new Date().toISOString(),
          },
        });

      toast({
        title: 'Sukces',
        description: 'Dane biometryczne zostały zarejestrowane',
      });

      // Odświeżanie danych biometrycznych
      await fetchBiometricData();

      return data;
    } catch (error) {
      console.error('Error in registerBiometricData:', error);
      return null;
    }
  }, [user, settings, biometricData, toast, fetchBiometricData]);

  // Usuwanie danych biometrycznych
  const removeBiometricData = useCallback(async (biometricId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('biometric_data')
        .delete()
        .eq('id', biometricId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing biometric data:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się usunąć danych biometrycznych',
          variant: 'destructive',
        });
        return false;
      }

      // Dodawanie wpisu do dziennika bezpieczeństwa
      await supabase
        .from('security_logs')
        .insert({
          user_id: user.id,
          event_type: 'biometric_removal',
          resource_type: 'biometric_data',
          resource_id: biometricId,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });

      toast({
        title: 'Sukces',
        description: 'Dane biometryczne zostały usunięte',
      });

      // Odświeżanie danych biometrycznych
      await fetchBiometricData();

      return true;
    } catch (error) {
      console.error('Error in removeBiometricData:', error);
      return false;
    }
  }, [user, toast, fetchBiometricData]);

  // Weryfikacja biometryczna
  const verifyBiometric = useCallback(async (
    biometricType: BiometricType,
    biometricValue: string,
    deviceId: string
  ): Promise<BiometricVerificationResult> => {
    if (!user || !settings.enabled || isLocked) {
      return {
        success: false,
        message: isLocked ? 'Konto jest tymczasowo zablokowane. Spróbuj ponownie później.' : 'Weryfikacja biometryczna jest wyłączona.',
        lockoutUntil: lockoutUntil || undefined,
      };
    }

    try {
      // Zapisywanie próby weryfikacji
      const { data: attemptData, error: attemptError } = await supabase
        .from('biometric_auth_attempts')
        .insert({
          user_id: user.id,
          biometric_type: biometricType,
          device_id: deviceId,
          success: false, // Domyślnie ustawiamy na false, zaktualizujemy później jeśli się powiedzie
          attempt_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (attemptError) {
        console.error('Error recording biometric auth attempt:', attemptError);
        return {
          success: false,
          message: 'Nie udało się zarejestrować próby weryfikacji biometrycznej',
        };
      }

      // Pobieranie danych biometrycznych dla danego typu i urządzenia
      const { data: storedData, error: dataError } = await supabase
        .from('biometric_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('biometric_type', biometricType)
        .eq('device_id', deviceId)
        .maybeSingle();

      if (dataError) {
        console.error('Error fetching stored biometric data:', dataError);
        return {
          success: false,
          message: 'Nie udało się pobrać danych biometrycznych',
          attemptId: attemptData.id,
        };
      }

      if (!storedData) {
        // Sprawdzanie liczby nieudanych prób
        await checkFailedAttempts(user.id);
        
        return {
          success: false,
          message: 'Nie znaleziono zarejestrowanych danych biometrycznych dla tego urządzenia',
          attemptId: attemptData.id,
        };
      }

      // Porównywanie danych biometrycznych
      // W rzeczywistej aplikacji tutaj byłaby bardziej zaawansowana logika porównywania
      const isMatch = biometricValue === storedData.biometric_value;

      if (!isMatch) {
        // Aktualizacja próby weryfikacji
        await supabase
          .from('biometric_auth_attempts')
          .update({ success: false })
          .eq('id', attemptData.id);

        // Sprawdzanie liczby nieudanych prób
        const lockout = await checkFailedAttempts(user.id);
        
        return {
          success: false,
          message: 'Weryfikacja biometryczna nie powiodła się',
          attemptId: attemptData.id,
          lockoutUntil: lockout,
        };
      }

      // Aktualizacja próby weryfikacji
      await supabase
        .from('biometric_auth_attempts')
        .update({ success: true })
        .eq('id', attemptData.id);

      // Aktualizacja ostatniego użycia danych biometrycznych
      await supabase
        .from('biometric_data')
        .update({ last_used: new Date().toISOString() })
        .eq('id', storedData.id);

      // Resetowanie licznika nieudanych prób
      await supabase
        .from('biometric_failed_attempts')
        .delete()
        .eq('user_id', user.id);

      // Dodawanie wpisu do dziennika bezpieczeństwa
      await supabase
        .from('security_logs')
        .insert({
          user_id: user.id,
          event_type: 'biometric_verification',
          resource_type: 'biometric_data',
          resource_id: storedData.id,
          metadata: {
            biometric_type: biometricType,
            device_id: deviceId,
            success: true,
            timestamp: new Date().toISOString(),
          },
        });

      return {
        success: true,
        message: 'Weryfikacja biometryczna powiodła się',
        attemptId: attemptData.id,
      };
    } catch (error) {
      console.error('Error in verifyBiometric:', error);
      return {
        success: false,
        message: 'Wystąpił błąd podczas weryfikacji biometrycznej',
      };
    }
  }, [user, settings, isLocked, lockoutUntil]);

  // Sprawdzanie liczby nieudanych prób
  const checkFailedAttempts = useCallback(async (userId: string): Promise<Date | undefined> => {
    try {
      // Pobieranie liczby nieudanych prób
      const { data: failedAttempts, error: countError } = await supabase
        .from('biometric_auth_attempts')
        .select('id')
        .eq('user_id', userId)
        .eq('success', false)
        .gte('attempt_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Ostatnie 24 godziny

      if (countError) {
        console.error('Error counting failed attempts:', countError);
        return;
      }

      const failedCount = failedAttempts.length;

      // Jeśli liczba nieudanych prób przekracza limit, blokujemy konto
      if (failedCount >= settings.failedAttemptsLimit) {
        const lockoutUntil = new Date();
        lockoutUntil.setMinutes(lockoutUntil.getMinutes() + settings.lockoutDuration);

        // Zapisywanie informacji o blokadzie
        await supabase
          .from('biometric_lockouts')
          .upsert({
            user_id: userId,
            lockout_until: lockoutUntil.toISOString(),
            failed_attempts: failedCount,
            created_at: new Date().toISOString(),
          });

        // Dodawanie wpisu do dziennika bezpieczeństwa
        await supabase
          .from('security_logs')
          .insert({
            user_id: userId,
            event_type: 'biometric_lockout',
            resource_type: 'user',
            resource_id: userId,
            metadata: {
              failed_attempts: failedCount,
              lockout_until: lockoutUntil.toISOString(),
              timestamp: new Date().toISOString(),
            },
          });

        setIsLocked(true);
        setLockoutUntil(lockoutUntil);

        return lockoutUntil;
      }

      return;
    } catch (error) {
      console.error('Error in checkFailedAttempts:', error);
      return;
    }
  }, [settings.failedAttemptsLimit, settings.lockoutDuration]);

  // Generowanie wyzwania biometrycznego
  const generateBiometricChallenge = useCallback(async () => {
    if (!user || !isSupported) return null;

    try {
      // Generowanie losowego wyzwania
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Zapisywanie wyzwania w bazie danych
      const { data, error } = await supabase
        .from('biometric_challenges')
        .insert({
          user_id: user.id,
          challenge: Array.from(challenge),
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Wygasa po 5 minutach
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error generating biometric challenge:', error);
        return null;
      }

      return {
        challengeId: data.id,
        challenge: challenge,
      };
    } catch (error) {
      console.error('Error in generateBiometricChallenge:', error);
      return null;
    }
  }, [user, isSupported]);

  // Inicjalizacja
  useEffect(() => {
    checkBiometricSupport();
    fetchSettings();
    fetchBiometricData();
  }, [checkBiometricSupport, fetchSettings, fetchBiometricData]);

  // Nasłuchiwanie na zmiany w ustawieniach
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('biometric_settings_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'biometric_settings',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchSettings]);

  return {
    settings,
    biometricData,
    loading,
    isSupported,
    isLocked,
    lockoutUntil,
    updateSettings,
    registerBiometricData,
    removeBiometricData,
    verifyBiometric,
    generateBiometricChallenge,
  };
}