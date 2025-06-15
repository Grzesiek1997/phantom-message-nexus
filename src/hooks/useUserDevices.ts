
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserDevice {
  id: string;
  user_id: string;
  device_name: string;
  device_id: string;
  device_key: string;
  platform: 'ios' | 'android' | 'desktop' | 'web';
  push_token?: string;
  last_active: string;
  is_primary: boolean;
  created_at: string;
}

export const useUserDevices = () => {
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDevices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się załadować urządzeń',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const registerDevice = async (deviceInfo: {
    device_name: string;
    device_id: string;
    platform: 'ios' | 'android' | 'desktop' | 'web';
    push_token?: string;
  }) => {
    if (!user) return;

    try {
      // Generate device key for encryption
      const deviceKey = crypto.randomUUID();

      const { data, error } = await supabase
        .from('user_devices')
        .insert({
          user_id: user.id,
          device_key: deviceKey,
          ...deviceInfo
        })
        .select()
        .single();

      if (error) throw error;

      setDevices(prev => [data, ...prev]);
      toast({
        title: 'Sukces',
        description: 'Urządzenie zostało zarejestrowane'
      });

      return data;
    } catch (error) {
      console.error('Error registering device:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zarejestrować urządzenia',
        variant: 'destructive'
      });
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(prev => prev.filter(d => d.id !== deviceId));
      toast({
        title: 'Sukces',
        description: 'Urządzenie zostało usunięte'
      });
    } catch (error) {
      console.error('Error removing device:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć urządzenia',
        variant: 'destructive'
      });
    }
  };

  const updateLastActive = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .update({ last_active: new Date().toISOString() })
        .eq('id', deviceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating device activity:', error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

  return {
    devices,
    loading,
    registerDevice,
    removeDevice,
    updateLastActive,
    refetch: fetchDevices
  };
};
