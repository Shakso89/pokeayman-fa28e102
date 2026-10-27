-- Migration: Enforce ON DELETE CASCADE for student relations and clean up orphaned rows

-- 1. Class enrollment junction table
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'class_students') THEN
    ALTER TABLE public.class_students
      DROP CONSTRAINT IF EXISTS class_students_student_id_fkey,
      ADD CONSTRAINT class_students_student_id_fkey
        FOREIGN KEY (student_id)
        REFERENCES public.students(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Student inventory / catches table
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_pokemon') THEN
    ALTER TABLE public.student_pokemon
      DROP CONSTRAINT IF EXISTS student_pokemon_student_id_fkey,
      ADD CONSTRAINT student_pokemon_student_id_fkey
        FOREIGN KEY (student_id)
        REFERENCES public.students(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Any claim, badge, or coin log tables
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_badges') THEN
    ALTER TABLE public.student_badges
      DROP CONSTRAINT IF EXISTS student_badges_student_id_fkey,
      ADD CONSTRAINT student_badges_student_id_fkey
        FOREIGN KEY (student_id)
        REFERENCES public.students(id)
        ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Database cleanup: purge orphaned junction rows
DELETE FROM public.class_students
WHERE student_id IS NULL
   OR student_id NOT IN (SELECT id FROM public.students);
