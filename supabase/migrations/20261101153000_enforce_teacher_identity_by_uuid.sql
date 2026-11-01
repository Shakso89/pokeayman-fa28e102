-- Migration: Enforce Teacher Identity by UUID (Deduplicate Same-Name Teachers)
-- 1. Ensure profiles has role, email, and teacher_credits
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'teacher';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS teacher_credits int DEFAULT 0;

-- 2. Class Teachers Junction Table must key on UUID
CREATE TABLE IF NOT EXISTS public.class_teachers (
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (class_id, teacher_id)
);

-- 3. Teacher Credits Ledger must key on UUID
CREATE TABLE IF NOT EXISTS public.teacher_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL DEFAULT 0,
  reason TEXT,
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create index to ensure fast queries per teacher UUID
CREATE INDEX IF NOT EXISTS idx_class_teachers_teacher ON public.class_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_teachers_class ON public.class_teachers(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_credits_teacher ON public.teacher_credits(teacher_id);

-- 5. Enable Row Level Security and Policies
ALTER TABLE public.class_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_credits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'class_teachers' AND policyname = 'Allow read class_teachers'
  ) THEN
    CREATE POLICY "Allow read class_teachers" ON public.class_teachers FOR SELECT TO authenticated, anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'class_teachers' AND policyname = 'Allow manage class_teachers'
  ) THEN
    CREATE POLICY "Allow manage class_teachers" ON public.class_teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credits' AND policyname = 'Allow read teacher_credits'
  ) THEN
    CREATE POLICY "Allow read teacher_credits" ON public.teacher_credits FOR SELECT TO authenticated, anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credits' AND policyname = 'Allow manage teacher_credits'
  ) THEN
    CREATE POLICY "Allow manage teacher_credits" ON public.teacher_credits FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON public.class_teachers TO authenticated, anon, service_role;
GRANT ALL ON public.teacher_credits TO authenticated, anon, service_role;

-- 6. RPC Function for Awarding Teacher Credits by UUID
CREATE OR REPLACE FUNCTION public.award_teacher_credits(
  p_teacher_id UUID,
  p_amount INT,
  p_reason TEXT DEFAULT 'Awarded by Admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance int;
  now_iso text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Amount must be greater than 0');
  END IF;

  -- 1. Insert into teacher_credits ledger
  INSERT INTO public.teacher_credits (teacher_id, amount, reason, awarded_at)
  VALUES (p_teacher_id, p_amount, p_reason, now());

  -- 2. Update profiles if column exists
  BEGIN
    UPDATE public.profiles
    SET teacher_credits = COALESCE(teacher_credits, 0) + p_amount
    WHERE id = p_teacher_id
    RETURNING teacher_credits INTO v_new_balance;
  EXCEPTION WHEN undefined_column THEN
    NULL;
  END;

  -- 3. Update app_records JSON if teacher record exists
  UPDATE public.app_records
  SET data = jsonb_set(
    data,
    '{teacher_credits}',
    to_jsonb(COALESCE((data->>'teacher_credits')::int, 0) + p_amount)
  )
  WHERE id = p_teacher_id::text AND data->>'type' = 'teacher';

  -- 4. Record credit_log entry into app_records for backward compatibility
  INSERT INTO public.app_records (id, data, created_at, updated_at)
  VALUES (
    gen_random_uuid()::text,
    jsonb_build_object(
      'type', 'credit_log',
      'log_type', 'admin_award',
      'recipient_id', p_teacher_id::text,
      'amount', p_amount,
      'log_action', 'Award',
      'log_amount', p_amount,
      'log_target', COALESCE(p_reason, 'Teacher Award'),
      'created_at', now_iso,
      '__backendId', gen_random_uuid()::text
    ),
    now(),
    now()
  );

  RETURN jsonb_build_object(
    'ok', true,
    'teacher_id', p_teacher_id,
    'amount', p_amount,
    'new_balance', v_new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.award_teacher_credits(UUID, INT, TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.award_teacher_credits(UUID, INT, TEXT) TO authenticated, anon, service_role;
