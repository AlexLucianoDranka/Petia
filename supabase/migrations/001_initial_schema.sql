-- ========================================================
-- PETIA - SUPABASE COMPLETE DATABASE SETUP & MULTI-TENANT RLS
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clinics (Tenants)
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  plan TEXT DEFAULT 'pro',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Staff Users (Perfis da Equipe)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  auth_id UUID UNIQUE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'vet', 'attendant')) DEFAULT 'owner',
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customers (Tutores)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  whatsapp_opt_in BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pets
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL, -- Cão, Gato, Ave, etc.
  breed TEXT,
  birth_date DATE,
  weight NUMERIC(5,2),
  sex TEXT CHECK (sex IN ('M', 'F')),
  neutered BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Pet Medical Records (Prontuário Veterinário)
CREATE TABLE IF NOT EXISTS public.pet_medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('vaccine', 'deworming', 'exam', 'surgery', 'consultation')) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  next_due_date DATE,
  vet_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Services Catalog
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('banho', 'tosa', 'consulta', 'vacina', 'cirurgia', 'outro')) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Appointments (Agenda Visual)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL,
  staff_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'done', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  price NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Subscription Plans (Planos de Assinatura de Tutores)
CREATE TABLE IF NOT EXISTS public.subscriptions_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  frequency TEXT CHECK (frequency IN ('mensal', 'semestral', 'anual')) DEFAULT 'mensal',
  services_included JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Customer Subscriptions
CREATE TABLE IF NOT EXISTS public.customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscriptions_plans(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT CHECK (status IN ('active', 'past_due', 'canceled', 'paused')) DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Inventory (Estoque)
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 5,
  unit_cost NUMERIC(10,2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Invoices / Payments
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  stripe_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Notification Log
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  channel TEXT CHECK (channel IN ('email', 'whatsapp')) NOT NULL,
  type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('delivered', 'failed', 'queued')) DEFAULT 'delivered'
);

-- ========================================================
-- AUTOMATIC TRIGGER FOR SUPABASE AUTH SIGNUPS
-- ========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_clinic_id UUID;
BEGIN
  -- 1. Create a default clinic tenant for the new user
  INSERT INTO public.clinics (name, slug)
  VALUES (
    COALESCE(new.raw_user_meta_data->>'clinic_name', 'Minha Clínica Veterinária'),
    'clinic-' || LOWER(SUBSTRING(new.id::text FROM 1 FOR 8))
  )
  RETURNING id INTO new_clinic_id;

  -- 2. Create staff profile linked to Supabase Auth
  INSERT INTO public.users (clinic_id, auth_id, name, role, email)
  VALUES (
    new_clinic_id,
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'owner',
    new.email
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE POLICY "Users access clinic data" ON public.clinics FOR ALL USING (id = get_user_clinic_id());
CREATE POLICY "Users access staff" ON public.users FOR ALL USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Users access customers" ON public.customers FOR ALL USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Users access pets" ON public.pets FOR ALL USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Users access medical records" ON public.pet_medical_records FOR ALL USING (
  pet_id IN (SELECT id FROM public.pets WHERE clinic_id = get_user_clinic_id())
);
CREATE POLICY "Users access services" ON public.services FOR ALL USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Users access appointments" ON public.appointments FOR ALL USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Users access plans" ON public.subscriptions_plans FOR ALL USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Users access customer subscriptions" ON public.customer_subscriptions FOR ALL USING (
  customer_id IN (SELECT id FROM public.customers WHERE clinic_id = get_user_clinic_id())
);
CREATE POLICY "Users access inventory" ON public.inventory FOR ALL USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Users access invoices" ON public.invoices FOR ALL USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Users access notifications" ON public.notification_log FOR ALL USING (clinic_id = get_user_clinic_id());
