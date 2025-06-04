
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

    try {
      // Get conversations user participates in
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return;
      }

      if (!participantsData || participantsData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participantsData.map(p => p.conversation_id);

      // Get conversation details
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds);

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        return;
      }

      // Get all participants for these conversations
      const { data: allParticipants, error: allParticipantsError } = await supabase
        .from('conversation_participants')
        .select('*')
        .in('conversation_id', conversationIds);

      if (allParticipantsError) {
        console.error('Error fetching all participants:', allParticipantsError);
        return;
      }

      // Get profiles for all participants
      const participantUserIds = allParticipants?.map(p => p.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', participantUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Combine data
      const formattedConversations = conversationsData?.map(conv => ({
        ...conv,
        type: conv.type as 'direct' | 'group',
        participants: allParticipants
          ?.filter(p => p.conversation_id === conv.id)
          .map(p => {
            const profile = profilesData?.find(prof => prof.id === p.user_id);
            return {
              user_id: p.user_id,
              role: p.role,
              profiles: {
                username: profile?.username || 'Unknown',
                display_name: profile?.display_name || profile?.username || 'Unknown'
              }
            };
          }) || []
      })) || [];

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (convId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        return;
      }

      // Get sender profiles
      const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', senderIds);

      if (profilesError) {
        console.error('Error fetching sender profiles:', profilesError);
        return;
      }

      const formattedMessages = messagesData.map(msg => {
        const senderProfile = profilesData?.find(p => p.id === msg.sender_id);
        return {
          ...msg,
          message_type: msg.message_type as 'text' | 'file' | 'image',
          sender: senderProfile ? {
            username: senderProfile.username,
            display_name: senderProfile.display_name || senderProfile.username
          } : undefined
        };
      });

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  // Send a message
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
        toast({
          title: 'Błąd wysyłania wiadomości',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  };

  // Create a new conversation
  const createConversation = async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    if (!user) return;

    try {
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
    } catch (error) {
      console.error('Error in createConversation:', error);
      throw error;
    }
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
