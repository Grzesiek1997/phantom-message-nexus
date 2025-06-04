
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  message_type: 'text' | 'file' | 'image';
  expires_at: string | null;
  created_at: string;
  sender?: {
    username: string;
    display_name: string;
  };
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: Array<{
    user_id: string;
    role: string;
    profiles: {
      username: string;
      display_name: string;
    };
  }>;
  last_message?: Message;
}

export const useMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations (
          id,
          type,
          name,
          created_by,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    // Get detailed conversation data with participants
    const conversationIds = data.map(item => item.conversation_id);
    
    if (conversationIds.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const { data: detailedConversations, error: detailError } = await supabase
      .from('conversations')
      .select(`
        id,
        type,
        name,
        created_by,
        created_at,
        updated_at,
        conversation_participants (
          user_id,
          role,
          profiles (
            username,
            display_name
          )
        )
      `)
      .in('id', conversationIds);

    if (detailError) {
      console.error('Error fetching detailed conversations:', detailError);
      return;
    }

    setConversations(detailedConversations || []);
    setLoading(false);
  };

  // Fetch messages for a conversation
  const fetchMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        conversation_id,
        message_type,
        expires_at,
        created_at,
        profiles (
          username,
          display_name
        )
      `)
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    const formattedMessages = data.map(msg => ({
      ...msg,
      sender: msg.profiles
    }));

    setMessages(formattedMessages);
  };

  // Send a message
  const sendMessage = async (content: string, conversationId: string, expiresInHours?: number) => {
    if (!user) return;

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
      toast({
        title: 'Błąd wysyłania wiadomości',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Create a new conversation
  const createConversation = async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    if (!user) return;

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        type,
        name,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Błąd tworzenia konwersacji',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }

    // Add participants
    const participants = [user.id, ...participantIds].map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      role: userId === user.id ? 'admin' : 'member'
    }));

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (participantError) {
      toast({
        title: 'Błąd dodawania uczestników',
        description: participantError.message,
        variant: 'destructive'
      });
      throw participantError;
    }

    await fetchConversations();
    return conversation.id;
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          if (conversationId && newMessage.conversation_id === conversationId) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    const conversationsSubscription = supabase
      .channel('conversations')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user, conversationId]);

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    createConversation,
    fetchConversations,
    fetchMessages
  };
};
