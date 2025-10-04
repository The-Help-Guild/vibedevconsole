-- Create audit log table for tracking admin access to sensitive data
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_resource text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can insert audit logs (via app code)
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = admin_id);

-- Create index for faster queries
CREATE INDEX idx_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_target_user ON public.admin_audit_log(target_user_id);
CREATE INDEX idx_audit_log_created_at ON public.admin_audit_log(created_at DESC);

-- Update submission_history RLS to hide sensitive reviewer data from developers
DROP POLICY IF EXISTS "Developers can view own submission history" ON public.submission_history;

CREATE POLICY "Developers can view own submission history"
ON public.submission_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = submission_history.application_id
    AND applications.developer_id = auth.uid()
  )
);

-- Note: The above policy still allows developers to see all columns
-- We'll handle column-level filtering in the application code