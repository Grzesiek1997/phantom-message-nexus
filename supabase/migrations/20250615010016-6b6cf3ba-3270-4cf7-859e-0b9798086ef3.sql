
-- Create friend requests table for proper friend invitation system
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  attempt_count INTEGER DEFAULT 1 CHECK (attempt_count <= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Create notifications table for friend requests and other notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'message', 'call')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- Enable RLS on new tables
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for friend_requests
CREATE POLICY "Users can view their own friend requests" ON friend_requests
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can create friend requests" ON friend_requests
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update received friend requests" ON friend_requests
  FOR UPDATE USING (receiver_id = auth.uid());

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Function to create notification when friend request is sent
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger for friend request notifications
CREATE TRIGGER trigger_friend_request_notification
  AFTER INSERT ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_friend_request_notification();

-- Function to handle friend request acceptance
CREATE OR REPLACE FUNCTION accept_friend_request(request_id UUID)
RETURNS VOID AS $$
DECLARE
  request_record friend_requests%ROWTYPE;
BEGIN
  -- Get the friend request
  SELECT * INTO request_record FROM friend_requests WHERE id = request_id AND receiver_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or not authorized';
  END IF;

  -- Update friend request status
  UPDATE friend_requests SET status = 'accepted', updated_at = NOW() WHERE id = request_id;
  
  -- Add both users as contacts
  INSERT INTO contacts (user_id, contact_user_id, status) 
  VALUES (request_record.sender_id, request_record.receiver_id, 'accepted')
  ON CONFLICT (user_id, contact_user_id) DO UPDATE SET status = 'accepted';
  
  INSERT INTO contacts (user_id, contact_user_id, status) 
  VALUES (request_record.receiver_id, request_record.sender_id, 'accepted')
  ON CONFLICT (user_id, contact_user_id) DO UPDATE SET status = 'accepted';
  
  -- Create notification for sender
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

-- Function to reject friend request and increment attempt count
CREATE OR REPLACE FUNCTION reject_friend_request(request_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE friend_requests 
  SET status = 'rejected', updated_at = NOW()
  WHERE id = request_id AND receiver_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or not authorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
