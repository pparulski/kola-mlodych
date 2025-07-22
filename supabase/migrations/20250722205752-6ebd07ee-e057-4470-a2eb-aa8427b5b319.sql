-- Add short_url column to news table for custom URL shortener
ALTER TABLE public.news 
ADD COLUMN short_url text UNIQUE;