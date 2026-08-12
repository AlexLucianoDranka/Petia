'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search, Plus, ShoppingCart, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';

export default function StorePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const [products] = useState([
    {
      id: 'prod-1',
      name: 'Ração Premier Formula Cães Adultos 15kg',
      category: 'Alimentação',
      price: 239.9,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-2',
      name: 'Shampoo Hipoalergênico Petia 500ml',
      category: 'Higiene & Estética',
      price: 48.9,
      stock: 24,
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 'prod-3',
      name: 'Coleira Antipulgas Seresto Cães Grandes',
      category: 'Medicamentos & Proteção',
      price: 189.0,
      stock: 8,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&auto=format&fit=crop&q=80',
    },
  ]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-st-electric" />
            <span>Loja & Catálogo de Produtos</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">
            Catálogo digital de rações, medicamentos, produtos de higiene e acessórios integrados ao estoque
          </p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none">
          <Plus className="w-4 h-4 shrink-0" />
          <span>Cadastrar Novo Produto</span>
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

      {/* 1 Coluna por Produto na Horizontal (100% Tela) */}
      <div className="grid grid-cols-1 w-full space-y-3">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="card p-4 sm:p-5 rounded-2xl w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-st-border hover:border-st-electric/40 transition-all"
          >
            {/* Product Image & Details */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-st-navy shrink-0 border border-st-border">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-st-arctic text-base truncate">{p.name}</h3>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30 whitespace-nowrap">
                    {p.category}
                  </span>
                </div>
                <span className="text-xs text-st-muted block mt-0.5 font-mono">Estoque disponível: {p.stock} un.</span>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-st-border/20 pt-2 sm:pt-0">
              <span className="text-xl font-extrabold text-st-arctic whitespace-nowrap">{formatCurrency(p.price)}</span>
              <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white text-xs font-bold shadow-glow whitespace-nowrap border-none">
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" /> Adicionar à Venda
              </button>
            </div>
          </div>
        ))}
      </div>

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
