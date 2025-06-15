
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
      // Use the existing message_reactions table if it exists, otherwise simulate
      const { data, error } = await supabase
        .from('message_reactions' as any)
        .select('*')
        .in('message_id', messageIds);

      if (data && !error) {
        const reactionsByMessage: Record<string, MessageReaction[]> = {};
        data.forEach((reaction: any) => {
          if (!reactionsByMessage[reaction.message_id]) {
            reactionsByMessage[reaction.message_id] = [];
          }
          reactionsByMessage[reaction.message_id].push(reaction);
        });
        setReactions(reactionsByMessage);
      }
    } catch (error) {
      console.log('Message reactions table not yet available, using local state');
      // For now, we'll use local state until the table is properly available
    }
  };

  const addReaction = async (messageId: string, reactionType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions' as any)
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (error) {
        // Fallback to local state
        const newReaction: MessageReaction = {
          id: `temp-${Date.now()}`,
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        };
        
        setReactions(prev => ({
          ...prev,
          [messageId]: [...(prev[messageId] || []), newReaction]
        }));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (messageId: string, reactionType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions' as any)
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (error) {
        // Fallback to local state
        setReactions(prev => ({
          ...prev,
          [messageId]: (prev[messageId] || []).filter(r => 
            !(r.user_id === user.id && r.reaction_type === reactionType)
          )
        }));
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

  return {
    reactions,
    addReaction,
    removeReaction,
    toggleReaction
  };
};
