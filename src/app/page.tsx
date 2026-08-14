import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Dog, CreditCard } from 'lucide-react';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-st-navy text-st-arctic font-sans selection:bg-st-electric selection:text-white">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-st-surface border border-st-electric/30 shadow-glow flex items-center justify-center text-st-electric">
            <Dog className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white">Petia</h1>
            <p className="text-[10px] text-st-muted font-mono uppercase tracking-wider">Gestão Veterinária Inteligente</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tutor"
            className="hidden sm:inline-flex text-xs font-semibold text-st-muted hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            Portal do Tutor
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-bold px-5 py-2.5 rounded-xl shadow-glow transition-all hover:scale-105 active:scale-95"
          >
            <span>Acessar Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center space-y-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-st-surface border border-st-border text-st-electric text-xs font-bold shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Controle Veterinário • Supabase RLS + Stripe + WhatsApp + Sólida Tech</span>
        </div>

        <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-white">
          Gestão completa e autônoma para <span className="text-transparent bg-clip-text bg-gradient-to-r from-st-electric via-st-steel to-st-ice">Clínicas & Pet Shops</span>.
        </h1>

        <p className="text-st-muted text-base lg:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
          Agenda visual, prontuário médico digital com carteira de vacinas, alertas automáticos via WhatsApp, esteira de check-in e assinaturas de banho recorrentes no Petia.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-st-electric hover:bg-st-steel text-white font-extrabold text-sm lg:text-base shadow-glow transition-all hover:scale-105"
          >
            Entrar no Sistema
          </Link>

          <Link
            href="/login?mode=register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic font-bold text-sm lg:text-base border border-st-border transition-all"
          >
            Criar Conta Grátis
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold border border-st-electric/30">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-white">Automação Extrema</h3>
            <p className="text-xs text-st-muted leading-relaxed">
              Disparo automático de lembretes de vacina, confirmação de agenda 24h e mensagem no aniversário do pet.
            </p>
          </div>

          <div className="card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-st-success/20 text-st-success flex items-center justify-center font-bold border border-st-success/30">
              <Dog className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-white">Prontuário Médico Digital</h3>
            <p className="text-xs text-st-muted leading-relaxed">
              Linha do tempo de vacinas, vermífugos, exames e cirurgias com carteira digital para o tutor.
            </p>
          </div>

          <div className="card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold border border-st-electric/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-white">Recorrência Stripe</h3>
            <p className="text-xs text-st-muted leading-relaxed">
              Planos de assinatura mensal de banhos e saúde pet com cobrança recorrente no cartão de crédito.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-st-border/40 py-8 text-center text-xs text-st-muted space-y-4">
        <p>© 2026 Petia • Todos os direitos reservados.</p>
        <SolidaTechBadge variant="auth" />
      </footer>
    </div>
  );
}
