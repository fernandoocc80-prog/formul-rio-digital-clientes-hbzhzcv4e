-- Revert Storage Bucket to public mode
UPDATE storage.buckets
SET public = true
WHERE id = 'documents';

-- Clean up existing storage policies
DROP POLICY IF EXISTS "Public can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to specific form paths" ON storage.objects;

-- Create unified public policies for storage
CREATE POLICY "Public can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
  );

CREATE POLICY "Anyone can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
  );

-- Ensure generated_documents allows anon inserts
DROP POLICY IF EXISTS "Service role can insert documents via edge function" ON generated_documents;
DROP POLICY IF EXISTS "Public can insert generated documents" ON generated_documents;

CREATE POLICY "Public can insert generated documents" ON generated_documents
  FOR INSERT WITH CHECK (true);
