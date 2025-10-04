-- Create app_reviews table for user ratings and comments
CREATE TABLE public.app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(application_id, user_id)
);

-- Enable RLS
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.app_reviews
FOR SELECT
USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Users can insert their own reviews"
ON public.app_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.app_reviews
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.app_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_app_reviews_updated_at
BEFORE UPDATE ON public.app_reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_app_reviews_application_id ON public.app_reviews(application_id);
CREATE INDEX idx_app_reviews_user_id ON public.app_reviews(user_id);

-- Function to update application rating based on reviews
CREATE OR REPLACE FUNCTION public.update_app_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.applications
  SET rating = (
    SELECT AVG(rating)::numeric(3,1)
    FROM public.app_reviews
    WHERE application_id = COALESCE(NEW.application_id, OLD.application_id)
  )
  WHERE id = COALESCE(NEW.application_id, OLD.application_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update app rating when reviews change
CREATE TRIGGER update_app_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.app_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_app_rating();