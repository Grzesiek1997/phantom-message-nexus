
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useDisappearingMessages } from './useDisappearingMessages';
import { useSecurityMonitoring } from './useSecurityMonitoring';

export interface EnhancedMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  content_encrypted?: string;
  content_hash?: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'voice_note' | 'file' | 'location' | 'contact' | 'sticker' | 'gif' | 'system' | 'call_log' | 'disappearing_notice';
  reply_to_id?: string;
  thread_root_id?: string;
  expires_at?: string;
  auto_delete_after?: number;
  is_edited: boolean;
  edit_history: any[];
  is_deleted: boolean;
  deleted_for_users?: string[];
  server_timestamp: string;
  created_at: string;
  updated_at: string;
  sender?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  reply_to_message?: EnhancedMessage;
  attachments?: any[];
  delivery_status?: 'sent' | 'delivered' | 'read' | 'failed';
}

export const useEnhancedMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { scheduleMessageDeletion } = useDisappearingMessages();
  const { logSecurityEvent } = useSecurityMonitoring();

  const fetchMessages = async () => {
    if (!conversationId || !user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, display_name, avatar_url),
          reply_to_message:messages!messages_reply_to_id_fkey(
            id, content, sender_id,
            sender:profiles!messages_sender_id_fkey(username, display_name)
          ),
          attachments:message_attachments(*)
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .not('deleted_for_users', 'cs', `{${user.id}}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter out messages with invalid sender data and transform them
      const validMessages = (data || []).filter(msg => 
        msg.sender && 
        typeof msg.sender === 'object' && 
        'username' in msg.sender
      ).map(msg => ({
        ...msg,
        delivery_status: 'delivered' as const,
        edit_history: Array.isArray(msg.edit_history) ? msg.edit_history : []
      })) as EnhancedMessage[];

      setMessages(validMessages);
    } catch (error) {
      console.error('Error fetching enhanced messages:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się załadować wiadomości',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    content: string,
    options: {
      messageType?: EnhancedMessage['message_type'];
      replyToId?: string;
      threadRootId?: string;
      autoDeleteAfter?: number;
    } = {}
  ) => {
    if (!conversationId || !user) return;

    try {
      // Simulate encryption (in real app, implement proper E2E encryption)
      const contentEncrypted = btoa(content); // Simple base64 encoding as placeholder
      const contentHash = await generateContentHash(content);

      const messageData = {
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        content_encrypted: contentEncrypted,
        content_hash: contentHash,
        message_type: options.messageType || 'text',
        reply_to_id: options.replyToId || null,
        thread_root_id: options.threadRootId || null,
        auto_delete_after: options.autoDeleteAfter || null,
        expires_at: options.autoDeleteAfter 
          ? new Date(Date.now() + options.autoDeleteAfter * 1000).toISOString()
          : null
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, display_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Schedule deletion if auto-delete is enabled
      if (options.autoDeleteAfter) {
        await scheduleMessageDeletion(data.id, options.autoDeleteAfter);
      }

      // Log security event for message sending
      await logSecurityEvent(
        'message_sent',
        'Message sent successfully',
        'low',
        { conversationId, messageType: options.messageType || 'text' }
      );

      // Ensure sender data is valid before creating enhanced message
      if (data.sender && typeof data.sender === 'object' && 'username' in data.sender) {
        const enhancedMessage = {
          ...data,
          delivery_status: 'sent' as const,
          attachments: [],
          edit_history: Array.isArray(data.edit_history) ? data.edit_history : []
        } as EnhancedMessage;

        setMessages(prev => [...prev, enhancedMessage]);
        return enhancedMessage;
      }
    } catch (error) {
      console.error('Error sending enhanced message:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać wiadomości',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!user) return;

    try {
      // Get current message for history
      const { data: currentMessage } = await supabase
        .from('messages')
        .select('content, edit_history')
        .eq('id', messageId)
        .single();

      if (!currentMessage) throw new Error('Message not found');

      const currentEditHistory = Array.isArray(currentMessage.edit_history) ? currentMessage.edit_history : [];
      const newEditHistory = [
        ...currentEditHistory,
        {
          content: currentMessage.content,
          edited_at: new Date().toISOString(),
          edited_by: user.id
        }
      ];

      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          content_encrypted: btoa(newContent),
          content_hash: await generateContentHash(newContent),
          is_edited: true,
          edit_history: newEditHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Only sender can edit

      if (error) throw error;

      await fetchMessages();
      toast({
        title: 'Sukces',
        description: 'Wiadomość została edytowana'
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

  const deleteMessage = async (messageId: string, deleteForEveryone: boolean = false) => {
    if (!user) return;

    try {
      if (deleteForEveryone) {
        // Hard delete for everyone (only sender can do this)
        const { error } = await supabase
          .from('messages')
          .update({
            is_deleted: true,
            content: '[Wiadomość usunięta]',
            content_encrypted: '[Wiadomość usunięta]'
          })
          .eq('id', messageId)
          .eq('sender_id', user.id);

        if (error) throw error;
      } else {
        // Soft delete for current user only
        const { data: currentMessage } = await supabase
          .from('messages')
          .select('deleted_for_users')
          .eq('id', messageId)
          .single();

        const deletedForUsers = Array.isArray(currentMessage?.deleted_for_users) ? currentMessage.deleted_for_users : [];
        if (!deletedForUsers.includes(user.id)) {
          deletedForUsers.push(user.id);
        }

        const { error } = await supabase
          .from('messages')
          .update({ deleted_for_users: deletedForUsers })
          .eq('id', messageId);

        if (error) throw error;
      }

      await fetchMessages();
      toast({
        title: 'Sukces',
        description: 'Wiadomość została usunięta'
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

  const markAsRead = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_delivery')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          status: 'read',
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const generateContentHash = async (content: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, user]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Fetch sender info
          const { data: senderData } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          if (senderData) {
            const enhancedMessage = {
              ...newMessage,
              sender: senderData,
              delivery_status: 'delivered' as const,
              attachments: [],
              edit_history: Array.isArray(newMessage.edit_history) ? newMessage.edit_history : []
            } as EnhancedMessage;

            setMessages(prev => [...prev, enhancedMessage]);

            // Mark as read if not sent by current user
            if (newMessage.sender_id !== user?.id) {
              await markAsRead(newMessage.id);
            }
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchMessages(); // Refresh on updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    refetch: fetchMessages
  };
};
