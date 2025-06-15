
-- Usunięcie błędnych (rekurencyjnych) polityk:
DROP POLICY IF EXISTS "Users can view participants of conversations they are in" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can remove themselves from conversations" ON public.conversation_participants;

-- Odświeżone, bezpieczne polityki:
CREATE POLICY "Users can view participants of conversations they are in"
  ON public.conversation_participants
  FOR SELECT
  USING (public.is_member_of(conversation_id));

CREATE POLICY "Users can add participants to conversations"
  ON public.conversation_participants
  FOR INSERT
  WITH CHECK (public.is_member_of(conversation_id));

CREATE POLICY "Users can remove themselves from conversations"
  ON public.conversation_participants
  FOR DELETE
  USING (user_id = auth.uid());
