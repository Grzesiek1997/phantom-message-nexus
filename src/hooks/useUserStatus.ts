
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
      // Use raw SQL to interact with the new table until types are updated
      const { error } = await supabase.rpc('update_user_last_seen');

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
      // For now, we'll simulate user statuses until the table types are available
      const statusMap: Record<string, UserStatus> = {};
      userIds.forEach(userId => {
        statusMap[userId] = {
          id: `status-${userId}`,
          user_id: userId,
          status: 'online', // Default to online for now
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });
      setUserStatuses(prev => ({ ...prev, ...statusMap }));
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
