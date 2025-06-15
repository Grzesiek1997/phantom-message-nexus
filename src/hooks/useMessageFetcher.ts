
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Message } from '@/types/chat';

export const useMessageFetcher = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async (convId: string) => {
    if (!user) {
      console.log('No user found, skipping message fetch');
      return;
    }

    try {
      console.log('Fetching messages for conversation:', convId);

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        toast({
          title: 'Błąd ładowania wiadomości',
          description: messagesError.message,
          variant: 'destructive'
        });
        return;
      }

      if (!messagesData) {
        console.log('No messages found');
        setMessages([]);
        return;
      }

      // Get sender profiles
      const senderIds = messagesData.map(msg => msg.sender_id);
      const uniqueSenderIds = [...new Set(senderIds)];

      const { data: senderProfiles, error: senderProfilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', uniqueSenderIds);

      if (senderProfilesError) {
        console.error('Error fetching sender profiles:', senderProfilesError);
      }

      const formattedMessages = messagesData.map(msg => {
        const senderProfile = senderProfiles?.find(p => p.id === msg.sender_id);
        return {
          ...msg,
          message_type: msg.message_type as 'text' | 'file' | 'image',
          sender: senderProfile ? {
            username: senderProfile.username,
            display_name: senderProfile.display_name || senderProfile.username
          } : {
            username: 'Unknown',
            display_name: 'Unknown User'
          }
        };
      });

      console.log('Formatted messages:', formattedMessages);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się załadować wiadomości',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (conversationId && user) {
      console.log('Fetching messages for conversation:', conversationId);
      fetchMessages(conversationId);
    } else {
      console.log('Clearing messages - no conversation or user');
      setMessages([]);
    }
  }, [conversationId, user]);

  return {
    messages,
    setMessages,
    fetchMessages
  };
};
