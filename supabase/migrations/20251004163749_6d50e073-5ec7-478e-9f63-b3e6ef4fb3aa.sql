-- Drop existing policies on developer_profiles to recreate them with better security
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.developer_profiles;
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.developer_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.developer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.developer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.developer_profiles;

-- Create more secure PERMISSIVE policies that explicitly control access
-- Only authenticated users can see their own profile data including sensitive fields
CREATE POLICY "Users can view own profile only"
ON public.developer_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all profiles (needed for admin dashboard functionality)
CREATE POLICY "Admins can view all profiles"
ON public.developer_profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can only insert their own profile during registration
CREATE POLICY "Users can insert own profile only"
ON public.developer_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile only"
ON public.developer_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicitly block all anonymous access
CREATE POLICY "Block all anonymous access"
ON public.developer_profiles
FOR ALL
TO anon
USING (false);

-- Add comment documenting the security model
COMMENT ON TABLE public.developer_profiles IS 'Developer profiles with PII. RLS enforces: users can only access their own data, admins can access all data for moderation purposes. All admin access should be audited via admin_audit_log table.';