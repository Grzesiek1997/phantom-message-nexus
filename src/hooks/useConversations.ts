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
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching conversations for user:', user.id);

      // Get conversations where user participates directly through a join
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner (
            user_id,
            role
          )
        `)
        .eq('conversation_participants.user_id', user.id)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        setLoading(false);
        return;
      }

      if (!conversationsData || conversationsData.length === 0) {
        console.log('No conversations found for user');
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = conversationsData.map(conv => conv.id);

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

      // Get last messages for conversations
      const { data: lastMessages, error: lastMessagesError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (lastMessagesError) {
        console.error('Error fetching last messages:', lastMessagesError);
      }

      // Combine the data
      const formattedConversations: Conversation[] = conversationsData.map(conv => {
        const participants = allParticipants
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
          }) || [];

        const lastMessage = lastMessages?.find(msg => msg.conversation_id === conv.id);

        return {
          id: conv.id,
          type: conv.type as 'direct' | 'group',
          name: conv.name,
          created_by: conv.created_by,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          participants,
          last_message: lastMessage ? {
            ...lastMessage,
            message_type: lastMessage.message_type as 'text' | 'file' | 'image'
          } : undefined
        };
      });

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
      throw new Error('User not authenticated');
    }

    try {
      console.log('Creating conversation with participants:', participantIds, 'type:', type);

      // Sprawdź czy użytkownicy są znajomymi (tylko dla direct chat)
      if (type === 'direct' && participantIds.length === 1) {
        const otherUserId = participantIds[0];
        
        console.log('Checking friendship status with:', otherUserId);
        
        // Sprawdź bezpośrednio w tabeli contacts
        const { data: friendship1, error: error1 } = await supabase
          .from('contacts')
          .select('status')
          .eq('user_id', user.id)
          .eq('contact_user_id', otherUserId)
          .eq('status', 'accepted')
          .maybeSingle();

        const { data: friendship2, error: error2 } = await supabase
          .from('contacts')
          .select('status')
          .eq('user_id', otherUserId)
          .eq('contact_user_id', user.id)
          .eq('status', 'accepted')
          .maybeSingle();

        if (error1 || error2) {
          console.error('Error checking friendship:', error1 || error2);
          throw new Error('Nie można sprawdzić statusu znajomości');
        }

        if (!friendship1 || !friendship2) {
          console.log('Users are not friends');
          throw new Error('Nie możesz rozpocząć czatu z osobą, która nie jest Twoim znajomym');
        }

        console.log('Users are friends, checking for existing conversation');
        
        // Sprawdź czy istnieje już konwersacja bezpośrednia
        const { data: existingConversations, error: checkError } = await supabase
          .from('conversations')
          .select(`
            id,
            conversation_participants!inner (user_id)
          `)
          .eq('type', 'direct');

        if (checkError) {
          console.error('Error checking existing conversations:', checkError);
        } else if (existingConversations) {
          // Znajdź konwersację z dokładnie tymi dwoma użytkownikami
          for (const conv of existingConversations) {
            const participantUserIds = conv.conversation_participants?.map(p => p.user_id) || [];
            if (participantUserIds.length === 2 && 
                participantUserIds.includes(user.id) && 
                participantUserIds.includes(otherUserId)) {
              console.log('Direct conversation already exists:', conv.id);
              await fetchConversations();
              return conv.id;
            }
          }
        }
      }

      // Utwórz nową konwersację
      console.log('Creating new conversation...');
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          type,
          name,
          created_by: user.id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw new Error(`Nie udało się utworzyć konwersacji: ${error.message}`);
      }

      console.log('Conversation created:', conversation);

      // Dodaj uczestników (łącznie z obecnym użytkownikiem)
      const participants = [user.id, ...participantIds].map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member'
      }));

      console.log('Adding participants:', participants);

      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantError) {
        console.error('Error adding participants:', participantError);
        
        // Spróbuj usunąć konwersację jeśli nie udało się dodać uczestników
        await supabase.from('conversations').delete().eq('id', conversation.id);
        
        throw new Error(`Nie udało się dodać uczestników: ${participantError.message}`);
      }

      console.log('Participants added successfully');
      
      // Odśwież listę konwersacji
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
    } else {
      setConversations([]);
      setLoading(false);
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
