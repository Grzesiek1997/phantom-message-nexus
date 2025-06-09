
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Message } from '@/types/chat';

export const useMessageOperations = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async (convId: string) => {
    if (!user) return;

    try {
      console.log('Fetching messages for conversation:', convId);

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return;
      }

      // Get sender profiles
      const senderIds = messagesData?.map(msg => msg.sender_id) || [];
      const { data: senderProfiles, error: senderProfilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', senderIds);

      if (senderProfilesError) {
        console.error('Error fetching sender profiles:', senderProfilesError);
        return;
      }

      const formattedMessages = messagesData?.map(msg => {
        const senderProfile = senderProfiles?.find(p => p.id === msg.sender_id);
        return {
          ...msg,
          message_type: msg.message_type as 'text' | 'file' | 'image',
          sender: senderProfile ? {
            username: senderProfile.username,
            display_name: senderProfile.display_name || senderProfile.username
          } : undefined
        };
      }) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async (content: string, conversationId: string, expiresInHours?: number) => {
    if (!user) return;

    try {
      const expiresAt = expiresInHours 
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          conversation_id: conversationId,
          sender_id: user.id,
          expires_at: expiresAt
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Błąd wysyłania wiadomości',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (conversationId && user) {
      fetchMessages(conversationId);
    }
  }, [conversationId, user]);

  return {
    messages,
    sendMessage,
    fetchMessages,
    setMessages
  };
};
