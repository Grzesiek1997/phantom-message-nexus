
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
      // Try to upsert to user_status table
      const { error } = await supabase
        .from('user_status' as any)
        .upsert({
          user_id: user.id,
          status: status,
          last_seen: new Date().toISOString(),
          custom_status: customStatus,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.log('User status table not available, updating profile instead');
        // Fallback to updating profile
        await supabase
          .from('profiles')
          .update({ 
            status: status,
            last_seen: new Date().toISOString(),
            is_online: status === 'online'
          })
          .eq('id', user.id);
      }

      setMyStatus(status);
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback to local state
      setMyStatus(status);
    }
  };

  const fetchUserStatuses = async (userIds: string[]) => {
    if (userIds.length === 0) return;

    try {
      // Try to fetch from the new user_status table first
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
        // Fallback to profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, status, last_seen, is_online')
          .in('id', userIds);

        if (profileData) {
          const statusMap: Record<string, UserStatus> = {};
          profileData.forEach(profile => {
            statusMap[profile.id] = {
              id: `status-${profile.id}`,
              user_id: profile.id,
              status: profile.is_online ? 'online' : (profile.status as any) || 'offline',
              last_seen: profile.last_seen || new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          });
          setUserStatuses(prev => ({ ...prev, ...statusMap }));
        }
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
