
-- Create the login_attempts table to track login attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on ip_address and created_at for faster queries
CREATE INDEX IF NOT EXISTS login_attempts_ip_created_idx ON public.login_attempts (ip_address, created_at);

-- Add RLS policies to control access to the login_attempts table
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to access the table
CREATE POLICY "Only authenticated users can access login attempts" ON public.login_attempts
  USING (auth.role() = 'authenticated');

-- Only administrators can insert into the login_attempts table
CREATE POLICY "Only authenticated users can insert login attempts" ON public.login_attempts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
