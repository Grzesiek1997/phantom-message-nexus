
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MessageReadStatus {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export const useMessageReadStatus = (conversationId?: string) => {
  const [readStatuses, setReadStatuses] = useState<Record<string, MessageReadStatus[]>>({});
  const { user } = useAuth();

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_read_status' as any)
        .upsert({
          message_id: messageId,
          user_id: user.id,
          read_at: new Date().toISOString()
        }, {
          onConflict: 'message_id,user_id'
        });

      if (error) {
        console.error('Error marking message as read:', error);
      }
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markMultipleAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    try {
      const readStatuses = messageIds.map(messageId => ({
        message_id: messageId,
        user_id: user.id,
        read_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('message_read_status' as any)
        .upsert(readStatuses, {
          onConflict: 'message_id,user_id'
        });

      if (error) {
        console.error('Error marking messages as read:', error);
      }
    } catch (error) {
      console.error('Error in markMultipleAsRead:', error);
    }
  };

  const fetchReadStatuses = async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('message_read_status' as any)
        .select('*')
        .in('message_id', messageIds);

      if (data && !error) {
        const statusMap: Record<string, MessageReadStatus[]> = {};
        data.forEach((status: any) => {
          if (!statusMap[status.message_id]) {
            statusMap[status.message_id] = [];
          }
          statusMap[status.message_id].push(status);
        });
        setReadStatuses(prev => ({ ...prev, ...statusMap }));
      }
    } catch (error) {
      console.error('Error fetching read statuses:', error);
    }
  };

  const getUnreadCount = (messageIds: string[]): number => {
    if (!user) return 0;
    
    return messageIds.filter(messageId => {
      const statuses = readStatuses[messageId] || [];
      return !statuses.some(status => status.user_id === user.id);
    }).length;
  };

  const isMessageRead = (messageId: string, userId?: string): boolean => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return false;
    
    const statuses = readStatuses[messageId] || [];
    return statuses.some(status => status.user_id === targetUserId);
  };

  // Real-time subscription for read status updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`read-status-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_read_status'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newStatus = payload.new as any;
            setReadStatuses(prev => {
              const updated = { ...prev };
              if (!updated[newStatus.message_id]) {
                updated[newStatus.message_id] = [];
              }
              const existingIndex = updated[newStatus.message_id].findIndex(
                s => s.user_id === newStatus.user_id
              );
              if (existingIndex >= 0) {
                updated[newStatus.message_id][existingIndex] = newStatus;
              } else {
                updated[newStatus.message_id].push(newStatus);
              }
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return {
    readStatuses,
    markAsRead,
    markMultipleAsRead,
    fetchReadStatuses,
    getUnreadCount,
    isMessageRead
  };
};
