-- Supabase registrations table schema definition
-- Create registrations table if not exists
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT NOT NULL,
    instagram TEXT NOT NULL,
    email TEXT NOT NULL,
    tier_selected TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending'::text NOT NULL
);

-- Index optimization for email and selected tier
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_tier_selected ON public.registrations(tier_selected);

-- Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to register via the public waitlist form
CREATE POLICY "Allow public insert registrations" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Restrict read permissions to authenticated users (admin dashboard)
CREATE POLICY "Allow authenticated read registrations" 
ON public.registrations 
FOR SELECT 
TO authenticated 
USING (true);
