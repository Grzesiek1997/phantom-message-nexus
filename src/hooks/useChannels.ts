
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Channel {
  id: string;
  name: string;
  username?: string;
  description?: string;
  avatar_url?: string;
  owner_id: string;
  category?: string;
  is_public: boolean;
  is_verified: boolean;
  subscriber_count: number;
  auto_delete_messages: boolean;
  message_ttl: number;
  is_premium: boolean;
  subscription_price?: number;
  created_at: string;
  updated_at: string;
  is_subscribed?: boolean;
  subscription_info?: {
    notifications_enabled: boolean;
    is_premium_subscriber: boolean;
    subscribed_at: string;
  };
}

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [subscribedChannels, setSubscribedChannels] = useState<Channel[]>([]);
  const [ownedChannels, setOwnedChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPublicChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_public', true)
        .order('subscriber_count', { ascending: false })
        .limit(50);

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching public channels:', error);
    }
  };

  const fetchSubscribedChannels = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('channel_subscribers')
        .select(`
          *,
          channel:channels(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const processedChannels = (data || []).map(sub => ({
        ...(sub.channel as Channel),
        is_subscribed: true,
        subscription_info: {
          notifications_enabled: sub.notifications_enabled,
          is_premium_subscriber: sub.is_premium_subscriber,
          subscribed_at: sub.subscribed_at
        }
      }));

      setSubscribedChannels(processedChannels);
    } catch (error) {
      console.error('Error fetching subscribed channels:', error);
    }
  };

  const fetchOwnedChannels = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOwnedChannels(data || []);
    } catch (error) {
      console.error('Error fetching owned channels:', error);
    }
  };

  const createChannel = async (channelData: {
    name: string;
    username?: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
    isPremium?: boolean;
    subscriptionPrice?: number;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert({
          name: channelData.name,
          username: channelData.username,
          description: channelData.description,
          category: channelData.category,
          owner_id: user.id,
          is_public: channelData.isPublic !== false,
          is_premium: channelData.isPremium || false,
          subscription_price: channelData.subscriptionPrice
        })
        .select()
        .single();

      if (error) throw error;

      setOwnedChannels(prev => [data, ...prev]);
      toast({
        title: 'Sukces',
        description: 'Kanał został utworzony'
      });

      return data;
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć kanału',
        variant: 'destructive'
      });
    }
  };

  const subscribeToChannel = async (channelId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('channel_subscribers')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          notifications_enabled: true
        });

      if (error) throw error;

      // Update subscriber count
      await supabase
        .from('channels')
        .update({ subscriber_count: supabase.sql`subscriber_count + 1` })
        .eq('id', channelId);

      await fetchSubscribedChannels();
      await fetchPublicChannels();

      toast({
        title: 'Sukces',
        description: 'Subskrybujesz kanał'
      });
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zasubskrybować kanału',
        variant: 'destructive'
      });
    }
  };

  const unsubscribeFromChannel = async (channelId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('channel_subscribers')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update subscriber count
      await supabase
        .from('channels')
        .update({ subscriber_count: supabase.sql`subscriber_count - 1` })
        .eq('id', channelId);

      setSubscribedChannels(prev => prev.filter(ch => ch.id !== channelId));
      await fetchPublicChannels();

      toast({
        title: 'Sukces',
        description: 'Anulowano subskrypcję kanału'
      });
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się anulować subskrypcji',
        variant: 'destructive'
      });
    }
  };

  const updateChannel = async (channelId: string, updates: Partial<Channel>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('channels')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', channelId)
        .eq('owner_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setOwnedChannels(prev => prev.map(ch => ch.id === channelId ? data : ch));
      toast({
        title: 'Sukces',
        description: 'Kanał został zaktualizowany'
      });

      return data;
    } catch (error) {
      console.error('Error updating channel:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować kanału',
        variant: 'destructive'
      });
    }
  };

  const deleteChannel = async (channelId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId)
        .eq('owner_id', user.id);

      if (error) throw error;

      setOwnedChannels(prev => prev.filter(ch => ch.id !== channelId));
      toast({
        title: 'Sukces',
        description: 'Kanał został usunięty'
      });
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć kanału',
        variant: 'destructive'
      });
    }
  };

  const searchChannels = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_public', true)
        .or(`name.ilike.%${query}%,username.ilike.%${query}%,description.ilike.%${query}%`)
        .order('subscriber_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching channels:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadChannels = async () => {
      await Promise.all([
        fetchPublicChannels(),
        fetchSubscribedChannels(),
        fetchOwnedChannels()
      ]);
      setLoading(false);
    };

    loadChannels();

    // Set up real-time subscription for channel updates
    const channel = supabase
      .channel('channels-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'channels' },
        () => {
          fetchPublicChannels();
          fetchOwnedChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    channels,
    subscribedChannels,
    ownedChannels,
    loading,
    createChannel,
    subscribeToChannel,
    unsubscribeFromChannel,
    updateChannel,
    deleteChannel,
    searchChannels,
    refetch: () => Promise.all([
      fetchPublicChannels(),
      fetchSubscribedChannels(),
      fetchOwnedChannels()
    ])
  };
};
