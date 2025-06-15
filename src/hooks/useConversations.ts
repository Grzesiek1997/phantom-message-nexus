
import { useConversationFetcher } from './useConversationFetcher';
import { useConversationOperations } from './useConversationOperations';

export const useConversations = () => {
  const { conversations, loading, fetchConversations } = useConversationFetcher();
  const { createConversation } = useConversationOperations();

  return {
    conversations,
    loading,
    createConversation,
    fetchConversations
  };
};
