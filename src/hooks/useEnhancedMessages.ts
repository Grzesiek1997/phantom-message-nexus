import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface MessageAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  duration?: number;
  dimensions?: { width: number; height: number };
  thumbnail_url?: string;
}

export interface EnhancedMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  content_encrypted?: string;
  message_type: string;
  reply_to_id?: string;
  thread_root_id?: string;
  is_edited: boolean;
  edit_history: any[];
  is_deleted: boolean;
  deleted_for_users: string[];
  expires_at?: string;
  auto_delete_after?: number;
  created_at: string;
  updated_at: string;
  server_timestamp: string;
  delivery_status: 'sent' | 'delivered' | 'read' | 'failed';
  sender: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  attachments: MessageAttachment[];
  reactions: any[];
  read_by: string[];
}

export const useEnhancedMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = useCallback(async (convId?: string, limit = 50, offset = 0) => {
    if (!user || !convId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, display_name, avatar_url),
          attachments:message_attachments(*),
          reactions:message_reactions(*)
        `)
        .eq('conversation_id', convId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const processedMessages = (data || []).map(msg => {
        const attachments = (msg.attachments || []).map((att: any) => ({
          id: att.id,
          file_name: att.file_name,
          file_url: att.file_url,
          file_type: att.file_type,
          file_size: att.file_size || 0,
          duration: att.duration || undefined,
          dimensions: att.dimensions && typeof att.dimensions === 'object' && !Array.isArray(att.dimensions)
            ? att.dimensions as { width: number; height: number }
            : undefined,
          thumbnail_url: att.thumbnail_path || undefined
        }));

        return {
          ...msg,
          delivery_status: 'delivered' as const,
          sender: msg.sender && typeof msg.sender === 'object' && !Array.isArray(msg.sender)
            ? msg.sender as EnhancedMessage['sender']
            : { username: 'Unknown', display_name: 'Unknown User', avatar_url: '' },
          attachments,
          reactions: msg.reactions || [],
          read_by: [],
          edit_history: Array.isArray(msg.edit_history) ? msg.edit_history : []
        };
      }) as EnhancedMessage[];

      if (offset === 0) {
        setMessages(processedMessages);
      } else {
        setMessages(prev => [...prev, ...processedMessages]);
      }
    } catch (error) {
      console.error('Error fetching enhanced messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const sendMessage = async (
    content: string,
    options: {
      replyToId?: string;
      autoDeleteAfter?: number;
    } = {}
  ) => {
    if (!user || !conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: 'text',
          reply_to_id: options.replyToId,
          auto_delete_after: options.autoDeleteAfter,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      const enhancedMessage: EnhancedMessage = {
        ...data,
        delivery_status: 'sent',
        sender: data.sender && typeof data.sender === 'object' && !Array.isArray(data.sender)
          ? data.sender as EnhancedMessage['sender']
          : { username: user.email || 'Unknown', display_name: 'Unknown User', avatar_url: '' },
        attachments: [],
        reactions: [],
        read_by: [],
        edit_history: []
      };

      setMessages(prev => [enhancedMessage, ...prev]);
      return enhancedMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać wiadomości',
        variant: 'destructive'
      });
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user) return;

    try {
      const currentMessage = messages.find(m => m.id === messageId);
      if (!currentMessage) return;

      const editHistory = Array.isArray(currentMessage.edit_history) 
        ? [...currentMessage.edit_history, { content: currentMessage.content, edited_at: new Date().toISOString() }]
        : [{ content: currentMessage.content, edited_at: new Date().toISOString() }];

      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          is_edited: true,
          edit_history: editHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, is_edited: true, edit_history: editHistory }
          : msg
      ));

      toast({
        title: 'Sukces',
        description: 'Wiadomość została zaktualizowana'
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się edytować wiadomości',
        variant: 'destructive'
      });
    }
  };

  const deleteMessage = async (messageId: string, deleteForEveryone = false) => {
    if (!user) return;

    try {
      if (deleteForEveryone) {
        const { error } = await supabase
          .from('messages')
          .update({ is_deleted: true })
          .eq('id', messageId)
          .eq('sender_id', user.id);

        if (error) throw error;
      } else {
        const currentMessage = messages.find(m => m.id === messageId);
        if (!currentMessage) return;

        const deletedForUsers = [...(currentMessage.deleted_for_users || []), user.id];

        const { error } = await supabase
          .from('messages')
          .update({ deleted_for_users: deletedForUsers })
          .eq('id', messageId);

        if (error) throw error;
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      toast({
        title: 'Sukces',
        description: deleteForEveryone ? 'Wiadomość została usunięta dla wszystkich' : 'Wiadomość została usunięta'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć wiadomości',
        variant: 'destructive'
      });
    }
  };

  const addReaction = async (messageId: string, reactionType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (error) throw error;

      toast({
        title: 'Sukces',
        description: 'Reakcja została dodana'
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_read_status')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          read_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    markAsRead
  };
};
