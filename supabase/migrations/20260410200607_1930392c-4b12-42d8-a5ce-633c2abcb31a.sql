
DROP POLICY IF EXISTS "Cloaker config insert auth only" ON public.cloaker_config;
DROP POLICY IF EXISTS "Cloaker config update auth only" ON public.cloaker_config;

CREATE POLICY "Cloaker config insert by anyone" ON public.cloaker_config FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Cloaker config update by anyone" ON public.cloaker_config FOR UPDATE TO public USING (true) WITH CHECK (true);
