
import { useConversations } from './useConversations';
import { useMessageOperations } from './messaging/useMessageOperations';
import { useRealtimeSubscriptions } from './messaging/useRealtimeSubscriptions';

export const useMessages = (conversationId?: string) => {
  const { conversations, loading, createConversation, fetchConversations } = useConversations();
  const { messages, sendMessage, editMessage, deleteMessage, fetchMessages, setMessages } = useMessageOperations(conversationId);
  
  useRealtimeSubscriptions(conversationId, setMessages, fetchConversations);

  const createConversationWithErrorHandling = async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    try {
      console.log('Creating conversation with error handling for participants:', participantIds);
      const result = await createConversation(participantIds, type, name);
      console.log('Conversation created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error in createConversationWithErrorHandling:', error);
      throw error;
    }
  };

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    createConversation: createConversationWithErrorHandling,
    fetchConversations,
    fetchMessages
  };
};

// Re-export types for backward compatibility
export type { Message, Conversation } from '@/types/chat';
