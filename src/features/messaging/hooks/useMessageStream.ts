
import { useState, useEffect, useCallback } from 'react';
import { useRealtimeHub } from './useRealtimeHub';
import { useAuth } from '@/hooks/useAuth';
import type { Message } from '@/types/chat';

/**
 * Specialized hook for real-time message streaming
 * Handles message subscriptions, optimistic updates, and message queuing
 */
export const useMessageStream = (conversationId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { subscribe, broadcast } = useRealtimeHub();

  /**
   * Handles incoming real-time messages
   * Filters messages by conversation and applies optimistic updates
   */
  const handleMessageReceived = useCallback((payload: any) => {
    const newMessage = payload.new as Message;
    
    // Only process messages for current conversation
    if (conversationId && newMessage.conversation_id === conversationId) {
      setMessages(prev => {
        // Prevent duplicates
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        
        return [...prev, newMessage];
      });
    }
  }, [conversationId]);

  /**
   * Handles message updates (edits, deletions)
   */
  const handleMessageUpdated = useCallback((payload: any) => {
    const updatedMessage = payload.new as Message;
    
    if (conversationId && updatedMessage.conversation_id === conversationId) {
      setMessages(prev => prev.map(msg => 
        msg.id === updatedMessage.id ? updatedMessage : msg
      ));
    }
  }, [conversationId]);

  /**
   * Handles message deletions
   */
  const handleMessageDeleted = useCallback((payload: any) => {
    const deletedMessage = payload.old as Message;
    
    if (conversationId && deletedMessage.conversation_id === conversationId) {
      setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
    }
  }, [conversationId]);

  /**
   * Sends a message with optimistic update
   * @param content - Message content
   * @param messageType - Type of message (text, image, etc.)
   */
  const sendMessage = useCallback(async (content: string, messageType: string = 'text') => {
    if (!user || !conversationId) return;

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      message_type: messageType as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_edited: false,
      is_deleted: false,
      reply_to_id: null,
      thread_root_id: null,
      expires_at: null
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send through real-time channel for instant delivery
      broadcast(`conversation-${conversationId}`, 'new_message', {
        content,
        message_type: messageType,
        sender_id: user.id
      });

      // TODO: Also save to database
    } catch (error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      console.error('Failed to send message:', error);
    }
  }, [user, conversationId, broadcast]);

  /**
   * Processes queued messages when connection is restored
   */
  const processMessageQueue = useCallback(() => {
    if (isConnected && messageQueue.length > 0) {
      messageQueue.forEach(message => {
        sendMessage(message.content, message.message_type);
      });
      setMessageQueue([]);
    }
  }, [isConnected, messageQueue, sendMessage]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up message stream for conversation:', conversationId);

    const unsubscribeInsert = subscribe(`conversation-${conversationId}`, 'messages', handleMessageReceived);
    const unsubscribeUpdate = subscribe(`conversation-${conversationId}`, 'messages', handleMessageUpdated);
    const unsubscribeDelete = subscribe(`conversation-${conversationId}`, 'messages', handleMessageDeleted);

    setIsConnected(true);

    return () => {
      unsubscribeInsert();
      unsubscribeUpdate();
      unsubscribeDelete();
      setIsConnected(false);
    };
  }, [conversationId, subscribe, handleMessageReceived, handleMessageUpdated, handleMessageDeleted]);

  // Process queue when connection is restored
  useEffect(() => {
    processMessageQueue();
  }, [processMessageQueue]);

  return {
    messages,
    sendMessage,
    isConnected,
    messageQueue: messageQueue.length,
    setMessages
  };
};
