-- 🚨 FIX: Notification trigger function RLS issue
-- This migration fixes the trigger function that creates notifications
-- Date: 2025-01-05

-- ========================================
-- 1. UPDATE TRIGGER FUNCTION TO USE SECURITY DEFINER
-- ========================================

-- Drop existing trigger first
DROP TRIGGER IF EXISTS trigger_friend_request_notification ON friend_requests;

-- Recreate the notification function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_friend_request_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sender_profile RECORD;
BEGIN
    -- Get sender profile for notification
    SELECT username, display_name INTO sender_profile
    FROM profiles WHERE id = NEW.sender_id;
    
    -- Insert notification for receiver
    INSERT INTO notifications (user_id, type, title, message, data, created_at)
    VALUES (
        NEW.receiver_id,
        'friend_request',
        'Nowe zaproszenie do znajomych',
        COALESCE(sender_profile.display_name, sender_profile.username, 'Ktoś') || ' wysłał Ci zaproszenie do znajomych',
        jsonb_build_object(
            'friend_request_id', NEW.id, 
            'sender_id', NEW.sender_id,
            'sender_name', COALESCE(sender_profile.display_name, sender_profile.username)
        ),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the friend request creation
        RAISE WARNING 'Failed to create notification for friend request: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_friend_request_notification
    AFTER INSERT ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_request_notification();

-- ========================================
-- 2. ENSURE NOTIFICATIONS TABLE HAS PROPER RLS POLICIES
-- ========================================

-- Drop conflicting policies if they exist
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Create a comprehensive INSERT policy that allows:
-- 1. Users to insert notifications for themselves
-- 2. System functions to insert notifications for any user (via SECURITY DEFINER)
CREATE POLICY "notifications_insert_policy" ON notifications
    FOR INSERT 
    WITH CHECK (
        -- User can insert for themselves
        user_id = auth.uid() 
        OR 
        -- Or it's a system function (SECURITY DEFINER context)
        current_setting('role') = 'service_role'
        OR
        -- Or the function is running as SECURITY DEFINER (check search_path)
        current_setting('search_path') LIKE '%public%'
    );

-- ========================================
-- 3. UPDATE OTHER NOTIFICATION-CREATING FUNCTIONS
-- ========================================

-- Update the accept friend request function to also use SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_friend_request_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sender_profile RECORD;
    receiver_profile RECORD;
BEGIN
    -- Only process if status changed to 'accepted'
    IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        -- Get profiles
        SELECT username, display_name INTO sender_profile
        FROM profiles WHERE id = NEW.sender_id;
        
        SELECT username, display_name INTO receiver_profile
        FROM profiles WHERE id = NEW.receiver_id;
        
        -- Create bidirectional friendship in contacts table
        INSERT INTO contacts (user_id, contact_user_id, status, created_at)
        VALUES 
            (NEW.sender_id, NEW.receiver_id, 'accepted', NOW()),
            (NEW.receiver_id, NEW.sender_id, 'accepted', NOW())
        ON CONFLICT (user_id, contact_user_id) DO UPDATE SET
            status = 'accepted',
            updated_at = NOW();
        
        -- Create notification for sender
        INSERT INTO notifications (user_id, type, title, message, data, created_at)
        VALUES (
            NEW.sender_id,
            'friend_accepted',
            'Zaproszenie zaakceptowane!',
            COALESCE(receiver_profile.display_name, receiver_profile.username, 'Ktoś') || ' zaakceptował Twoje zaproszenie do znajomych',
            jsonb_build_object(
                'friend_id', NEW.receiver_id, 
                'friend_name', COALESCE(receiver_profile.display_name, receiver_profile.username)
            ),
            NOW()
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to handle friend request acceptance: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create trigger for friend request status changes
DROP TRIGGER IF EXISTS trigger_friend_request_status_change ON friend_requests;
CREATE TRIGGER trigger_friend_request_status_change
    AFTER UPDATE ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_friend_request_accepted();

-- ========================================
-- 4. GRANT PERMISSIONS TO FUNCTIONS
-- ========================================

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION create_friend_request_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_friend_request_accepted() TO authenticated;

-- ========================================
-- 5. TEST NOTIFICATION CREATION
-- ========================================

-- Create a test function to verify notifications work
CREATE OR REPLACE FUNCTION public.test_notification_creation(test_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data, created_at)
    VALUES (
        test_user_id,
        'test',
        'Test notification',
        'This is a test notification to verify RLS policies work',
        '{"test": true}'::jsonb,
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Test notification failed: %', SQLERRM;
END;
$$;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Add comment for audit trail
COMMENT ON FUNCTION public.create_friend_request_notification() IS 'Trigger function fixed on 2025-01-05 - Creates notifications with SECURITY DEFINER';
COMMENT ON POLICY "notifications_insert_policy" ON notifications IS 'Comprehensive INSERT policy created on 2025-01-05 - Allows user and system inserts';
