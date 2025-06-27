import { describe, it, expect } from 'vitest';
import { mapToUserStory, formatStoryWithAuthor } from '@/utils/storyHelpers';
import type { UserStory } from '@/hooks/useStories';

describe('Story Helpers', () => {
  describe('mapToUserStory', () => {
    it('should map a story object to UserStory type', () => {
      const mockStory = {
        id: '123',
        user_id: 'user123',
        content_type: 'text',
        content_encrypted: 'encrypted-content',
        background_color: '#ff0000',
        media_url: 'https://example.com/media.jpg',
        media_thumbnail: 'https://example.com/thumbnail.jpg',
        duration: 10,
        visibility: 'contacts',
        allowed_viewers: ['user1', 'user2'],
        blocked_viewers: ['user3'],
        view_count: 5,
        allow_replies: true,
        allow_reactions: true,
        expires_at: '2023-12-31',
        created_at: '2023-12-01'
      };

      const result = mapToUserStory(mockStory);

      expect(result).toEqual({
        id: '123',
        user_id: 'user123',
        content_type: 'text',
        content_encrypted: 'encrypted-content',
        background_color: '#ff0000',
        media_url: 'https://example.com/media.jpg',
        media_thumbnail: 'https://example.com/thumbnail.jpg',
        duration: 10,
        visibility: 'contacts',
        allowed_viewers: ['user1', 'user2'],
        blocked_viewers: ['user3'],
        view_count: 5,
        allow_replies: true,
        allow_reactions: true,
        expires_at: '2023-12-31',
        created_at: '2023-12-01',
        viewed_by_user: false
      });
    });

    it('should handle missing or default values', () => {
      const mockStory = {
        id: '123',
        user_id: 'user123',
        // Missing content_type
        // Missing content_encrypted
        background_color: '#ff0000',
        media_url: 'https://example.com/media.jpg',
        media_thumbnail: 'https://example.com/thumbnail.jpg',
        duration: 10,
        // Missing visibility
        allowed_viewers: null,
        blocked_viewers: null,
        // Missing view_count
        allow_replies: false,
        // Missing allow_reactions
        expires_at: '2023-12-31',
        created_at: '2023-12-01'
      };

      const result = mapToUserStory(mockStory);

      expect(result).toEqual({
        id: '123',
        user_id: 'user123',
        content_type: 'text', // Default value
        content_encrypted: '', // Default value
        background_color: '#ff0000',
        media_url: 'https://example.com/media.jpg',
        media_thumbnail: 'https://example.com/thumbnail.jpg',
        duration: 10,
        visibility: 'contacts', // Default value
        allowed_viewers: null,
        blocked_viewers: null,
        view_count: 0, // Default value
        allow_replies: false,
        allow_reactions: true, // Default value (negation of false)
        expires_at: '2023-12-31',
        created_at: '2023-12-01',
        viewed_by_user: false
      });
    });
  });

  describe('formatStoryWithAuthor', () => {
    it('should format a story with author information', () => {
      const mockStory = {
        id: '123',
        user_id: 'user123',
        content_type: 'text',
        content_encrypted: 'encrypted-content',
        background_color: '#ff0000',
        media_url: 'https://example.com/media.jpg',
        media_thumbnail: 'https://example.com/thumbnail.jpg',
        duration: 10,
        visibility: 'contacts',
        allowed_viewers: ['user1', 'user2'],
        blocked_viewers: ['user3'],
        view_count: 5,
        allow_replies: true,
        allow_reactions: true,
        expires_at: '2023-12-31',
        created_at: '2023-12-01'
      };

      const mockAuthor = {
        username: 'johndoe',
        display_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg'
      };

      const result = formatStoryWithAuthor(mockStory, mockAuthor, true);

      expect(result).toEqual({
        id: '123',
        user_id: 'user123',
        content_type: 'text',
        content_encrypted: 'encrypted-content',
        background_color: '#ff0000',
        media_url: 'https://example.com/media.jpg',
        media_thumbnail: 'https://example.com/thumbnail.jpg',
        duration: 10,
        visibility: 'contacts',
        allowed_viewers: ['user1', 'user2'],
        blocked_viewers: ['user3'],
        view_count: 5,
        allow_replies: true,
        allow_reactions: true,
        expires_at: '2023-12-31',
        created_at: '2023-12-01',
        author: {
          username: 'johndoe',
          display_name: 'John Doe',
          avatar_url: 'https://example.com/avatar.jpg'
        },
        viewed_by_user: true
      });
    });

    it('should handle missing author information', () => {
      const mockStory = {
        id: '123',
        user_id: 'user123',
        content_type: 'text',
        content_encrypted: 'encrypted-content',
        background_color: '#ff0000',
        media_url: 'https://example.com/media.jpg',
        media_thumbnail: 'https://example.com/thumbnail.jpg',
        duration: 10,
        visibility: 'contacts',
        allowed_viewers: ['user1', 'user2'],
        blocked_viewers: ['user3'],
        view_count: 5,
        allow_replies: true,
        allow_reactions: true,
        expires_at: '2023-12-31',
        created_at: '2023-12-01'
      };

      // No author provided
      const result = formatStoryWithAuthor(mockStory, null);

      expect(result).toEqual({
        id: '123',
        user_id: 'user123',
        content_type: 'text',
        content_encrypted: 'encrypted-content',
        background_color: '#ff0000',
        media_url: 'https://example.com/media.jpg',
        media_thumbnail: 'https://example.com/thumbnail.jpg',
        duration: 10,
        visibility: 'contacts',
        allowed_viewers: ['user1', 'user2'],
        blocked_viewers: ['user3'],
        view_count: 5,
        allow_replies: true,
        allow_reactions: true,
        expires_at: '2023-12-31',
        created_at: '2023-12-01',
        author: {
          username: 'Unknown',
          display_name: 'Unknown User',
          avatar_url: ''
        },
        viewed_by_user: false
      });
    });

    it('should use username as display_name if display_name is missing', () => {
      const mockStory = {
        id: '123',
        user_id: 'user123',
        content_type: 'text',
        content_encrypted: 'encrypted-content'
      };

      const mockAuthor = {
        username: 'johndoe',
        // Missing display_name
        avatar_url: 'https://example.com/avatar.jpg'
      };

      const result = formatStoryWithAuthor(mockStory, mockAuthor);

      expect(result.author).toEqual({
        username: 'johndoe',
        display_name: 'johndoe', // Should use username
        avatar_url: 'https://example.com/avatar.jpg'
      });
    });

    it('should use empty string for avatar_url if missing', () => {
      const mockStory = {
        id: '123',
        user_id: 'user123',
        content_type: 'text',
        content_encrypted: 'encrypted-content'
      };

      const mockAuthor = {
        username: 'johndoe',
        display_name: 'John Doe'
        // Missing avatar_url
      };

      const result = formatStoryWithAuthor(mockStory, mockAuthor);

      expect(result.author).toEqual({
        username: 'johndoe',
        display_name: 'John Doe',
        avatar_url: '' // Should use empty string
      });
    });
  });
});