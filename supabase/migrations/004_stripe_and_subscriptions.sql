-- ========================================================
-- PETIA - MIGRATION 004: STRIPE CUSTOMER, SUBSCRIPTION STATUS & TRIAL
-- Execute no SQL Editor do seu projeto Supabase em:
-- https://supabase.com/dashboard/project/[seu-projeto]/sql
-- ========================================================

-- Add Stripe customer and subscription tracking to clinics table
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'basico',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Index for fast webhook lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_clinics_stripe_customer_id
  ON public.clinics (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Add avatar_url to users if not already present (from migration 003)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add 'tutor' and 'planos' to system_menus if not present
INSERT INTO public.system_menus (key, label, sort_order) VALUES
  ('tutor', 'Portal do Tutor', 14),
  ('planos', 'Planos & Assinatura', 15),
  ('perfil', 'Meu Perfil', 16),
  ('settings', 'Configurações Clínica', 17)
ON CONFLICT (key) DO UPDATE
  SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;

-- Helper function: get active plan for a clinic
CREATE OR REPLACE FUNCTION public.get_active_plan(p_clinic_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(plan, 'basico')
  FROM public.clinics
  WHERE id = p_clinic_id
  LIMIT 1;
$$;

-- RLS policy: clinics can only read their own data
-- (Skip if you already have RLS enabled on clinics)
-- ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Clinic members can view own clinic"
--   ON public.clinics FOR SELECT
--   USING (id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- ========================================================
-- VERIFICATION QUERIES (run separately to check)
-- ========================================================
-- SELECT id, plan, subscription_status, trial_ends_at FROM public.clinics LIMIT 5;
-- SELECT get_active_plan('[your-clinic-uuid]');
