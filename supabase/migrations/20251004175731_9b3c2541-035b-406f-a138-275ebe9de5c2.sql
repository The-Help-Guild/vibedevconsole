-- Drop the overly restrictive anonymous access policy
DROP POLICY IF EXISTS "Block anonymous write access" ON public.applications;

-- Create proper policies to allow public read access to published apps
-- while blocking anonymous writes
CREATE POLICY "Anyone can view published apps"
ON public.applications
FOR SELECT
TO public
USING (status = 'published'::app_status);

-- Block anonymous INSERT
CREATE POLICY "Block anonymous inserts"
ON public.applications
FOR INSERT
TO anon
WITH CHECK (false);

-- Block anonymous UPDATE  
CREATE POLICY "Block anonymous updates"
ON public.applications
FOR UPDATE
TO anon
USING (false);

-- Block anonymous DELETE
CREATE POLICY "Block anonymous deletes"
ON public.applications
FOR DELETE
TO anon
USING (false);