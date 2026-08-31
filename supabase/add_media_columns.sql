ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS photos JSONB[] DEFAULT '{}';
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS documents JSONB[] DEFAULT '{}';
