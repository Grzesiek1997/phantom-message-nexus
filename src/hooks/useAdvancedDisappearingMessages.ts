import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface DisappearingMessageSettings {
  enabled: boolean;
  timeToLive: number; // w sekundach
  burnAfterRead: boolean;
  allowScreenshots: boolean;
  notifyOnScreenshot: boolean;
  notifyOnExpiry: boolean;
  allowForwarding: boolean;
  requireBiometricToView: boolean;
}

interface DisappearingMessage {
  id: string;
  messageId: string;
  conversationId: string;
  expiresAt: Date;
  burnAfterRead: boolean;
  viewedBy: string[];
  createdAt: Date;
}

export function useAdvancedDisappearingMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<DisappearingMessageSettings>({
    enabled: false,
    timeToLive: 86400, // 24 godziny domyślnie
    burnAfterRead: false,
    allowScreenshots: false,
    notifyOnScreenshot: true,
    notifyOnExpiry: false,
    allowForwarding: false,
    requireBiometricToView: false,
  });
  const [loading, setLoading] = useState(true);

  // Pobieranie ustawień wiadomości znikających
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('disappearing_message_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching disappearing message settings:', error);
        return;
      }

      if (data) {
        setSettings({
          enabled: data.enabled,
          timeToLive: data.time_to_live,
          burnAfterRead: data.burn_after_read,
          allowScreenshots: data.allow_screenshots,
          notifyOnScreenshot: data.notify_on_screenshot,
          notifyOnExpiry: data.notify_on_expiry,
          allowForwarding: data.allow_forwarding,
          requireBiometricToView: data.require_biometric_to_view,
        });
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Aktualizacja ustawień wiadomości znikających
  const updateSettings = useCallback(async (newSettings: Partial<DisappearingMessageSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('disappearing_message_settings')
        .upsert({
          user_id: user.id,
          enabled: newSettings.enabled !== undefined ? newSettings.enabled : settings.enabled,
          time_to_live: newSettings.timeToLive !== undefined ? newSettings.timeToLive : settings.timeToLive,
          burn_after_read: newSettings.burnAfterRead !== undefined ? newSettings.burnAfterRead : settings.burnAfterRead,
          allow_screenshots: newSettings.allowScreenshots !== undefined ? newSettings.allowScreenshots : settings.allowScreenshots,
          notify_on_screenshot: newSettings.notifyOnScreenshot !== undefined ? newSettings.notifyOnScreenshot : settings.notifyOnScreenshot,
          notify_on_expiry: newSettings.notifyOnExpiry !== undefined ? newSettings.notifyOnExpiry : settings.notifyOnExpiry,
          allow_forwarding: newSettings.allowForwarding !== undefined ? newSettings.allowForwarding : settings.allowForwarding,
          require_biometric_to_view: newSettings.requireBiometricToView !== undefined ? newSettings.requireBiometricToView : settings.requireBiometricToView,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating disappearing message settings:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się zaktualizować ustawień wiadomości znikających',
          variant: 'destructive',
        });
        return;
      }

      setSettings(prev => ({
        ...prev,
        ...newSettings,
      }));

      toast({
        title: 'Sukces',
        description: 'Ustawienia wiadomości znikających zostały zaktualizowane',
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
    }
  }, [user, settings, toast]);

  // Tworzenie wiadomości znikającej
  const createDisappearingMessage = useCallback(async (
    messageId: string,
    conversationId: string,
    customTTL?: number,
    customBurnAfterRead?: boolean
  ) => {
    if (!user || !settings.enabled) return null;

    try {
      const ttl = customTTL !== undefined ? customTTL : settings.timeToLive;
      const burnAfterRead = customBurnAfterRead !== undefined ? customBurnAfterRead : settings.burnAfterRead;
      
      // Obliczanie czasu wygaśnięcia
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + ttl);

      const { data, error } = await supabase
        .from('disappearing_messages')
        .insert({
          message_id: messageId,
          conversation_id: conversationId,
          expires_at: expiresAt.toISOString(),
          burn_after_read: burnAfterRead,
          viewed_by: [],
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating disappearing message:', error);
        return null;
      }

      // Dodanie do kolejki wiadomości do usunięcia
      await supabase
        .from('disappearing_messages_queue')
        .insert({
          message_id: messageId,
          delete_at: expiresAt.toISOString(),
          processed: false,
        });

      return data;
    } catch (error) {
      console.error('Error in createDisappearingMessage:', error);
      return null;
    }
  }, [user, settings]);

  // Oznaczanie wiadomości jako przeczytanej
  const markMessageAsViewed = useCallback(async (messageId: string) => {
    if (!user) return;

    try {
      // Pobieranie informacji o wiadomości znikającej
      const { data: disappearingMessage, error: fetchError } = await supabase
        .from('disappearing_messages')
        .select('*')
        .eq('message_id', messageId)
        .single();

      if (fetchError || !disappearingMessage) {
        console.error('Error fetching disappearing message:', fetchError);
        return;
      }

      // Sprawdzanie, czy użytkownik już widział tę wiadomość
      const viewedBy = disappearingMessage.viewed_by || [];
      if (viewedBy.includes(user.id)) return;

      // Dodawanie użytkownika do listy osób, które widziały wiadomość
      const updatedViewedBy = [...viewedBy, user.id];

      // Aktualizacja listy osób, które widziały wiadomość
      const { error: updateError } = await supabase
        .from('disappearing_messages')
        .update({ viewed_by: updatedViewedBy })
        .eq('id', disappearingMessage.id);

      if (updateError) {
        console.error('Error updating disappearing message:', updateError);
        return;
      }

      // Jeśli włączona jest opcja "burn after read" i wszyscy uczestnicy konwersacji widzieli wiadomość,
      // usuwamy ją natychmiast
      if (disappearingMessage.burn_after_read) {
        // Pobieranie listy uczestników konwersacji
        const { data: participants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', disappearingMessage.conversation_id);

        if (participantsError) {
          console.error('Error fetching conversation participants:', participantsError);
          return;
        }

        const participantIds = participants.map(p => p.user_id);
        const allParticipantsViewed = participantIds.every(id => updatedViewedBy.includes(id));

        if (allParticipantsViewed) {
          // Usuwanie wiadomości
          await supabase
            .from('messages')
            .delete()
            .eq('id', messageId);

          // Usuwanie wpisu o wiadomości znikającej
          await supabase
            .from('disappearing_messages')
            .delete()
            .eq('id', disappearingMessage.id);

          // Aktualizacja kolejki wiadomości do usunięcia
          await supabase
            .from('disappearing_messages_queue')
            .update({ processed: true })
            .eq('message_id', messageId);
        }
      }
    } catch (error) {
      console.error('Error in markMessageAsViewed:', error);
    }
  }, [user]);

  // Sprawdzanie, czy wiadomość jest wiadomością znikającą
  const isDisappearingMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('disappearing_messages')
        .select('id')
        .eq('message_id', messageId)
        .maybeSingle();

      if (error) {
        console.error('Error checking if message is disappearing:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isDisappearingMessage:', error);
      return false;
    }
  }, []);

  // Pobieranie informacji o wiadomości znikającej
  const getDisappearingMessageInfo = useCallback(async (messageId: string): Promise<DisappearingMessage | null> => {
    try {
      const { data, error } = await supabase
        .from('disappearing_messages')
        .select('*')
        .eq('message_id', messageId)
        .single();

      if (error) {
        console.error('Error fetching disappearing message info:', error);
        return null;
      }

      return {
        id: data.id,
        messageId: data.message_id,
        conversationId: data.conversation_id,
        expiresAt: new Date(data.expires_at),
        burnAfterRead: data.burn_after_read,
        viewedBy: data.viewed_by || [],
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error in getDisappearingMessageInfo:', error);
      return null;
    }
  }, []);

  // Obliczanie pozostałego czasu do wygaśnięcia wiadomości
  const getRemainingTime = useCallback((expiresAt: Date): number => {
    const now = new Date();
    const remainingMs = expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.floor(remainingMs / 1000)); // Zwraca pozostały czas w sekundach
  }, []);

  // Formatowanie pozostałego czasu do czytelnej postaci
  const formatRemainingTime = useCallback((seconds: number): string => {
    if (seconds <= 0) return 'Wygasła';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }, []);

  // Zgłaszanie próby zrzutu ekranu
  const reportScreenshotAttempt = useCallback(async (messageId: string) => {
    if (!user || !settings.notifyOnScreenshot) return;

    try {
      // Pobieranie informacji o wiadomości
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .select('conversation_id, sender_id')
        .eq('id', messageId)
        .single();

      if (messageError || !message) {
        console.error('Error fetching message:', messageError);
        return;
      }

      // Tworzenie powiadomienia dla nadawcy wiadomości
      await supabase
        .from('notifications')
        .insert({
          user_id: message.sender_id,
          type: 'security_alert',
          title: 'Próba zrzutu ekranu',
          message: 'Ktoś próbował wykonać zrzut ekranu Twojej wiadomości znikającej',
          data: {
            message_id: messageId,
            conversation_id: message.conversation_id,
            screenshot_by: user.id,
            timestamp: new Date().toISOString(),
          },
        });

      // Dodawanie wpisu do dziennika bezpieczeństwa
      await supabase
        .from('security_logs')
        .insert({
          user_id: user.id,
          event_type: 'screenshot_attempt',
          resource_type: 'message',
          resource_id: messageId,
          metadata: {
            conversation_id: message.conversation_id,
            message_owner: message.sender_id,
            timestamp: new Date().toISOString(),
          },
        });
    } catch (error) {
      console.error('Error in reportScreenshotAttempt:', error);
    }
  }, [user, settings.notifyOnScreenshot]);

  // Inicjalizacja
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Nasłuchiwanie na zmiany w ustawieniach
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('disappearing_settings_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'disappearing_message_settings',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchSettings]);

  return {
    settings,
    loading,
    updateSettings,
    createDisappearingMessage,
    markMessageAsViewed,
    isDisappearingMessage,
    getDisappearingMessageInfo,
    getRemainingTime,
    formatRemainingTime,
    reportScreenshotAttempt,
  };
}