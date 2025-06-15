
-- Dodaj brakujące kolumny do tabeli friend_requests
ALTER TABLE friend_requests 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'friend_request' CHECK (type IN ('friend_request')),
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Nowe zaproszenie do znajomych',
ADD COLUMN IF NOT EXISTS message TEXT DEFAULT 'Otrzymałeś zaproszenie do znajomych',
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';

-- Dodaj brakujące kolumny do tabeli notifications  
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'friend_request' CHECK (type IN ('friend_request', 'friend_accepted', 'message', 'call')),
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS message TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';

-- Dodaj indeksy dla lepszej wydajności
CREATE INDEX IF NOT EXISTS idx_friend_requests_status_receiver ON friend_requests(status, receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status_sender ON friend_requests(status, sender_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status_user ON contacts(status, user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status_contact ON contacts(status, contact_user_id);

-- Funkcja do usuwania kontaktu
CREATE OR REPLACE FUNCTION delete_contact(contact_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcja do usuwania zaproszenia
CREATE OR REPLACE FUNCTION delete_friend_request(request_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM friend_requests 
  WHERE id = request_id AND (sender_id = auth.uid() OR receiver_id = auth.uid());
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or not authorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Zaktualizuj funkcję accept_friend_request aby prawidłowo obsługiwać attempt_count
CREATE OR REPLACE FUNCTION accept_friend_request(request_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Zaktualizuj funkcję reject_friend_request aby obsługiwać attempt_count
CREATE OR REPLACE FUNCTION reject_friend_request(request_id UUID)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
