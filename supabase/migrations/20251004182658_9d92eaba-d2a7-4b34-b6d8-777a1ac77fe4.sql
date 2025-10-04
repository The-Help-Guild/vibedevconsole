-- Create table for authentication rate limiting
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('login', 'signup')),
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_lookup 
ON public.auth_rate_limits(identifier, action, attempted_at DESC);

-- Enable RLS
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (managed by edge function)
CREATE POLICY "Service role only" ON public.auth_rate_limits
FOR ALL USING (false);

-- Auto-cleanup old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.auth_rate_limits 
  WHERE attempted_at < now() - interval '24 hours';
$$;

-- Optional: Schedule cleanup via pg_cron (requires pg_cron extension)
-- This will be set up separately if needed