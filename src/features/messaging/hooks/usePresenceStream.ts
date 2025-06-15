
import { useState, useEffect, useCallback } from 'react';
import { useRealtimeHub } from './useRealtimeHub';
import { useAuth } from '@/hooks/useAuth';

interface UserPresence {
  user_id: string;
  online_at: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  activity?: string;
  device?: string;
}

/**
 * Manages real-time user presence and status updates
 * Tracks online status, typing indicators, and activity states
 */
export const usePresenceStream = (conversationId?: string) => {
  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [myStatus, setMyStatus] = useState<UserPresence['status']>('online');
  const { user } = useAuth();
  const { subscribe, broadcastPresence, broadcast } = useRealtimeHub();

  /**
   * Updates user presence information
   */
  const handlePresenceUpdate = useCallback((payload: any) => {
    const { key, newPresences, leftPresences } = payload;
    
    setPresenceMap(prev => {
      const updated = new Map(prev);
      
      // Add new presences
      if (newPresences) {
        newPresences.forEach((presence: UserPresence) => {
          updated.set(presence.user_id, presence);
        });
      }
      
      // Remove left presences
      if (leftPresences) {
        leftPresences.forEach((presence: UserPresence) => {
          updated.delete(presence.user_id);
        });
      }
      
      return updated;
    });
  }, []);

  /**
   * Handles typing indicator updates
   */
  const handleTypingUpdate = useCallback((payload: any) => {
    const { user_id, is_typing, conversation_id: typingConversationId } = payload;
    
    // Only process typing for current conversation
    if (conversationId && typingConversationId === conversationId) {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        if (is_typing) {
          updated.add(user_id);
        } else {
          updated.delete(user_id);
        }
        return updated;
      });
      
      // Auto-remove typing indicator after 3 seconds
      if (is_typing) {
        setTimeout(() => {
          setTypingUsers(prev => {
            const updated = new Set(prev);
            updated.delete(user_id);
            return updated;
          });
        }, 3000);
      }
    }
  }, [conversationId]);

  /**
   * Updates current user's status and broadcasts to others
   * @param status - New presence status
   * @param activity - Optional activity description
   */
  const updateMyStatus = useCallback((status: UserPresence['status'], activity?: string) => {
    if (!user) return;

    const presence: UserPresence = {
      user_id: user.id,
      online_at: new Date().toISOString(),
      status,
      activity,
      device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
    };

    setMyStatus(status);
    broadcastPresence(presence);
  }, [user, broadcastPresence]);

  /**
   * Indicates that current user is typing
   * @param isTyping - Whether user is currently typing
   */
  const setTyping = useCallback((isTyping: boolean) => {
    if (!user || !conversationId) return;

    broadcast(`conversation-${conversationId}`, 'typing', {
      user_id: user.id,
      is_typing: isTyping,
      conversation_id: conversationId
    });
  }, [user, conversationId, broadcast]);

  /**
   * Gets presence status for a specific user
   * @param userId - Target user ID
   * @returns User presence information or null if not available
   */
  const getUserPresence = useCallback((userId: string): UserPresence | null => {
    return presenceMap.get(userId) || null;
  }, [presenceMap]);

  /**
   * Gets list of users currently typing
   * @returns Array of user IDs who are typing
   */
  const getTypingUsers = useCallback((): string[] => {
    return Array.from(typingUsers).filter(userId => userId !== user?.id);
  }, [typingUsers, user?.id]);

  /**
   * Checks if a user is currently online
   * @param userId - User ID to check
   * @returns Boolean indicating online status
   */
  const isUserOnline = useCallback((userId: string): boolean => {
    const presence = getUserPresence(userId);
    if (!presence) return false;
    
    const lastSeen = new Date(presence.online_at);
    const now = new Date();
    const timeDiff = now.getTime() - lastSeen.getTime();
    
    // Consider user online if last seen within 5 minutes
    return timeDiff < 5 * 60 * 1000 && presence.status !== 'offline';
  }, [getUserPresence]);

  // Set up presence subscriptions
  useEffect(() => {
    if (!user) return;

    const unsubscribePresence = subscribe('presence', 'presence', handlePresenceUpdate);
    const unsubscribeTyping = subscribe('typing', 'typing_indicators', handleTypingUpdate);

    // Set initial status
    updateMyStatus('online');

    // Update status on page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateMyStatus('away');
      } else {
        updateMyStatus('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat to maintain presence
    const heartbeat = setInterval(() => {
      if (!document.hidden) {
        updateMyStatus(myStatus);
      }
    }, 30000); // Every 30 seconds

    return () => {
      unsubscribePresence();
      unsubscribeTyping();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeat);
      updateMyStatus('offline');
    };
  }, [user, subscribe, updateMyStatus, myStatus, handlePresenceUpdate, handleTypingUpdate]);

  return {
    presenceMap,
    typingUsers: getTypingUsers(),
    myStatus,
    updateMyStatus,
    setTyping,
    getUserPresence,
    isUserOnline,
    onlineUsersCount: Array.from(presenceMap.values()).filter(p => p.status === 'online').length
  };
};
