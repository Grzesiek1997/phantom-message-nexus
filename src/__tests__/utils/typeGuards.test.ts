import { describe, it, expect } from 'vitest';
import { 
  isValidObject, 
  isUserStoryRecord, 
  isContactRecord, 
  isFriendRequestRecord 
} from '@/utils/typeGuards';

describe('Type Guards', () => {
  describe('isValidObject', () => {
    it('should return true for valid objects', () => {
      expect(isValidObject({})).toBe(true);
      expect(isValidObject({ name: 'John' })).toBe(true);
      expect(isValidObject(new Date())).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(isValidObject(null)).toBe(false);
      expect(isValidObject(undefined)).toBe(false);
      expect(isValidObject(42)).toBe(false);
      expect(isValidObject('string')).toBe(false);
      expect(isValidObject(true)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isValidObject([])).toBe(false);
      expect(isValidObject([1, 2, 3])).toBe(false);
    });
  });

  describe('isUserStoryRecord', () => {
    it('should return true for valid user story records', () => {
      expect(isUserStoryRecord({ id: '1', user_id: '123' })).toBe(true);
      expect(isUserStoryRecord({ id: '1', user_id: '123', content: 'Hello' })).toBe(true);
    });

    it('should return false for invalid user story records', () => {
      expect(isUserStoryRecord({})).toBe(false);
      expect(isUserStoryRecord({ id: '1' })).toBe(false);
      expect(isUserStoryRecord({ user_id: '123' })).toBe(false);
      expect(isUserStoryRecord(null)).toBe(false);
      expect(isUserStoryRecord([])).toBe(false);
    });
  });

  describe('isContactRecord', () => {
    it('should return true for valid contact records', () => {
      expect(isContactRecord({ id: '1', contact_user_id: '123' })).toBe(true);
      expect(isContactRecord({ id: '1', contact_user_id: '123', name: 'John' })).toBe(true);
    });

    it('should return false for invalid contact records', () => {
      expect(isContactRecord({})).toBe(false);
      expect(isContactRecord({ id: '1' })).toBe(false);
      expect(isContactRecord({ contact_user_id: '123' })).toBe(false);
      expect(isContactRecord(null)).toBe(false);
      expect(isContactRecord([])).toBe(false);
    });
  });

  describe('isFriendRequestRecord', () => {
    it('should return true for valid friend request records', () => {
      expect(isFriendRequestRecord({ id: '1', sender_id: '123', receiver_id: '456' })).toBe(true);
      expect(isFriendRequestRecord({ 
        id: '1', 
        sender_id: '123', 
        receiver_id: '456', 
        status: 'pending' 
      })).toBe(true);
    });

    it('should return false for invalid friend request records', () => {
      expect(isFriendRequestRecord({})).toBe(false);
      expect(isFriendRequestRecord({ id: '1', sender_id: '123' })).toBe(false);
      expect(isFriendRequestRecord({ id: '1', receiver_id: '456' })).toBe(false);
      expect(isFriendRequestRecord({ sender_id: '123', receiver_id: '456' })).toBe(false);
      expect(isFriendRequestRecord(null)).toBe(false);
      expect(isFriendRequestRecord([])).toBe(false);
    });
  });
});