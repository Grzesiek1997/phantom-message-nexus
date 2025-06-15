
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address?: string;
  user_agent?: string;
  device_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface DecryptionFailure {
  id: string;
  user_id: string;
  conversation_id: string;
  message_id: string;
  failure_type: string;
  device_info: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export const useSecurityMonitoring = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [decryptionFailures, setDecryptionFailures] = useState<DecryptionFailure[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

      const processedEvents = (data || []).map(event => ({
        ...event,
        metadata: typeof event.metadata === 'object' && event.metadata !== null 
          ? event.metadata as Record<string, any>
          : {}
      })) as SecurityEvent[];

      setSecurityEvents(processedEvents);
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

      const processedFailures = (data || []).map(failure => ({
        ...failure,
        device_info: typeof failure.device_info === 'object' && failure.device_info !== null 
          ? failure.device_info as Record<string, any>
          : {}
      })) as DecryptionFailure[];

      setDecryptionFailures(processedFailures);
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
          metadata: JSON.parse(JSON.stringify(metadata)),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const processedEvent: SecurityEvent = {
        ...data,
        metadata: typeof data.metadata === 'object' && data.metadata !== null 
          ? data.metadata as Record<string, any>
          : {}
      };

      setSecurityEvents(prev => [processedEvent, ...prev]);
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
          device_info: JSON.parse(JSON.stringify(deviceInfo)),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const processedFailure: DecryptionFailure = {
        ...data,
        device_info: typeof data.device_info === 'object' && data.device_info !== null 
          ? data.device_info as Record<string, any>
          : {}
      };

      setDecryptionFailures(prev => [processedFailure, ...prev]);
    } catch (error) {
      console.error('Error logging decryption failure:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchSecurityEvents(), fetchDecryptionFailures()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    securityEvents,
    decryptionFailures,
    loading,
    logSecurityEvent,
    logDecryptionFailure,
    refetch: () => Promise.all([fetchSecurityEvents(), fetchDecryptionFailures()])
  };
};
