
-- =====================================================
-- DODATKOWE TABELE - KOMUNIKATOR SUPABASE
-- Funkcje których brakowało w poprzedniej wersji
-- =====================================================

-- =====================================================
-- 1. STORIES & STATUS UPDATES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  content_type VARCHAR(20) CHECK (content_type IN ('text', 'image', 'video')),
  content_encrypted TEXT NOT NULL,
  background_color VARCHAR(7), -- Hex color for text stories
  
  -- Media
  media_url TEXT,
  media_thumbnail TEXT,
  duration INTEGER, -- For video stories
  
  -- Privacy & Visibility
  visibility VARCHAR(20) DEFAULT 'contacts' CHECK (visibility IN ('public', 'contacts', 'close_friends', 'custom')),
  allowed_viewers UUID[], -- For custom visibility
  blocked_viewers UUID[], -- Users who can't see this story
  
  -- Interaction
  view_count INTEGER DEFAULT 0,
  allow_replies BOOLEAN DEFAULT TRUE,
  allow_reactions BOOLEAN DEFAULT TRUE,
  
  -- Timing
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story views tracking
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.user_stories(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Story replies (private messages to story author)
CREATE TABLE IF NOT EXISTS public.story_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.user_stories(id) ON DELETE CASCADE,
  replier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_encrypted TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CHANNELS & BROADCASTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE, -- @channel_name
  description TEXT,
  avatar_url TEXT,
  
  -- Ownership & Management
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  category VARCHAR(50), -- 'news', 'tech', 'entertainment', etc.
  
  -- Settings
  is_public BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  subscriber_count INTEGER DEFAULT 0,
  
  -- Content moderation
  auto_delete_messages BOOLEAN DEFAULT FALSE,
  message_ttl INTEGER DEFAULT 0, -- Auto-delete after X seconds
  
  -- Monetization
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_price DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel subscribers
CREATE TABLE IF NOT EXISTS public.channel_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription settings
  notifications_enabled BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Premium subscription
  is_premium_subscriber BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(channel_id, user_id)
);

-- Channel admins
CREATE TABLE IF NOT EXISTS public.channel_admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  permissions JSONB DEFAULT '{
    "post_messages": true,
    "delete_messages": true,
    "manage_subscribers": false,
    "edit_channel": false
  }',
  
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  
  UNIQUE(channel_id, user_id)
);

-- =====================================================
-- 3. BOTS & AUTOMATION
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  
  -- Bot owner and verification
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Technical details
  webhook_url TEXT,
  webhook_secret TEXT,
  api_token TEXT UNIQUE,
  
  -- Capabilities
  can_join_groups BOOLEAN DEFAULT TRUE,
  can_read_all_messages BOOLEAN DEFAULT FALSE,
  inline_mode BOOLEAN DEFAULT FALSE,
  
  -- Usage stats
  total_interactions INTEGER DEFAULT 0,
  active_chats INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot commands
CREATE TABLE IF NOT EXISTS public.bot_commands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
  
  command VARCHAR(50) NOT NULL, -- without '/'
  description VARCHAR(255) NOT NULL,
  usage_example VARCHAR(255),
  
  -- Scope
  scope VARCHAR(20) DEFAULT 'all' CHECK (scope IN ('all', 'private', 'group', 'admin')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bot_id, command)
);

-- Bot interactions log
CREATE TABLE IF NOT EXISTS public.bot_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id),
  
  command VARCHAR(50),
  input_text TEXT,
  response_text TEXT,
  
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. POLLS & INTERACTIVE CONTENT
-- =====================================================

CREATE TABLE IF NOT EXISTS public.polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  
  question TEXT NOT NULL,
  poll_type VARCHAR(20) DEFAULT 'single' CHECK (poll_type IN ('single', 'multiple', 'quiz')),
  
  -- Settings
  is_anonymous BOOLEAN DEFAULT FALSE,
  allows_multiple_answers BOOLEAN DEFAULT FALSE,
  correct_option_id UUID, -- For quiz polls
  
  -- Timing
  expires_at TIMESTAMP WITH TIME ZONE,
  is_closed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  
  text VARCHAR(255) NOT NULL,
  option_order INTEGER NOT NULL,
  vote_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(poll_id, voter_id, option_id)
);

