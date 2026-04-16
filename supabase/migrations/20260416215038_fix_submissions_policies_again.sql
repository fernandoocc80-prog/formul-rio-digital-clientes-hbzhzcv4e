-- Fix RLS policies to guarantee full flow for submissions
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.form_submissions;
CREATE POLICY "Anyone can insert submissions" ON public.form_submissions
  FOR INSERT TO public, anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth users can view submissions" ON public.form_submissions;
CREATE POLICY "Auth users can view submissions" ON public.form_submissions
  FOR SELECT TO public, anon, authenticated USING (true);

DROP POLICY IF EXISTS "Auth users can update submissions" ON public.form_submissions;
CREATE POLICY "Auth users can update submissions" ON public.form_submissions
  FOR UPDATE TO public, anon, authenticated USING (true);

DROP POLICY IF EXISTS "Auth users can delete submissions" ON public.form_submissions;
CREATE POLICY "Auth users can delete submissions" ON public.form_submissions
  FOR DELETE TO public, anon, authenticated USING (true);
