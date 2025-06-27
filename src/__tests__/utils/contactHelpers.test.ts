import { describe, it, expect } from 'vitest';
import { 
  formatContact, 
  formatSentRequest, 
  filterExistingContacts 
} from '@/utils/contactHelpers';
import type { SearchUser } from '@/hooks/useContacts';

describe('Contact Helpers', () => {
  describe('formatContact', () => {
    it('should format a contact with profile information', () => {
      const contact = {
        id: '123',
        user_id: 'user1',
        contact_user_id: 'user2',
        status: 'accepted',
        created_at: '2023-01-01T00:00:00Z'
      };
      
      const profile = {
        username: 'johndoe',
        display_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg'
      };
      
      const result = formatContact(contact, profile);
      
      expect(result).toEqual({
        ...contact,
        profile: {
          username: 'johndoe',
          display_name: 'John Doe',
          avatar_url: 'https://example.com/avatar.jpg'
        },
        friend_request_status: 'accepted',
        can_chat: true,
        friend_request_id: undefined
      });
    });
    
    it('should handle missing profile information', () => {
      const contact = {
        id: '123',
        user_id: 'user1',
        contact_user_id: 'user2',
        status: 'accepted',
        created_at: '2023-01-01T00:00:00Z'
      };
      
      const result = formatContact(contact, null);
      
      expect(result).toEqual({
        ...contact,
        profile: {
          username: 'Unknown',
          display_name: 'Unknown User'
        },
        friend_request_status: 'accepted',
        can_chat: true,
        friend_request_id: undefined
      });
    });
    
    it('should handle pending contacts', () => {
      const contact = {
        id: '123',
        user_id: 'user1',
        contact_user_id: 'user2',
        status: 'pending',
        created_at: '2023-01-01T00:00:00Z'
      };
      
      const profile = {
        username: 'johndoe',
        display_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg'
      };
      
      const result = formatContact(contact, profile);
      
      expect(result).toEqual({
        ...contact,
        profile: {
          username: 'johndoe',
          display_name: 'John Doe',
          avatar_url: 'https://example.com/avatar.jpg'
        },
        friend_request_status: 'pending',
        can_chat: false,
        friend_request_id: undefined
      });
    });
    
    it('should use friend request information when provided', () => {
      const contact = {
        id: '123',
        user_id: 'user1',
        contact_user_id: 'user2',
        status: 'pending',
        created_at: '2023-01-01T00:00:00Z'
      };
      
      const profile = {
        username: 'johndoe',
        display_name: 'John Doe'
      };
      
      const friendRequest = {
        id: 'fr123',
        status: 'accepted'
      };
      
      const result = formatContact(contact, profile, friendRequest);
      
      expect(result).toEqual({
        ...contact,
        profile: {
          username: 'johndoe',
          display_name: 'John Doe'
        },
        friend_request_status: 'accepted',
        can_chat: false,
        friend_request_id: 'fr123'
      });
    });
  });
  
  describe('formatSentRequest', () => {
    it('should format a sent friend request with profile information', () => {
      const request = {
        id: 'fr123',
        sender_id: 'user1',
        receiver_id: 'user2',
        status: 'pending',
        created_at: '2023-01-01T00:00:00Z'
      };
      
      const profile = {
        username: 'johndoe',
        display_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg'
      };
      
      const result = formatSentRequest(request, profile);
      
      expect(result).toEqual({
        id: 'fr123',
        user_id: 'user1',
        contact_user_id: 'user2',
        status: 'pending',
        created_at: '2023-01-01T00:00:00Z',
        profile: {
          username: 'johndoe',
          display_name: 'John Doe',
          avatar_url: 'https://example.com/avatar.jpg'
        },
        friend_request_status: 'pending',
        can_chat: false,
        friend_request_id: 'fr123'
      });
    });
    
    it('should handle missing profile information', () => {
      const request = {
        id: 'fr123',
        sender_id: 'user1',
        receiver_id: 'user2',
        status: 'pending'
      };
      
      const result = formatSentRequest(request, null);
      
      expect(result).toMatchObject({
        id: 'fr123',
        user_id: 'user1',
        contact_user_id: 'user2',
        status: 'pending',
        profile: {
          username: 'Unknown',
          display_name: 'Unknown User'
        },
        friend_request_status: 'pending',
        can_chat: false,
        friend_request_id: 'fr123'
      });
      
      // Check that created_at is a valid ISO string
      expect(new Date(result.created_at).toISOString()).toBe(result.created_at);
    });
  });
  
  describe('filterExistingContacts', () => {
    it('should filter out existing contacts from search results', () => {
      const searchResults: SearchUser[] = [
        { id: 'user1', username: 'user1', display_name: 'User 1' },
        { id: 'user2', username: 'user2', display_name: 'User 2' },
        { id: 'user3', username: 'user3', display_name: 'User 3' },
        { id: 'user4', username: 'user4', display_name: 'User 4' }
      ];
      
      const existingContactIds = new Set(['user1', 'user3']);
      
      const result = filterExistingContacts(searchResults, existingContactIds);
      
      expect(result).toEqual([
        { id: 'user2', username: 'user2', display_name: 'User 2' },
        { id: 'user4', username: 'user4', display_name: 'User 4' }
      ]);
    });
    
    it('should return all search results when there are no existing contacts', () => {
      const searchResults: SearchUser[] = [
        { id: 'user1', username: 'user1', display_name: 'User 1' },
        { id: 'user2', username: 'user2', display_name: 'User 2' }
      ];
      
      const existingContactIds = new Set<string>();
      
      const result = filterExistingContacts(searchResults, existingContactIds);
      
      expect(result).toEqual(searchResults);
    });
    
    it('should return an empty array when all search results are existing contacts', () => {
      const searchResults: SearchUser[] = [
        { id: 'user1', username: 'user1', display_name: 'User 1' },
        { id: 'user2', username: 'user2', display_name: 'User 2' }
      ];
      
      const existingContactIds = new Set(['user1', 'user2']);
      
      const result = filterExistingContacts(searchResults, existingContactIds);
      
      expect(result).toEqual([]);
    });
  });
});