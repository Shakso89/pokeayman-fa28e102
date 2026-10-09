UPDATE public.app_records SET data = data || jsonb_build_object('teacher_email', u.email)
FROM auth.users u
WHERE app_records.data->>'type' = 'teacher' AND app_records.data->>'cloud_user_id' = u.id::text
  AND COALESCE(app_records.data->>'teacher_email','') = '';