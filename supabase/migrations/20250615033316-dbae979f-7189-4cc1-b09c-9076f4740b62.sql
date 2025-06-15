
-- =====================================================
-- PHASE 1: CORE DATABASE EXTENSIONS & TABLE IMPROVEMENTS
-- =====================================================

-- Add required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. ENHANCE USERS TABLE
-- =====================================================

-- Add missing columns to existing users table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available' CHECK (status IN ('available', 'away', 'busy', 'invisible'));

-- End-to-end encryption keys
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identity_key TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signed_prekey TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prekey_signature TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS one_time_prekeys TEXT[];

-- Security & Privacy
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS backup_phrase_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "read_receipts": true,
  "last_seen": "contacts", 
  "profile_photo": "contacts",
  "disappearing_messages": false,
  "screen_lock": false,
  "incognito_keyboard": false
}';

-- Status & Activity
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disappearing_messages_ttl INTEGER DEFAULT 0;

-- Premium & Business
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 2. MULTI-DEVICE SUPPORT
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name VARCHAR(100) NOT NULL,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  device_key TEXT NOT NULL,
  platform VARCHAR(20) CHECK (platform IN ('ios', 'android', 'desktop', 'web')),
  push_token TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ENHANCE CONTACTS TABLE
-- =====================================================

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS nickname VARCHAR(100);
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS verified_safety_number TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 4. CONTACT VERIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contact_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  safety_number VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- =====================================================
-- 5. ENHANCE CONVERSATIONS TABLE
-- =====================================================

ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_admin_only BOOLEAN DEFAULT FALSE;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS member_limit INTEGER DEFAULT 500;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS disappearing_messages_ttl INTEGER DEFAULT 0;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS group_key TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS invite_link_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS invite_link VARCHAR(255) UNIQUE;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- =====================================================
-- 6. ENHANCE CONVERSATION PARTICIPANTS
-- =====================================================

ALTER TABLE public.conversation_participants ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.conversation_participants ADD COLUMN IF NOT EXISTS muted_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.conversation_participants ADD COLUMN IF NOT EXISTS custom_notifications JSONB DEFAULT '{}';
ALTER TABLE public.conversation_participants ADD COLUMN IF NOT EXISTS last_read_message_id UUID;
ALTER TABLE public.conversation_participants ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 7. ENHANCE MESSAGES TABLE
-- =====================================================

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content_encrypted TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS thread_root_id UUID REFERENCES public.messages(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS auto_delete_after INTEGER;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_for_users UUID[];
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update message_type to include more types
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_message_type_check 
CHECK (message_type IN ('text', 'image', 'video', 'audio', 'voice_note', 'file', 'location', 'contact', 'sticker', 'gif', 'system', 'call_log', 'disappearing_notice'));

-- =====================================================
-- 8. ENHANCE MESSAGE ATTACHMENTS
-- =====================================================

ALTER TABLE public.message_attachments ADD COLUMN IF NOT EXISTS encryption_key TEXT;
ALTER TABLE public.message_attachments ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;
ALTER TABLE public.message_attachments ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE public.message_attachments ADD COLUMN IF NOT EXISTS dimensions JSONB;

-- =====================================================
-- 9. MESSAGE DELIVERY TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.message_delivery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.user_devices(id),
  status VARCHAR(20) CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, device_id)
);

-- =====================================================
-- 10. CALLS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id),
  caller_id UUID REFERENCES auth.users(id) NOT NULL,
  type VARCHAR(15) CHECK (type IN ('voice', 'video', 'group_voice', 'group_video')),
  status VARCHAR(20) DEFAULT 'ringing' CHECK (status IN ('ringing', 'connecting', 'connected', 'ended', 'missed', 'rejected', 'failed')),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  connection_type VARCHAR(20),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connected_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  end_reason VARCHAR(50),
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.call_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  was_invited BOOLEAN DEFAULT FALSE,
  connection_quality VARCHAR(20)
);

-- =====================================================
-- 11. SECURITY & ENCRYPTION
-- =====================================================

