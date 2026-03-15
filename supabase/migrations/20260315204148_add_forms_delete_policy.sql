DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'forms'
          AND policyname = 'Auth users can delete forms'
    ) THEN
        CREATE POLICY "Auth users can delete forms" ON public.forms
            FOR DELETE
            TO public
            USING (auth.role() = 'authenticated');
    END IF;
END
$$;
