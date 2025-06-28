-- 🚨 FIX: Missing INSERT policy for notifications table
-- This migration adds the missing INSERT policy for notifications
-- Date: 2025-01-05

-- ========================================
-- 1. ADD MISSING INSERT POLICY
-- ========================================

-- Add INSERT policy for notifications table
-- Users should be able to create notifications for themselves
-- System functions should also be able to create notifications
CREATE POLICY "Users can insert their own notifications" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ========================================
-- 2. ADD POLICY FOR SYSTEM FUNCTIONS
-- ========================================

-- Allow system functions to insert notifications
-- This is needed for triggers and RPC functions
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ========================================
-- 3. GRANT NECESSARY PERMISSIONS
-- ========================================

-- Grant INSERT permission to authenticated users
GRANT INSERT ON notifications TO authenticated;

-- Grant INSERT permission to service role (for triggers/functions)
GRANT INSERT ON notifications TO service_role;

-- ========================================
-- 4. UPDATE EXISTING FUNCTIONS TO USE SECURITY DEFINER
-- ========================================

-- Update accept_friend_request function to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    friend_request_record RECORD;
    sender_profile RECORD;
    receiver_profile RECORD;
BEGIN
    -- Get the friend request details
    SELECT * INTO friend_request_record
    FROM friend_requests 
    WHERE id = request_id AND receiver_id = auth.uid() AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Friend request not found or not pending';
    END IF;
    
    -- Get sender and receiver profiles
    SELECT username, display_name INTO sender_profile
    FROM profiles WHERE id = friend_request_record.sender_id;
    
    SELECT username, display_name INTO receiver_profile  
    FROM profiles WHERE id = friend_request_record.receiver_id;
    
    -- Update the friend request status
    UPDATE friend_requests 
    SET status = 'accepted', updated_at = NOW()
    WHERE id = request_id;
    
    -- Create bidirectional friendship in contacts table
    INSERT INTO contacts (user_id, contact_user_id, status, created_at)
    VALUES 
        (friend_request_record.sender_id, friend_request_record.receiver_id, 'accepted', NOW()),
        (friend_request_record.receiver_id, friend_request_record.sender_id, 'accepted', NOW())
    ON CONFLICT (user_id, contact_user_id) DO UPDATE SET
        status = 'accepted',
        updated_at = NOW();
    
    -- Create notification for sender
    INSERT INTO notifications (user_id, type, title, message, data, created_at)
    VALUES (
        friend_request_record.sender_id,
        'friend_accepted',
        'Zaproszenie zaakceptowane!',
        (receiver_profile.display_name || receiver_profile.username) || ' zaakceptował(a) Twoje zaproszenie do znajomych',
        jsonb_build_object('friend_id', friend_request_record.receiver_id, 'friend_name', receiver_profile.display_name || receiver_profile.username),
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error accepting friend request: %', SQLERRM;
END;
$$;

-- Update reject_friend_request function to use SECURITY DEFINER  
CREATE OR REPLACE FUNCTION public.reject_friend_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    friend_request_record RECORD;
    receiver_profile RECORD;
BEGIN
    -- Get the friend request details
    SELECT * INTO friend_request_record
    FROM friend_requests 
    WHERE id = request_id AND receiver_id = auth.uid() AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Friend request not found or not pending';
    END IF;
    
    -- Get receiver profile
    SELECT username, display_name INTO receiver_profile
    FROM profiles WHERE id = friend_request_record.receiver_id;
    
    -- Update the friend request status
    UPDATE friend_requests 
    SET status = 'rejected', updated_at = NOW()
    WHERE id = request_id;
    
    -- Create notification for sender
    INSERT INTO notifications (user_id, type, title, message, data, created_at)
    VALUES (
        friend_request_record.sender_id,
        'friend_rejected', 
        'Zaproszenie odrzucone',
        (receiver_profile.display_name || receiver_profile.username) || ' odrzucił(a) Twoje zaproszenie do znajomych',
        jsonb_build_object('friend_id', friend_request_record.receiver_id, 'friend_name', receiver_profile.display_name || receiver_profile.username),
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error rejecting friend request: %', SQLERRM;
END;
$$;

-- ========================================
-- 5. CREATE MISSING delete_friend_request FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION public.delete_friend_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Delete the friend request (only sender or receiver can delete)
    DELETE FROM friend_requests 
    WHERE id = request_id 
    AND (sender_id = auth.uid() OR receiver_id = auth.uid());
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Friend request not found or access denied';
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error deleting friend request: %', SQLERRM;
END;
$$;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Add comment for audit trail
COMMENT ON POLICY "Users can insert their own notifications" ON notifications IS 'RLS policy fix applied on 2025-01-05 - Users can create notifications';
COMMENT ON POLICY "System can insert notifications" ON notifications IS 'RLS policy fix applied on 2025-01-05 - System functions can create notifications';
