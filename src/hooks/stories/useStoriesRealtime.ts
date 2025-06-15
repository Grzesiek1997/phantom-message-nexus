
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useStoriesRealtime = (fetchStories: () => Promise<void>) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

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
  }, [user, fetchStories]);
};
