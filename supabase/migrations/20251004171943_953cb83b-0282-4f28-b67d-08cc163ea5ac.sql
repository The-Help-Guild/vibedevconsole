-- Add more restrictive policy for developer_profiles to ensure only profile owner or admins can view PII
-- Drop the existing policy and create more specific ones

DROP POLICY IF EXISTS "Users can view own profile only" ON public.developer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.developer_profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON public.developer_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all profiles (for review purposes)
CREATE POLICY "Admins can view all profiles for moderation"
  ON public.developer_profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add comment documenting PII handling
COMMENT ON COLUMN public.developer_profiles.phone_number IS 'PII: Phone number stored for developer verification. Subject to 90-day retention policy.';
COMMENT ON COLUMN public.developer_profiles.address IS 'PII: Physical address stored for developer verification. Subject to 90-day retention policy.';

-- Add index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_developer_profiles_user_id ON public.developer_profiles(user_id);