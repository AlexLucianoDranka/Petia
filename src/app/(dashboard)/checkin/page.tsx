'use client';

import React, { useState } from 'react';
import { CheckCircle2, DollarSign, Printer, Mail, Clock, Dog } from 'lucide-react';

export default function CheckinPage() {
  const [activeQueue, setActiveQueue] = useState([
    {
      id: 'chk-1',
      petName: 'Thor (Golden)',
      tutorName: 'Mariana Silva Santos',
      tutorPhone: '(11) 99123-4567',
      service: 'Banho & Tosa Completa',
      price: 130.0,
      status: 'in_progress',
      checkinTime: '10:15',
    },
    {
      id: 'chk-2',
      petName: 'Mel (Shih Tzu)',
      tutorName: 'Fernanda Lima Castro',
      tutorPhone: '(11) 97766-5544',
      service: 'Banho Higiênico',
      price: 75.0,
      status: 'ready_for_checkout',
      checkinTime: '09:30',
    },
  ]);

  const [completedInvoice, setCompletedInvoice] = useState<any>(null);

  const handleAdvanceStatus = (id: string) => {
    setActiveQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.status === 'checked_in') return { ...item, status: 'in_progress' };
          if (item.status === 'in_progress') return { ...item, status: 'ready_for_checkout' };
        }
        return item;
      })
    );
  };

  const handleCheckoutAndPay = (item: any) => {
    setCompletedInvoice({
      ...item,
      invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });

    setActiveQueue((prev) => prev.filter((i) => i.id !== item.id));
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-st-electric" />
            <span>Fila de Check-in & Checkout</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Recepção do pet, esteira de atendimento e geração rápida de cobrança no Petia</p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all">
          <span>+ Novo Check-in de Balcão</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Queue Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-st-arctic text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-st-electric" />
            <span>Esteira de Atendimento Atual</span>
          </h2>

          <div className="space-y-3">
            {activeQueue.length === 0 ? (
              <div className="p-8 card rounded-2xl text-center text-st-muted text-xs">
                Nenhum pet na esteira de check-in neste momento.
              </div>
            ) : (
              activeQueue.map((item) => (
                <div key={item.id} className="card p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric font-bold flex items-center justify-center border border-st-electric/30">
                        <Dog className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-st-arctic text-base">{item.petName}</h3>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              item.status === 'in_progress'
                                ? 'bg-st-electric/20 text-st-electric border-st-electric/30'
                                : item.status === 'ready_for_checkout'
                                ? 'bg-st-warning/20 text-st-warning border-st-warning/30 animate-pulse'
                                : 'bg-st-surface-2 text-st-muted border-st-border'
                            }`}
                          >
                            {item.status === 'in_progress'
                              ? 'EM BANHO / CONSULTA'
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
                          className="px-4 py-2 rounded-xl bg-st-warning hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition-all"
                        >
                          Marcar como Pronto
                        </button>
                      )}

                      {item.status === 'ready_for_checkout' && (
                        <button
                          onClick={() => handleCheckoutAndPay(item)}
                          className="px-4 py-2 rounded-xl bg-st-success hover:bg-emerald-600 text-white font-semibold text-xs shadow-glow-success transition-all animate-bounce"
                        >
                          Checkout & Cobrar R$ {item.price.toFixed(2)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoice Generator Card */}
        <div className="card rounded-2xl p-6 space-y-4 h-fit">
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
                  className="flex-1 py-2 rounded-xl bg-st-surface hover:bg-st-surface-2 text-st-arctic border border-st-border font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => alert('Recibo enviado via WhatsApp!')}
                  className="flex-1 py-2 rounded-xl bg-st-success hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
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
    </div>
  );
}
