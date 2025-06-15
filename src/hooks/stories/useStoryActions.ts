
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUserStoryRecord } from '@/utils/typeGuards';
import { mapToUserStory } from '@/utils/storyHelpers';
import type { UserStory } from '@/hooks/useStories';

export const useStoryActions = (
  setUserStories: React.Dispatch<React.SetStateAction<UserStory[]>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();

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

      if (!isUserStoryRecord(data)) return;

      const processedStory = mapToUserStory(data);
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

  return {
    createStory,
    deleteStory
  };
};
