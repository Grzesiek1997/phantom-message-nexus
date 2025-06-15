
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
  phone?: string;
  status: 'available' | 'away' | 'busy' | 'invisible';
  identity_key?: string;
  signed_prekey?: string;
  prekey_signature?: string;
  one_time_prekeys?: string[];
  pin_hash?: string;
  two_factor_secret?: string;
  backup_phrase_hash?: string;
  privacy_settings: PrivacySettings;
  last_seen: string;
  is_online: boolean;
  disappearing_messages_ttl: number;
  is_premium: boolean;
  is_verified: boolean;
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
      setProfile(data);
    } catch (error) {
      console.error('Error fetching enhanced profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<EnhancedProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: 'Sukces',
        description: 'Profil został zaktualizowany'
      });

      return data;
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
    if (!profile) return;

    const newSettings = {
      ...profile.privacy_settings,
      ...settings
    };

    return updateProfile({ privacy_settings: newSettings });
  };

  const updateStatus = async (status: 'available' | 'away' | 'busy' | 'invisible') => {
    return updateProfile({ status });
  };

  const updateOnlineStatus = async (isOnline: boolean) => {
    const updates: Partial<EnhancedProfile> = {
      is_online: isOnline,
      last_seen: new Date().toISOString()
    };

    return updateProfile(updates);
  };

  const generateEncryptionKeys = async () => {
    if (!user) return;

    try {
      // In a real implementation, you would generate proper encryption keys
      // For now, we'll generate placeholder keys
      const identityKey = crypto.randomUUID();
      const signedPrekey = crypto.randomUUID();
      const prekeySignature = crypto.randomUUID();
      const oneTimePrekeys = Array.from({ length: 100 }, () => crypto.randomUUID());

      const updates = {
        identity_key: identityKey,
        signed_prekey: signedPrekey,
        prekey_signature: prekeySignature,
        one_time_prekeys: oneTimePrekeys
      };

      return updateProfile(updates);
    } catch (error) {
      console.error('Error generating encryption keys:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wygenerować kluczy szyfrowania',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Update online status when component mounts/unmounts
  useEffect(() => {
    if (profile) {
      updateOnlineStatus(true);

      const interval = setInterval(() => {
        updateOnlineStatus(true);
      }, 30000); // Update every 30 seconds

      return () => {
        clearInterval(interval);
        updateOnlineStatus(false);
      };
    }
  }, [profile]);

  return {
    profile,
    loading,
    updateProfile,
    updatePrivacySettings,
    updateStatus,
    updateOnlineStatus,
    generateEncryptionKeys,
    refetch: fetchProfile
  };
};
