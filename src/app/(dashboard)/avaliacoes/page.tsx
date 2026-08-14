'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Heart, ThumbsUp, TrendingUp, Filter, Sparkles } from 'lucide-react';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

interface Review {
  id: string;
  appointment_id?: string;
  customer_name: string;
  pet_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function AvaliacoesDashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('petia_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews(parsed);
        }
      } catch (e) {}
    }
  }, []);

  const filtered = filterRating === 'all'
    ? reviews
    : reviews.filter((r) => r.rating === filterRating);

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  const total5Star = reviews.filter((r) => r.rating === 5).length;
  const npsScore = Math.round((total5Star / reviews.length) * 100);

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <span>Avaliações & Reputação da Clínica</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">
            Acompanhe o feedback dos tutores e a satisfação do atendimento pós-consulta
          </p>
        </div>

        <div className="flex items-center gap-2 bg-st-electric/10 border border-st-electric/30 px-3.5 py-2 rounded-xl text-xs text-st-electric font-semibold whitespace-nowrap">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Link de Avaliação Automático Ativado</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 rounded-2xl border border-st-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center justify-center font-extrabold text-xl shrink-0">
            {avgRating}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-st-muted tracking-wider block">Nota Média</span>
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(Number(avgRating))
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-st-muted/30'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-st-muted font-medium mt-0.5 block">{reviews.length} avaliações</span>
          </div>
        </div>

        <div className="card p-5 rounded-2xl border border-st-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-st-success/10 text-st-success border border-st-success/20 flex items-center justify-center font-extrabold text-xl shrink-0">
            {npsScore}%
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-st-muted tracking-wider block">NPS / Satisfação</span>
            <span className="text-xs font-bold text-st-arctic block mt-0.5">Promotores da Marca</span>
            <span className="text-[11px] text-st-muted font-medium">{total5Star} avaliações 5 estrelas</span>
          </div>
        </div>

        <div className="card p-5 rounded-2xl border border-st-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-st-electric/10 text-st-electric border border-st-electric/20 flex items-center justify-center font-extrabold text-xl shrink-0">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-st-muted tracking-wider block">Taxa de Resposta</span>
            <span className="text-xs font-bold text-st-arctic block mt-0.5">88% dos tutores</span>
            <span className="text-[11px] text-st-muted font-medium">respondem pós-consulta</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-st-border/40 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-st-muted uppercase shrink-0">Filtrar por:</span>
          {(['all', 5, 4, 3, 2, 1] as const).map((ratingVal) => (
            <button
              key={ratingVal}
              onClick={() => setFilterRating(ratingVal)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterRating === ratingVal
                  ? 'bg-st-electric text-white shadow-glow-sm'
                  : 'bg-st-surface text-st-muted hover:text-st-arctic border border-st-border'
              }`}
            >
              {ratingVal === 'all' ? 'Todas' : `${ratingVal} ★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.map((rev) => (
          <div key={rev.id} className="card p-5 rounded-2xl space-y-3 border border-st-border hover:border-st-electric/30 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-st-arctic text-sm">{rev.customer_name}</h3>
                <span className="text-xs text-st-electric font-medium">Pet: {rev.pet_name}</span>
              </div>

              <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
                <span className="text-xs font-extrabold text-yellow-400">{rev.rating}.0</span>
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              </div>
            </div>

            {rev.comment && (
              <p className="text-xs text-st-arctic/90 leading-relaxed bg-st-navy/50 p-3 rounded-xl border border-st-border/30">
                "{rev.comment}"
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] text-st-muted pt-1">
              <span>{new Date(rev.created_at).toLocaleDateString('pt-BR')}</span>
              <span className="text-st-electric font-medium">Avaliado via QR/Link pós-atendimento</span>
            </div>
          </div>
        ))}
      </div>

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
