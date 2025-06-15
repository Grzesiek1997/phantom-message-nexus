
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  created_at: string;
  is_active: boolean;
}

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast({
        title: 'Błąd',
        description: 'Twoja przeglądarka nie obsługuje powiadomień',
        variant: 'destructive'
      });
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast({
        title: 'Sukces',
        description: 'Powiadomienia zostały włączone'
      });
      return true;
    } else {
      toast({
        title: 'Informacja',
        description: 'Powiadomienia zostały odrzucone',
        variant: 'destructive'
      });
      return false;
    }
  };

  const subscribeToPush = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push messaging is not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      
      // You would need to get this from your server/environment
      const vapidKey = 'your-vapid-public-key'; // This should be configured in your environment
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      const subscriptionObject = subscription.toJSON();

      const { error } = await supabase
        .from('push_subscriptions' as any)
        .upsert({
          user_id: user.id,
          endpoint: subscriptionObject.endpoint,
          p256dh_key: subscriptionObject.keys?.p256dh || '',
          auth_key: subscriptionObject.keys?.auth || '',
          is_active: true
        });

      if (error) {
        throw error;
      }

      setIsSubscribed(true);
      
      toast({
        title: 'Sukces',
        description: 'Zostałeś zapisany do powiadomień push'
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zapisać do powiadomień',
        variant: 'destructive'
      });
      return false;
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      const { error } = await supabase
        .from('push_subscriptions' as any)
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setIsSubscribed(false);
      
      toast({
        title: 'Informacja',
        description: 'Zostałeś wypisany z powiadomień push'
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wypisać z powiadomień',
        variant: 'destructive'
      });
      return false;
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test powiadomienia', {
        body: 'To jest testowe powiadomienie z komunikatora',
        icon: '/favicon.ico'
      });
    }
  };

  return {
    isSubscribed,
    permission,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  };
};
