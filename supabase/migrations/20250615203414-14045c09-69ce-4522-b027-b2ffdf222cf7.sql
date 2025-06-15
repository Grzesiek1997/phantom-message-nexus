
-- Enable RLS on biometric_data and restrict to each user
ALTER TABLE public.biometric_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own biometric data" ON public.biometric_data
  FOR ALL USING (user_id = auth.uid());

-- Enable RLS on biometric_auth_attempts and restrict to each user
ALTER TABLE public.biometric_auth_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and insert their own auth attempts" ON public.biometric_auth_attempts
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own auth attempts" ON public.biometric_auth_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Enable RLS on biometric_settings and restrict to each user
ALTER TABLE public.biometric_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own biometric settings" ON public.biometric_settings
  FOR ALL USING (user_id = auth.uid());
