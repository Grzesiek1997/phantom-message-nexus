
import { useState, useEffect, useCallback } from 'react';
import { useRealtimeHub } from './useRealtimeHub';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AppNotification {
  id: string;
  user_id: string;
  type: 'message' | 'friend_request' | 'call' | 'system';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Real-time notification management system
 * Handles push notifications, in-app alerts, and notification history
 */
export const useNotificationStream = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const { user } = useAuth();
  const { subscribe, broadcast } = useRealtimeHub();
  const { toast } = useToast();

  /**
   * Handles incoming real-time notifications
   */
  const handleNotificationReceived = useCallback((payload: any) => {
    const notification = payload.new as AppNotification;
    
    // Only process notifications for current user
    if (notification.user_id === user?.id) {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast for high priority notifications
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'call' ? 'default' : 'default'
        });
      }
      
      // Request browser notification permission and show notification
      if (isEnabled && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          showBrowserNotification(notification);
        } else if (Notification.permission !== 'denied') {
          requestNotificationPermission();
        }
      }
    }
  }, [user?.id, isEnabled, toast]);

  /**
   * Shows native browser notification
   */
  const showBrowserNotification = useCallback((notification: AppNotification) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const options: NotificationOptions = {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: notification.priority === 'low'
    };

    const browserNotification = new Notification(notification.title, options);
    
    browserNotification.onclick = () => {
      window.focus();
      markAsRead(notification.id);
      browserNotification.close();
      
      // Handle notification click based on type
      handleNotificationClick(notification);
    };

    // Auto-close after 5 seconds for non-urgent notifications
    if (notification.priority !== 'urgent') {
      setTimeout(() => browserNotification.close(), 5000);
    }
  }, []);

  /**
   * Handles notification click actions
   */
  const handleNotificationClick = useCallback((notification: AppNotification) => {
    switch (notification.type) {
      case 'message':
        // Navigate to conversation
        if (notification.data?.conversation_id) {
          // TODO: Navigate to conversation
          console.log('Navigate to conversation:', notification.data.conversation_id);
        }
        break;
      case 'friend_request':
        // Navigate to contacts/requests
        console.log('Navigate to friend requests');
        break;
      case 'call':
        // Handle incoming call
        if (notification.data?.call_id) {
          console.log('Handle call:', notification.data.call_id);
        }
        break;
    }
  }, []);

  /**
   * Requests browser notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  /**
   * Marks a notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, is_read: true }
        : notification
    ));
    
    setUnreadCount(prev => Math.max(0, prev - 1));

    // TODO: Update database
  }, []);

  /**
   * Marks all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(notification => ({ 
      ...notification, 
      is_read: true 
    })));
    
    setUnreadCount(0);

    // TODO: Update database
  }, []);

  /**
   * Sends a notification to specific users
   */
  const sendNotification = useCallback(async (
    userIds: string[], 
    notification: Omit<AppNotification, 'id' | 'user_id' | 'created_at' | 'is_read'>
  ) => {
    userIds.forEach(userId => {
      broadcast('notifications', 'new_notification', {
        ...notification,
        user_id: userId,
        id: `notif-${Date.now()}-${userId}`,
        created_at: new Date().toISOString(),
        is_read: false
      });
    });
  }, [broadcast]);

  /**
   * Clears old notifications (keep last 50)
   */
  const clearOldNotifications = useCallback(() => {
    setNotifications(prev => prev.slice(0, 50));
  }, []);

  /**
   * Toggles notification system on/off
   */
  const toggleNotifications = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (enabled) {
      requestNotificationPermission();
    }
  }, [requestNotificationPermission]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribe('notifications', 'notifications', handleNotificationReceived);

    return unsubscribe;
  }, [user, subscribe, handleNotificationReceived]);

  // Request permission on mount
  useEffect(() => {
    if (isEnabled) {
      requestNotificationPermission();
    }
  }, [isEnabled, requestNotificationPermission]);

  // Clear old notifications periodically
  useEffect(() => {
    const interval = setInterval(clearOldNotifications, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [clearOldNotifications]);

  return {
    notifications,
    unreadCount,
    isEnabled,
    markAsRead,
    markAllAsRead,
    sendNotification,
    toggleNotifications,
    requestPermission: requestNotificationPermission,
    hasPermission: 'Notification' in window && Notification.permission === 'granted'
  };
};
