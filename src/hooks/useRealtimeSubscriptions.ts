
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Message } from '@/types/chat';

export const useRealtimeSubscriptions = (
  conversationId: string | undefined,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  fetchConversations: () => Promise<void>
) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscriptions');

    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as any;
          if (conversationId && newMessage.conversation_id === conversationId) {
            setMessages(prev => [...prev, {
              ...newMessage,
              message_type: newMessage.message_type as 'text' | 'file' | 'image'
            }]);
          }
        }
      )
      .subscribe();

    const conversationsSubscription = supabase
      .channel('conversations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          console.log('Conversation updated, refetching...');
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user, conversationId, setMessages, fetchConversations]);
};
