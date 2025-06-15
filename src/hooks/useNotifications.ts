
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useFriendRequests } from './friends/useFriendRequests';

export interface Notification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'friend_accepted' | 'message' | 'call';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { receivedRequests } = useFriendRequests();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      const mappedNotifications: Notification[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        type: (item.type as 'friend_request' | 'friend_accepted' | 'message' | 'call') || 'message',
        title: item.title || 'Powiadomienie',
        message: item.message || 'Masz nowe powiadomienie',
        data: item.data,
        is_read: item.is_read || false,
        created_at: item.created_at || new Date().toISOString()
      }));

      // Dodaj zaproszenia do znajomych jako powiadomienia
      const friendRequestNotifications: Notification[] = receivedRequests.map(request => ({
        id: `friend_request_${request.id}`,
        user_id: user.id,
        type: 'friend_request' as const,
        title: 'Nowe zaproszenie do znajomych',
        message: `${request.sender_profile?.display_name || 'Ktoś'} chce dodać Cię do znajomych`,
        data: { friend_request_id: request.id },
        is_read: false,
        created_at: request.created_at
      }));

      const allNotifications = [...mappedNotifications, ...friendRequestNotifications];
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      if (notificationId.startsWith('friend_request_')) {
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      await fetchNotifications();
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      await fetchNotifications();
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, receivedRequests]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  };
};
