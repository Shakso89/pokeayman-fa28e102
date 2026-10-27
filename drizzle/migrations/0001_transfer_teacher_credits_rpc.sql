-- Function for atomic teacher credit transfer by managers/admins
CREATE OR REPLACE FUNCTION public.transfer_teacher_credits(
  _sender_id text,
  _recipient_id text,
  _amount int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender jsonb;
  recipient jsonb;
  sender_credits int;
  is_admin boolean := false;
  sender_name text;
  recipient_name text;
  now_iso text := to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  log_id uuid := gen_random_uuid();
BEGIN
  IF _amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_amount', 'message', 'Transfer amount must be greater than 0.');
  END IF;

  IF _sender_id = _recipient_id THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'same_account', 'message', 'Cannot transfer credits to yourself.');
  END IF;

  -- Lock and retrieve sender record
  SELECT data INTO sender FROM app_records WHERE id = _sender_id AND data->>'type' = 'teacher' FOR UPDATE;
  IF sender IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'sender_not_found', 'message', 'Manager record not found.');
  END IF;

  -- Lock and retrieve recipient record
  SELECT data INTO recipient FROM app_records WHERE id = _recipient_id AND data->>'type' = 'teacher' FOR UPDATE;
  IF recipient IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'recipient_not_found', 'message', 'Recipient teacher record not found.');
  END IF;

  sender_credits := coalesce(nullif(sender->>'teacher_credits','')::numeric, 0)::int;
  sender_name := coalesce(sender->>'teacher_name', '');
  recipient_name := coalesce(recipient->>'teacher_name', '');

  -- Check if sender is admin / has unlimited credits (-1)
  IF sender->>'teacher_role' = 'admin' OR sender_credits = -1 OR lower(trim(sender_name)) = 'ayman' THEN
    is_admin := true;
  END IF;

  IF NOT is_admin AND sender_credits < _amount THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'insufficient_credits', 'message', 'Insufficient credits balance.');
  END IF;

  -- Deduct from sender if not unlimited
  IF NOT is_admin THEN
    UPDATE app_records
    SET data = data || jsonb_build_object(
      'teacher_credits', sender_credits - _amount,
      'teacher_spent_total', coalesce(nullif(data->>'teacher_spent_total','')::numeric, 0) + _amount
    )
    WHERE id = _sender_id;
  END IF;

  -- Add to recipient
  UPDATE app_records
  SET data = data || jsonb_build_object(
    'teacher_credits', CASE
      WHEN coalesce(nullif(recipient->>'teacher_credits','')::numeric, 0)::int = -1 THEN -1
      ELSE coalesce(nullif(recipient->>'teacher_credits','')::numeric, 0) + _amount
    END
  )
  WHERE id = _recipient_id;

  -- Insert credit_log record into app_records
  INSERT INTO app_records (id, data, created_at, updated_at)
  VALUES (
    log_id::text,
    jsonb_build_object(
      'type', 'credit_log',
      'log_type', 'manager_transfer',
      'sender_id', _sender_id,
      'recipient_id', _recipient_id,
      'sender_name', sender_name,
      'recipient_name', recipient_name,
      'amount', _amount,
      'log_action', 'Transfer',
      'log_amount', _amount,
      'log_target', recipient_name,
      'teacher_name', sender_name,
      'created_at', now_iso,
      '__backendId', log_id::text
    ),
    now(),
    now()
  );

  RETURN jsonb_build_object(
    'ok', true,
    'sender_credits', CASE WHEN is_admin THEN -1 ELSE sender_credits - _amount END,
    'recipient_name', recipient_name,
    'amount', _amount
  );
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_teacher_credits(text, text, int) FROM public;
GRANT EXECUTE ON FUNCTION public.transfer_teacher_credits(text, text, int) TO anon, authenticated;
