'use client';

import React, { useState } from 'react';
import { Package, Plus, Search, RefreshCw } from 'lucide-react';
import { INITIAL_INVENTORY } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function InventoryPage() {
  const [inventory] = useState(INITIAL_INVENTORY);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-st-electric" />
            <span>Estoque & Insumos Clínicos</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Controle de vacinas, medicamentos, rações, xampus e material de consumo</p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none">
          <Plus className="w-4 h-4 shrink-0" />
          <span>Cadastrar Produto / Insumo</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
        <input
          type="text"
          placeholder="Buscar produto por nome ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
        />
      </div>

      {/* 1 Coluna por Produto no Estoque na Horizontal (100% Tela) */}
      <div className="grid grid-cols-1 w-full space-y-3">
        {filtered.map((item) => {
          const isLowStock = item.quantity <= item.min_quantity;

          return (
            <div
              key={item.id}
              className="card p-4 sm:p-5 rounded-2xl w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-st-border hover:border-st-electric/40 transition-all"
            >
              {/* Item Name & Category */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-st-electric/20 text-st-electric border border-st-electric/40 flex items-center justify-center font-extrabold text-base shrink-0 shadow-glow">
                  <Package className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-st-arctic text-base truncate">{item.name}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30 whitespace-nowrap">
                      {item.category}
                    </span>
                    {isLowStock && (
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-danger/20 text-st-danger border border-st-danger/30 whitespace-nowrap">
                        Estoque Baixo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-st-muted mt-0.5">Custo Unitário: {formatCurrency(item.unit_cost || 0)}</p>
                </div>
              </div>

              {/* Internal Columns: Quantity & Price */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-st-border/40 pt-3 lg:pt-0 lg:pl-4">
                <div>
                  <span className="text-[10px] font-bold text-st-muted uppercase block">Qtd em Estoque</span>
                  <span className={`font-extrabold text-sm block ${isLowStock ? 'text-st-danger' : 'text-st-arctic'}`}>
                    {item.quantity} un.
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-st-muted uppercase block">Valor Unitário Custo</span>
                  <span className="font-extrabold text-st-electric text-sm block">{formatCurrency(item.unit_cost || 0)}</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-[10px] font-bold text-st-muted uppercase block">Estoque Mínimo</span>
                  <span className="text-st-muted font-semibold block">{item.min_quantity} un.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-st-border/20">
                <button className="px-3.5 py-2 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-st-electric" /> Ajustar Qtd
                </button>
                <button className="px-4 py-2 bg-st-electric hover:bg-st-steel text-white font-bold rounded-xl text-xs shadow-glow transition-all whitespace-nowrap border-none">
                  Entrada de Nota
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
