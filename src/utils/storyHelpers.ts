
import type { UserStory } from '@/hooks/useStories';

export const mapToUserStory = (story: any): UserStory => ({
  id: story.id,
  user_id: story.user_id,
  content_type: (story.content_type as 'text' | 'image' | 'video') || 'text',
  content_encrypted: story.content_encrypted || '',
  background_color: story.background_color,
  media_url: story.media_url,
  media_thumbnail: story.media_thumbnail,
  duration: story.duration,
  visibility: (story.visibility as 'public' | 'contacts' | 'close_friends' | 'custom') || 'contacts',
  allowed_viewers: story.allowed_viewers,
  blocked_viewers: story.blocked_viewers,
  view_count: story.view_count || 0,
  allow_replies: story.allow_replies !== false,
  allow_reactions: story.allow_reactions !== false,
  expires_at: story.expires_at,
  created_at: story.created_at,
  viewed_by_user: false
});

export const formatStoryWithAuthor = (story: any, author: any, isViewed: boolean = false): UserStory => ({
  ...mapToUserStory(story),
  author: author ? {
    username: author.username,
    display_name: author.display_name || author.username,
    avatar_url: author.avatar_url || ''
  } : { 
    username: 'Unknown', 
    display_name: 'Unknown User', 
    avatar_url: '' 
  },
  viewed_by_user: isViewed
});
