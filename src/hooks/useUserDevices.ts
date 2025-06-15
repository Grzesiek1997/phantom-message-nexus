
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserDevice {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  device_key: string;
  platform: 'ios' | 'android' | 'desktop' | 'web';
  is_primary: boolean;
  last_active: string;
  created_at: string;
  push_token?: string;
}

interface RegisterDeviceParams {
  device_id: string;
  device_name: string;
  platform: 'ios' | 'android' | 'desktop' | 'web';
  device_key?: string;
  push_token?: string;
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

      // Process the data to ensure platform matches the expected type
      const processedDevices = (data || []).map(device => ({
        ...device,
        platform: ['ios', 'android', 'desktop', 'web'].includes(device.platform) 
          ? device.platform as 'ios' | 'android' | 'desktop' | 'web'
          : 'web' // default fallback
      }));

      setDevices(processedDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerDevice = async (params: RegisterDeviceParams) => {
    if (!user) return;

    try {
      const deviceKey = params.device_key || `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('user_devices')
        .upsert({
          user_id: user.id,
          device_id: params.device_id,
          device_name: params.device_name,
          platform: params.platform,
          device_key: deviceKey,
          push_token: params.push_token,
          last_active: new Date().toISOString(),
          is_primary: devices.length === 0 // First device is primary
        })
        .select()
        .single();

      if (error) throw error;

      const processedDevice = {
        ...data,
        platform: ['ios', 'android', 'desktop', 'web'].includes(data.platform) 
          ? data.platform as 'ios' | 'android' | 'desktop' | 'web'
          : 'web'
      };

      setDevices(prev => {
        const existingIndex = prev.findIndex(d => d.device_id === params.device_id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = processedDevice;
          return updated;
        }
        return [processedDevice, ...prev];
      });

      toast({
        title: 'Sukces',
        description: 'Urządzenie zostało zarejestrowane'
      });
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('device_id', deviceId)
        .eq('user_id', user.id);

      if (error) throw error;

      setDevices(prev => prev.filter(device => device.device_id !== deviceId));

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

  const setPrimaryDevice = async (deviceId: string) => {
    if (!user) return;

    try {
      // First, remove primary status from all devices
      await supabase
        .from('user_devices')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Then set the selected device as primary
      const { error } = await supabase
        .from('user_devices')
        .update({ is_primary: true })
        .eq('device_id', deviceId)
        .eq('user_id', user.id);

      if (error) throw error;

      setDevices(prev => prev.map(device => ({
        ...device,
        is_primary: device.device_id === deviceId
      })));

      toast({
        title: 'Sukces',
        description: 'Urządzenie zostało ustawione jako główne'
      });
    } catch (error) {
      console.error('Error setting primary device:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się ustawić urządzenia jako głównego',
        variant: 'destructive'
      });
    }
  };

  const updateLastActive = async (deviceId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_devices')
        .update({ last_active: new Date().toISOString() })
        .eq('device_id', deviceId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating last active:', error);
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
    setPrimaryDevice,
    updateLastActive,
    refetch: fetchDevices
  };
};
