-- ========================================================
-- PETIA - DEFAULT SEED DATA (UUIDs VÁLIDOS EM HEXADECIMAL)
-- Execute este script no SQL Editor do Supabase após a migration 001
-- ========================================================

-- 1. Inserir Clínica de Demonstração
INSERT INTO public.clinics (id, name, slug, phone, address)
VALUES (
  'a1000000-0000-4000-8000-000000000101',
  'Petia - Vila Madalena',
  'petia-vila-madalena',
  '(11) 98765-4321',
  'Rua Harmonia, 450 - Vila Madalena, São Paulo - SP'
) ON CONFLICT (id) DO NOTHING;

-- 2. Inserir Equipe Veterinária
INSERT INTO public.users (id, clinic_id, name, role, email)
VALUES
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000101', 'Dr. Lucas Mendes', 'vet', 'lucas@petia.com.br'),
  ('b2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000101', 'Dra. Camila Rocha', 'vet', 'camila@petia.com.br'),
  ('b3000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000101', 'Ana Beatris (Recepção)', 'attendant', 'ana@petia.com.br')
ON CONFLICT (id) DO NOTHING;

-- 3. Inserir Serviços do Catálogo
INSERT INTO public.services (clinic_id, name, category, price, duration_minutes)
VALUES
  ('a1000000-0000-4000-8000-000000000101', 'Banho & Tosa Completa (Porte Grande)', 'banho', 130.00, 60),
  ('a1000000-0000-4000-8000-000000000101', 'Banho Higiênico (Porte Pequeno/Médio)', 'banho', 75.00, 45),
  ('a1000000-0000-4000-8000-000000000101', 'Consulta Clínica Veterinária', 'consulta', 180.00, 30),
  ('a1000000-0000-4000-8000-000000000101', 'Aplicação de Vacina Importada (V10/V4)', 'vacina', 110.00, 20),
  ('a1000000-0000-4000-8000-000000000101', 'Procedimento de Castração', 'cirurgia', 650.00, 120);
