
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Call {
  id: string;
  conversation_id?: string;
  caller_id: string;
  type: 'voice' | 'video' | 'group_voice' | 'group_video';
  status: 'ringing' | 'connecting' | 'connected' | 'ended' | 'missed' | 'rejected' | 'failed';
  quality_rating?: number;
  connection_type?: string;
  started_at: string;
  connected_at?: string;
  ended_at?: string;
  duration_seconds: number;
  end_reason?: string;
  metadata: Record<string, any>;
}

export interface CallParticipant {
  id: string;
  call_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  was_invited: boolean;
  connection_quality?: string;
}

export const useCalls = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCalls = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .or(`caller_id.eq.${user.id},conversation_id.in.(${await getUserConversations()})`)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserConversations = async (): Promise<string> => {
    if (!user) return '';

    const { data } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    return data?.map(c => c.conversation_id).join(',') || '';
  };

  const startCall = async (
    conversationId: string,
    type: 'voice' | 'video' | 'group_voice' | 'group_video'
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calls')
        .insert({
          conversation_id: conversationId,
          caller_id: user.id,
          type,
          status: 'ringing'
        })
        .select()
        .single();

      if (error) throw error;

      setActiveCall(data);
      setCalls(prev => [data, ...prev]);

      toast({
        title: 'Połączenie',
        description: 'Nawiązywanie połączenia...'
      });

      return data;
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się rozpocząć połączenia',
        variant: 'destructive'
      });
    }
  };

  const endCall = async (callId: string, reason?: string) => {
    try {
      const endTime = new Date().toISOString();
      const call = calls.find(c => c.id === callId);
      const duration = call ? Math.floor((new Date(endTime).getTime() - new Date(call.started_at).getTime()) / 1000) : 0;

      const { error } = await supabase
        .from('calls')
        .update({
          status: 'ended',
          ended_at: endTime,
          duration_seconds: duration,
          end_reason: reason
        })
        .eq('id', callId);

      if (error) throw error;

      setActiveCall(null);
      setCalls(prev => prev.map(c => 
        c.id === callId 
          ? { ...c, status: 'ended' as const, ended_at: endTime, duration_seconds: duration }
          : c
      ));

      toast({
        title: 'Połączenie zakończone',
        description: `Czas trwania: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
      });
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const answerCall = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('calls')
        .update({
          status: 'connected',
          connected_at: new Date().toISOString()
        })
        .eq('id', callId);

      if (error) throw error;

      const updatedCall = calls.find(c => c.id === callId);
      if (updatedCall) {
        setActiveCall({ ...updatedCall, status: 'connected' });
      }
    } catch (error) {
      console.error('Error answering call:', error);
    }
  };

  const rejectCall = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('calls')
        .update({
          status: 'rejected',
          ended_at: new Date().toISOString()
        })
        .eq('id', callId);

      if (error) throw error;

      setCalls(prev => prev.map(c => 
        c.id === callId 
          ? { ...c, status: 'rejected' as const }
          : c
      ));
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  const rateCall = async (callId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('calls')
        .update({ quality_rating: rating })
        .eq('id', callId);

      if (error) throw error;

      setCalls(prev => prev.map(c => 
        c.id === callId 
          ? { ...c, quality_rating: rating }
          : c
      ));
    } catch (error) {
      console.error('Error rating call:', error);
    }
  };

  useEffect(() => {
    fetchCalls();

    // Subscribe to call changes
    const callsSubscription = supabase
      .channel('calls')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'calls' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCalls(prev => [payload.new as Call, ...prev]);
            
            // If this is an incoming call for the current user
            if (payload.new.caller_id !== user?.id) {
              toast({
                title: 'Połączenie przychodzące',
                description: 'Otrzymujesz połączenie...'
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            setCalls(prev => prev.map(c => 
              c.id === payload.new.id ? payload.new as Call : c
            ));
            
            if (activeCall?.id === payload.new.id) {
              setActiveCall(payload.new as Call);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callsSubscription);
    };
  }, [user]);

  return {
    calls,
    activeCall,
    loading,
    startCall,
    endCall,
    answerCall,
    rejectCall,
    rateCall,
    refetch: fetchCalls
  };
};
