-- Create drafts table for auto-saving campaign wizard progress
CREATE TABLE public.drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own drafts" 
ON public.drafts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drafts" 
ON public.drafts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts" 
ON public.drafts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts" 
ON public.drafts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamp updates
CREATE TRIGGER update_drafts_updated_at
BEFORE UPDATE ON public.drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create AI cache table for speed optimization
CREATE TABLE public.ai_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_hash TEXT NOT NULL UNIQUE,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX idx_ai_cache_prompt_hash ON public.ai_cache(prompt_hash);
CREATE INDEX idx_ai_cache_created_at ON public.ai_cache(created_at);

-- Enable RLS (public read for caching)
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI cache" 
ON public.ai_cache 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage AI cache" 
ON public.ai_cache 
FOR ALL 
USING (true)
WITH CHECK (true);