export type PlanType = 'basico' | 'essencial' | 'profissional' | 'ouro' | 'platina' | 'diamond';

export interface PlanConfig {
  id: PlanType;
  name: string;
  badge?: string;
  popular?: boolean;
  priceMonthly: number;
  priceYearly: number; // com desconto de ~20%
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  description: string;
  limits: {
    maxPets: number | 'ilimitado';
    maxStaff: number | 'ilimitado';
    whatsappAutomations: number;
    hasGroomingKanban: boolean;
    hasStaffPermissions: boolean;
    hasTutorPortal: boolean;
    hasMultiUnit: boolean;
    hasVipSupport: boolean;
  };
  features: string[];
}

export const PLANS: Record<PlanType, PlanConfig> = {
  basico: {
    id: 'basico',
    name: 'Iniciante Start',
    badge: 'Super Acessível',
    priceMonthly: 4.99,
    priceYearly: 49.90,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_BASICO_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_BASICO_YEARLY,
    description: 'Ideal para profissionais autônomos ou clínicas iniciando a digitalização.',
    limits: {
      maxPets: 20,
      maxStaff: 1,
      whatsappAutomations: 10,
      hasGroomingKanban: false,
      hasStaffPermissions: false,
      hasTutorPortal: false,
      hasMultiUnit: false,
      hasVipSupport: false,
    },
    features: [
      'Até 20 pets cadastrados',
      '1 usuário de acesso (vet / atendente)',
      'Agenda visual completa',
      'Prontuário veterinário básico',
      'Suporte via e-mail',
    ],
  },
  essencial: {
    id: 'essencial',
    name: 'Essencial Bronze',
    priceMonthly: 29.90,
    priceYearly: 299.00,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ESSENCIAL_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ESSENCIAL_YEARLY,
    description: 'Para pequenas clínicas e pet shops com fluxo diário constante.',
    limits: {
      maxPets: 100,
      maxStaff: 2,
      whatsappAutomations: 50,
      hasGroomingKanban: true,
      hasStaffPermissions: false,
      hasTutorPortal: false,
      hasMultiUnit: false,
      hasVipSupport: false,
    },
    features: [
      'Até 100 pets cadastrados',
      'Até 2 usuários de acesso',
      'Quadro Kanban Banho & Tosa',
      'Prontuário com anexos de exames',
      'Controle de estoque básico',
      '50 disparos de lembretes no WhatsApp/mês',
    ],
  },
  profissional: {
    id: 'profissional',
    name: 'Profissional Prata',
    priceMonthly: 59.90,
    priceYearly: 599.00,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PROFISSIONAL_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PROFISSIONAL_YEARLY,
    description: 'Para clínicas estruturadas que buscam automação e controle financeiro.',
    limits: {
      maxPets: 300,
      maxStaff: 5,
      whatsappAutomations: 200,
      hasGroomingKanban: true,
      hasStaffPermissions: true,
      hasTutorPortal: false,
      hasMultiUnit: false,
      hasVipSupport: false,
    },
    features: [
      'Até 300 pets cadastrados',
      'Até 5 usuários de acesso',
      'Gestão de Equipe & Permissões Granulares',
      'Cadastro de Profissionais com Comissão',
      'Controle de Estoque & Alerta de Validade',
      '200 disparos de WhatsApp/mês',
    ],
  },
  ouro: {
    id: 'ouro',
    name: 'Clínica Pro Ouro',
    popular: true,
    badge: 'Mais Vendido',
    priceMonthly: 99.90,
    priceYearly: 999.00,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_OURO_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_OURO_YEARLY,
    description: 'Solução completa para clínicas de médio porte sem limitação de pets.',
    limits: {
      maxPets: 'ilimitado',
      maxStaff: 10,
      whatsappAutomations: 500,
      hasGroomingKanban: true,
      hasStaffPermissions: true,
      hasTutorPortal: true,
      hasMultiUnit: false,
      hasVipSupport: false,
    },
    features: [
      'Pets e Prontuários ILIMITADOS',
      'Até 10 usuários da equipe',
      'Portal do Tutor Self-Service',
      'Planos de Assinatura Recorrente para Tutores',
      'Relatórios Financeiros e DRE Simplificado',
      '500 disparos de WhatsApp/mês',
    ],
  },
  platina: {
    id: 'platina',
    name: 'Empresarial Platina',
    priceMonthly: 149.90,
    priceYearly: 1499.00,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PLATINA_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PLATINA_YEARLY,
    description: 'Para hospitais veterinários e centros estéticos de grande escala.',
    limits: {
      maxPets: 'ilimitado',
      maxStaff: 'ilimitado',
      whatsappAutomations: 1500,
      hasGroomingKanban: true,
      hasStaffPermissions: true,
      hasTutorPortal: true,
      hasMultiUnit: false,
      hasVipSupport: true,
    },
    features: [
      'Pets e Equipe ILIMITADOS',
      'Central de Automações & CRM Avançado',
      'Painel BI de Indicadores e Desempenho',
      'Emissão de Comprovantes e PDF de Receituário',
      '1.500 disparos de WhatsApp/mês',
      'Suporte Prioritário Via WhatsApp',
    ],
  },
  diamond: {
    id: 'diamond',
    name: 'Redes & Franquias Diamond',
    badge: 'Enterprise',
    priceMonthly: 299.90,
    priceYearly: 2999.00,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_DIAMOND_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_DIAMOND_YEARLY,
    description: 'Gestão multi-unidades para redes de clínicas, pet shops e franquias.',
    limits: {
      maxPets: 'ilimitado',
      maxStaff: 'ilimitado',
      whatsappAutomations: 5000,
      hasGroomingKanban: true,
      hasStaffPermissions: true,
      hasTutorPortal: true,
      hasMultiUnit: true,
      hasVipSupport: true,
    },
    features: [
      'Multi-Unidades Sob a Mesma Conta',
      'API e Webhooks Dedicados',
      'Relatórios Consolidados de Rede',
      '5.000 disparos de WhatsApp/mês',
      'Gerente de Conta Dedicado + Onboarding VIP',
      'SLA de Atendimento Garantido em Contrato',
    ],
  },
};