-- =====================================================
-- 5. STICKERS & CUSTOM EMOJI
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sticker_packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Pack details
  creator_id UUID REFERENCES auth.users(id),
  is_official BOOLEAN DEFAULT FALSE,
  is_animated BOOLEAN DEFAULT FALSE,
  
  -- Pricing
  is_free BOOLEAN DEFAULT TRUE,
  price DECIMAL(10,2) DEFAULT 0,
  
  -- Stats
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stickers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID REFERENCES public.sticker_packs(id) ON DELETE CASCADE,
  
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  emoji_tags TEXT[], -- Associated emojis for search
  
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_sticker_packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id UUID REFERENCES public.sticker_packs(id) ON DELETE CASCADE,
  
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  
  UNIQUE(user_id, pack_id)
);

-- =====================================================
-- 6. VOICE MESSAGES & AUDIO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.voice_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  
  -- Audio file details
  file_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  file_size INTEGER NOT NULL,
  
  -- Audio processing
  waveform_data JSONB, -- Audio waveform for UI
  transcript TEXT, -- AI-generated transcript
  is_transcribed BOOLEAN DEFAULT FALSE,
  
  -- Playback tracking
  play_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice message playbacks (for read receipts)
CREATE TABLE IF NOT EXISTS public.voice_playbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voice_message_id UUID REFERENCES public.voice_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  play_duration INTEGER, -- How long user listened
  
  UNIQUE(voice_message_id, user_id)
);

-- =====================================================
-- 7. LOCATION & LIVE TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.location_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  -- Location data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2), -- in meters
  altitude DECIMAL(10, 2), -- in meters
  
  -- Sharing settings
  is_live BOOLEAN DEFAULT FALSE, -- Live location vs static
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Privacy
  shared_with UUID[], -- Specific users who can see this
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live location updates (for real-time tracking)
CREATE TABLE IF NOT EXISTS public.live_location_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_share_id UUID REFERENCES public.location_shares(id) ON DELETE CASCADE,
  
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  speed DECIMAL(10, 2), -- km/h
  heading INTEGER, -- degrees
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. THEMES & CUSTOMIZATION
-- =====================================================

CREATE TABLE IF NOT EXISTS public.themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Theme data
  theme_data JSONB NOT NULL, -- Complete theme configuration
  preview_url TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  is_official BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  
  -- Stats
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
  
  is_active BOOLEAN DEFAULT FALSE,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, theme_id)
);

-- Custom wallpapers
CREATE TABLE IF NOT EXISTS public.wallpapers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id), -- NULL for global
  
  image_url TEXT NOT NULL,
  blur_level INTEGER DEFAULT 0,
  brightness DECIMAL(3,2) DEFAULT 1.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. DRAFTS & SCHEDULED MESSAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.message_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  content_encrypted TEXT NOT NULL,
  attachments JSONB DEFAULT '[]', -- Array of attachment info
  reply_to_id UUID REFERENCES public.messages(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, conversation_id)
);

