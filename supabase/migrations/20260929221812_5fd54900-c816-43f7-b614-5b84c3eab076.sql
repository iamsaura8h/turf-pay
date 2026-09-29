ALTER TABLE public.matches ADD COLUMN per_person numeric NOT NULL DEFAULT 86;
ALTER TABLE public.players
  ADD COLUMN pay_type text NOT NULL DEFAULT 'cash' CHECK (pay_type IN ('cash','upi','later','split')),
  ADD COLUMN amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN partner text,
  ADD COLUMN owed numeric;
UPDATE public.players SET amount = cash + upi, pay_type = CASE WHEN upi > 0 AND cash = 0 THEN 'upi' ELSE 'cash' END;