
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface DisappearingMessage {
  id: string;
  message_id: string;
  delete_at: string;
  processed: boolean;
  created_at: string;
}

export const useDisappearingMessages = () => {
  const [queue, setQueue] = useState<DisappearingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchQueue = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('disappearing_messages_queue')
        .select(`
          *,
          messages!inner(
            conversation_id,
            conversation_participants!inner(user_id)
          )
        `)
        .eq('messages.conversation_participants.user_id', user.id)
        .eq('processed', false)
        .order('delete_at', { ascending: true });

      if (error) throw error;
      setQueue(data || []);
    } catch (error) {
      console.error('Error fetching disappearing messages queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleMessageDeletion = async (
    messageId: string,
    ttlSeconds: number
  ) => {
    try {
      const deleteAt = new Date();
      deleteAt.setSeconds(deleteAt.getSeconds() + ttlSeconds);

      const { data, error } = await supabase
        .from('disappearing_messages_queue')
        .insert({
          message_id: messageId,
          delete_at: deleteAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setQueue(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error scheduling message deletion:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaplanować usunięcia wiadomości',
        variant: 'destructive'
      });
    }
  };

  const processExpiredMessages = async () => {
    try {
      // Call the cleanup function
      const { data, error } = await supabase.rpc('cleanup_disappearing_messages');
      
      if (error) throw error;

      // Refresh the queue
      await fetchQueue();

      console.log(`Processed ${data} expired messages`);
      return data;
    } catch (error) {
      console.error('Error processing expired messages:', error);
    }
  };

  const updateMessageTTL = async (
    conversationId: string,
    ttlSeconds: number
  ) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ disappearing_messages_ttl: ttlSeconds })
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: 'Sukces',
        description: `Czas życia wiadomości ustawiony na ${ttlSeconds > 0 ? `${ttlSeconds} sekund` : 'wyłączony'}`
      });
    } catch (error) {
      console.error('Error updating message TTL:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować ustawień',
        variant: 'destructive'
      });
    }
  };

  const deleteMessageImmediately = async (messageId: string) => {
    try {
      // Mark message as deleted
      const { error: messageError } = await supabase
        .from('messages')
        .update({ 
          is_deleted: true,
          content: '[Wiadomość usunięta]',
          content_encrypted: '[Wiadomość usunięta]'
        })
        .eq('id', messageId);

      if (messageError) throw messageError;

      // Remove from queue if exists
      const { error: queueError } = await supabase
        .from('disappearing_messages_queue')
        .delete()
        .eq('message_id', messageId);

      if (queueError) console.error('Error removing from queue:', queueError);

      setQueue(prev => prev.filter(item => item.message_id !== messageId));

      toast({
        title: 'Sukces',
        description: 'Wiadomość została usunięta'
      });
    } catch (error) {
      console.error('Error deleting message immediately:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć wiadomości',
        variant: 'destructive'
      });
    }
  };

  const getTimeRemaining = (deleteAt: string): number => {
    const now = new Date().getTime();
    const deleteTime = new Date(deleteAt).getTime();
    return Math.max(0, deleteTime - now);
  };

  useEffect(() => {
    fetchQueue();

    // Set up interval to process expired messages
    const interval = setInterval(() => {
      processExpiredMessages();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  // Real-time subscription for queue changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('disappearing_messages')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'disappearing_messages_queue' },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    queue,
    loading,
    scheduleMessageDeletion,
    processExpiredMessages,
    updateMessageTTL,
    deleteMessageImmediately,
    getTimeRemaining,
    refetch: fetchQueue
  };
};
