-- Create a public bucket for Activity Documents and Photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pulse_media',
  'pulse_media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- (RLS is already enabled on storage.objects by default in Supabase)

-- 1. Policy to allow ANYONE to read public objects
DROP POLICY IF EXISTS "Public access to pulse_media" ON storage.objects;
CREATE POLICY "Public access to pulse_media"
ON storage.objects FOR SELECT
USING (bucket_id = 'pulse_media');

-- 2. Policy to allow AUTHENTICATED users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload to pulse_media" ON storage.objects;
CREATE POLICY "Authenticated users can upload to pulse_media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pulse_media'
  AND auth.role() = 'authenticated'
);

-- 3. Policy to allow users to update their own files (optional)
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pulse_media'
  AND auth.uid() = owner
);

-- 4. Policy to allow users to delete their own files (optional)
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pulse_media'
  AND auth.uid() = owner
);
