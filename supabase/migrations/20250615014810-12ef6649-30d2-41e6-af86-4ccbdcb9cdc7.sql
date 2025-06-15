
-- Add unique constraint to prevent duplicate participants in conversations
ALTER TABLE conversation_participants 
ADD CONSTRAINT unique_user_conversation 
UNIQUE (user_id, conversation_id);

-- Add index for better performance on participant queries
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_conversation 
ON conversation_participants (user_id, conversation_id);
