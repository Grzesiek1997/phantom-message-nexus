
-- Enable RLS on invitations table
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invitations
CREATE POLICY "Users can view their own invitations" ON public.invitations
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own invitations" ON public.invitations
  FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Enable RLS on other important tables that are missing it
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blocked_users
CREATE POLICY "Users can manage their blocked users" ON public.blocked_users
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for location_shares
CREATE POLICY "Users can view location shares in their conversations" ON public.location_shares
  FOR SELECT USING (
    user_id = auth.uid() OR
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create location shares" ON public.location_shares
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for message_threads
CREATE POLICY "Users can view message threads in their group chats" ON public.message_threads
  FOR SELECT USING (
    group_chat_id IN (
      SELECT group_chat_id FROM public.group_chat_members WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for scheduled_messages
CREATE POLICY "Users can manage their scheduled messages" ON public.scheduled_messages
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for story_replies
CREATE POLICY "Users can view story replies" ON public.story_replies
  FOR SELECT USING (
    replier_id = auth.uid() OR
    story_id IN (
      SELECT id FROM public.user_stories WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create story replies" ON public.story_replies
  FOR INSERT WITH CHECK (replier_id = auth.uid());

-- Create RLS policies for story_views
CREATE POLICY "Users can view story views for their stories" ON public.story_views
  FOR SELECT USING (
    viewer_id = auth.uid() OR
    story_id IN (
      SELECT id FROM public.user_stories WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create story views" ON public.story_views
  FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- Create RLS policies for usage_analytics
CREATE POLICY "Users can view their own analytics" ON public.usage_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analytics" ON public.usage_analytics
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add missing foreign key constraints (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'message_attachments_message_id_fkey' 
                   AND table_name = 'message_attachments') THEN
        ALTER TABLE public.message_attachments 
        ADD CONSTRAINT message_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'message_reactions_message_id_fkey' 
                   AND table_name = 'message_reactions') THEN
        ALTER TABLE public.message_reactions 
        ADD CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'message_reactions_user_id_fkey' 
                   AND table_name = 'message_reactions') THEN
        ALTER TABLE public.message_reactions 
        ADD CONSTRAINT message_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'message_read_status_message_id_fkey' 
                   AND table_name = 'message_read_status') THEN
        ALTER TABLE public.message_read_status 
        ADD CONSTRAINT message_read_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'message_read_status_user_id_fkey' 
                   AND table_name = 'message_read_status') THEN
        ALTER TABLE public.message_read_status 
        ADD CONSTRAINT message_read_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add performance indexes on foreign key columns
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id ON public.message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON public.message_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_sender_id ON public.invitations(sender_id);
CREATE INDEX IF NOT EXISTS idx_invitations_recipient_id ON public.invitations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON public.blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON public.blocked_users(blocked_user_id);

-- Add unique constraints where needed (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_user_message_reaction' 
                   AND table_name = 'message_reactions') THEN
        ALTER TABLE public.message_reactions 
        ADD CONSTRAINT unique_user_message_reaction UNIQUE (user_id, message_id, reaction_type);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_user_message_read' 
                   AND table_name = 'message_read_status') THEN
        ALTER TABLE public.message_read_status 
        ADD CONSTRAINT unique_user_message_read UNIQUE (user_id, message_id);
    END IF;
END $$;

-- Fix the conversation_participants RLS policy to avoid infinite recursion
DROP POLICY IF EXISTS "Users can view participants of conversations they are in" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_select" ON public.conversation_participants;

-- Create a security definer function to check conversation membership
CREATE OR REPLACE FUNCTION public.is_conversation_member(conversation_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversation_uuid AND user_id = user_uuid
  );
$$;

-- Create new policies using the security definer function
CREATE POLICY "conversation_participants_select" ON public.conversation_participants
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_conversation_member(conversation_id, auth.uid())
);

CREATE POLICY "conversation_participants_insert" ON public.conversation_participants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND c.created_by = auth.uid()
  )
);

CREATE POLICY "conversation_participants_delete" ON public.conversation_participants
FOR DELETE USING (user_id = auth.uid());
