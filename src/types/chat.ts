
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  message_type: 'text' | 'file' | 'image';
  expires_at: string | null;
  created_at: string;
  sender?: {
    username: string;
    display_name: string;
  };
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: Array<{
    user_id: string;
    role: string;
    profiles: {
      username: string;
      display_name: string;
    };
  }>;
  last_message?: Message;
}
