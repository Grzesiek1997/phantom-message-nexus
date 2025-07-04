import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMessageOperations } from './messaging/useMessageOperations';
import type { Message, Conversation } from '@/types/chat';

export const useMessages = (conversationId?: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { messages, sendMessage, editMessage, deleteMessage, fetchMessages, setMessages } = useMessageOperations(conversationId);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching conversations for user:', user.id);

      // Pobierz konwersacje użytkownika
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner(*)
        `)
        .eq('user_id', user.id);

      if (participantsError) {
        console.error('Error fetching conversations:', participantsError);
        return;
      }

      if (!participantsData || participantsData.length === 0) {
        setConversations([]);
        return;
      }

      // Format conversations data
      const formattedConversations: Conversation[] = participantsData.map(item => ({
        id: item.conversation_id,
        type: (item.conversations as any).is_group ? 'group' : 'direct',
        name: (item.conversations as any).name || 'Direct Chat',
        created_by: (item.conversations as any).creator_id,
        created_at: (item.conversations as any).created_at,
        updated_at: (item.conversations as any).created_at,
        message_count: (item.conversations as any).message_count || 0
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string): Promise<string | undefined> => {
    if (!user) {
      toast({
        title: 'Błąd uwierzytelniania',
        description: 'Musisz być zalogowany aby utworzyć konwersację',
        variant: 'destructive'
      });
      return;
    }

    if (participantIds.length === 0) {
      toast({
        title: 'Błąd',
        description: 'Musisz wybrać uczestników konwersacji',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Creating conversation with participants:', participantIds, 'type:', type);

      // Sprawdź czy istnieje już konwersacja bezpośrednia z tym użytkownikiem
      if (type === 'direct' && participantIds.length === 1) {
        const { data: existingConversation } = await supabase.rpc('get_or_create_dm_conversation', {
          other_user_id: participantIds[0]
        });

        if (existingConversation) {
          console.log('Found existing conversation:', existingConversation);
          await fetchConversations(); // Refresh conversations list
          return existingConversation.toString();
        }
      }

      // Utwórz nową konwersację
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          is_group: type === 'group',
          creator_id: user.id,
          metadata: { name: name || 'New Conversation' }
        })
        .select()
        .single();

      if (conversationError) {
        console.error('Error creating conversation:', conversationError);
        toast({
          title: 'Błąd',
          description: 'Nie udało się utworzyć konwersacji',
          variant: 'destructive'
        });
        return;
      }

      console.log('Conversation created:', conversationData);

      // Dodaj uczestników do konwersacji
      const allParticipants = [user.id, ...participantIds];
      const participantsToInsert = allParticipants.map(userId => ({
        conversation_id: conversationData.id,
        user_id: userId,
        is_admin: userId === user.id
      }));

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantsToInsert);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        toast({
          title: 'Błąd',
          description: 'Nie udało się dodać uczestników do konwersacji',
          variant: 'destructive'
        });
        return;
      }

      console.log('Participants added successfully');
      
      await fetchConversations(); // Refresh conversations list
      return conversationData.id;

    } catch (error) {
      console.error('Error in createConversation:', error);
      toast({
        title: 'Błąd',
        description: 'Wystąpił błąd podczas tworzenia konwersacji',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    createConversation,
    fetchConversations,
    fetchMessages
  };
};

// Re-export types for backward compatibility
export type { Message, Conversation } from '@/types/chat';