CREATE TABLE IF NOT EXISTS public.key_exchange_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  root_key TEXT NOT NULL,
  chain_key_send TEXT NOT NULL,
  chain_key_receive TEXT NOT NULL,
  send_counter INTEGER DEFAULT 0,
  receive_counter INTEGER DEFAULT 0,
  previous_counter INTEGER DEFAULT 0,
  dh_ratchet_key TEXT NOT NULL,
  next_header_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS public.decryption_failures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID REFERENCES public.conversations(id),
  message_id UUID,
  failure_type VARCHAR(50),
  device_info JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(100) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address INET,
  user_agent TEXT,
  device_id UUID REFERENCES public.user_devices(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. PRIVACY & DISAPPEARING CONTENT
-- =====================================================

CREATE TABLE IF NOT EXISTS public.disappearing_messages_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  delete_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.privacy_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  target_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. NOTIFICATION TOKENS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.user_devices(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(20) CHECK (platform IN ('apns', 'fcm', 'web_push')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 14. PERFORMANCE INDEXES
-- =====================================================

-- Users/Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_online ON public.profiles(is_online, last_seen);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_expires ON public.messages(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_thread ON public.messages(thread_root_id) WHERE thread_root_id IS NOT NULL;

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_member_lookup ON public.conversation_participants(user_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- Security indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user ON public.security_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decryption_failures_user ON public.decryption_failures(user_id, created_at DESC);

-- Calls indexes
CREATE INDEX IF NOT EXISTS idx_calls_participant ON public.calls(caller_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_conversation ON public.calls(conversation_id, started_at DESC);

-- =====================================================
-- 15. ESSENTIAL FUNCTIONS
-- =====================================================

-- Secure message cleanup for disappearing messages
CREATE OR REPLACE FUNCTION public.cleanup_disappearing_messages()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired messages and their attachments
  WITH deleted_messages AS (
    DELETE FROM public.messages 
    WHERE expires_at < NOW() AND expires_at IS NOT NULL
    RETURNING id
  )
  DELETE FROM public.message_attachments 
  WHERE message_id IN (SELECT id FROM deleted_messages);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Update disappearing queue
  UPDATE public.disappearing_messages_queue 
  SET processed = TRUE 
  WHERE delete_at < NOW() AND processed = FALSE;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate safety number for contact verification
CREATE OR REPLACE FUNCTION public.generate_safety_number(user1_uuid UUID, user2_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user1_key TEXT;
  user2_key TEXT;
  combined_keys TEXT;
BEGIN
  -- Get identity keys for both users
  SELECT identity_key INTO user1_key FROM public.profiles WHERE id = user1_uuid;
  SELECT identity_key INTO user2_key FROM public.profiles WHERE id = user2_uuid;
  
  IF user1_key IS NULL OR user2_key IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Combine keys in consistent order (smaller UUID first)
  IF user1_uuid < user2_uuid THEN
    combined_keys := user1_key || user2_key;
  ELSE
    combined_keys := user2_key || user1_key;
  END IF;
  
  -- Generate 60-digit safety number from hash
  RETURN SUBSTRING(ENCODE(DIGEST(combined_keys, 'sha256'), 'hex'), 1, 60);
END;
$$ LANGUAGE plpgsql;

-- Update conversation activity trigger
CREATE OR REPLACE FUNCTION public.update_conversation_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET 
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_conversation_activity ON public.messages;
CREATE TRIGGER trigger_conversation_activity
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_activity();

-- =====================================================
-- 16. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_exchange_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decryption_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disappearing_messages_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_tokens ENABLE ROW LEVEL SECURITY;

-- User devices policies
CREATE POLICY "users_own_devices" ON public.user_devices
  FOR ALL USING (auth.uid() = user_id);

-- Contact verifications policies
CREATE POLICY "contact_verifications_participants" ON public.contact_verifications
  FOR ALL USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Message delivery policies
CREATE POLICY "message_delivery_own_data" ON public.message_delivery
  FOR ALL USING (auth.uid() = user_id);

-- Calls policies
CREATE POLICY "calls_participants_only" ON public.calls
  FOR ALL USING (
    auth.uid() = caller_id OR
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
    )
  );

-- Call participants policies
CREATE POLICY "call_participants_own_data" ON public.call_participants
  FOR ALL USING (auth.uid() = user_id);

-- Security events policies
CREATE POLICY "security_events_own_data" ON public.security_events
  FOR ALL USING (auth.uid() = user_id);

-- Privacy actions policies
CREATE POLICY "privacy_actions_own_data" ON public.privacy_actions
  FOR ALL USING (auth.uid() = user_id);

-- Notification tokens policies
CREATE POLICY "notification_tokens_own_data" ON public.notification_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_delivery;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_events;
