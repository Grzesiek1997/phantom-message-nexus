-- 🚨 CRITICAL SECURITY FIX: register_user Function
-- This migration fixes the register_user function security issue
-- Date: 2025-01-05
-- Fixes: Function name "public.register_user" is not unique error

-- ========================================
-- 1. IDENTIFY AND FIX REGISTER_USER FUNCTIONS
-- ========================================

-- Drop all register_user functions (regardless of signature)
DO $$ 
DECLARE 
    func_record RECORD;
BEGIN
    -- Find and drop all register_user functions
    FOR func_record IN (
        SELECT 
            p.oid,
            p.proname,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.proname = 'register_user'
    ) LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.register_user(%s)', func_record.args);
        RAISE NOTICE 'Dropped function register_user(%)', func_record.args;
    END LOOP;
END $$;

-- ========================================
-- 2. CREATE SECURE REGISTER_USER FUNCTION
-- ========================================

-- Create new secure register_user function with proper search path
CREATE OR REPLACE FUNCTION public.register_user(
    user_id UUID,
    email TEXT,
    full_name TEXT DEFAULT NULL,
    avatar_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    new_profile_id UUID;
BEGIN
    -- Input validation
    IF user_id IS NULL OR email IS NULL THEN
        RAISE EXCEPTION 'user_id and email are required';
    END IF;

    IF NOT email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format';
    END IF;

    -- Insert into profiles table
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        email,
        COALESCE(full_name, split_part(email, '@', 1)),
        avatar_url,
        NOW(),
        NOW()
    )
    RETURNING id INTO new_profile_id;

    -- Insert into users table if it exists and doesn't have the user
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        INSERT INTO public.users (
            id,
            email,
            created_at
        ) VALUES (
            user_id,
            email,
            NOW()
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN new_profile_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'User with this email already exists';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to register user: %', SQLERRM;
END;
$$;

-- ========================================
-- 3. SET PROPER PERMISSIONS
-- ========================================

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.register_user(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Revoke from anon users for security
REVOKE EXECUTE ON FUNCTION public.register_user(UUID, TEXT, TEXT, TEXT) FROM anon;

-- ========================================
-- 4. CREATE TRIGGER FOR AUTO REGISTRATION
-- ========================================

-- Function to handle new user registration via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Auto-register user when they sign up
    PERFORM public.register_user(
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the authentication
        RAISE WARNING 'Failed to auto-register user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 5. ADDITIONAL SECURITY MEASURES
-- ========================================

-- Create function to safely get user profile
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID DEFAULT auth.uid())
RETURNS SETOF public.profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM public.profiles 
    WHERE id = COALESCE(user_id, auth.uid())
    AND id = auth.uid(); -- Ensure users can only get their own profile
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Add comment for audit trail
COMMENT ON FUNCTION public.register_user(UUID, TEXT, TEXT, TEXT) IS 'Secure user registration function - fixed on 2025-01-05';
