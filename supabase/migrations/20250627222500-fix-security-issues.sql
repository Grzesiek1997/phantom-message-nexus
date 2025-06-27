-- Fix security issues identified by Supabase linter

-- 1. Fix Security Definer View issue
-- Change the view to use SECURITY INVOKER instead of SECURITY DEFINER
CREATE OR REPLACE VIEW public.v_blocked_summary
WITH (security_invoker=true) AS
SELECT 
    user_id,
    COUNT(*) as blocked_count,
    MAX(created_at) as last_blocked_at
FROM public.blocked_users
GROUP BY user_id;

-- 2. Fix RLS Disabled in Public tables
-- Enable RLS on all tables that don't have it enabled

-- Enable RLS on blocked_users table
ALTER TABLE IF EXISTS public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blocked_users
CREATE POLICY "Users can view their own blocked users" ON public.blocked_users
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY "Users can manage their own blocked users" ON public.blocked_users
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS on participant_settings table
ALTER TABLE IF EXISTS public.participant_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for participant_settings
CREATE POLICY "Users can view their own participant settings" ON public.participant_settings
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY "Users can manage their own participant settings" ON public.participant_settings
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS on messages table
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in conversations they are part of" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can send messages in conversations they are part of" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can edit their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());
    
CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE USING (sender_id = auth.uid());

-- Enable RLS on message_reactions table
ALTER TABLE IF EXISTS public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for message_reactions
CREATE POLICY "Users can view reactions in conversations they are part of" ON public.message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can add reactions to messages in conversations they are part of" ON public.message_reactions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can manage their own reactions" ON public.message_reactions
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS on bots table
ALTER TABLE IF EXISTS public.bots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bots
CREATE POLICY "Users can view available bots" ON public.bots
    FOR SELECT USING (is_public = true OR created_by = auth.uid());
    
CREATE POLICY "Users can manage their own bots" ON public.bots
    FOR ALL USING (created_by = auth.uid());

-- Enable RLS on bot_interactions table
ALTER TABLE IF EXISTS public.bot_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bot_interactions
CREATE POLICY "Users can view their own bot interactions" ON public.bot_interactions
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY "Users can create their own bot interactions" ON public.bot_interactions
    FOR INSERT WITH CHECK (user_id = auth.uid());
    
CREATE POLICY "Users can manage their own bot interactions" ON public.bot_interactions
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS on attachments table
ALTER TABLE IF EXISTS public.attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for attachments
CREATE POLICY "Users can view attachments in conversations they are part of" ON public.attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = attachments.message_id
            AND cp.user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can add attachments to their own messages" ON public.attachments
    FOR INSERT WITH CHECK (
        uploader_id = auth.uid()
    );
    
CREATE POLICY "Users can manage their own attachments" ON public.attachments
    FOR ALL USING (uploader_id = auth.uid());

-- Enable RLS on biometric_data table
ALTER TABLE IF EXISTS public.biometric_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for biometric_data
CREATE POLICY "Users can view their own biometric data" ON public.biometric_data
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY "Users can manage their own biometric data" ON public.biometric_data
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS on users table
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view other users' public profiles" ON public.users
    FOR SELECT USING (true);
    
CREATE POLICY "Users can manage their own profile" ON public.users
    FOR ALL USING (id = auth.uid());

-- Enable RLS on friends table
ALTER TABLE IF EXISTS public.friends ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for friends
CREATE POLICY "Users can view their own friends" ON public.friends
    FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());
    
CREATE POLICY "Users can manage their own friends" ON public.friends
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS on conversations table
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations
CREATE POLICY "Users can view conversations they are part of" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Users can update conversations they are part of" ON public.conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can delete conversations they created" ON public.conversations
    FOR DELETE USING (created_by = auth.uid());

-- Enable RLS on conversation_participants table
ALTER TABLE IF EXISTS public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversation_participants
CREATE POLICY "Users can view participants in conversations they are part of" ON public.conversation_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
            AND cp.user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can add participants to conversations they created" ON public.conversation_participants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_participants.conversation_id
            AND created_by = auth.uid()
        )
    );
    
CREATE POLICY "Users can remove themselves from conversations" ON public.conversation_participants
    FOR DELETE USING (user_id = auth.uid());
    
CREATE POLICY "Conversation creators can manage participants" ON public.conversation_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_participants.conversation_id
            AND created_by = auth.uid()
        )
    );

-- Enable RLS on biometric_settings table
ALTER TABLE IF EXISTS public.biometric_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for biometric_settings
CREATE POLICY "Users can view their own biometric settings" ON public.biometric_settings
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY "Users can manage their own biometric settings" ON public.biometric_settings
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS on biometric_auth_attempts table
ALTER TABLE IF EXISTS public.biometric_auth_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for biometric_auth_attempts
CREATE POLICY "Users can view their own biometric auth attempts" ON public.biometric_auth_attempts
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY "Users can create their own biometric auth attempts" ON public.biometric_auth_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid());
    
CREATE POLICY "Users can manage their own biometric auth attempts" ON public.biometric_auth_attempts
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS on user_devices table
ALTER TABLE IF EXISTS public.user_devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_devices
CREATE POLICY "Users can view their own devices" ON public.user_devices
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY "Users can manage their own devices" ON public.user_devices
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS on checkout_sessions table
ALTER TABLE IF EXISTS public.checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for checkout_sessions
CREATE POLICY "Users can view their own checkout sessions" ON public.checkout_sessions
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY "Users can create their own checkout sessions" ON public.checkout_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());
    
CREATE POLICY "Users can manage their own checkout sessions" ON public.checkout_sessions
    FOR ALL USING (user_id = auth.uid());

-- Enable RLS on feedback table
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feedback
CREATE POLICY "Users can view their own feedback" ON public.feedback
    FOR SELECT USING (user_id = auth.uid());
    
CREATE POLICY "Users can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK (user_id = auth.uid());
    
CREATE POLICY "Users can manage their own feedback" ON public.feedback
    FOR ALL USING (user_id = auth.uid());

-- 3. Fix Function Search Path Mutable issue
-- The register_user function already has search_path set in the previous migration

-- 4. Create RLS policies for tables that have RLS enabled but no policies
-- Create RLS policies for calls table
CREATE POLICY "Users can view calls they are part of" ON public.calls
    FOR SELECT USING (
        caller_id = auth.uid() OR callee_id = auth.uid()
    );
    
CREATE POLICY "Users can create calls" ON public.calls
    FOR INSERT WITH CHECK (
        caller_id = auth.uid()
    );
    
CREATE POLICY "Users can update calls they are part of" ON public.calls
    FOR UPDATE USING (
        caller_id = auth.uid() OR callee_id = auth.uid()
    );
    
CREATE POLICY "Users can delete calls they initiated" ON public.calls
    FOR DELETE USING (
        caller_id = auth.uid()
    );

-- Create RLS policies for message_attachments table
CREATE POLICY "Users can view attachments in conversations they are part of" ON public.message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_attachments.message_id
            AND cp.user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can add attachments to their own messages" ON public.message_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_attachments.message_id
            AND m.sender_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can manage attachments on their own messages" ON public.message_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_attachments.message_id
            AND m.sender_id = auth.uid()
        )
    );

-- Create RLS policies for message_edit_history table
CREATE POLICY "Users can view edit history of messages in conversations they are part of" ON public.message_edit_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_edit_history.message_id
            AND cp.user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can add edit history to their own messages" ON public.message_edit_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_edit_history.message_id
            AND m.sender_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can manage edit history of their own messages" ON public.message_edit_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_edit_history.message_id
            AND m.sender_id = auth.uid()
        )
    );