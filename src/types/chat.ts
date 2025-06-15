export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'voice' | 'location' | 'poll' | 'sticker';
  created_at: string;
  updated_at: string;
  reply_to_id?: string;
  thread_root_id?: string;
  is_edited?: boolean;
  is_deleted?: boolean;
  expires_at?: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  delivery_status?: 'sent' | 'delivered' | 'read';
  edit_history?: any[];
  sender?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  duration?: number;
  dimensions?: { width: number; height: number };
  thumbnail_path?: string;
  uploaded_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name?: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  member_count?: number;
  message_count?: number;
  participants?: ConversationParticipant[];
  last_message?: Message;
  is_muted?: boolean;
  muted_until?: string;
  disappearing_messages_ttl?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'moderator';
  joined_at: string;
  last_read_at?: string;
  last_read_message_id?: string;
  is_muted?: boolean;
  muted_until?: string;
  custom_notifications?: any;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  status?: 'available' | 'busy' | 'away' | 'offline';
  last_seen?: string;
  is_online?: boolean;
  is_verified?: boolean;
  is_premium?: boolean;
  privacy_settings?: PrivacySettings;
}

export interface PrivacySettings {
  read_receipts: boolean;
  last_seen: 'everyone' | 'contacts' | 'nobody';
  profile_photo: 'everyone' | 'contacts' | 'nobody';
  disappearing_messages: boolean;
  screen_lock: boolean;
  incognito_keyboard: boolean;
}

export interface UserDevice {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  device_key: string;
  platform: 'ios' | 'android' | 'desktop' | 'web';
  is_primary: boolean;
  last_active: string;
  created_at: string;
  push_token?: string;
}

export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  nickname?: string;
  is_favorite: boolean;
  is_blocked: boolean;
  added_at: string;
  profile?: UserProfile;
}

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
  author?: UserProfile;
  viewed_by_user?: boolean;
}

export interface Poll {
  id: string;
  message_id?: string;
  creator_id: string;
  question: string;
  poll_type: 'single' | 'multiple' | 'quiz';
  is_anonymous: boolean;
  allows_multiple_answers: boolean;
  expires_at?: string;
  is_closed: boolean;
  correct_option_id?: string;
  created_at: string;
  options: PollOption[];
  votes?: PollVote[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  option_order: number;
  vote_count: number;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  voter_id: string;
  voted_at: string;
}

export interface LocationShare {
  id: string;
  user_id: string;
  conversation_id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  is_live: boolean;
  expires_at?: string;
  shared_with?: string[];
  created_at: string;
  updated_at: string;
}
