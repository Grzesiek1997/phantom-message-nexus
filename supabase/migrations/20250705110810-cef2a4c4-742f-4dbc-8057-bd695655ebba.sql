
-- Sprawdzenie i naprawa tabeli profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Dodanie unikalnego ograniczenia dla email jeśli nie istnieje
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_email_key'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
    END IF;
END $$;

-- Dodanie unikalnego ograniczenia dla username jeśli nie istnieje
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_username_key'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Naprawienie tabeli friend_requests
ALTER TABLE public.friend_requests 
DROP CONSTRAINT IF EXISTS friend_requests_status_check;

ALTER TABLE public.friend_requests 
ADD CONSTRAINT friend_requests_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Dodanie unikalnego ograniczenia dla friend_requests
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'friend_requests_sender_receiver_unique'
    ) THEN
        ALTER TABLE public.friend_requests 
        ADD CONSTRAINT friend_requests_sender_receiver_unique 
        UNIQUE(sender_id, receiver_id);
    END IF;
END $$;

-- Utworzenie tabeli friendships jeśli nie istnieje
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Utworzenie tabeli user_presence jeśli nie istnieje
CREATE TABLE IF NOT EXISTS public.user_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  status text CHECK (status IN ('online', 'offline', 'away', 'busy')) DEFAULT 'offline',
  last_active_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS Policies dla friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships" ON public.friendships
FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can create friendships" ON public.friendships
FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can delete their friendships" ON public.friendships
FOR DELETE USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- RLS Policies dla user_presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all presence" ON public.user_presence
FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON public.user_presence
FOR ALL USING (user_id = auth.uid());

-- Funkcja dla automatycznego tworzenia friendships po akceptacji zaproszenia
CREATE OR REPLACE FUNCTION public.handle_friend_request_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- Jeśli status zmienił się na 'accepted', utwórz friendship
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.friendships (user1_id, user2_id)
    VALUES (
      LEAST(NEW.sender_id, NEW.receiver_id),
      GREATEST(NEW.sender_id, NEW.receiver_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger dla automatycznego tworzenia friendships
DROP TRIGGER IF EXISTS friend_request_accepted_trigger ON public.friend_requests;
CREATE TRIGGER friend_request_accepted_trigger
  AFTER UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_friend_request_accepted();

-- Włączenie realtime dla kluczowych tabel
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Dodanie indeksów dla wydajności
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_status ON public.friend_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_status ON public.friend_requests(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON public.friendships(user1_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON public.friendships(user2_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON public.user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
