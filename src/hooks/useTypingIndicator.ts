
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useTypingIndicator = (conversationId?: string) => {
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const startTyping = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      const { error } = await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error starting typing indicator:', error);
      }
    } catch (error) {
      console.error('Error in startTyping:', error);
    }
  }, [conversationId, user]);

  const stopTyping = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      const { error } = await supabase
        .from('typing_indicators')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error stopping typing indicator:', error);
      }
    } catch (error) {
      console.error('Error in stopTyping:', error);
    }
  }, [conversationId, user]);

  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to typing indicators for this conversation
    const typingChannel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new.user_id !== user?.id) {
              // Get user profile for typing indicator
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, username')
                .eq('id', payload.new.user_id)
                .single();

              setTypingUsers(prev => ({
                ...prev,
                [payload.new.user_id]: profile?.display_name || profile?.username || 'Ktoś'
              }));
            }
          } else if (payload.eventType === 'DELETE') {
            setTypingUsers(prev => {
              const newTyping = { ...prev };
              delete newTyping[payload.old.user_id];
              return newTyping;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [conversationId, user]);

  const typingUserNames = Object.values(typingUsers);

  return {
    typingUsers: typingUserNames,
    startTyping,
    stopTyping
  };
};
