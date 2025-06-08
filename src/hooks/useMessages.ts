
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
      console.log('Fetching conversations for user:', user.id);

      // Get conversations where user participates
      const { data: userParticipants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        setLoading(false);
        return;
      }

      if (!userParticipants || userParticipants.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = userParticipants.map(p => p.conversation_id);

      // Get conversations data
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds);

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        setLoading(false);
        return;
      }

      // Get all participants for these conversations
      const { data: allParticipants, error: allParticipantsError } = await supabase
        .from('conversation_participants')
        .select('*')
        .in('conversation_id', conversationIds);

      if (allParticipantsError) {
        console.error('Error fetching all participants:', allParticipantsError);
        setLoading(false);
        return;
      }

      // Get profiles for all participants
      const participantUserIds = allParticipants?.map(p => p.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', participantUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setLoading(false);
        return;
      }

      // Combine the data
      const formattedConversations = conversationsData?.map(conv => ({
        ...conv,
        type: conv.type as 'direct' | 'group',
        participants: allParticipants
          ?.filter(p => p.conversation_id === conv.id)
          .map(p => {
            const profile = profiles?.find(prof => prof.id === p.user_id);
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

      console.log('Formatted conversations:', formattedConversations);
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
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

  // Create a new conversation
  const createConversation = async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    if (!user) return;

    try {
      console.log('Creating conversation with participants:', participantIds);

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
        console.error('Error creating conversation:', error);
        toast({
          title: 'Błąd tworzenia konwersacji',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      console.log('Conversation created:', conversation);

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
        console.error('Error adding participants:', participantError);
        toast({
          title: 'Błąd dodawania uczestników',
          description: participantError.message,
          variant: 'destructive'
        });
        throw participantError;
      }

      console.log('Participants added successfully');
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
    if (conversationId && user) {
      fetchMessages(conversationId);
    }
  }, [conversationId, user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscriptions');

    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('New message received:', payload);
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
          console.log('Conversation updated, refetching...');
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscriptions');
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
