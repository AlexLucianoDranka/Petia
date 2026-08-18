'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, RefreshCw, X, CheckCircle2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getScopedData } from '@/lib/data/clinicDataScope';
import { showToast } from '@/components/ui/GlobalToastAndLoader';
import { ClientPortal } from '@/components/ui/ClientPortal';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_cost: number;
  updated_at?: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    getScopedData('petia_inventory')
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State: Cadastrar Produto / Insumo
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Medicamentos');
  const [newQuantity, setNewQuantity] = useState('');
  const [newMinQuantity, setNewMinQuantity] = useState('');
  const [newUnitCost, setNewUnitCost] = useState('');

  // Modal State: Adjust Stock / Entrada de Nota
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState('');

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (isCreateModalOpen || isAdjustModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateModalOpen, isAdjustModalOpen]);

  const saveInventoryToStorage = (updated: InventoryItem[]) => {
    setInventory(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('petia_inventory', JSON.stringify(updated));
      window.dispatchEvent(new Event('petia_data_updated'));
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      quantity: parseInt(newQuantity, 10) || 0,
      min_quantity: parseInt(newMinQuantity, 10) || 5,
      unit_cost: parseFloat(newUnitCost) || 0,
      updated_at: new Date().toISOString(),
    };

    const updated = [newItem, ...inventory];
    saveInventoryToStorage(updated);

    // Reset form
    setNewName('');
    setNewQuantity('');
    setNewMinQuantity('');
    setNewUnitCost('');
    setIsCreateModalOpen(false);

    showToast('Insumo cadastrado no estoque com sucesso!', 'success');
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const qtyToAdd = parseInt(adjustQty, 10) || 0;
    const updated = inventory.map((item) => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          quantity: Math.max(0, item.quantity + qtyToAdd),
          updated_at: new Date().toISOString(),
        };
      }
      return item;
    });

    saveInventoryToStorage(updated);
    setIsAdjustModalOpen(false);
    setSelectedItem(null);
    setAdjustQty('');
    showToast('Estoque atualizado com sucesso!', 'success');
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${name}" do estoque?`)) {
      const updated = inventory.filter((item) => item.id !== id);
      saveInventoryToStorage(updated);
      showToast('Item removido do estoque!', 'info');
    }
  };

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
          <p className="text-xs text-st-muted mt-0.5">
            Controle de vacinas, medicamentos, rações, xampus e material de consumo
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none cursor-pointer"
        >
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

      {/* Inventory Items List */}
      {filtered.length === 0 ? (
        <div className="card p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-st-surface-2 border border-st-border flex items-center justify-center text-st-muted">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-st-arctic">Nenhum item no estoque</h3>
          <p className="text-xs text-st-muted max-w-sm">
            {searchTerm
              ? 'Nenhum item encontrado com essa busca.'
              : 'Seu estoque está vazio. Cadastre seu primeiro insumo clínico ou produto!'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Insumo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 w-full space-y-3">
          {filtered.map((item) => {
            const isLowStock = item.quantity <= item.min_quantity;

            return (
              <div
                key={item.id}
                className="card p-4 sm:p-5 rounded-2xl w-full border border-st-border hover:border-st-electric/40 transition-all space-y-4"
              >
                {/* Header Line */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric border border-st-electric/40 flex items-center justify-center font-extrabold text-base shrink-0 shadow-glow">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-st-arctic text-base leading-tight">{item.name}</h3>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-electric/15 text-st-electric border border-st-electric/30 whitespace-nowrap">
                          {item.category}
                        </span>
                        {isLowStock && (
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-st-danger/20 text-st-danger border border-st-danger/30 whitespace-nowrap">
                            Estoque Baixo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-st-muted mt-0.5">
                        Custo Unitário: {formatCurrency(item.unit_cost || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setAdjustQty('1');
                        setIsAdjustModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-st-electric" /> Ajustar Qtd
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setAdjustQty('10');
                        setIsAdjustModalOpen(true);
                      }}
                      className="px-4 py-1.5 bg-st-electric hover:bg-st-steel text-white font-bold rounded-xl text-xs shadow-glow transition-all whitespace-nowrap border-none cursor-pointer"
                    >
                      Entrada de Nota
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="p-1.5 rounded-xl bg-st-surface hover:bg-st-danger/20 text-st-muted hover:text-st-danger border border-st-border transition-colors cursor-pointer"
                      title="Excluir do Estoque"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Inner Structured Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-st-surface/60 border border-st-border/50 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">
                      Quantidade em Estoque
                    </span>
                    <span className={`font-extrabold text-sm block ${isLowStock ? 'text-st-danger' : 'text-st-arctic'}`}>
                      {item.quantity} unidades
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">
                      Custo de Aquisição
                    </span>
                    <span className="font-extrabold text-st-electric text-sm block">
                      {formatCurrency(item.unit_cost || 0)}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-st-muted uppercase tracking-wider block">
                      Estoque Mínimo de Alerta
                    </span>
                    <span className="text-st-muted font-semibold block">{item.min_quantity} unidades</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Cadastrar Produto / Insumo (Perfeitamente Centralizado na Tela com Lock de Scroll + Portal) */}
      {isCreateModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
          <div className="relative my-auto w-full max-w-lg card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-st-border/40 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-st-arctic">Cadastrar Insumo no Estoque</h3>
                  <p className="text-xs text-st-muted">Adicione vacinas, medicamentos ou materiais de consumo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-st-muted hover:text-st-arctic hover:bg-st-surface-2 shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable */}
            <form onSubmit={handleCreateItem} className="space-y-4 text-xs lg:text-sm overflow-y-auto sidebar-scrollbar flex-1 pr-1">
              <div>
                <label className="block font-semibold text-st-muted mb-1">Nome do Insumo / Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vacina V10 Zoetis (Frasco 1 dose)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-st-muted mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                >
                  <option value="Medicamentos">Medicamentos</option>
                  <option value="Vacinas">Vacinas</option>
                  <option value="Estética">Estética & Banho</option>
                  <option value="Cirurgia & Hospitalar">Cirurgia & Hospitalar</option>
                  <option value="Alimentação">Alimentação & Rações</option>
                  <option value="Acessórios">Acessórios & Consumo</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Qtd Inicial</label>
                  <input
                    type="number"
                    required
                    placeholder="10"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Estoque Mín.</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={newMinQuantity}
                    onChange={(e) => setNewMinQuantity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newUnitCost}
                    onChange={(e) => setNewUnitCost(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-st-border text-st-muted hover:text-st-arctic font-semibold whitespace-nowrap cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold shadow-glow whitespace-nowrap cursor-pointer border-none"
                >
                  Salvar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
        </ClientPortal>
      )}

      {/* MODAL 2: Ajustar Estoque / Entrada de Nota (Centralizado + Lock de Scroll + Portal) */}
      {isAdjustModalOpen && selectedItem && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
          <div className="relative my-auto w-full max-w-md card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-st-arctic">Entrada / Ajuste de Estoque</h3>
                  <p className="text-xs text-st-muted truncate max-w-[200px]">{selectedItem.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-2 rounded-xl text-st-muted hover:text-st-arctic hover:bg-st-surface-2 shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs lg:text-sm">
              <div className="p-3 rounded-xl bg-st-surface/60 border border-st-border text-xs space-y-1">
                <p className="text-st-muted">Estoque Atual: <strong className="text-st-arctic">{selectedItem.quantity} unidades</strong></p>
                <p className="text-st-muted">Estoque Mínimo: <strong className="text-st-arctic">{selectedItem.min_quantity} unidades</strong></p>
              </div>

              <div>
                <label className="block font-semibold text-st-muted mb-1">
                  Quantidade a Adicionar / Remover (usar valor negativo para dar baixa) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 10 para adicionar 10 un"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-st-border text-st-muted hover:text-st-arctic font-semibold whitespace-nowrap cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold shadow-glow whitespace-nowrap cursor-pointer border-none"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
        </ClientPortal>
      )}
    </div>
  );
}
