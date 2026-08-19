-- ========================================================
-- PETIA - MIGRATION 004: CORREÇÃO DO TESTE GRÁTIS DE 7 DIAS
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- 1. Adiciona a coluna trial_ends_at (caso não exista) com padrão de 7 dias no futuro para novas clínicas
ALTER TABLE public.clinics ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

-- 2. Altera o padrão do subscription_status para 'trial' (novas contas começam no teste grátis, não como 'active')
ALTER TABLE public.clinics ALTER COLUMN subscription_status SET DEFAULT 'trial';

-- 3. Atualiza as clínicas existentes
-- Para contas antigas, define o fim do trial como 7 dias após a data de criação
UPDATE public.clinics
SET trial_ends_at = created_at + INTERVAL '7 days'
WHERE trial_ends_at IS NULL;

-- Corrige o status de contas que foram criadas com 'active' por engano e ainda estão no período de trial
UPDATE public.clinics
SET subscription_status = 'trial'
WHERE subscription_status = 'active' AND (created_at + INTERVAL '7 days') > NOW();
