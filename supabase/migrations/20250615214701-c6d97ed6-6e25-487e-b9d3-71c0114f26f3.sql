
-- BOT COMMANDS (admin-only)
CREATE POLICY "Admins full access to bot_commands" ON public.bot_commands
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- BOT INTERACTIONS (admin-only)
CREATE POLICY "Admins full access to bot_interactions" ON public.bot_interactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- CHANNEL ADMINS (admin-only)
CREATE POLICY "Admins full access to channel_admins" ON public.channel_admins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- CONVERSATION ANALYTICS (admin-only)
CREATE POLICY "Admins full access to conversation_analytics" ON public.conversation_analytics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- DECRYPTION FAILURES (admin-only)
CREATE POLICY "Admins full access to decryption_failures" ON public.decryption_failures
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- DISAPPEARING MESSAGES QUEUE (admin-only)
CREATE POLICY "Admins full access to disappearing_messages_queue" ON public.disappearing_messages_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- GROUP CHATS (admin-only)
CREATE POLICY "Admins full access to group_chats" ON public.group_chats
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- KEY EXCHANGE SESSIONS (admin-only)
CREATE POLICY "Admins full access to key_exchange_sessions" ON public.key_exchange_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- LIVE LOCATION UPDATES (admin-only)
CREATE POLICY "Admins full access to live_location_updates" ON public.live_location_updates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- MESSAGE STATUS (admin-only)
CREATE POLICY "Admins full access to message_status" ON public.message_status
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- POLL OPTIONS (admin-only)
CREATE POLICY "Admins full access to poll_options" ON public.poll_options
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- POLLS (admin-only)
CREATE POLICY "Admins full access to polls" ON public.polls
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );

-- VOICE MESSAGES (admin-only)
CREATE POLICY "Admins full access to voice_messages" ON public.voice_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
  );
