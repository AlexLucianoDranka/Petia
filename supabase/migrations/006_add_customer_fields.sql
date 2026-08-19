-- Migration para adicionar CPF e Endereço na tabela de tutores
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS document TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;
