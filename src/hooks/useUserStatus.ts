
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserStatus {
  id: string;
  user_id: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  last_seen: string;
  custom_status?: string;
  updated_at: string;
}

export const useUserStatus = () => {
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>({});
  const [myStatus, setMyStatus] = useState<'online' | 'offline' | 'away' | 'busy'>('offline');
  const { user } = useAuth();

  const updateMyStatus = async (status: 'online' | 'offline' | 'away' | 'busy', customStatus?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_status')
        .upsert({
          user_id: user.id,
          status,
          custom_status: customStatus,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (!error) {
        setMyStatus(status);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const fetchUserStatuses = async (userIds: string[]) => {
    if (userIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('user_status')
        .select('*')
        .in('user_id', userIds);

      if (data && !error) {
        const statusMap: Record<string, UserStatus> = {};
        data.forEach(status => {
          statusMap[status.user_id] = status;
        });
        setUserStatuses(prev => ({ ...prev, ...statusMap }));
      }
    } catch (error) {
      console.error('Error fetching user statuses:', error);
    }
  };

  // Update status on mount and visibility change
  useEffect(() => {
    if (!user) return;

    updateMyStatus('online');

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateMyStatus('away');
      } else {
        updateMyStatus('online');
      }
    };

    const handleBeforeUnload = () => {
      updateMyStatus('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Update last seen every 30 seconds
    const interval = setInterval(() => {
      if (!document.hidden) {
        supabase.rpc('update_user_last_seen');
      }
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
      updateMyStatus('offline');
    };
  }, [user]);

  // Real-time subscription for status updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-status-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_status'
        },
        (payload) => {
          const status = payload.new as UserStatus;
          if (status) {
            setUserStatuses(prev => ({
              ...prev,
              [status.user_id]: status
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    userStatuses,
    myStatus,
    updateMyStatus,
    fetchUserStatuses
  };
};
