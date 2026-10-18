CREATE OR REPLACE FUNCTION public.solve_quiz(_quiz_id text, _student_id text, _student_name text, _answer text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q jsonb; s jsonb; solved text; reward int; name_l text := lower(trim(coalesce(_student_name,'')));
BEGIN
  SELECT data INTO q FROM app_records WHERE id = _quiz_id AND data->>'type' = 'quiz' FOR UPDATE;
  IF q IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'missing'); END IF;
  IF lower(trim(coalesce(_answer,''))) <> lower(trim(coalesce(q->>'quiz_answer',''))) THEN RETURN jsonb_build_object('ok', false, 'reason', 'wrong'); END IF;
  IF name_l = '' THEN RETURN jsonb_build_object('ok', false, 'reason', 'student'); END IF;
  solved := coalesce(q->>'quiz_solved_by','');
  IF name_l = ANY (SELECT lower(trim(x)) FROM unnest(string_to_array(solved, ',')) x) THEN RETURN jsonb_build_object('ok', false, 'reason', 'already'); END IF;
  SELECT data INTO s FROM app_records WHERE id = _student_id AND data->>'type' = 'student' FOR UPDATE;
  IF s IS NULL OR lower(trim(coalesce(s->>'student_name',''))) <> name_l THEN RETURN jsonb_build_object('ok', false, 'reason', 'student'); END IF;
  reward := greatest(0, coalesce(nullif(q->>'quiz_reward','')::numeric, 0))::int;
  UPDATE app_records SET data = data || jsonb_build_object('quiz_solved_by', CASE WHEN solved = '' THEN trim(_student_name) ELSE solved || ',' || trim(_student_name) END) WHERE id = _quiz_id;
  UPDATE app_records SET data = data || jsonb_build_object('coins', coalesce(nullif(data->>'coins','')::numeric, 0) + reward) WHERE id = _student_id;
  RETURN jsonb_build_object('ok', true, 'reward', reward);
END; $$;
REVOKE ALL ON FUNCTION public.solve_quiz(text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.solve_quiz(text, text, text, text) TO anon, authenticated;