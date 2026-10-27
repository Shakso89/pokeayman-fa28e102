-- Migration: Drop name unique constraint, ensure columns, and update class_students table

-- 1. Remove any global uniqueness on student names (multiple students can share the same name)
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_name_key;

-- 2. Ensure canonical student fields exist
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS power integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pin text NOT NULL DEFAULT '1234';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS coins integer DEFAULT 0;

-- 3. Ensure classes table exists
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  school_name text,
  class_pin text,
  class_level text,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ensure class_students table has correct columns and foreign key cascades
CREATE TABLE IF NOT EXISTS public.class_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'class_students') THEN
    ALTER TABLE public.class_students ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'class_students' AND column_name = 'joined_at') THEN
      UPDATE public.class_students SET created_at = joined_at WHERE created_at IS NULL;
    END IF;
  END IF;
END $$;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_class_students_class ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON public.class_students(student_id);

-- 6. Grant permissions & RLS policies
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_students TO anon, authenticated;
GRANT ALL ON public.classes TO service_role;
GRANT ALL ON public.students TO service_role;
GRANT ALL ON public.class_students TO service_role;

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'classes' AND policyname = 'Allow all access to classes') THEN
    CREATE POLICY "Allow all access to classes" ON public.classes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Allow all access to students') THEN
    CREATE POLICY "Allow all access to students" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'class_students' AND policyname = 'Allow all access to class_students') THEN
    CREATE POLICY "Allow all access to class_students" ON public.class_students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
