CREATE TABLE public.app_records (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_records TO anon, authenticated;
GRANT ALL ON public.app_records TO service_role;
ALTER TABLE public.app_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "App can read records" ON public.app_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "App can add records" ON public.app_records FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "App can edit records" ON public.app_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "App can remove records" ON public.app_records FOR DELETE TO anon, authenticated USING (true);
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER app_records_updated_at BEFORE UPDATE ON public.app_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();