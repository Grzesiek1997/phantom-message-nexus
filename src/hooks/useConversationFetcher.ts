
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Conversation } from '@/types/chat';

export const useConversationFetcher = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return {
    conversations,
    loading,
    fetchConversations
  };
};
