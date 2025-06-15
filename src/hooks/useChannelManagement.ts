
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ChannelStats {
  total_channels: number;
  public_channels: number;
  premium_channels: number;
  total_subscribers: number;
  verified_channels: number;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  sender_profile?: {
    username: string;
    display_name?: string;
  };
}

export const useChannelManagement = () => {
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [recentMessages, setRecentMessages] = useState<ChannelMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChannelStats = async () => {
    try {
      const { data: channels, error } = await supabase
        .from('channels')
        .select('id, is_public, is_premium, is_verified, subscriber_count');

      if (error) throw error;

      const stats: ChannelStats = {
        total_channels: channels?.length || 0,
        public_channels: channels?.filter(c => c.is_public).length || 0,
        premium_channels: channels?.filter(c => c.is_premium).length || 0,
        verified_channels: channels?.filter(c => c.is_verified).length || 0,
        total_subscribers: channels?.reduce((sum, c) => sum + (c.subscriber_count || 0), 0) || 0
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching channel stats:', error);
    }
  };

  const fetchRecentChannelMessages = async () => {
    try {
      // Ponieważ nie mamy jeszcze tabeli channel_messages, użyjemy messages z konwersacji typu channel
      const { data: channelConversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'channel')
        .limit(10);

      if (!channelConversations || channelConversations.length === 0) {
        setRecentMessages([]);
        return;
      }

      const conversationIds = channelConversations.map(c => c.id);

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          message_type,
          created_at,
          sender:profiles!messages_sender_id_fkey(username, display_name)
        `)
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const processedMessages = (messages || []).map(msg => ({
        id: msg.id,
        channel_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        message_type: msg.message_type,
        created_at: msg.created_at,
        sender_profile: msg.sender && typeof msg.sender === 'object' && !Array.isArray(msg.sender) 
          ? msg.sender as ChannelMessage['sender_profile']
          : { username: 'Unknown', display_name: 'Unknown User' }
      })) as ChannelMessage[];

      setRecentMessages(processedMessages);
    } catch (error) {
      console.error('Error fetching recent channel messages:', error);
    }
  };

  const broadcastToAllChannels = async (message: string) => {
    if (!user) return;

    try {
      // Pobierz wszystkie kanały które należą do usera lub gdzie user jest adminem
      const { data: userChannels, error: channelsError } = await supabase
        .from('channels')
        .select('id, name')
        .eq('owner_id', user.id);

      if (channelsError) throw channelsError;

      if (!userChannels || userChannels.length === 0) {
        toast({
          title: 'Brak kanałów',
          description: 'Nie masz kanałów do których możesz wysłać wiadomość',
          variant: 'destructive'
        });
        return;
      }

      let successCount = 0;

      for (const channel of userChannels) {
        try {
          // Znajdź konwersację dla kanału
          const { data: conversation } = await supabase
            .from('conversations')
            .select('id')
            .eq('type', 'channel')
            .eq('name', channel.name)
            .single();

          if (conversation) {
            await supabase
              .from('messages')
              .insert({
                conversation_id: conversation.id,
                sender_id: user.id,
                content: message,
                message_type: 'text'
              });
            
            successCount++;
          }
        } catch (channelError) {
          console.error(`Error sending to channel ${channel.name}:`, channelError);
        }
      }

      toast({
        title: 'Sukces',
        description: `Wiadomość wysłana do ${successCount} kanałów`
      });
    } catch (error) {
      console.error('Error broadcasting to channels:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać wiadomości do kanałów',
        variant: 'destructive'
      });
    }
  };

  const moderateMessage = async (messageId: string, action: 'delete' | 'hide') => {
    if (!user) return;

    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', messageId);

        if (error) throw error;
      } else if (action === 'hide') {
        const { error } = await supabase
          .from('messages')
          .update({ is_deleted: true })
          .eq('id', messageId);

        if (error) throw error;
      }

      toast({
        title: 'Sukces',
        description: `Wiadomość została ${action === 'delete' ? 'usunięta' : 'ukryta'}`
      });

      // Odśwież listę wiadomości
      await fetchRecentChannelMessages();
    } catch (error) {
      console.error('Error moderating message:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się moderować wiadomości',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchChannelStats(),
        fetchRecentChannelMessages()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    stats,
    recentMessages,
    loading,
    broadcastToAllChannels,
    moderateMessage,
    refreshData: () => Promise.all([fetchChannelStats(), fetchRecentChannelMessages()])
  };
};
