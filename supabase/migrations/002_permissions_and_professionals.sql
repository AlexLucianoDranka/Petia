-- ========================================================
-- PETIA - MIGRATION 002: PERMISSÕES GRANULARES, EQUIPE E PROFISSIONAIS
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- Extend users table role check to include 'manager'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('owner', 'manager', 'vet', 'attendant'));

-- Link tutor customer account to auth.users for tutor portal login
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- 1. System Menus List (Chaves fixas do menu)
CREATE TABLE IF NOT EXISTS public.system_menus (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Seed System Menus
INSERT INTO public.system_menus (key, label, sort_order) VALUES
  ('dashboard', 'Dashboard', 1),
  ('agenda', 'Agenda Visual', 2),
  ('checkin', 'Check-in & Checkout', 3),
  ('pets', 'Pets (Prontuário)', 4),
  ('tutores', 'Tutores (Clientes)', 5),
  ('professionals', 'Profissionais', 6),
  ('services', 'Serviços & Preços', 7),
  ('inventory', 'Estoque & Insumos', 8),
  ('subscriptions', 'Planos Recorrentes', 9),
  ('automations', 'Central Automações', 10),
  ('staff', 'Gestão de Equipe', 11)
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;

-- 2. Staff Permissions (Permissão por funcionário x menu)
CREATE TABLE IF NOT EXISTS public.staff_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  menu_key TEXT REFERENCES public.system_menus(key) ON DELETE CASCADE NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  can_view BOOLEAN DEFAULT TRUE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, menu_key)
);

-- 3. Staff Invites (Convites pendentes)
CREATE TABLE IF NOT EXISTS public.staff_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'manager', 'vet', 'attendant')) DEFAULT 'attendant',
  invited_by UUID REFERENCES public.users(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')) DEFAULT 'pending',
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Clinic Professionals (Prestadores de Serviço)
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  linked_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  specialty TEXT CHECK (specialty IN ('veterinario', 'groomer', 'banhista', 'adestrador', 'tosador', 'outro')) NOT NULL,
  document_number TEXT, -- CRMV ou CPF
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  bio TEXT,
  commission_percent NUMERIC(5,2) DEFAULT 0.00,
  work_schedule JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link professionals to appointments & medical records
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL;
ALTER TABLE public.pet_medical_records ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.system_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read system_menus" ON public.system_menus FOR SELECT USING (true);

CREATE POLICY "Owner manages permissions" ON public.staff_permissions
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Owner manages invites" ON public.staff_invites
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users access professionals" ON public.professionals
  FOR ALL USING (clinic_id = get_user_clinic_id());
