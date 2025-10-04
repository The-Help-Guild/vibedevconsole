-- Make audit log immutable by explicitly denying UPDATE and DELETE operations
-- This ensures admins cannot tamper with audit records after creation

-- Deny UPDATE operations on audit logs (append-only)
CREATE POLICY "Audit logs cannot be modified"
ON public.admin_audit_log
FOR UPDATE
USING (false);

-- Deny DELETE operations on audit logs (permanent records)
CREATE POLICY "Audit logs cannot be deleted"
ON public.admin_audit_log
FOR DELETE
USING (false);

-- Add a comment to document this security measure
COMMENT ON TABLE public.admin_audit_log IS 'Immutable audit log for admin actions. Records cannot be modified or deleted to maintain integrity of audit trail.';