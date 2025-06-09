
import { useConversations } from './useConversations';
import { useMessageOperations } from './useMessageOperations';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';

export const useMessages = (conversationId?: string) => {
  const { conversations, loading, createConversation, fetchConversations } = useConversations();
  const { messages, sendMessage, fetchMessages, setMessages } = useMessageOperations(conversationId);
  
  useRealtimeSubscriptions(conversationId, setMessages, fetchConversations);

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

// Re-export types for backward compatibility
export type { Message, Conversation } from '@/types/chat';
