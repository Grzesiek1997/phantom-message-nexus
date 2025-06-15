
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PrivacySettings {
  read_receipts: boolean;
  last_seen: 'everyone' | 'contacts' | 'nobody';
  profile_photo: 'everyone' | 'contacts' | 'nobody';
  disappearing_messages: boolean;
  screen_lock: boolean;
  incognito_keyboard: boolean;
}

export interface EnhancedProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  last_seen: string;
  is_online: boolean;
  is_verified: boolean;
  is_premium: boolean;
  phone?: string;
  privacy_settings: PrivacySettings;
  disappearing_messages_ttl: number;
  identity_key?: string;
  signed_prekey?: string;
  prekey_signature?: string;
  one_time_prekeys?: string[];
  backup_phrase_hash?: string;
  pin_hash?: string;
  two_factor_secret?: string;
  premium_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export const useEnhancedProfiles = () => {
  const [profile, setProfile] = useState<EnhancedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        // Safely parse privacy_settings with proper type checking
        let privacySettings: PrivacySettings;
        try {
          if (data.privacy_settings && typeof data.privacy_settings === 'object' && !Array.isArray(data.privacy_settings)) {
            const settings = data.privacy_settings as Record<string, any>;
            privacySettings = {
              read_receipts: Boolean(settings.read_receipts ?? true),
              last_seen: (settings.last_seen as 'everyone' | 'contacts' | 'nobody') || 'contacts',
              profile_photo: (settings.profile_photo as 'everyone' | 'contacts' | 'nobody') || 'contacts',
              disappearing_messages: Boolean(settings.disappearing_messages ?? false),
              screen_lock: Boolean(settings.screen_lock ?? false),
              incognito_keyboard: Boolean(settings.incognito_keyboard ?? false)
            };
          } else {
            // Default privacy settings
            privacySettings = {
              read_receipts: true,
              last_seen: 'contacts',
              profile_photo: 'contacts',
              disappearing_messages: false,
              screen_lock: false,
              incognito_keyboard: false
            };
          }
        } catch (parseError) {
          console.error('Error parsing privacy settings:', parseError);
          privacySettings = {
            read_receipts: true,
            last_seen: 'contacts',
            profile_photo: 'contacts',
            disappearing_messages: false,
            screen_lock: false,
            incognito_keyboard: false
          };
        }

        const enhancedProfile: EnhancedProfile = {
          ...data,
          privacy_settings: privacySettings,
          status: (data.status as 'available' | 'busy' | 'away' | 'offline') || 'available',
          disappearing_messages_ttl: data.disappearing_messages_ttl || 0,
          is_online: data.is_online || false,
          is_verified: data.is_verified || false,
          is_premium: data.is_premium || false,
          last_seen: data.last_seen || new Date().toISOString(),
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        };

        setProfile(enhancedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<EnhancedProfile>) => {
    if (!user || !profile) return;

    try {
      // Convert privacy_settings to JSON if included in updates
      const dbUpdates: any = { ...updates };
      if (updates.privacy_settings) {
        dbUpdates.privacy_settings = updates.privacy_settings;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);

      toast({
        title: 'Sukces',
        description: 'Profil został zaktualizowany'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować profilu',
        variant: 'destructive'
      });
    }
  };

  const updatePrivacySettings = async (settings: Partial<PrivacySettings>) => {
    if (!user || !profile) return;

    try {
      const updatedSettings = {
        ...profile.privacy_settings,
        ...settings
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          privacy_settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        privacy_settings: updatedSettings
      } : null);

      toast({
        title: 'Sukces',
        description: 'Ustawienia prywatności zostały zaktualizowane'
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować ustawień prywatności',
        variant: 'destructive'
      });
    }
  };

  const updateStatus = async (status: 'available' | 'busy' | 'away' | 'offline') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status,
          is_online: status !== 'offline',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        status,
        is_online: status !== 'offline',
        last_seen: new Date().toISOString()
      } : null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: data.publicUrl });

      toast({
        title: 'Sukces',
        description: 'Zdjęcie profilowe zostało zaktualizowane'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się przesłać zdjęcia profilowego',
        variant: 'destructive'
      });
    }
  };

  const generateBackupPhrase = () => {
    const words = [
      'apple', 'banana', 'cherry', 'dog', 'elephant', 'fire', 'guitar', 'house',
      'ice', 'jungle', 'key', 'lion', 'moon', 'night', 'ocean', 'piano',
      'queen', 'river', 'sun', 'tree', 'umbrella', 'village', 'water', 'zebra'
    ];

    const phrase = Array.from({ length: 12 }, () => 
      words[Math.floor(Math.random() * words.length)]
    ).join(' ');

    return phrase;
  };

  const setBackupPhrase = async (phrase: string) => {
    if (!user) return;

    try {
      // In a real app, you'd hash this phrase securely
      const hashedPhrase = btoa(phrase); // Simple base64 encoding for demo

      const { error } = await supabase
        .from('profiles')
        .update({
          backup_phrase_hash: hashedPhrase,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        backup_phrase_hash: hashedPhrase
      } : null);

      toast({
        title: 'Sukces',
        description: 'Fraza odzyskiwania została ustawiona'
      });
    } catch (error) {
      console.error('Error setting backup phrase:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się ustawić frazy odzyskiwania',
        variant: 'destructive'
      });
    }
  };

  const generateEncryptionKeys = async () => {
    if (!user) return;

    try {
      // Generate mock encryption keys for demo
      const identityKey = btoa(Math.random().toString(36));
      const signedPrekey = btoa(Math.random().toString(36));
      const prekeySignature = btoa(Math.random().toString(36));
      const oneTimePrekeys = Array.from({ length: 10 }, () => btoa(Math.random().toString(36)));

      const { error } = await supabase
        .from('profiles')
        .update({
          identity_key: identityKey,
          signed_prekey: signedPrekey,
          prekey_signature: prekeySignature,
          one_time_prekeys: oneTimePrekeys,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        identity_key: identityKey,
        signed_prekey: signedPrekey,
        prekey_signature: prekeySignature,
        one_time_prekeys: oneTimePrekeys
      } : null);

      toast({
        title: 'Sukces',
        description: 'Klucze szyfrowania zostały wygenerowane'
      });
    } catch (error) {
      console.error('Error generating encryption keys:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wygenerować kluczy szyfrowania',
        variant: 'destructive'
      });
    }
  };

  const enable2FA = async (secret: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_secret: secret,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        two_factor_secret: secret
      } : null);

      toast({
        title: 'Sukces',
        description: 'Uwierzytelnianie dwuskładnikowe zostało włączone'
      });
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się włączyć uwierzytelniania dwuskładnikowego',
        variant: 'destructive'
      });
    }
  };

  const disable2FA = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_secret: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        two_factor_secret: undefined
      } : null);

      toast({
        title: 'Sukces',
        description: 'Uwierzytelnianie dwuskładnikowe zostało wyłączone'
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wyłączyć uwierzytelniania dwuskładnikowego',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    updatePrivacySettings,
    updateStatus,
    uploadAvatar,
    generateBackupPhrase,
    setBackupPhrase,
    generateEncryptionKeys,
    enable2FA,
    disable2FA,
    refetch: fetchProfile
  };
};
