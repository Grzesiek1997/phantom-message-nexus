
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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
  const [stories, setStories] = useState<UserStory[]>([]);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStories = async () => {
    if (!user) return;

    try {
      // First check if user_stories table exists
      const { data: tableCheck } = await supabase
        .from('user_stories' as any)
        .select('id')
        .limit(1);

      if (!tableCheck) {
        console.log('User stories table not found');
        setStories([]);
        return;
      }

      const { data, error } = await supabase
        .from('user_stories' as any)
        .select(`
          *,
          author:profiles!user_stories_user_id_fkey(username, display_name, avatar_url),
          story_views!inner(viewer_id)
        `)
        .gt('expires_at', new Date().toISOString())
        .in('visibility', ['public', 'contacts'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stories:', error);
        return;
      }

      const processedStories = (data || []).map(story => ({
        ...story,
        content_type: (story.content_type as 'text' | 'image' | 'video') || 'text',
        visibility: (story.visibility as 'public' | 'contacts' | 'close_friends' | 'custom') || 'contacts',
        author: story.author && typeof story.author === 'object' && !Array.isArray(story.author)
          ? story.author as UserStory['author']
          : { username: 'Unknown', display_name: 'Unknown User', avatar_url: '' },
        viewed_by_user: Array.isArray(story.story_views) && story.story_views.some((view: any) => view.viewer_id === user.id)
      })) as UserStory[];

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
      
      const processedStories = (data || []).map(story => ({
        ...story,
        content_type: (story.content_type as 'text' | 'image' | 'video') || 'text',
        visibility: (story.visibility as 'public' | 'contacts' | 'close_friends' | 'custom') || 'contacts'
      })) as UserStory[];
      
      setUserStories(processedStories);
    } catch (error) {
      console.error('Error fetching user stories:', error);
    }
  };

  const createStory = async (
    contentType: 'text' | 'image' | 'video',
    content: string,
    options: {
      backgroundColor?: string;
      mediaUrl?: string;
      duration?: number;
      visibility?: 'public' | 'contacts' | 'close_friends' | 'custom';
      allowedViewers?: string[];
      allowReplies?: boolean;
      allowReactions?: boolean;
    } = {}
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_stories' as any)
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_encrypted: content,
          background_color: options.backgroundColor,
          media_url: options.mediaUrl,
          duration: options.duration,
          visibility: options.visibility || 'contacts',
          allowed_viewers: options.allowedViewers,
          allow_replies: options.allowReplies !== false,
          allow_reactions: options.allowReactions !== false,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const processedStory = {
        ...data,
        content_type: data.content_type as 'text' | 'image' | 'video',
        visibility: data.visibility as 'public' | 'contacts' | 'close_friends' | 'custom'
      } as UserStory;

      setUserStories(prev => [processedStory, ...prev]);
      toast({
        title: 'Sukces',
        description: 'Historia została dodana'
      });

      return processedStory;
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się dodać historii',
        variant: 'destructive'
      });
    }
  };

  const viewStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('story_views' as any)
        .upsert({
          story_id: storyId,
          viewer_id: user.id,
          viewed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Try to update view count with the available RPC function
      try {
        await supabase.rpc('increment_story_view_count', { p_story_id: storyId });
      } catch (rpcError) {
        console.log('RPC function not available, updating directly');
        const currentStory = stories.find(s => s.id === storyId);
        if (currentStory) {
          await supabase
            .from('user_stories' as any)
            .update({ view_count: (currentStory.view_count || 0) + 1 })
            .eq('id', storyId);
        }
      }

      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, viewed_by_user: true, view_count: (story.view_count || 0) + 1 }
          : story
      ));
    } catch (error) {
      console.error('Error viewing story:', error);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_stories' as any)
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (error) throw error;

      setUserStories(prev => prev.filter(story => story.id !== storyId));
      toast({
        title: 'Sukces',
        description: 'Historia została usunięta'
      });
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć historii',
        variant: 'destructive'
      });
    }
  };

  const getStoryViews = async (storyId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('story_views' as any)
        .select(`
          *,
          viewer:profiles!story_views_viewer_id_fkey(username, display_name, avatar_url)
        `)
        .eq('story_id', storyId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching story views:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadStories = async () => {
      await Promise.all([fetchStories(), fetchUserStories()]);
      setLoading(false);
    };

    loadStories();

    const channel = supabase
      .channel('stories-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'user_stories' },
        () => fetchStories()
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'user_stories' },
        () => fetchStories()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    stories,
    userStories,
    loading,
    createStory,
    viewStory,
    deleteStory,
    getStoryViews,
    refetch: () => Promise.all([fetchStories(), fetchUserStories()])
  };
};
