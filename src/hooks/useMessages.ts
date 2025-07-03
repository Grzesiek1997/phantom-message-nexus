
// Simplified messages without complex conversations hook
import { useMessageOperations } from './messaging/useMessageOperations';
import { useRealtimeSubscriptions } from './messaging/useRealtimeSubscriptions';

export const useMessages = (conversationId?: string) => {
  // Simplified without conversations hook
  const conversations: any[] = [];
  const createConversation = async () => {};
  const fetchConversations = async () => {};
  
  const { messages, sendMessage, editMessage, deleteMessage, fetchMessages, setMessages } = useMessageOperations(conversationId);
  
  // Simplified realtime without parameters

  const createConversationWithErrorHandling = async (participantIds: string[], type: 'direct' | 'group' = 'direct', name?: string) => {
    try {
      console.log('Creating conversation with error handling for participants:', participantIds);
      const result = await createConversation();
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
    loading: false,
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
