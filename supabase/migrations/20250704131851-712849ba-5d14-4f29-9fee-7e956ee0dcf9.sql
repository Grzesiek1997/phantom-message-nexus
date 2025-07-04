-- Rozszerzenie schematu bazy danych - dodanie brakujących kolumn do tabeli messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to_id uuid;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS thread_root_id uuid;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Utworzenie funkcji do automatycznego ustawiania created_at na podstawie sent_at
CREATE OR REPLACE FUNCTION sync_message_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at = NEW.sent_at;
  END IF;
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at = NEW.sent_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla automatycznego ustawiania timestamps
DROP TRIGGER IF EXISTS sync_message_timestamps_trigger ON public.messages;
CREATE TRIGGER sync_message_timestamps_trigger
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION sync_message_timestamps();

-- Zaktualizuj istniejące rekordy
UPDATE public.messages 
SET 
  created_at = sent_at,
  updated_at = sent_at
WHERE created_at IS NULL OR updated_at IS NULL;

-- Dodanie bucket dla załączników wiadomości
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Polityki dla storage bucket message-attachments
CREATE POLICY "Users can upload message attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'message-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view message attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'message-attachments');

CREATE POLICY "Users can delete their message attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'message-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Dodanie RLS policies dla tabeli messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT USING (
  conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their conversations" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON public.messages
FOR DELETE USING (sender_id = auth.uid());