import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Central hub for all real-time subscriptions and events
 * Manages connections for messages, presence, notifications, and calls
 * Provides optimized connection pooling and event distribution
 */
export const useRealtimeHub = () => {
  const { user } = useAuth();
  const channelsRef = useRef<Map<string, any>>(new Map());
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map());

  /**
   * Subscribes to a real-time channel with automatic cleanup
   * @param channelName - Unique channel identifier
   * @param eventType - Type of events to listen for
   * @param callback - Function to call when events occur
   */
  const subscribe = useCallback((channelName: string, eventType: string, callback: Function) => {
    if (!user) return () => {};

    const listenerKey = `${channelName}-${eventType}`;
    
    // Add listener to registry
    if (!listenersRef.current.has(listenerKey)) {
      listenersRef.current.set(listenerKey, new Set());
    }
    listenersRef.current.get(listenerKey)!.add(callback);

    // Create channel if it doesn't exist
    if (!channelsRef.current.has(channelName)) {
      const channel = supabase.channel(channelName);
      channelsRef.current.set(channelName, channel);
      
      // Subscribe to the channel
      channel.subscribe((status) => {
        console.log(`Channel ${channelName} status:`, status);
      });
    }

    const channel = channelsRef.current.get(channelName);
    
    // Set up event listener
    channel.on('postgres_changes', { event: '*', schema: 'public', table: eventType }, (payload: any) => {
      const listeners = listenersRef.current.get(listenerKey);
      if (listeners) {
        listeners.forEach(listener => listener(payload));
      }
    });

    // Return cleanup function
    return () => {
      const listeners = listenersRef.current.get(listenerKey);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          listenersRef.current.delete(listenerKey);
        }
      }
    };
  }, [user]);

  /**
   * Broadcasts presence information to other users
   * @param status - User presence status object
   */
  const broadcastPresence = useCallback((status: any) => {
    if (!user) return;

    const presenceChannel = channelsRef.current.get('presence') || supabase.channel('presence');
    if (!channelsRef.current.has('presence')) {
      channelsRef.current.set('presence', presenceChannel);
      presenceChannel.subscribe();
    }

    presenceChannel.track({
      user_id: user.id,
      online_at: new Date().toISOString(),
      ...status
    });
  }, [user]);

  /**
   * Sends a real-time event to a specific channel
   * @param channelName - Target channel name
   * @param eventName - Event type name
   * @param payload - Event data
   */
  const broadcast = useCallback((channelName: string, eventName: string, payload: any) => {
    const channel = channelsRef.current.get(channelName);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: eventName,
        payload
      });
    }
  }, []);

  /**
   * Cleanup all subscriptions and channels
   */
  const cleanup = useCallback(() => {
    channelsRef.current.forEach((channel, channelName) => {
      console.log(`Cleaning up channel: ${channelName}`);
      supabase.removeChannel(channel);
    });
    channelsRef.current.clear();
    listenersRef.current.clear();
  }, []);

  // Cleanup on unmount or user change
  useEffect(() => {
    return cleanup;
  }, [cleanup, user]);

  return {
    subscribe,
    broadcastPresence,
    broadcast,
    cleanup,
    isConnected: channelsRef.current.size > 0
  };
};
