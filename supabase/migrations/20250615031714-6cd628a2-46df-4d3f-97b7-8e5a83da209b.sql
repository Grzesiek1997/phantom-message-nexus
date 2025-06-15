
-- Tabela dla statusów użytkowników (online/offline/away/busy)
CREATE TABLE public.user_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away', 'busy')),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  custom_status TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela dla przechowywania kluczy szyfrowania użytkowników
CREATE TABLE public.user_encryption_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  public_key TEXT NOT NULL,
  key_type TEXT NOT NULL DEFAULT 'rsa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Tabela dla typowania (user is typing...)
CREATE TABLE public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  is_typing BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela dla zaznaczania wiadomości jako przeczytanych
CREATE TABLE public.message_read_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Tabela dla plików i załączników
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela dla historii edycji wiadomości
CREATE TABLE public.message_edit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  previous_content TEXT NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_by UUID NOT NULL
);

-- Tabela dla powiadomień push
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Tabela dla sesji użytkowników (do śledzenia aktywnych sesji)
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  device_info JSONB,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Dodanie indeksów dla lepszej wydajności
CREATE INDEX idx_user_status_user_id ON public.user_status(user_id);
CREATE INDEX idx_user_status_status ON public.user_status(status);
CREATE INDEX idx_typing_indicators_conversation_id ON public.typing_indicators(conversation_id);
CREATE INDEX idx_typing_indicators_user_id ON public.typing_indicators(user_id);
CREATE INDEX idx_message_read_status_message_id ON public.message_read_status(message_id);
CREATE INDEX idx_message_read_status_user_id ON public.message_read_status(user_id);
CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active);

-- Dodanie ograniczeń klucza obcego
ALTER TABLE public.user_status ADD CONSTRAINT fk_user_status_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_encryption_keys ADD CONSTRAINT fk_user_encryption_keys_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.typing_indicators ADD CONSTRAINT fk_typing_indicators_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.typing_indicators ADD CONSTRAINT fk_typing_indicators_conversation_id 
  FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE public.message_read_status ADD CONSTRAINT fk_message_read_status_message_id 
  FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;

ALTER TABLE public.message_read_status ADD CONSTRAINT fk_message_read_status_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.message_attachments ADD CONSTRAINT fk_message_attachments_message_id 
  FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;

ALTER TABLE public.message_edit_history ADD CONSTRAINT fk_message_edit_history_message_id 
  FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;

ALTER TABLE public.message_edit_history ADD CONSTRAINT fk_message_edit_history_edited_by 
  FOREIGN KEY (edited_by) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.push_subscriptions ADD CONSTRAINT fk_push_subscriptions_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_sessions ADD CONSTRAINT fk_user_sessions_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Włączenie RLS (Row Level Security) dla wszystkich tabel
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla user_status
CREATE POLICY "Users can view all user statuses" ON public.user_status FOR SELECT USING (true);
CREATE POLICY "Users can update own status" ON public.user_status 
  FOR ALL USING (auth.uid() = user_id);

-- Polityki RLS dla user_encryption_keys
CREATE POLICY "Users can view own encryption keys" ON public.user_encryption_keys 
  FOR ALL USING (auth.uid() = user_id);

-- Polityki RLS dla typing_indicators
CREATE POLICY "Users can view typing in their conversations" ON public.typing_indicators 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = typing_indicators.conversation_id 
      AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own typing status" ON public.typing_indicators 
  FOR ALL USING (auth.uid() = user_id);

-- Polityki RLS dla message_read_status
CREATE POLICY "Users can view read status for their messages" ON public.message_read_status 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_read_status.message_id 
      AND cp.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own read status" ON public.message_read_status 
  FOR ALL USING (auth.uid() = user_id);

-- Polityki RLS dla message_attachments
CREATE POLICY "Users can view attachments in their conversations" ON public.message_attachments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_attachments.message_id 
      AND cp.user_id = auth.uid()
    )
  );

-- Polityki RLS dla message_edit_history
CREATE POLICY "Users can view edit history for their messages" ON public.message_edit_history 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_edit_history.message_id 
      AND cp.user_id = auth.uid()
    )
  );

-- Polityki RLS dla push_subscriptions
CREATE POLICY "Users can manage own push subscriptions" ON public.push_subscriptions 
  FOR ALL USING (auth.uid() = user_id);

-- Polityki RLS dla user_sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions 
  FOR ALL USING (auth.uid() = user_id);

-- Funkcja do automatycznego czyszczenia starych sesji
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_sessions 
  WHERE expires_at < NOW() OR (last_activity < NOW() - INTERVAL '30 days');
END;
$$;

-- Funkcja do automatycznego usuwania starych wskaźników typowania
CREATE OR REPLACE FUNCTION public.cleanup_typing_indicators()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.typing_indicators 
  WHERE updated_at < NOW() - INTERVAL '10 seconds';
END;
$$;

-- Włączenie realtime dla nowych tabel
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_read_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_attachments;
