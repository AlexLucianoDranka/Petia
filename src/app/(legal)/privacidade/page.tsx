import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function PrivacidadePage() {
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
              <h1 className="text-2xl font-extrabold text-white">Política de Privacidade</h1>
              <p className="text-xs text-st-muted">Petia — Gestão Veterinária Inteligente (LGPD)</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-st-muted leading-relaxed">
            <p>
              A privacidade e a proteção dos dados dos tutores e estabelecimentos parceiros são compromissos fundamentais do <strong className="text-st-arctic">Petia</strong> e da <strong className="text-st-arctic">Sólida Tech</strong>.
            </p>

            <h3 className="font-bold text-sm text-st-arctic">1. Coleta e Finalidade dos Dados</h3>
            <p>
              Coletamos informações como nome do tutor, telefone, e-mail e cadastro dos pets com a única finalidade de viabilizar o agendamento de consultas, envio de lembretes automáticos de vacinação via WhatsApp/E-mail e histórico veterinário.
            </p>

            <h3 className="font-bold text-sm text-st-arctic">2. Opt-in de Comunicação por WhatsApp</h3>
            <p>
              O envio de notificações automáticas via WhatsApp é condicionado ao consentimento prévio do tutor. O tutor pode solicitar a remoção ou opt-out de mensagens automáticas a qualquer momento.
            </p>

            <h3 className="font-bold text-sm text-st-arctic">3. Segurança e Criptografia</h3>
            <p>
              Todos os dados trafegam sob protocolos de segurança HTTPS/TLS com armazenamento em banco de dados isolado via Supabase PostgreSQL com segurança em nível de linha (RLS).
            </p>
          </div>
        </div>

        <SolidaTechBadge variant="auth" />
      </div>
    </div>
  );
}
