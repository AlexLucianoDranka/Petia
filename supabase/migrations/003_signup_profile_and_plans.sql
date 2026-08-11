-- ========================================================
-- PETIA - MIGRATION 003: SIGNUP COMPLETO, PERFIL E PLANOS STRIPE
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- Extend clinics table with CNPJ, representative info, and address
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS representative_name TEXT;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS representative_cpf TEXT;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS representative_whatsapp TEXT;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Extend users table with CPF, phone, birth_date
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Seed Perfil and Planos in System Menus
INSERT INTO public.system_menus (key, label, sort_order) VALUES
  ('perfil', 'Meu Perfil', 12),
  ('planos', 'Planos & Assinatura', 13)
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;
