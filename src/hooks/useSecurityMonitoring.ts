
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  description?: string;
  metadata: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address?: string;
  user_agent?: string;
  device_id?: string;
  created_at: string;
}

export interface DecryptionFailure {
  id: string;
  user_id?: string;
  conversation_id?: string;
  message_id?: string;
  failure_type?: string;
  device_info: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export const useSecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [decryptionFailures, setDecryptionFailures] = useState<DecryptionFailure[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSecurityEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSecurityEvents(data || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    }
  };

  const fetchDecryptionFailures = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('decryption_failures')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDecryptionFailures(data || []);
    } catch (error) {
      console.error('Error fetching decryption failures:', error);
    }
  };

  const logSecurityEvent = async (
    eventType: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('security_events')
        .insert({
          user_id: user.id,
          event_type: eventType,
          description,
          severity,
          metadata,
          ip_address: await getUserIP(),
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (error) throw error;

      setSecurityEvents(prev => [data, ...prev]);

      // Show toast for high/critical events
      if (severity === 'high' || severity === 'critical') {
        toast({
          title: 'Ostrzeżenie bezpieczeństwa',
          description: description,
          variant: 'destructive'
        });
      }

      return data;
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const logDecryptionFailure = async (
    conversationId: string,
    messageId: string,
    failureType: string,
    deviceInfo: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('decryption_failures')
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          message_id: messageId,
          failure_type: failureType,
          device_info: {
            ...deviceInfo,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          },
          ip_address: await getUserIP()
        })
        .select()
        .single();

      if (error) throw error;

      setDecryptionFailures(prev => [data, ...prev]);

      // Log as security event too
      await logSecurityEvent(
        'decryption_failure',
        `Decryption failed: ${failureType}`,
        'high',
        { conversationId, messageId, failureType }
      );

      return data;
    } catch (error) {
      console.error('Error logging decryption failure:', error);
    }
  };

  const getUserIP = async (): Promise<string | undefined> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting user IP:', error);
      return undefined;
    }
  };

  const clearOldEvents = async (daysToKeep: number = 90) => {
    if (!user) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const { error } = await supabase
        .from('security_events')
        .delete()
        .eq('user_id', user.id)
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      await fetchSecurityEvents();
      
      toast({
        title: 'Sukces',
        description: 'Stare zdarzenia bezpieczeństwa zostały usunięte'
      });
    } catch (error) {
      console.error('Error clearing old events:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć starych zdarzeń',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSecurityEvents(),
        fetchDecryptionFailures()
      ]);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Subscribe to new security events
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('security_events')
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'security_events',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setSecurityEvents(prev => [payload.new as SecurityEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    securityEvents,
    decryptionFailures,
    loading,
    logSecurityEvent,
    logDecryptionFailure,
    clearOldEvents,
    refetch: () => Promise.all([fetchSecurityEvents(), fetchDecryptionFailures()])
  };
};
