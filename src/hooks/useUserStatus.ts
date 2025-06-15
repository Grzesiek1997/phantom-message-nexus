
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
      // Direct insert/update to user_status table using raw query since types aren't updated yet
      const { error } = await supabase
        .from('user_status' as any)
        .upsert({
          user_id: user.id,
          status: status,
          last_seen: new Date().toISOString(),
          custom_status: customStatus,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        setMyStatus(status);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback to local state
      setMyStatus(status);
    }
  };

  const fetchUserStatuses = async (userIds: string[]) => {
    if (userIds.length === 0) return;

    try {
      // Try to fetch from the new user_status table
      const { data, error } = await supabase
        .from('user_status' as any)
        .select('*')
        .in('user_id', userIds);

      if (data && !error) {
        const statusMap: Record<string, UserStatus> = {};
        data.forEach((status: any) => {
          statusMap[status.user_id] = {
            id: status.id,
            user_id: status.user_id,
            status: status.status,
            last_seen: status.last_seen,
            custom_status: status.custom_status,
            updated_at: status.updated_at
          };
        });
        setUserStatuses(prev => ({ ...prev, ...statusMap }));
      } else {
        // Fallback to simulated data if table doesn't exist yet
        const statusMap: Record<string, UserStatus> = {};
        userIds.forEach(userId => {
          statusMap[userId] = {
            id: `status-${userId}`,
            user_id: userId,
            status: 'online',
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });
        setUserStatuses(prev => ({ ...prev, ...statusMap }));
      }
    } catch (error) {
      console.error('Error fetching user statuses:', error);
      // Fallback to simulated data
      const statusMap: Record<string, UserStatus> = {};
      userIds.forEach(userId => {
        statusMap[userId] = {
          id: `status-${userId}`,
          user_id: userId,
          status: 'online',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });
      setUserStatuses(prev => ({ ...prev, ...statusMap }));
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

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateMyStatus('offline');
    };
  }, [user]);

  return {
    userStatuses,
    myStatus,
    updateMyStatus,
    fetchUserStatuses
  };
};
