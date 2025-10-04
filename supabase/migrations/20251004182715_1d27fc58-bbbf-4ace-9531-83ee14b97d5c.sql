-- Fix search_path for cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.auth_rate_limits 
  WHERE attempted_at < now() - interval '24 hours';
$$;