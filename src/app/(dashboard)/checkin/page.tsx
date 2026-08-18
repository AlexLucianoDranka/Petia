'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, DollarSign, Printer, Mail, Clock, Dog, Plus, X, Trash2 } from 'lucide-react';
import { getScopedData } from '@/lib/data/clinicDataScope';
import { showToast } from '@/components/ui/GlobalToastAndLoader';
import { ClientPortal } from '@/components/ui/ClientPortal';

export interface CheckinItem {
  id: string;
  petName: string;
  tutorName: string;
  tutorPhone: string;
  service: string;
  price: number;
  status: 'checked_in' | 'in_progress' | 'ready_for_checkout';
  created_at: string;
}

export default function CheckinPage() {
  const [activeQueue, setActiveQueue] = useState<CheckinItem[]>(() =>
    getScopedData('petia_checkin_queue')
  );
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [petName, setPetName] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');
  const [service, setService] = useState('Banho & Tosa');
  const [price, setPrice] = useState('');

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const saveQueueToStorage = (updated: CheckinItem[]) => {
    setActiveQueue(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('petia_checkin_queue', JSON.stringify(updated));
      window.dispatchEvent(new Event('petia_data_updated'));
    }
  };

  const handleCreateCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim() || !tutorName.trim()) return;

    const newItem: CheckinItem = {
      id: `chk-${Date.now()}`,
      petName: petName.trim(),
      tutorName: tutorName.trim(),
      tutorPhone: tutorPhone.trim() || '(11) 99999-9999',
      service: service,
      price: parseFloat(price) || 85.0,
      status: 'in_progress',
      created_at: new Date().toISOString(),
    };

    const updated = [newItem, ...activeQueue];
    saveQueueToStorage(updated);

    // Reset form
    setPetName('');
    setTutorName('');
    setTutorPhone('');
    setPrice('');
    setIsModalOpen(false);

    showToast('Check-in realizado com sucesso!', 'success');
  };

  const handleAdvanceStatus = (id: string) => {
    const updated = activeQueue.map((item) => {
      if (item.id === id) {
        if (item.status === 'checked_in') return { ...item, status: 'in_progress' as const };
        if (item.status === 'in_progress') return { ...item, status: 'ready_for_checkout' as const };
      }
      return item;
    });
    saveQueueToStorage(updated);
    showToast('Status do pet atualizado na esteira!', 'info');
  };

  const handleCheckoutAndPay = (item: CheckinItem) => {
    setCompletedInvoice({
      ...item,
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });

    const updated = activeQueue.filter((i) => i.id !== item.id);
    saveQueueToStorage(updated);
    showToast('Checkout concluído e cobrança gerada!', 'success');
  };

  const handleDeleteItem = (id: string) => {
    const updated = activeQueue.filter((i) => i.id !== id);
    saveQueueToStorage(updated);
    showToast('Item removido da esteira', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-up w-full pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl w-full">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-st-electric" />
            <span>Fila de Check-in & Checkout</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">
            Recepção do pet, esteira de atendimento e geração rápida de cobrança no Petia
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all cursor-pointer border-none"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Novo Check-in de Balcão</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Queue Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-st-arctic text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-st-electric" />
            <span>Esteira de Atendimento Atual ({activeQueue.length})</span>
          </h2>

          <div className="space-y-3">
            {activeQueue.length === 0 ? (
              <div className="p-12 card rounded-2xl text-center text-st-muted text-xs space-y-3">
                <Dog className="w-10 h-10 text-st-muted/40 mx-auto" />
                <p>Nenhum pet na esteira de check-in neste momento.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-st-electric hover:bg-st-steel text-white font-bold text-xs rounded-xl shadow-glow"
                >
                  Fazer Primeiro Check-in
                </button>
              </div>
            ) : (
              activeQueue.map((item) => (
                <div key={item.id} className="card p-5 rounded-2xl space-y-4 border border-st-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric font-bold flex items-center justify-center border border-st-electric/30 shrink-0">
                        <Dog className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-st-arctic text-base">{item.petName}</h3>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              item.status === 'in_progress'
                                ? 'bg-st-electric/20 text-st-electric border-st-electric/30'
                                : item.status === 'ready_for_checkout'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                                : 'bg-st-surface-2 text-st-muted border-st-border'
                            }`}
                          >
                            {item.status === 'in_progress'
                              ? 'EM ATENDIMENTO'
                              : item.status === 'ready_for_checkout'
                              ? 'PRONTO PARA CHECKOUT'
                              : 'CHECK-IN EFETUADO'}
                          </span>
                        </div>
                        <p className="text-xs text-st-muted mt-0.5">
                          Tutor: <span className="font-semibold text-st-arctic">{item.tutorName}</span> ({item.tutorPhone})
                        </p>
                        <p className="text-xs text-st-arctic font-semibold mt-1">
                          Serviço: {item.service} — <span className="text-st-electric font-bold">R$ {item.price.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {item.status === 'in_progress' && (
                        <button
                          onClick={() => handleAdvanceStatus(item.id)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-st-navy font-bold text-xs shadow-sm transition-all border-none cursor-pointer"
                        >
                          Marcar como Pronto
                        </button>
                      )}

                      {item.status === 'ready_for_checkout' && (
                        <button
                          onClick={() => handleCheckoutAndPay(item)}
                          className="px-4 py-2 rounded-xl bg-st-success hover:bg-emerald-600 text-white font-bold text-xs shadow-glow transition-all border-none cursor-pointer"
                        >
                          Checkout & Cobrar R$ {item.price.toFixed(2)}
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-xl bg-st-surface hover:bg-st-danger/20 text-st-muted hover:text-st-danger border border-st-border transition-colors cursor-pointer"
                        title="Cancelar / Remover da Fila"
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoice Generator Card */}
        <div className="card rounded-2xl p-6 space-y-4 h-fit border border-st-border">
          <h3 className="font-bold text-st-arctic text-base flex items-center gap-2 border-b border-st-border/40 pb-3">
            <DollarSign className="w-5 h-5 text-st-success" />
            <span>Comprovante de Cobrança</span>
          </h3>

          {completedInvoice ? (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="p-4 bg-st-success/15 rounded-xl border border-st-success/30 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-st-success mx-auto" />
                <h4 className="font-bold text-st-success text-sm">Pagamento Confirmado</h4>
                <p className="text-[11px] text-st-muted">Recibo gerado automaticamente.</p>
              </div>

              <div className="p-4 bg-st-navy rounded-xl border border-st-border space-y-2 font-mono text-[11px]">
                <p className="flex justify-between">
                  <span className="text-st-muted">Recibo Nº:</span>
                  <span className="font-bold text-st-arctic">{completedInvoice.invoiceNumber}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-st-muted">Pet:</span>
                  <span className="font-bold text-st-arctic">{completedInvoice.petName}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-st-muted">Tutor:</span>
                  <span className="font-bold text-st-arctic">{completedInvoice.tutorName}</span>
                </p>
                <p className="flex justify-between border-t border-st-border/40 pt-2 text-xs">
                  <span className="font-bold text-st-arctic">Total Pago:</span>
                  <span className="font-bold text-st-success">R$ {completedInvoice.price.toFixed(2)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Imprimindo comprovante...')}
                  className="flex-1 py-2 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic border border-st-border font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => alert('Recibo enviado via WhatsApp!')}
                  className="flex-1 py-2 rounded-xl bg-st-success hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border-none cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Enviar Recibo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-st-muted text-xs">
              Conclua o atendimento na esteira para gerar o recibo de pagamento.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Novo Check-in de Balcão (Centralizado + Lock de Scroll + Portal) */}
      {isModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
          <div className="relative my-auto w-full max-w-md card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-st-arctic">Novo Check-in de Balcão</h3>
                  <p className="text-xs text-st-muted">Adicione o pet na esteira de atendimento</p>
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

            <form onSubmit={handleCreateCheckin} className="space-y-4 text-xs lg:text-sm overflow-y-auto sidebar-scrollbar flex-1 pr-1">
              <div>
                <label className="block font-semibold text-st-muted mb-1">Nome do Pet *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Thor, Luna..."
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-st-muted mb-1">Nome do Tutor Responsável *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Mendes"
                  value={tutorName}
                  onChange={(e) => setTutorName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-st-muted mb-1">WhatsApp / Telefone</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={tutorPhone}
                  onChange={(e) => setTutorPhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Serviço</label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  >
                    <option value="Banho & Tosa">Banho & Tosa</option>
                    <option value="Consulta Veterinária">Consulta Veterinária</option>
                    <option value="Vacinação">Vacinação</option>
                    <option value="Hospedagem / Creche">Hospedagem / Creche</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-st-muted mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="85.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-st-border text-st-muted hover:text-st-arctic font-semibold whitespace-nowrap cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold shadow-glow whitespace-nowrap cursor-pointer border-none"
                >
                  Fazer Check-in
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
