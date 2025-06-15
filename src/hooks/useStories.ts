
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useStoriesData } from './stories/useStoriesData';
import { useStoryActions } from './stories/useStoryActions';
import { useStoryViews } from './stories/useStoryViews';
import { useStoriesRealtime } from './stories/useStoriesRealtime';

export interface UserStory {
  id: string;
  user_id: string;
  content_type: 'text' | 'image' | 'video';
  content_encrypted: string;
  background_color?: string;
  media_url?: string;
  media_thumbnail?: string;
  duration?: number;
  visibility: 'public' | 'contacts' | 'close_friends' | 'custom';
  allowed_viewers?: string[];
  blocked_viewers?: string[];
  view_count: number;
  allow_replies: boolean;
  allow_reactions: boolean;
  expires_at: string;
  created_at: string;
  author?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  viewed_by_user?: boolean;
}

export interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewed_at: string;
}

export const useStories = () => {
  const { user } = useAuth();
  const {
    stories,
    userStories,
    loading,
    setLoading,
    fetchStories,
    fetchUserStories,
    setStories,
    setUserStories
  } = useStoriesData();

  const { createStory, deleteStory } = useStoryActions(setUserStories);
  const { viewStory, getStoryViews } = useStoryViews(stories, setStories);

  useStoriesRealtime(fetchStories);

  useEffect(() => {
    const loadStories = async () => {
      await Promise.all([fetchStories(), fetchUserStories()]);
      setLoading(false);
    };

    if (user) {
      loadStories();
    }
  }, [user, fetchStories, fetchUserStories, setLoading]);

  const refetch = () => Promise.all([fetchStories(), fetchUserStories()]);

  return {
    stories,
    userStories,
    loading,
    createStory,
    viewStory,
    deleteStory,
    getStoryViews,
    refetch
  };
};
