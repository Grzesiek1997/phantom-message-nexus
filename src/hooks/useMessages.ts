
import { useConversations } from './useConversations';
import { useMessageStream } from '@/features/messaging/hooks/useMessageStream';
import { usePresenceStream } from '@/features/messaging/hooks/usePresenceStream';

/**
 * Main messaging hook that orchestrates all messaging functionality
 * Combines conversation management, real-time messaging, and presence
 */
export const useMessages = (conversationId?: string) => {
  const { conversations, loading, createConversation, fetchConversations } = useConversations();
  const { 
    messages, 
    sendMessage: sendMessageStream, 
    isConnected,
    setMessages 
  } = useMessageStream(conversationId);
  
  const {
    presenceMap,
    typingUsers,
    setTyping,
    isUserOnline,
    updateMyStatus
  } = usePresenceStream(conversationId);

  /**
   * Enhanced message sending with presence updates
   */
  const sendMessage = async (content: string, convId?: string, messageType: string = 'text') => {
    const targetConversationId = convId || conversationId;
    if (!targetConversationId) return;

    try {
      await sendMessageStream(content, messageType);
      
      // Update presence to show activity
      updateMyStatus('online', 'messaging');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  /**
   * Creates conversation with enhanced error handling
   */
  const createConversationWithErrorHandling = async (
    participantIds: string[], 
    type: 'direct' | 'group' = 'direct', 
    name?: string
  ) => {
    try {
      console.log('Creating conversation with participants:', participantIds);
      const result = await createConversation(participantIds, type, name);
      console.log('Conversation created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  return {
    // Messages
    messages,
    sendMessage,
    setMessages,
    
    // Conversations
    conversations,
    loading,
    createConversation: createConversationWithErrorHandling,
    fetchConversations,
    
    // Presence & Real-time
    presenceMap,
    typingUsers,
    setTyping,
    isUserOnline,
    isConnected,
    
    // Helper methods
    getOnlineUsers: () => Array.from(presenceMap.values()).filter(p => p.status === 'online'),
    getConversationPresence: (convId: string) => {
      const conversation = conversations.find(c => c.id === convId);
      if (!conversation) return [];
      
      return conversation.participants?.map(p => ({
        user_id: p.user_id,
        presence: presenceMap.get(p.user_id),
        isOnline: isUserOnline(p.user_id)
      })) || [];
    }
  };
};

// Re-export types for backward compatibility
export type { Message, Conversation } from '@/types/chat';
