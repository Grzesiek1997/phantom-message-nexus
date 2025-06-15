
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Conversation } from '@/types/chat';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
        console.log('No conversations found for user');
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
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać listy konwersacji',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    if (!user) {
      console.error('No user found when creating conversation');
      return;
    }

    try {
      console.log('Creating conversation with participants:', participantIds, 'type:', type);

      // For direct conversations, check if one already exists
      if (type === 'direct' && participantIds.length === 1) {
        const otherUserId = participantIds[0];
        
        // Check if direct conversation already exists
        const { data: existingParticipants, error: checkError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, conversations!inner(type)')
          .in('user_id', [user.id, otherUserId]);

        if (checkError) {
          console.error('Error checking existing conversations:', checkError);
        } else if (existingParticipants) {
          // Find conversations that have both users and are direct
          const conversationCounts = existingParticipants.reduce((acc, p) => {
            if (p.conversations?.type === 'direct') {
              acc[p.conversation_id] = (acc[p.conversation_id] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);

          const existingConversationId = Object.keys(conversationCounts).find(
            id => conversationCounts[id] === 2
          );

          if (existingConversationId) {
            console.log('Direct conversation already exists:', existingConversationId);
            await fetchConversations();
            return existingConversationId;
          }
        }
      }

      // Create new conversation
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

      // Add participants (including current user)
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
        
        // If constraint violation (conversation already exists), just return the existing one
        if (participantError.code === '23505') {
          console.log('Conversation participants already exist, fetching conversations...');
          await fetchConversations();
          return conversation.id;
        }
        
        toast({
          title: 'Błąd dodawania uczestników',
          description: participantError.message,
          variant: 'destructive'
        });
        throw participantError;
      }

      console.log('Participants added successfully');
      
      // Refresh conversations list
      await fetchConversations();
      
      return conversation.id;
    } catch (error) {
      console.error('Error in createConversation:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć konwersacji',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Real-time subscriptions for conversations
  useEffect(() => {
    if (!user) return;

    const conversationsChannel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log('Conversations updated, refreshing...');
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants'
        },
        () => {
          console.log('Conversation participants updated, refreshing...');
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [user]);

  return {
    conversations,
    loading,
    createConversation,
    fetchConversations
  };
};
