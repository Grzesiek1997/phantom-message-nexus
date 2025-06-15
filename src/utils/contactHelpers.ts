
import type { Contact, SearchUser } from '@/hooks/useContacts';

export const formatContact = (contact: any, profile: any, friendRequest?: any): Contact => {
  const isAccepted = contact.status === 'accepted';
  
  return {
    ...contact,
    status: contact.status as 'pending' | 'accepted' | 'blocked',
    profile: profile ? {
      username: profile.username,
      display_name: profile.display_name || profile.username,
      avatar_url: profile.avatar_url
    } : {
      username: 'Unknown',
      display_name: 'Unknown User'
    },
    friend_request_status: friendRequest 
      ? friendRequest.status as 'pending' | 'accepted' | 'rejected'
      : (isAccepted ? 'accepted' as const : contact.status as 'pending' | 'accepted' | 'rejected'),
    can_chat: isAccepted,
    friend_request_id: friendRequest?.id
  };
};

export const formatSentRequest = (request: any, profile: any): Contact => ({
  id: request.id,
  user_id: request.sender_id,
  contact_user_id: request.receiver_id,
  status: 'pending' as const,
  created_at: request.created_at || new Date().toISOString(),
  profile: profile ? {
    username: profile.username,
    display_name: profile.display_name || profile.username,
    avatar_url: profile.avatar_url
  } : {
    username: 'Unknown',
    display_name: 'Unknown User'
  },
  friend_request_status: request.status as 'pending' | 'accepted' | 'rejected',
  can_chat: false,
  friend_request_id: request.id
});

export const filterExistingContacts = (searchResults: SearchUser[], existingContactIds: Set<string>): SearchUser[] => {
  return searchResults.filter(user => !existingContactIds.has(user.id));
};
