
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isUserStoryRecord } from '@/utils/typeGuards';
import { formatStoryWithAuthor } from '@/utils/storyHelpers';
import type { UserStory } from '@/hooks/useStories';

export const useStoriesData = () => {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_stories' as any)
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .in('visibility', ['public', 'contacts'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error);
        return;
      }

      if (!data) {
        setStories([]);
        return;
      }

      const filteredData = (data as any[]).filter(isUserStoryRecord);
      const authorIds = [...new Set(filteredData.map((story: any) => story.user_id))];
      
      const { data: authors } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', authorIds);

      const storyIds = filteredData.map((story: any) => story.id);
      const { data: views } = await supabase
        .from('story_views' as any)
        .select('story_id')
        .in('story_id', storyIds)
        .eq('viewer_id', user.id);

      const viewedStoryIds = new Set((views as any[] || []).filter(isUserStoryRecord).map(v => v.story_id));

      const processedStories = filteredData.map((story: any) => {
        const author = authors?.find(a => a.id === story.user_id);
        return formatStoryWithAuthor(story, author, viewedStoryIds.has(story.id));
      });

      setStories(processedStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const fetchUserStories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_stories' as any)
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user stories:', error);
        return;
      }

      if (!data) {
        setUserStories([]);
        return;
      }

      const filteredData = (data as any[]).filter(isUserStoryRecord);
      const processedStories = filteredData.map(formatStoryWithAuthor);
      setUserStories(processedStories);
    } catch (error) {
      console.error('Error fetching user stories:', error);
    }
  };

  return {
    stories,
    userStories,
    loading,
    setLoading,
    fetchStories,
    fetchUserStories,
    setStories,
    setUserStories
  };
};
