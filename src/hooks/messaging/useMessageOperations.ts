
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

      // Pobierz wiadomości
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', targetConversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // Pobierz profile nadawców
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', senderIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      const formattedMessages: Message[] = messagesData.map(msg => {
        const senderProfile = profiles?.find(p => p.id === msg.sender_id);
        return {
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender_id: msg.sender_id,
          content: msg.content,
          message_type: 'text' as 'text' | 'file' | 'image' | 'voice' | 'location' | 'poll' | 'sticker',
          created_at: msg.sent_at,
          updated_at: msg.sent_at,
          reply_to_id: null,
          thread_root_id: null,
          is_edited: false,
          is_deleted: false,
          expires_at: null,
          sender: senderProfile ? {
            username: senderProfile.username,
            display_name: senderProfile.display_name,
            avatar_url: senderProfile.avatar_url
          } : undefined
        };
      });

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
          metadata: { type: messageType, reply_to_id: replyToId }
        })
        .select()
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

      // Pobierz profil nadawcy
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('username, display_name, avatar_url')
        .eq('id', user.id)
        .single();

      // Dodaj wiadomość do lokalnego stanu
      const newMessage: Message = {
        id: data.id,
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        content: data.content,
        message_type: 'text' as 'text' | 'file' | 'image' | 'voice' | 'location' | 'poll' | 'sticker',
        created_at: data.sent_at,
        updated_at: data.sent_at,
        reply_to_id: null,
        thread_root_id: null,
        is_edited: false,
        is_deleted: false,
        expires_at: null,
        sender: senderProfile ? {
          username: senderProfile.username,
          display_name: senderProfile.display_name,
          avatar_url: senderProfile.avatar_url
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
          metadata: { ...{}, is_edited: true }
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
          ? { ...msg, content: newContent.trim(), is_edited: true }
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
          content: 'Wiadomość została usunięta',
          metadata: { ...{}, is_deleted: true }
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
          ? { ...msg, is_deleted: true, content: 'Wiadomość została usunięta' }
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
