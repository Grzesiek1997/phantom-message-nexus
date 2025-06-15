
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isUserStoryRecord } from '@/utils/typeGuards';
import type { UserStory } from '@/hooks/useStories';

export const useStoryViews = (
  stories: UserStory[],
  setStories: React.Dispatch<React.SetStateAction<UserStory[]>>
) => {
  const { user } = useAuth();

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

      try {
        await supabase.rpc('increment_story_view_count', { p_story_id: storyId });
      } catch (rpcError) {
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
      return (data as any[] || []).filter(isUserStoryRecord);
    } catch (error) {
      console.error('Error fetching story views:', error);
      return [];
    }
  };

  return {
    viewStory,
    getStoryViews
  };
};
