'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search, Plus, ShoppingCart, Trash2, X, Package, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getScopedData } from '@/lib/data/clinicDataScope';
import { showToast } from '@/components/ui/GlobalToastAndLoader';
import { ClientPortal } from '@/components/ui/ClientPortal';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
  created_at?: string;
}

export default function StorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ProductItem[]>(() =>
    getScopedData('petia_store_products')
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Alimentação');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newImage, setNewImage] = useState('');

  // Lock background scroll when modal is open
  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const saveProductsToStorage = (updated: ProductItem[]) => {
    setProducts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('petia_store_products', JSON.stringify(updated));
      window.dispatchEvent(new Event('petia_data_updated'));
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;

    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      price: parseFloat(newPrice) || 0,
      stock: parseInt(newStock, 10) || 0,
      image: newImage.trim() || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };

    const updated = [newProd, ...products];
    saveProductsToStorage(updated);

    // Reset form
    setNewName('');
    setNewPrice('');
    setNewStock('');
    setNewImage('');
    setIsModalOpen(false);

    showToast('Produto cadastrado com sucesso!', 'success');
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      const updated = products.filter((p) => p.id !== id);
      saveProductsToStorage(updated);
      showToast('Produto excluído com sucesso!', 'info');
    }
  };

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

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap border-none"
        >
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

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="card p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-st-surface-2 border border-st-border flex items-center justify-center text-st-muted">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-st-arctic">Nenhum produto no catálogo</h3>
          <p className="text-xs text-st-muted max-w-sm">
            {searchTerm ? 'Nenhum produto encontrado com essa busca.' : 'Sua loja não possui produtos cadastrados ainda. Adicione o primeiro produto!'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Produto</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 w-full space-y-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="card p-4 sm:p-5 rounded-2xl w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-st-border hover:border-st-electric/40 transition-all"
            >
              {/* Product Image & Details */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-st-navy shrink-0 border border-st-border">
                  <img
                    src={p.image || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&auto=format&fit=crop&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&auto=format&fit=crop&q=80');
                    }}
                  />
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

              {/* Price, Delete & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-st-border/20 pt-2 sm:pt-0">
                <span className="text-xl font-extrabold text-st-arctic whitespace-nowrap">{formatCurrency(p.price)}</span>
                
                <button
                  onClick={() => handleDeleteProduct(p.id, p.name)}
                  className="p-2.5 rounded-xl bg-st-surface hover:bg-st-danger/20 text-st-muted hover:text-st-danger border border-st-border transition-colors whitespace-nowrap shrink-0"
                  title="Excluir Produto"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Cadastrar Produto (Centralizado + Lock de Scroll + Portal) */}
      {isModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
            <div className="relative my-auto w-full max-w-md card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-st-border/40 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-st-arctic">Cadastrar Novo Produto</h3>
                    <p className="text-xs text-st-muted">Adicione itens ao catálogo da sua clínica</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-st-muted hover:text-st-arctic hover:bg-st-surface-2 shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs lg:text-sm overflow-y-auto sidebar-scrollbar flex-1 pr-1">
              <div>
                <label className="block font-semibold text-st-muted mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ração Premier Cães Adultos 15kg"
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
                  <option value="Alimentação">Alimentação</option>
                  <option value="Higiene & Estética">Higiene & Estética</option>
                  <option value="Medicamentos & Proteção">Medicamentos & Proteção</option>
                  <option value="Acessórios & Brinquedos">Acessórios & Brinquedos</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-st-muted mb-1">URL da Imagem (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-st-border text-st-muted hover:text-st-arctic font-semibold whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold shadow-glow whitespace-nowrap"
                >
                  Salvar Produto
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
