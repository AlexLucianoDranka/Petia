-- ========================================================
-- PETIA - MIGRATION 005: TUTOR AUTHENTICATION
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

CREATE TABLE IF NOT EXISTS public.tutor_auth_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  pin TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.tutor_auth_codes ENABLE ROW LEVEL SECURITY;

-- Since this table is used exclusively by the backend API (Next.js server)
-- with the Service Role key, we don't need to expose any public RLS policies.
-- Service Role bypasses RLS automatically.

