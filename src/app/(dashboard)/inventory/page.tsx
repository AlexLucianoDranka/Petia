'use client';

import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, Search } from 'lucide-react';
import { INITIAL_INVENTORY } from '@/lib/mockData';

export default function InventoryPage() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdjustQuantity = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty, updated_at: new Date().toISOString() };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-st-electric" />
            <span>Estoque & Insumos</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Alertas automáticos de nível mínimo para medicamentos, estéticos e acessórios</p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all">
          <Plus className="w-4 h-4" />
          <span>Cadastrar Item no Estoque</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
        <input
          type="text"
          placeholder="Buscar insumo por produto ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
        />
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const isLowStock = item.quantity <= item.min_quantity;

          return (
            <div
              key={item.id}
              className={`card p-5 rounded-2xl space-y-4 shadow-sm ${
                isLowStock ? 'border-st-warning/50 bg-st-warning/5' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-surface-2 text-st-muted border border-st-border">
                    {item.category}
                  </span>
                  <h3 className="font-extrabold text-st-arctic text-base mt-1.5">{item.name}</h3>
                </div>
                {isLowStock && (
                  <span className="p-1.5 rounded-xl bg-st-warning/20 text-st-warning border border-st-warning/40 flex items-center gap-1 text-[10px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Estresse
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-st-navy p-3 rounded-xl border border-st-border/60">
                <div>
                  <span className="text-st-muted font-bold block text-[9px] uppercase">Qtd Atual</span>
                  <span className={`text-base font-black ${isLowStock ? 'text-st-warning' : 'text-st-arctic'}`}>
                    {item.quantity} un
                  </span>
                </div>
                <div>
                  <span className="text-st-muted font-bold block text-[9px] uppercase">Qtd Mínima</span>
                  <span className="text-base font-bold text-st-arctic">{item.min_quantity} un</span>
                </div>
              </div>

              {/* Adjust Quantity Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-st-muted font-medium">Custo Unit: R$ {item.unit_cost.toFixed(2)}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustQuantity(item.id, -1)}
                    className="p-1.5 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic font-bold text-xs border border-st-border"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleAdjustQuantity(item.id, 1)}
                    className="p-1.5 rounded-xl bg-st-electric/20 hover:bg-st-electric/30 text-st-electric font-bold text-xs border border-st-electric/40"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
