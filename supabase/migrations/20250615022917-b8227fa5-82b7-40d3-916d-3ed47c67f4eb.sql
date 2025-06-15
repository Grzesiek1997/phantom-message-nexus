
-- Sprawdź czy tabela conversations ma wszystkie potrzebne kolumny
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Sprawdź czy tabela conversation_participants ma prawidłowe indeksy
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);

-- Dodaj RLS policies dla conversation_participants jeśli ich brakuje
DROP POLICY IF EXISTS "Users can view their conversation participants" ON conversation_participants;
CREATE POLICY "Users can view their conversation participants" ON conversation_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
    AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can add conversation participants" ON conversation_participants;
CREATE POLICY "Users can add conversation participants" ON conversation_participants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND c.created_by = auth.uid()
  )
);

-- Dodaj RLS policies dla conversations jeśli ich brakuje
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = id
    AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
FOR INSERT WITH CHECK (created_by = auth.uid());

-- Dodaj RLS policies dla messages jeśli ich brakuje
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
CREATE POLICY "Users can send messages to their conversations" ON messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
    AND cp.user_id = auth.uid()
  )
);

-- Dodaj funkcję do sprawdzania czy użytkownicy są znajomymi
CREATE OR REPLACE FUNCTION are_users_friends(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM contacts 
    WHERE user_id = user1_id 
    AND contact_user_id = user2_id 
    AND status = 'accepted'
  ) AND EXISTS (
    SELECT 1 FROM contacts 
    WHERE user_id = user2_id 
    AND contact_user_id = user1_id 
    AND status = 'accepted'
  );
$$;
