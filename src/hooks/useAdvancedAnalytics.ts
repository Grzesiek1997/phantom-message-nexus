
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserEngagementMetrics {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  average_session_duration: number;
  messages_per_user: number;
  retention_rate: number;
}

export interface MessageAnalytics {
  total_messages: number;
  messages_today: number;
  messages_this_week: number;
  text_messages: number;
  media_messages: number;
  average_message_length: number;
  peak_hours: { hour: number; count: number }[];
}

export interface PopularFeatures {
  feature_name: string;
  usage_count: number;
  growth_rate: number;
}

export const useAdvancedAnalytics = () => {
  const [userMetrics, setUserMetrics] = useState<UserEngagementMetrics | null>(null);
  const [messageAnalytics, setMessageAnalytics] = useState<MessageAnalytics | null>(null);
  const [popularFeatures, setPopularFeatures] = useState<PopularFeatures[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const calculateUserEngagement = async (): Promise<UserEngagementMetrics> => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      // Daily active users
      const { count: dailyUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('last_seen', oneDayAgo.toISOString());

      // Weekly active users
      const { count: weeklyUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('last_seen', oneWeekAgo.toISOString());

      // Monthly active users
      const { count: monthlyUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('last_seen', oneMonthAgo.toISOString());

      // Messages per user (aproximate)
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('id', { count: 'exact' });

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      return {
        daily_active_users: dailyUsers || 0,
        weekly_active_users: weeklyUsers || 0,
        monthly_active_users: monthlyUsers || 0,
        average_session_duration: 0, // Placeholder
        messages_per_user: totalUsers ? Math.round((totalMessages || 0) / totalUsers) : 0,
        retention_rate: 0 // Placeholder
      };
    } catch (error) {
      console.error('Error calculating user engagement:', error);
      return {
        daily_active_users: 0,
        weekly_active_users: 0,
        monthly_active_users: 0,
        average_session_duration: 0,
        messages_per_user: 0,
        retention_rate: 0
      };
    }
  };

  const calculateMessageAnalytics = async (): Promise<MessageAnalytics> => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
      // Total messages
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('id', { count: 'exact' });

      // Messages today
      const { count: messagesToday } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .gte('created_at', oneDayAgo.toISOString());

      // Messages this week
      const { count: messagesThisWeek } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .gte('created_at', oneWeekAgo.toISOString());

      // Text vs media messages
      const { count: textMessages } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('message_type', 'text');

      const { count: mediaMessages } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .in('message_type', ['image', 'file']);

      // Average message length
      const { data: messageLengths } = await supabase
        .from('messages')
        .select('content')
        .eq('message_type', 'text')
        .limit(1000);

      const averageLength = messageLengths?.reduce((sum, msg) => 
        sum + (msg.content?.length || 0), 0
      ) / (messageLengths?.length || 1) || 0;

      return {
        total_messages: totalMessages || 0,
        messages_today: messagesToday || 0,
        messages_this_week: messagesThisWeek || 0,
        text_messages: textMessages || 0,
        media_messages: mediaMessages || 0,
        average_message_length: Math.round(averageLength),
        peak_hours: [] // Placeholder - would need more complex query
      };
    } catch (error) {
      console.error('Error calculating message analytics:', error);
      return {
        total_messages: 0,
        messages_today: 0,
        messages_this_week: 0,
        text_messages: 0,
        media_messages: 0,
        average_message_length: 0,
        peak_hours: []
      };
    }
  };

  const getPopularFeatures = async (): Promise<PopularFeatures[]> => {
    try {
      // Symulacja popularnych funkcji na podstawie dostępnych danych
      const features: PopularFeatures[] = [
        { feature_name: 'Wysyłanie wiadomości', usage_count: 0, growth_rate: 0 },
        { feature_name: 'Tworzenie grup', usage_count: 0, growth_rate: 0 },
        { feature_name: 'Udostępnianie plików', usage_count: 0, growth_rate: 0 },
        { feature_name: 'Kanały', usage_count: 0, growth_rate: 0 },
        { feature_name: 'Historie', usage_count: 0, growth_rate: 0 }
      ];

      // Policz wiadomości
      const { count: messageCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact' });

      // Policz grupy
      const { count: groupCount } = await supabase
        .from('conversations')
        .select('id', { count: 'exact' })
        .eq('type', 'group');

      // Policz załączniki
      const { count: fileCount } = await supabase
        .from('message_attachments')
        .select('id', { count: 'exact' });

      // Policz kanały
      const { count: channelCount } = await supabase
        .from('channels')
        .select('id', { count: 'exact' });

      // Policz historie
      const { count: storyCount } = await supabase
        .from('user_stories')
        .select('id', { count: 'exact' });

      features[0].usage_count = messageCount || 0;
      features[1].usage_count = groupCount || 0;
      features[2].usage_count = fileCount || 0;
      features[3].usage_count = channelCount || 0;
      features[4].usage_count = storyCount || 0;

      return features.sort((a, b) => b.usage_count - a.usage_count);
    } catch (error) {
      console.error('Error getting popular features:', error);
      return [];
    }
  };

  const generateAnalyticsReport = async () => {
    const report = {
      generated_at: new Date().toISOString(),
      user_metrics: userMetrics,
      message_analytics: messageAnalytics,
      popular_features: popularFeatures,
      summary: {
        total_active_users: userMetrics?.daily_active_users || 0,
        message_velocity: messageAnalytics?.messages_today || 0,
        top_feature: popularFeatures[0]?.feature_name || 'Brak danych'
      }
    };

    // Zapisz raport do localStorage jako backup
    localStorage.setItem('analytics_report', JSON.stringify(report));
    
    return report;
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      
      try {
        const [userMetricsData, messageAnalyticsData, popularFeaturesData] = await Promise.all([
          calculateUserEngagement(),
          calculateMessageAnalytics(),
          getPopularFeatures()
        ]);

        setUserMetrics(userMetricsData);
        setMessageAnalytics(messageAnalyticsData);
        setPopularFeatures(popularFeaturesData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return {
    userMetrics,
    messageAnalytics,
    popularFeatures,
    loading,
    generateAnalyticsReport,
    refreshAnalytics: async () => {
      setLoading(true);
      const [userMetricsData, messageAnalyticsData, popularFeaturesData] = await Promise.all([
        calculateUserEngagement(),
        calculateMessageAnalytics(),
        getPopularFeatures()
      ]);
      setUserMetrics(userMetricsData);
      setMessageAnalytics(messageAnalyticsData);
      setPopularFeatures(popularFeaturesData);
      setLoading(false);
    }
  };
};
