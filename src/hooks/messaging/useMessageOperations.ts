
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/types/chat';

export const useMessageOperations = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async (convId?: string) => {
    const targetConversationId = convId || conversationId;
    if (!targetConversationId || !user) return;

    try {
      setLoading(true);
      console.log('Fetching messages for conversation:', targetConversationId);

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('conversation_id', targetConversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        message_type: msg.message_type as 'text' | 'file' | 'image' | 'voice' | 'location' | 'poll' | 'sticker',
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        reply_to_id: msg.reply_to_id,
        thread_root_id: msg.thread_root_id,
        is_edited: msg.is_edited,
        is_deleted: msg.is_deleted,
        expires_at: msg.expires_at,
        sender: msg.sender ? {
          username: msg.sender.username,
          display_name: msg.sender.display_name,
          avatar_url: msg.sender.avatar_url
        } : undefined
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, convId?: string, messageType: string = 'text', replyToId?: string) => {
    const targetConversationId = convId || conversationId;
    if (!targetConversationId || !user || !content.trim()) return;

    try {
      console.log('Sending message to conversation:', targetConversationId);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: targetConversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType,
          reply_to_id: replyToId || null
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się wysłać wiadomości',
          variant: 'destructive'
        });
        return;
      }

      console.log('Message sent successfully:', data);

      // Dodaj wiadomość do lokalnego stanu
      const newMessage: Message = {
        id: data.id,
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        content: data.content,
        message_type: data.message_type as 'text' | 'file' | 'image' | 'voice' | 'location' | 'poll' | 'sticker',
        created_at: data.created_at,
        updated_at: data.updated_at,
        reply_to_id: data.reply_to_id,
        thread_root_id: data.thread_root_id,
        is_edited: data.is_edited,
        is_deleted: data.is_deleted,
        expires_at: data.expires_at,
        sender: data.sender ? {
          username: data.sender.username,
          display_name: data.sender.display_name,
          avatar_url: data.sender.avatar_url
        } : undefined
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: 'Błąd',
        description: 'Wystąpił błąd podczas wysyłania wiadomości',
        variant: 'destructive'
      });
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user || !newContent.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent.trim(),
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('Error editing message:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się edytować wiadomości',
          variant: 'destructive'
        });
        return;
      }

      // Zaktualizuj lokalny stan
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent.trim(), is_edited: true, updated_at: new Date().toISOString() }
          : msg
      ));

      toast({
        title: 'Wiadomość edytowana',
        description: 'Wiadomość została pomyślnie edytowana'
      });
    } catch (error) {
      console.error('Error in editMessage:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          content: 'Wiadomość została usunięta',
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('Error deleting message:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się usunąć wiadomości',
          variant: 'destructive'
        });
        return;
      }

      // Zaktualizuj lokalny stan
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_deleted: true, content: 'Wiadomość została usunięta', updated_at: new Date().toISOString() }
          : msg
      ));

      toast({
        title: 'Wiadomość usunięta',
        description: 'Wiadomość została pomyślnie usunięta'
      });
    } catch (error) {
      console.error('Error in deleteMessage:', error);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    fetchMessages,
    setMessages
  };
};
