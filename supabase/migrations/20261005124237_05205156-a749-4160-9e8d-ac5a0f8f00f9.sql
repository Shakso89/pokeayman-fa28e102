CREATE POLICY "Signed-in teachers update student accounts" ON public.app_records FOR UPDATE TO authenticated
USING (data->>'type' = 'student') WITH CHECK (data->>'type' = 'student');