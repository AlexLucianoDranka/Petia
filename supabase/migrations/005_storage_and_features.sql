-- ========================================================
-- PETIA - MIGRATION 005: STORAGE BUCKETS & SAAS FEATURES
-- Execute no SQL Editor do seu projeto Supabase em:
-- https://supabase.com/dashboard/project/[seu-projeto]/sql
-- ========================================================

-- 1. Create Storage bucket for Pet Exams & Radiographies (if storage schema exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-exams',
  'pet-exams',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Public access to read exams
CREATE POLICY "Public Read Pet Exams"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-exams');

-- Storage Policy: Authenticated users can upload exams
CREATE POLICY "Auth Upload Pet Exams"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pet-exams' AND auth.role() = 'authenticated');

-- 2. Create Ratings / Avaliações table
CREATE TABLE IF NOT EXISTS public.customer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  appointment_id UUID,
  customer_name TEXT NOT NULL,
  pet_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Tutor Subscriptions table
CREATE TABLE IF NOT EXISTS public.tutor_club_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  pet_name TEXT NOT NULL,
  plan_title TEXT NOT NULL,
  monthly_price NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS where appropriate
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_club_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for reviews"
  ON public.customer_reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow clinic read reviews"
  ON public.customer_reviews FOR SELECT
  USING (true);

CREATE POLICY "Allow clinic read/write tutor club"
  ON public.tutor_club_subscriptions FOR ALL
  USING (true);
