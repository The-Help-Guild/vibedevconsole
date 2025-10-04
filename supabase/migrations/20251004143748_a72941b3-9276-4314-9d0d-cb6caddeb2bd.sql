-- Fix function search_path for handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Add explicit anonymous denial policies
CREATE POLICY "Block anonymous access to profiles"
ON public.developer_profiles
FOR ALL
TO anon
USING (false);

CREATE POLICY "Block anonymous access to roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);

CREATE POLICY "Block anonymous access to submissions"
ON public.submission_history
FOR ALL
TO anon
USING (false);

-- Add DELETE policy for user_roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));