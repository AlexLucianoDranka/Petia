'use client';

import React, { useState } from 'react';
import { Briefcase, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { INITIAL_SERVICES } from '@/lib/mockData';

export default function ServicesPage() {
  const [services, setServices] = useState(INITIAL_SERVICES);

  const toggleServiceActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-st-electric" />
            <span>Serviços & Preços</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Defina preços por porte, duração estimada e categorias de atendimento</p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all">
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Serviço</span>
        </button>
      </div>

      {/* Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className={`card p-5 rounded-2xl space-y-4 shadow-sm ${
              srv.active ? '' : 'opacity-60 bg-st-navy'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30">
                  {srv.category}
                </span>
                <h3 className="font-extrabold text-st-arctic text-base mt-1.5">{srv.name}</h3>
              </div>
              <button
                onClick={() => toggleServiceActive(srv.id)}
                className={`p-1.5 rounded-xl text-xs font-semibold ${
                  srv.active ? 'text-st-success bg-st-success/20' : 'text-st-muted bg-st-surface'
                }`}
              >
                {srv.active ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between bg-st-navy p-3 rounded-xl border border-st-border/60 text-xs">
              <div className="flex items-center gap-1.5 text-st-muted">
                <Clock className="w-4 h-4 text-st-electric" />
                <span className="font-semibold text-st-arctic">{srv.duration_minutes} minutos</span>
              </div>
              <div className="font-extrabold text-st-arctic text-sm">
                R$ {srv.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
