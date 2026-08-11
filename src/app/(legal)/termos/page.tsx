import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-st-navy text-st-arctic px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-st-electric hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Login</span>
        </Link>

        <div className="card p-8 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-st-border/40 pb-4">
            <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Termos de Uso</h1>
              <p className="text-xs text-st-muted">Petia — Gestão Veterinária Inteligente</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-st-muted leading-relaxed">
            <p>
              Bem-vindo ao <strong className="text-st-arctic">Petia</strong>. Ao utilizar nossa plataforma SaaS de gestão para pet shops e clínicas veterinárias, você concorda com os termos e condições descritos a seguir.
            </p>

            <h3 className="font-bold text-sm text-st-arctic">1. Acesso e Conta de Usuário</h3>
            <p>
              O sistema Petia é fornecido como serviço (SaaS) multi-tenant isolado por clínica. Cada conta administrativa é responsável pela veracidade dos dados cadastrados e por manter o sigilo de suas credenciais de acesso.
            </p>

            <h3 className="font-bold text-sm text-st-arctic">2. Responsabilidade pelos Dados dos Pacientes</h3>
            <p>
              Os prontuários médicos, históricos de vacinas e registros de atendimento são mantidos pela clínica veterinária cadastrada. O Petia provê infraestrutura segura com criptografia de ponta a ponta e controle de acesso por RLS (Row Level Security).
            </p>

            <h3 className="font-bold text-sm text-st-arctic">3. Assinaturas e Cobranças Recorrentes</h3>
            <p>
              Os pagamentos das assinaturas do sistema e das mensalidades dos tutores são processados com segurança por meio da infraestrutura parceira do Stripe.
            </p>

            <h3 className="font-bold text-sm text-st-arctic">4. Propriedade Intelectual</h3>
            <p>
              A marca, código-fonte, design system e arquitetura do software são de propriedade da <strong className="text-st-arctic">Sólida Tech</strong>.
            </p>
          </div>
        </div>

        <SolidaTechBadge variant="auth" />
      </div>
    </div>
  );
}
