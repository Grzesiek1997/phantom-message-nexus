
-- Function to check if the current user is a member of a conversation
CREATE OR REPLACE FUNCTION public.is_member_of(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id AND user_id = auth.uid()
  );
$$;

-- RLS for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS for conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view conversations they are part of" ON public.conversations;
CREATE POLICY "Users can view conversations they are part of" ON public.conversations FOR SELECT USING (public.is_member_of(id));
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "Users can update conversations they are part of" ON public.conversations;
CREATE POLICY "Users can update conversations they are part of" ON public.conversations FOR UPDATE USING (public.is_member_of(id));

-- RLS for conversation_participants table
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view participants of conversations they are in" ON public.conversation_participants;
CREATE POLICY "Users can view participants of conversations they are in" ON public.conversation_participants FOR SELECT USING (public.is_member_of(conversation_id));
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;
CREATE POLICY "Users can add participants to conversations" ON public.conversation_participants FOR INSERT WITH CHECK (public.is_member_of(conversation_id));
DROP POLICY IF EXISTS "Users can remove themselves from conversations" ON public.conversation_participants;
CREATE POLICY "Users can remove themselves from conversations" ON public.conversation_participants FOR DELETE USING (user_id = auth.uid());

-- RLS for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages in conversations they are part of" ON public.messages;
CREATE POLICY "Users can view messages in conversations they are part of" ON public.messages FOR SELECT USING (public.is_member_of(conversation_id));
DROP POLICY IF EXISTS "Users can send messages in conversations they are part of" ON public.messages;
CREATE POLICY "Users can send messages in conversations they are part of" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND public.is_member_of(conversation_id));
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE USING (sender_id = auth.uid());

-- RLS for contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own contacts" ON public.contacts;
CREATE POLICY "Users can manage their own contacts" ON public.contacts
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add Foreign Keys to contacts table to fix relationships
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_user_id_fkey;
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_contact_user_id_fkey;
ALTER TABLE public.contacts
ADD CONSTRAINT contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.contacts
ADD CONSTRAINT contacts_contact_user_id_fkey FOREIGN KEY (contact_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- RPC functions to fix build errors
CREATE OR REPLACE FUNCTION public.increment_subscriber_count(p_channel_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.channels
  SET subscriber_count = COALESCE(subscriber_count, 0) + 1
  WHERE id = p_channel_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_subscriber_count(p_channel_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.channels
  SET subscriber_count = COALESCE(subscriber_count, 0) - 1
  WHERE id = p_channel_id and COALESCE(subscriber_count, 0) > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_vote_count(p_option_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.poll_options
  SET vote_count = COALESCE(vote_count, 0) + 1
  WHERE id = p_option_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_story_view_count(p_story_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  story_exists BOOLEAN;
BEGIN
  -- Check if user_stories table exists to avoid error on non-existent table.
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_stories'
  ) INTO story_exists;

  IF story_exists AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_stories' AND column_name = 'view_count') THEN
    UPDATE public.user_stories
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_story_id;
  END IF;
END;
$$;
