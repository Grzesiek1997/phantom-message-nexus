
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types/chat';

export const useRealtimeSubscriptions = (
  conversationId?: string,
  setMessages?: (updater: (prev: Message[]) => Message[]) => void,
  fetchConversations?: () => Promise<void>
) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !conversationId) return;

    console.log('Setting up realtime subscriptions for conversation:', conversationId);

    const messagesChannel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as any;
          
          if (setMessages && newMessage.sender_id !== user.id) {
            setMessages(prev => {
              // Sprawdź czy wiadomość już istnieje
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) return prev;
              
              return [...prev, {
                id: newMessage.id,
                conversation_id: newMessage.conversation_id,
                sender_id: newMessage.sender_id,
                content: newMessage.content,
                message_type: newMessage.message_type,
                created_at: newMessage.created_at,
                updated_at: newMessage.updated_at,
                reply_to_id: newMessage.reply_to_id,
                thread_root_id: newMessage.thread_root_id,
                is_edited: newMessage.is_edited,
                is_deleted: newMessage.is_deleted,
                expires_at: newMessage.expires_at
              }];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Message updated:', payload);
          const updatedMessage = payload.new as any;
          
          if (setMessages) {
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id 
                ? {
                    ...msg,
                    content: updatedMessage.content,
                    is_edited: updatedMessage.is_edited,
                    is_deleted: updatedMessage.is_deleted,
                    updated_at: updatedMessage.updated_at
                  }
                : msg
            ));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Message deleted:', payload);
          const deletedMessage = payload.old as any;
          
          if (setMessages) {
            setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
          }
        }
      )
      .subscribe();

    // Subskrypcja dla konwersacji
    const conversationsChannel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log('Conversations updated, refetching...');
          if (fetchConversations) {
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, conversationId]);
};
