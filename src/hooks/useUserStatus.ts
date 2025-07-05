
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserStatus {
  status: 'online' | 'offline' | 'away' | 'busy';
  last_active_at: string;
}

export const useUserStatus = () => {
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>({});
  const { user } = useAuth();

  const updateMyStatus = async (status: 'online' | 'offline' | 'away' | 'busy') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating status:', error);
      }
    } catch (error) {
      console.error('Error in updateMyStatus:', error);
    }
  };

  const fetchUserStatuses = async (userIds: string[]) => {
    if (userIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select('user_id, status, last_active_at')
        .in('user_id', userIds);

      if (error) {
        console.error('Error fetching user statuses:', error);
        return;
      }

      const statusMap: Record<string, UserStatus> = {};
      data?.forEach(item => {
        statusMap[item.user_id] = {
          status: item.status as 'online' | 'offline' | 'away' | 'busy',
          last_active_at: item.last_active_at
        };
      });

      setUserStatuses(prev => ({ ...prev, ...statusMap }));
    } catch (error) {
      console.error('Error in fetchUserStatuses:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Set user as online when component mounts
    updateMyStatus('online');

    // Set user as offline when page is about to unload
    const handleBeforeUnload = () => {
      updateMyStatus('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Real-time subscription to user presence updates
    const presenceChannel = supabase
      .channel('user-presence-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          console.log('Presence update:', payload);
          if (payload.new) {
            setUserStatuses(prev => ({
              ...prev,
              [payload.new.user_id]: {
                status: payload.new.status,
                last_active_at: payload.new.last_active_at
              }
            }));
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateMyStatus('offline');
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  return {
    userStatuses,
    updateMyStatus,
    fetchUserStatuses
  };
};
