
-- Create table for call transcriptions
CREATE TABLE IF NOT EXISTS public.call_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  source TEXT DEFAULT 'ai' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add index for faster querying by call_id
CREATE INDEX IF NOT EXISTS idx_call_transcriptions_call_id ON public.call_transcriptions(call_id);

-- Enable Row Level Security
ALTER TABLE public.call_transcriptions ENABLE ROW LEVEL SECURITY;

-- Default policy to allow all operations (would typically be more restrictive in production)
CREATE POLICY "Allow all operations" ON public.call_transcriptions FOR ALL USING (true);
