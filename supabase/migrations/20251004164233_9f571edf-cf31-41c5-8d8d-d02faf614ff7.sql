-- Create RLS policies for apk-files storage bucket
-- Policy: Developers can upload APK files to their own folder
CREATE POLICY "Developers can upload own APK files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'apk-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Developers can read their own APK files
CREATE POLICY "Developers can read own APK files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'apk-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can read all APK files
CREATE POLICY "Admins can read all APK files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'apk-files' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Anyone can download APKs from published apps
CREATE POLICY "Published app APKs are downloadable"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'apk-files'
  AND EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.apk_file_path = storage.objects.name
      AND applications.status = 'published'
  )
);

-- Create apk_downloads audit table for tracking downloads
CREATE TABLE public.apk_downloads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  apk_file_path text NOT NULL,
  downloaded_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text
);

-- Enable RLS on apk_downloads
ALTER TABLE public.apk_downloads ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all download logs
CREATE POLICY "Admins can view all download logs"
ON public.apk_downloads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Policy: Users can view their own download history
CREATE POLICY "Users can view own download history"
ON public.apk_downloads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert download logs
CREATE POLICY "Users can log downloads"
ON public.apk_downloads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Block anonymous access to download logs
CREATE POLICY "Block anonymous access to download logs"
ON public.apk_downloads
FOR ALL
TO anon
USING (false);

-- Add index for performance
CREATE INDEX idx_apk_downloads_user_id ON public.apk_downloads(user_id);
CREATE INDEX idx_apk_downloads_application_id ON public.apk_downloads(application_id);

-- Add comment documenting the security model
COMMENT ON TABLE public.apk_downloads IS 'Audit log for APK downloads. Tracks who downloaded what and when for analytics and abuse detection.';