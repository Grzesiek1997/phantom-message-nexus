
-- Fix function search path mutable warnings by setting search_path in all functions

CREATE OR REPLACE FUNCTION public.increment_subscriber_count(p_channel_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
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
SET search_path TO 'public'
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
SET search_path TO 'public'
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
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.create_group_chat(group_name text, user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    new_group_chat_id uuid;
BEGIN
    INSERT INTO public.group_chats (name, created_at)
    VALUES (group_name, now())
    RETURNING id INTO new_group_chat_id;

    INSERT INTO public.group_chat_members (group_chat_id, user_id, joined_at)
    VALUES (new_group_chat_id, user_id, now());

    RETURN new_group_chat_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_friend_request_notification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    NEW.receiver_id,
    'friend_request',
    'Nowe zaproszenie do znajomych',
    'Otrzymałeś zaproszenie do znajomych',
    json_build_object('friend_request_id', NEW.id, 'sender_id', NEW.sender_id)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record friend_requests%ROWTYPE;
BEGIN
  -- Pobierz zaproszenie
  SELECT * INTO request_record FROM friend_requests WHERE id = request_id AND receiver_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or not authorized';
  END IF;

  -- Zaktualizuj status zaproszenia
  UPDATE friend_requests SET status = 'accepted', updated_at = NOW() WHERE id = request_id;

  -- Dodaj oba kontakty
  INSERT INTO contacts (user_id, contact_user_id, status)
  VALUES (request_record.sender_id, request_record.receiver_id, 'accepted')
  ON CONFLICT (user_id, contact_user_id) DO UPDATE SET status = 'accepted';

  INSERT INTO contacts (user_id, contact_user_id, status)
  VALUES (request_record.receiver_id, request_record.sender_id, 'accepted')
  ON CONFLICT (user_id, contact_user_id) DO UPDATE SET status = 'accepted';

  -- Utwórz powiadomienie dla nadawcy
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    request_record.sender_id,
    'friend_accepted',
    'Zaproszenie zaakceptowane',
    'Twoje zaproszenie do znajomych zostało zaakceptowane',
    json_build_object('friend_id', request_record.receiver_id)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_friend_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record friend_requests%ROWTYPE;
  current_attempts INTEGER;
BEGIN
  -- Pobierz dane zaproszenia
  SELECT * INTO request_record FROM friend_requests WHERE id = request_id AND receiver_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or not authorized';
  END IF;

  -- Sprawdź ile już było prób od tego użytkownika
  SELECT COALESCE(SUM(attempt_count), 0) INTO current_attempts
  FROM friend_requests
  WHERE sender_id = request_record.sender_id
    AND receiver_id = request_record.receiver_id
    AND status = 'rejected';

  -- Zaktualizuj status na odrzucone
  UPDATE friend_requests
  SET status = 'rejected', updated_at = NOW(), attempt_count = request_record.attempt_count
  WHERE id = request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_user()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    -- Function logic here
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_contact(contact_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contact_record contacts%ROWTYPE;
BEGIN
  -- Pobierz dane kontaktu
  SELECT * INTO contact_record FROM contacts WHERE id = contact_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contact not found or not authorized';
  END IF;

  -- Usuń kontakt w obu kierunkach
  DELETE FROM contacts WHERE (user_id = auth.uid() AND contact_user_id = contact_record.contact_user_id)
                         OR (user_id = contact_record.contact_user_id AND contact_user_id = auth.uid());

  -- Usuń powiązane zaproszenia
  DELETE FROM friend_requests WHERE (sender_id = auth.uid() AND receiver_id = contact_record.contact_user_id)
                                 OR (sender_id = contact_record.contact_user_id AND receiver_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_friend_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM friend_requests
  WHERE id = request_id AND (sender_id = auth.uid() OR receiver_id = auth.uid());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or not authorized';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_message(conversation_id uuid, sender_id uuid, content text)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.messages (conversation_id, sender_id, content, created_at)
  VALUES (conversation_id, sender_id, content, now());
END;
$$;

CREATE OR REPLACE FUNCTION public.are_users_friends(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.is_conversation_member(conversation_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conversation_uuid AND user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.user_sessions
  WHERE expires_at < NOW() OR (last_activity < NOW() - INTERVAL '30 days');
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_typing_indicators()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.typing_indicators
  WHERE updated_at < NOW() - INTERVAL '10 seconds';
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_disappearing_messages()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired messages and their attachments
  WITH deleted_messages AS (
    DELETE FROM public.messages
    WHERE expires_at < NOW() AND expires_at IS NOT NULL
    RETURNING id
  )
  DELETE FROM public.message_attachments
  WHERE message_id IN (SELECT id FROM deleted_messages);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Update disappearing queue
  UPDATE public.disappearing_messages_queue
  SET processed = TRUE
  WHERE delete_at < NOW() AND processed = FALSE;

  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_safety_number(user1_uuid uuid, user2_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  user1_key TEXT;
  user2_key TEXT;
  combined_keys TEXT;
BEGIN
  -- Get identity keys for both users
  SELECT identity_key INTO user1_key FROM public.profiles WHERE id = user1_uuid;
  SELECT identity_key INTO user2_key FROM public.profiles WHERE id = user2_uuid;

  IF user1_key IS NULL OR user2_key IS NULL THEN
    RETURN NULL;
  END IF;

  -- Combine keys in consistent order (smaller UUID first)
  IF user1_uuid < user2_uuid THEN
    combined_keys := user1_key || user2_key;
  ELSE
    combined_keys := user2_key || user1_key;
  END IF;

  -- Generate 60-digit safety number from hash
  RETURN SUBSTRING(ENCODE(DIGEST(combined_keys, 'sha256'), 'hex'), 1, 60);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_activity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_at = NEW.created_at,
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_stories WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_scheduled_messages()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
