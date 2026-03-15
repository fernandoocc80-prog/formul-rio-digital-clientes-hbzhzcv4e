-- 1. Private Storage Bucket Transition
UPDATE storage.buckets
SET public = false
WHERE id = 'documents';

-- 2. Clean up existing public policies to enforce privacy
DROP POLICY IF EXISTS "Public can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;

-- 3. Storage RLS Policies
-- SELECT access granted only to authenticated users
CREATE POLICY "Auth users can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

-- INSERT access permitted for file paths matching forms/{form_id}/{submission_id}/...
CREATE POLICY "Allow uploads to specific form paths" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    name LIKE 'forms/%/%/%'
  );

-- 4. Backend Validation Layer
-- Trigger to verify submission_id exists when inserting into generated_documents
CREATE OR REPLACE FUNCTION verify_submission_exists()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM form_submissions WHERE id = NEW.submission_id) THEN
    RAISE EXCEPTION 'Submission ID % does not exist in form_submissions', NEW.submission_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_verify_submission_exists ON generated_documents;
CREATE TRIGGER trg_verify_submission_exists
BEFORE INSERT OR UPDATE ON generated_documents
FOR EACH ROW
EXECUTE FUNCTION verify_submission_exists();
