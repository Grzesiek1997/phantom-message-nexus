
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

      const formattedMessages: Message[] = messagesData.map(msg => {
        const senderProfile = senderProfiles?.find(p => p.id === msg.sender_id);
        return {
          ...msg,
          message_type: msg.message_type as 'text' | 'file' | 'image' | 'voice' | 'location' | 'poll' | 'sticker',
          edit_history: Array.isArray(msg.edit_history) ? msg.edit_history : [],
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

  const sendMessage = async (content: string, conversationId: string, expiresInHours?: number) => {
    if (!user) {
      toast({
        title: 'Błąd',
        description: 'Musisz być zalogowany aby wysłać wiadomość',
        variant: 'destructive'
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Błąd',
        description: 'Wiadomość nie może być pusta',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Sending message:', { content, conversationId, userId: user.id });

      const expiresAt = expiresInHours 
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          conversation_id: conversationId,
          sender_id: user.id,
          expires_at: expiresAt,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Błąd wysyłania wiadomości',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      console.log('Message sent successfully:', data);
      
      // Optionally add the message to local state immediately for better UX
      // The realtime subscription will also add it, but this provides instant feedback
      if (data) {
        const newMessage: Message = {
          ...data,
          message_type: data.message_type as 'text' | 'file' | 'image' | 'voice' | 'location' | 'poll' | 'sticker',
          edit_history: [],
          sender: {
            username: user.user_metadata?.username || 'You',
            display_name: user.user_metadata?.display_name || user.user_metadata?.username || 'You'
          }
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
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
    sendMessage,
    fetchMessages,
    setMessages
  };
};
