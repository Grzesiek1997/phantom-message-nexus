-- 🚨 BACKUP: Simple friend request functions
-- This migration creates simplified versions of friend request functions
-- that avoid complex RLS issues with notifications
-- Date: 2025-01-05

-- ========================================
-- 1. SIMPLE ACCEPT FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION public.accept_friend_request_simple(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    friend_request_record RECORD;
BEGIN
    -- Get the friend request details
    SELECT * INTO friend_request_record
    FROM friend_requests 
    WHERE id = request_id AND receiver_id = auth.uid() AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Friend request not found or not pending';
    END IF;
    
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
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error accepting friend request: %', SQLERRM;
END;
$$;

-- ========================================
-- 2. SIMPLE REJECT FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION public.reject_friend_request_simple(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update the friend request status
    UPDATE friend_requests 
    SET status = 'rejected', updated_at = NOW()
    WHERE id = request_id AND receiver_id = auth.uid() AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Friend request not found or not pending';
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error rejecting friend request: %', SQLERRM;
END;
$$;

-- ========================================
-- 3. SIMPLE DELETE FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION public.delete_friend_request_simple(request_id UUID)
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
-- 4. GRANT PERMISSIONS
-- ========================================

GRANT EXECUTE ON FUNCTION public.accept_friend_request_simple(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_friend_request_simple(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_friend_request_simple(UUID) TO authenticated;

-- ========================================
-- 5. CREATE SAFE CONTACT CREATION FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION public.create_friendship_safe(friend_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create bidirectional friendship
    INSERT INTO contacts (user_id, contact_user_id, status, created_at)
    VALUES 
        (auth.uid(), friend_id, 'accepted', NOW()),
        (friend_id, auth.uid(), 'accepted', NOW())
    ON CONFLICT (user_id, contact_user_id) DO UPDATE SET
        status = 'accepted',
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create friendship: %', SQLERRM;
        RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_friendship_safe(UUID) TO authenticated;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

COMMENT ON FUNCTION public.accept_friend_request_simple(UUID) IS 'Simple friend request acceptance without notifications - emergency fix 2025-01-05';
COMMENT ON FUNCTION public.reject_friend_request_simple(UUID) IS 'Simple friend request rejection without notifications - emergency fix 2025-01-05';
COMMENT ON FUNCTION public.delete_friend_request_simple(UUID) IS 'Simple friend request deletion without notifications - emergency fix 2025-01-05';
