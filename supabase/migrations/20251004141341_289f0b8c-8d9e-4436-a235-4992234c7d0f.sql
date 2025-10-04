-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'developer');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'developer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create developer_profiles table (PII isolated and encrypted)
CREATE TABLE public.developer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT,
  website_url TEXT,
  phone_number TEXT,
  address TEXT,
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.developer_profiles ENABLE ROW LEVEL SECURITY;

-- Create app_status enum
CREATE TYPE public.app_status AS ENUM ('draft', 'pending', 'published', 'rejected');

-- Create app_category enum
CREATE TYPE public.app_category AS ENUM (
  'games', 'social', 'productivity', 'entertainment', 
  'education', 'lifestyle', 'business', 'utilities', 'other'
);

-- Create applications table (metadata)
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES public.developer_profiles(user_id) ON DELETE CASCADE NOT NULL,
  app_name TEXT NOT NULL,
  package_name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  category app_category NOT NULL,
  version_code INTEGER NOT NULL DEFAULT 1,
  version_name TEXT NOT NULL DEFAULT '1.0.0',
  status app_status NOT NULL DEFAULT 'draft',
  apk_file_path TEXT,
  icon_url TEXT,
  screenshots TEXT[],
  downloads INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create submission_history table (versioning and audit trail)
CREATE TABLE public.submission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  version_code INTEGER NOT NULL,
  version_name TEXT NOT NULL,
  status app_status NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  apk_file_path TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.submission_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles (users can view their own roles)
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for developer_profiles
CREATE POLICY "Users can view own profile"
ON public.developer_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.developer_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.developer_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.developer_profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for applications
CREATE POLICY "Developers can view own apps"
ON public.applications FOR SELECT
TO authenticated
USING (auth.uid() = developer_id);

CREATE POLICY "Developers can insert own apps"
ON public.applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Developers can update own apps"
ON public.applications FOR UPDATE
TO authenticated
USING (auth.uid() = developer_id);

CREATE POLICY "Admins can view all apps"
ON public.applications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all apps"
ON public.applications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Published apps are viewable by all"
ON public.applications FOR SELECT
TO authenticated
USING (status = 'published');

-- RLS Policies for submission_history
CREATE POLICY "Developers can view own submission history"
ON public.submission_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.id = submission_history.application_id
    AND applications.developer_id = auth.uid()
  )
);

CREATE POLICY "Developers can insert submission history"
ON public.submission_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can view all submission history"
ON public.submission_history FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submission history"
ON public.submission_history FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for APK files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apk-files',
  'apk-files',
  false,
  524288000, -- 500MB limit
  ARRAY['application/vnd.android.package-archive', 'application/octet-stream']
);

-- Storage RLS policies for APK files
CREATE POLICY "Developers can upload own APKs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'apk-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Developers can view own APKs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'apk-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all APKs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'apk-files'
  AND public.has_role(auth.uid(), 'admin')
);

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-screenshots',
  'app-screenshots',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage RLS policies for screenshots (public bucket)
CREATE POLICY "Anyone can view screenshots"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-screenshots');

CREATE POLICY "Authenticated users can upload screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-screenshots');

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_developer_profiles_updated_at
  BEFORE UPDATE ON public.developer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to automatically create developer profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create developer profile
  INSERT INTO public.developer_profiles (user_id, gdpr_consent, marketing_consent)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'gdpr_consent')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false)
  );
  
  -- Assign developer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'developer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();