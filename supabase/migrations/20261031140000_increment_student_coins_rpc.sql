-- Migration: Create atomic increment_student_coins RPC function and coin_transactions table

CREATE OR REPLACE FUNCTION increment_student_coins(target_student_id UUID, coin_delta INT)
RETURNS INT AS $$
DECLARE
  new_balance INT;
BEGIN
  UPDATE students
  SET coins = GREATEST(0, COALESCE(coins, 0) + coin_delta)
  WHERE id = target_student_id
  RETURNING coins INTO new_balance;
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_student_coins(UUID, INT) TO anon, authenticated, service_role;

-- Ensure coin_transactions ledger table exists
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  created_by TEXT,
  description TEXT DEFAULT 'Admin adjustment',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_student_id ON public.coin_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON public.coin_transactions(created_at DESC);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.coin_transactions TO anon, authenticated, service_role;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coin_transactions' AND policyname = 'Enable all for coin_transactions') THEN
    CREATE POLICY "Enable all for coin_transactions" ON public.coin_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
