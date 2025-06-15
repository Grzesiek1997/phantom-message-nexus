
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TypingIndicator {
  id: string;
  user_id: string;
  conversation_id: string;
  is_typing: boolean;
  updated_at: string;
}

export const useTypingIndicator = (conversationId?: string) => {
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingIndicator>>({});
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();

  const startTyping = useCallback(async () => {
    if (!user || !conversationId || isTyping) return;

    try {
      const { error } = await supabase
        .from('typing_indicators' as any)
        .upsert({
          user_id: user.id,
          conversation_id: conversationId,
          is_typing: true,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        setIsTyping(true);
      }
    } catch (error) {
      console.error('Error starting typing:', error);
    }
  }, [user, conversationId, isTyping]);

  const stopTyping = useCallback(async () => {
    if (!user || !conversationId || !isTyping) return;

    try {
      const { error } = await supabase
        .from('typing_indicators' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId);

      if (!error) {
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error stopping typing:', error);
    }
  }, [user, conversationId, isTyping]);

  const fetchTypingUsers = useCallback(async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('typing_indicators' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_typing', true);

      if (data && !error) {
        const typingMap: Record<string, TypingIndicator> = {};
        data.forEach((indicator: any) => {
          if (indicator.user_id !== user?.id) { // Exclude current user
            typingMap[indicator.user_id] = indicator;
          }
        });
        setTypingUsers(typingMap);
      }
    } catch (error) {
      console.error('Error fetching typing users:', error);
    }
  }, [conversationId, user?.id]);

  // Real-time subscription for typing indicators
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchTypingUsers();
        }
      )
      .subscribe();

    // Initial fetch
    fetchTypingUsers();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchTypingUsers]);

  // Auto-cleanup typing when component unmounts
  useEffect(() => {
    return () => {
      if (isTyping) {
        stopTyping();
      }
    };
  }, [isTyping, stopTyping]);

  return {
    typingUsers,
    isTyping,
    startTyping,
    stopTyping
  };
};