CREATE TABLE IF NOT EXISTS public.scheduled_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  -- Message content
  content_encrypted TEXT NOT NULL,
  message_type VARCHAR(30) DEFAULT 'text',
  attachments JSONB DEFAULT '[]',
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_message_id UUID REFERENCES public.messages(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. ANALYTICS & INSIGHTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.usage_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Date partition
  date DATE NOT NULL,
  
  -- Activity metrics
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  voice_messages_sent INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 0,
  calls_received INTEGER DEFAULT 0,
  
  -- Engagement
  active_conversations INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  stories_posted INTEGER DEFAULT 0,
  stories_viewed INTEGER DEFAULT 0,
  
  -- Features used
  features_used JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Conversation analytics
CREATE TABLE IF NOT EXISTS public.conversation_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Activity
  total_messages INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  new_members INTEGER DEFAULT 0,
  left_members INTEGER DEFAULT 0,
  
  -- Content types
  text_messages INTEGER DEFAULT 0,
  media_messages INTEGER DEFAULT 0,
  voice_messages INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(conversation_id, date)
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Stories
CREATE INDEX IF NOT EXISTS idx_stories_user_expires ON public.user_stories(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story ON public.story_views(story_id, viewed_at DESC);

-- Channels
CREATE INDEX IF NOT EXISTS idx_channels_public ON public.channels(is_public, subscriber_count DESC);
CREATE INDEX IF NOT EXISTS idx_channel_subscribers_user ON public.channel_subscribers(user_id);

-- Bots
CREATE INDEX IF NOT EXISTS idx_bots_username ON public.bots(username);
CREATE INDEX IF NOT EXISTS idx_bot_interactions_bot ON public.bot_interactions(bot_id, created_at DESC);

-- Polls
CREATE INDEX IF NOT EXISTS idx_polls_message ON public.polls(message_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);

-- Location
CREATE INDEX IF NOT EXISTS idx_location_shares_live ON public.location_shares(is_live, expires_at);
CREATE INDEX IF NOT EXISTS idx_location_conversation ON public.location_shares(conversation_id, created_at DESC);

-- Scheduled messages
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_time ON public.scheduled_messages(scheduled_for, status);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_date ON public.usage_analytics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_date ON public.conversation_analytics(conversation_id, date DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sticker_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sticker_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_playbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_analytics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for user-owned data
CREATE POLICY "users_own_stories" ON public.user_stories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_story_views" ON public.story_views FOR ALL USING (auth.uid() = viewer_id);
CREATE POLICY "users_own_story_replies" ON public.story_replies FOR ALL USING (auth.uid() = replier_id);
CREATE POLICY "users_own_channel_subscriptions" ON public.channel_subscribers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_bots" ON public.bots FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "users_own_poll_votes" ON public.poll_votes FOR ALL USING (auth.uid() = voter_id);
CREATE POLICY "users_own_sticker_packs" ON public.user_sticker_packs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_voice_playbacks" ON public.voice_playbacks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_location_shares" ON public.location_shares FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_themes" ON public.user_themes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_wallpapers" ON public.wallpapers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_drafts" ON public.message_drafts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_scheduled_messages" ON public.scheduled_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_analytics" ON public.usage_analytics FOR ALL USING (auth.uid() = user_id);

-- Public read policies for certain tables
CREATE POLICY "public_channels_read" ON public.channels FOR SELECT USING (is_public = true);
CREATE POLICY "public_sticker_packs_read" ON public.sticker_packs FOR SELECT USING (true);
CREATE POLICY "public_stickers_read" ON public.stickers FOR SELECT USING (true);
CREATE POLICY "public_themes_read" ON public.themes FOR SELECT USING (true);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Clean expired stories
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_stories WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Send scheduled messages
CREATE OR REPLACE FUNCTION public.process_scheduled_messages()
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  processed_count INTEGER := 0;
  scheduled_msg RECORD;
  new_message_id UUID;
BEGIN
  FOR scheduled_msg IN 
    SELECT * FROM public.scheduled_messages 
    WHERE scheduled_for <= NOW() AND status = 'pending'
    ORDER BY scheduled_for ASC
    LIMIT 100
  LOOP
    BEGIN
      -- Create the actual message
      INSERT INTO public.messages (conversation_id, sender_id, content, message_type)
      VALUES (
        scheduled_msg.conversation_id,
        scheduled_msg.user_id,
        scheduled_msg.content_encrypted,
        scheduled_msg.message_type
      ) RETURNING id INTO new_message_id;
      
      -- Update scheduled message status
      UPDATE public.scheduled_messages 
      SET status = 'sent', sent_at = NOW(), sent_message_id = new_message_id
      WHERE id = scheduled_msg.id;
      
      processed_count := processed_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Mark as failed
      UPDATE public.scheduled_messages 
      SET status = 'failed'
      WHERE id = scheduled_msg.id;
    END;
  END LOOP;
  
  RETURN processed_count;
END;
$$;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_location_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_messages;
