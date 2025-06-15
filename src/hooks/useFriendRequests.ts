
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
}

export const useFriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFriendRequests = async () => {
    if (!user) return;

    try {
      // Get received friend requests
      const { data: receivedData, error: receivedError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (receivedError) {
        console.error('Error fetching friend requests:', receivedError);
        return;
      }

      // Get sent friend requests
      const { data: sentData, error: sentError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', user.id);

      if (sentError) {
        console.error('Error fetching sent requests:', sentError);
        return;
      }

      // Get profiles for received requests
      if (receivedData && receivedData.length > 0) {
        const senderIds = receivedData.map(req => req.sender_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', senderIds);

        const requestsWithProfiles = receivedData.map(req => ({
          ...req,
          sender_profile: profiles?.find(p => p.id === req.sender_id)
        }));

        setFriendRequests(requestsWithProfiles);
      } else {
        setFriendRequests([]);
      }

      setSentRequests(sentData || []);
    } catch (error) {
      console.error('Error in fetchFriendRequests:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;

    try {
      // Check if user has already sent 3 requests to this person
      const { data: existingRequests } = await supabase
        .from('friend_requests')
        .select('attempt_count')
        .eq('sender_id', user.id)
        .eq('receiver_id', receiverId)
        .eq('status', 'rejected');

      if (existingRequests && existingRequests.length > 0) {
        const totalAttempts = existingRequests.reduce((sum, req) => sum + req.attempt_count, 0);
        if (totalAttempts >= 3) {
          toast({
            title: 'Limit osiągnięty',
            description: 'Możesz wysłać maksymalnie 3 zaproszenia do tej osoby',
            variant: 'destructive'
          });
          return;
        }
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
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

      toast({
        title: 'Zaproszenie wysłane',
        description: 'Zaproszenie do znajomych zostało wysłane'
      });

      await fetchFriendRequests();
    } catch (error) {
      console.error('Error in sendFriendRequest:', error);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
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

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
    }
  }, [user]);

  return {
    friendRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    fetchFriendRequests
  };
};
