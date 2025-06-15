
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: string;
  custom_emoji_url?: string;
  created_at: string;
}

export const useMessageReactions = (messageIds: string[]) => {
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReactions = async () => {
    if (messageIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      if (data && !error) {
        const reactionsByMessage: Record<string, MessageReaction[]> = {};
        data.forEach(reaction => {
          if (!reactionsByMessage[reaction.message_id]) {
            reactionsByMessage[reaction.message_id] = [];
          }
          reactionsByMessage[reaction.message_id].push(reaction);
        });
        setReactions(reactionsByMessage);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const addReaction = async (messageId: string, reactionType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (error) {
        toast({
          title: 'Błąd',
          description: 'Nie udało się dodać reakcji',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (messageId: string, reactionType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (error) {
        toast({
          title: 'Błąd',
          description: 'Nie udało się usunąć reakcji',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const toggleReaction = async (messageId: string, reactionType: string) => {
    if (!user) return;

    const messageReactions = reactions[messageId] || [];
    const userReaction = messageReactions.find(r => r.user_id === user.id && r.reaction_type === reactionType);

    if (userReaction) {
      await removeReaction(messageId, reactionType);
    } else {
      await addReaction(messageId, reactionType);
    }
  };

  useEffect(() => {
    if (messageIds.length > 0) {
      fetchReactions();
    }
  }, [messageIds]);

  // Real-time subscription for reaction updates
  useEffect(() => {
    if (messageIds.length === 0) return;

    const channel = supabase
      .channel('message-reactions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=in.(${messageIds.join(',')})`
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageIds]);

  return {
    reactions,
    addReaction,
    removeReaction,
    toggleReaction
  };
};
