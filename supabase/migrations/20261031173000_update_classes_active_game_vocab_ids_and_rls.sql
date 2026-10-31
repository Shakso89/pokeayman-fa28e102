-- Migration: Update active_game_vocab_list_ids and ensure class update policies and admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

GRANT ALL ON public.admin_users TO authenticated, anon, service_role;

ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS active_game_vocab_list_ids UUID[] DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'classes' AND policyname = 'Teachers can update their own classes'
  ) THEN
    CREATE POLICY "Teachers can update their own classes" 
    ON public.classes 
    FOR UPDATE 
    TO authenticated 
    USING (
      auth.uid() = teacher_id 
      OR teacher_id IS NULL
      OR auth.uid() IN (SELECT user_id FROM public.admin_users)
      OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    )
    WITH CHECK (
      auth.uid() = teacher_id 
      OR teacher_id IS NULL
      OR auth.uid() IN (SELECT user_id FROM public.admin_users)
      OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
