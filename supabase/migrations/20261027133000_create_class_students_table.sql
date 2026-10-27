-- Migration: Create classes, students, and class_students junction table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  school_name text,
  class_pin text,
  class_level text,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  pin text NOT NULL DEFAULT '1234',
  avatar_url text,
  avatar_pokemon_id integer DEFAULT 0,
  coins integer DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if tables were created previously
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pin text NOT NULL DEFAULT '1234';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS avatar_pokemon_id integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS coins integer DEFAULT 0;

-- Junction table for many-to-many class enrollment
CREATE TABLE IF NOT EXISTS public.class_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_class_students_class ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON public.class_students(student_id);

-- Migrate any single students.class_id if that column exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'class_id'
  ) THEN
    INSERT INTO public.class_students (class_id, student_id)
    SELECT s.class_id, s.id
    FROM public.students s
    WHERE s.class_id IS NOT NULL
    ON CONFLICT (class_id, student_id) DO NOTHING;
  END IF;
END $$;

-- Permissions and RLS
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
