-- Security Enhancement: Block anonymous write access to applications
CREATE POLICY "Block anonymous write access"
ON public.applications
FOR ALL
TO anon
USING (false);

-- Security Enhancement: Add DELETE policies for applications
CREATE POLICY "Developers can delete own draft apps"
ON public.applications
FOR DELETE
USING (
  auth.uid() = developer_id 
  AND status = 'draft'::app_status
);

CREATE POLICY "Admins can delete any app"
ON public.applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));