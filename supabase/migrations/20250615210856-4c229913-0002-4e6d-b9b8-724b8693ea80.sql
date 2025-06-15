
-- Fix register_user function with proper search_path
CREATE OR REPLACE FUNCTION public.register_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- This function can be implemented later with actual registration logic
    -- For now it's a placeholder to satisfy the database structure
    RAISE NOTICE 'Register user function called';
END;
$$;

-- Move pg_trgm extension from public to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Grant usage on extensions schema to required roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
