
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TypingIndicatorProps {
  conversationId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ conversationId }) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to typing indicators
    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch current typing users
          const { data } = await supabase
            .from('typing_indicators')
            .select(`
              user_id,
              profiles!typing_indicators_user_id_fkey(display_name, username)
            `)
            .eq('conversation_id', conversationId)
            .eq('is_typing', true)
            .neq('user_id', user?.id || '');

          if (data) {
            const usernames = data.map(item => 
              (item.profiles as any)?.display_name || (item.profiles as any)?.username || 'Unknown'
            );
            setTypingUsers(usernames);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-gray-400">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm">
        {typingUsers.length === 1 
          ? `${typingUsers[0]} pisze...`
          : `${typingUsers.slice(0, 2).join(', ')}${typingUsers.length > 2 ? ' i inni' : ''} piszą...`
        }
      </span>
    </div>
  );
};

export default TypingIndicator;
