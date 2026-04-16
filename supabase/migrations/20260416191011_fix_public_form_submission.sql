-- Make sure the form_submissions table allows public inserts
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.form_submissions;
CREATE POLICY "Anyone can insert submissions" ON public.form_submissions
  FOR INSERT TO public, anon, authenticated WITH CHECK (true);

-- Ensure public forms are readable by anyone
DROP POLICY IF EXISTS "Public can read forms" ON public.forms;
CREATE POLICY "Public can read forms" ON public.forms
  FOR SELECT TO public, anon, authenticated USING (true);

-- Ensure storage allows public uploads for the documents bucket
DROP POLICY IF EXISTS "Public can upload documents" ON storage.objects;
CREATE POLICY "Public can upload documents" ON storage.objects
  FOR INSERT TO public, anon, authenticated WITH CHECK (bucket_id = 'documents');

-- Ensure storage allows public reads for the documents bucket
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;
CREATE POLICY "Anyone can view documents" ON storage.objects
  FOR SELECT TO public, anon, authenticated USING (bucket_id = 'documents');

-- Ensure generated documents allows anon inserts
DROP POLICY IF EXISTS "Public can insert generated documents" ON public.generated_documents;
CREATE POLICY "Public can insert generated documents" ON public.generated_documents
  FOR INSERT TO public, anon, authenticated WITH CHECK (true);
