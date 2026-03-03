-- Create the user-documents bucket as private (not public) if it doesn't exist.
-- The upsert-style insert prevents errors if already created via the dashboard.
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing policies so this migration is idempotent.
DROP POLICY IF EXISTS "Users can upload own documents"   ON storage.objects;
DROP POLICY IF EXISTS "Users can read own documents"     ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents"   ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents"   ON storage.objects;

-- Files are stored at {authId}/{stepSlug}/{timestamp}-{filename}.
-- (storage.foldername(name))[1] returns the first path segment, which is the authId.

-- INSERT: authenticated user may only upload into their own folder.
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- SELECT: authenticated user may only read files in their own folder.
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- UPDATE: authenticated user may only update files in their own folder.
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE: authenticated user may only delete files in their own folder.
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
