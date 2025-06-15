import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  attempt_count: number;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  receiver_profile?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export const useFriendRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFriendRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching friend requests for user:', user.id);

      // ZMODYFIKOWANE POBIERANIE: pobierz WSZYSTKIE zaproszenia gdzie odbiorca to user (nieważne jaki status)
      const { data: receivedData, error: receivedError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id);

      if (receivedError) {
        console.error('Error fetching received requests:', receivedError);
      }

      // Wysłane zaproszenia bez zmian
      const { data: sentData, error: sentError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', user.id);

      if (sentError) {
        console.error('Error fetching sent requests:', sentError);
      }

      // Profile dla otrzymanych zaproszeń (niezależnie od statusu)
      if (receivedData && receivedData.length > 0) {
        const senderIds = receivedData.map(req => req.sender_id);
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', senderIds);

        const requestsWithProfiles = receivedData.map(req => ({
          ...req,
          status: req.status as 'pending' | 'accepted' | 'rejected',
          attempt_count: req.attempt_count || 1,
          created_at: req.created_at || new Date().toISOString(),
          updated_at: req.updated_at || new Date().toISOString(),
          sender_profile: senderProfiles?.find(p => p.id === req.sender_id)
        }));

        setReceivedRequests(requestsWithProfiles);
      } else {
        setReceivedRequests([]);
      }

      // Wysłane z profilem bez zmian
      if (sentData && sentData.length > 0) {
        const receiverIds = sentData.map(req => req.receiver_id);
        const { data: receiverProfiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', receiverIds);

        const sentWithProfiles = sentData.map(req => ({
          ...req,
          status: req.status as 'pending' | 'accepted' | 'rejected',
          attempt_count: req.attempt_count || 1,
          created_at: req.created_at || new Date().toISOString(),
          updated_at: req.updated_at || new Date().toISOString(),
          receiver_profile: receiverProfiles?.find(p => p.id === req.receiver_id)
        }));

        setSentRequests(sentWithProfiles);
      } else {
        setSentRequests([]);
      }
    } catch (error) {
      console.error('Error in fetchFriendRequests:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;

    try {
      // Sprawdź ile już było prób
      const { data: existingRequests } = await supabase
        .from('friend_requests')
        .select('attempt_count, status')
        .eq('sender_id', user.id)
        .eq('receiver_id', receiverId);

      const totalAttempts = existingRequests?.reduce((sum, req) => {
        return sum + (req.status === 'rejected' ? req.attempt_count || 1 : 0);
      }, 0) || 0;

      if (totalAttempts >= 3) {
        toast({
          title: 'Limit osiągnięty',
          description: 'Możesz wysłać maksymalnie 3 zaproszenia do tej osoby. Pozostałe próby: 0',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending',
          attempt_count: 1
        });

      if (error) {
        console.error('Error sending friend request:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się wysłać zaproszenia',
          variant: 'destructive'
        });
        return;
      }

      const remainingAttempts = 3 - (totalAttempts + 1);
      toast({
        title: 'Zaproszenie wysłane',
        description: `Zaproszenie do znajomych zostało wysłane. Pozostałe próby: ${remainingAttempts}`
      });

      await fetchFriendRequests();
    } catch (error) {
      console.error('Error in sendFriendRequest:', error);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      console.log('Accepting friend request:', requestId);
      
      const { error } = await supabase.rpc('accept_friend_request', {
        request_id: requestId
      });

      if (error) {
        console.error('Error accepting friend request:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się zaakceptować zaproszenia',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Zaproszenie zaakceptowane',
        description: 'Nowy znajomy został dodany do kontaktów'
      });

      await fetchFriendRequests();
    } catch (error) {
      console.error('Error in acceptFriendRequest:', error);
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('reject_friend_request', {
        request_id: requestId
      });

      if (error) {
        console.error('Error rejecting friend request:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się odrzucić zaproszenia',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Zaproszenie odrzucone',
        description: 'Zaproszenie zostało odrzucone'
      });

      await fetchFriendRequests();
    } catch (error) {
      console.error('Error in rejectFriendRequest:', error);
    }
  };

  const deleteFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('delete_friend_request', {
        request_id: requestId
      });

      if (error) {
        console.error('Error deleting friend request:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się usunąć zaproszenia',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Zaproszenie usunięte',
        description: 'Zaproszenie zostało usunięte'
      });

      await fetchFriendRequests();
    } catch (error) {
      console.error('Error in deleteFriendRequest:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const friendRequestsChannel = supabase
      .channel('friend-requests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          console.log('Received friend requests updated, refreshing...');
          fetchFriendRequests();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `sender_id=eq.${user.id}`
        },
        () => {
          console.log('Sent friend requests updated, refreshing...');
          fetchFriendRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendRequestsChannel);
    };
  }, [user]);

  return {
    receivedRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriendRequest,
    fetchFriendRequests
  };
};
