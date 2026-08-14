'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Calendar,
  UserCheck,
  Building2,
  Printer,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SolidaTechBadge } from '@/components/ui/SolidaTechBadge';
import jsPDF from 'jspdf';

import { getScopedData } from '@/lib/data/clinicDataScope';



export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pdv' | 'receivables' | 'payables' | 'commissions'>('overview');

  // PDV State
  const [pdvClient, setPdvClient] = useState('');
  const [pdvPet, setPdvPet] = useState('');
  const [pdvItems, setPdvItems] = useState<{ id: string; name: string; price: number; qty: number; type: string }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit' | 'cash'>('pix');
  const [saleCompleted, setSaleCompleted] = useState(false);

  // Payables & Receivables Scoped Data
  const [receivables, setReceivables] = useState<any[]>(() => getScopedData('petia_receivables'));
  const [payables, setPayables] = useState<any[]>(() => getScopedData('petia_payables'));
  const [commissions] = useState<any[]>(() => getScopedData('petia_commissions'));

  const subtotalPdv = pdvItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const generateReceiptPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Petia - Recibo de Pagamento Balcao', 14, 20);
    doc.setFontSize(10);
    doc.text(`Cliente / Tutor: ${pdvClient}`, 14, 30);
    doc.text(`Pet: ${pdvPet}`, 14, 36);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 42);
    doc.text(`Forma de Pagamento: ${paymentMethod.toUpperCase()}`, 14, 48);

    doc.text('------------------------------------------------------------', 14, 54);

    let y = 62;
    pdvItems.forEach((item) => {
      doc.text(`${item.name} (${item.qty}x) - R$ ${(item.price * item.qty).toFixed(2)}`, 14, y);
      y += 8;
    });

    doc.text('------------------------------------------------------------', 14, y);
    doc.setFontSize(12);
    doc.text(`TOTAL PAGO: R$ ${subtotalPdv.toFixed(2)}`, 14, y + 10);
    doc.setFontSize(9);
    doc.text('Obrigado pela preferencia! Petia Gestao Veterinaria', 14, y + 22);

    doc.save(`recibo-${pdvClient.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const handleFinishSale = () => {
    generateReceiptPDF();
    setSaleCompleted(true);
    setTimeout(() => {
      setSaleCompleted(false);
      setPdvItems([]);
    }, 3000);
  };

  const markAsPaid = (id: string) => {
    setReceivables((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'paid' } : item))
    );
  };

  return (
    <div className="space-y-6 animate-fade-up w-full max-w-6xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-st-electric" />
            <span>Financeiro & Caixa PDV</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">
            Faturamento, PDV de caixa rápido, contas a receber, contas a pagar e cálculo automático de comissões
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-st-surface rounded-xl border border-st-border flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('pdv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'pdv' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            Caixa PDV
          </button>
          <button
            onClick={() => setActiveTab('receivables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'receivables' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            A Receber
          </button>
          <button
            onClick={() => setActiveTab('payables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'payables' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            A Pagar
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'commissions' ? 'bg-st-electric text-white shadow-glow-sm' : 'text-st-muted hover:text-st-arctic'
            }`}
          >
            Comissões
          </button>
        </div>
      </div>

      {/* TAB 1: VISÃO GERAL & METRICAS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div className="card p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-st-muted">
                <span className="text-xs font-semibold">Faturamento (Mês)</span>
                <div className="p-2 rounded-xl bg-st-success/15 text-st-success">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-st-arctic">{formatCurrency(18940.0)}</p>
              <span className="text-[10px] text-st-success font-semibold block">+14% vs mês anterior</span>
            </div>

            <div className="card p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-st-muted">
                <span className="text-xs font-semibold">Contas a Receber</span>
                <div className="p-2 rounded-xl bg-st-electric/15 text-st-electric">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-st-arctic">{formatCurrency(600.0)}</p>
              <span className="text-[10px] text-st-muted font-semibold block">4 faturas pendentes</span>
            </div>

            <div className="card p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-st-muted">
                <span className="text-xs font-semibold">Contas a Pagar</span>
                <div className="p-2 rounded-xl bg-st-danger/15 text-st-danger">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-st-arctic">{formatCurrency(1630.0)}</p>
              <span className="text-[10px] text-st-danger font-semibold block">2 despesas pendentes</span>
            </div>

            <div className="card p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-st-muted">
                <span className="text-xs font-semibold">Comissões a Pagar</span>
                <div className="p-2 rounded-xl bg-st-warning/15 text-st-warning">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-st-arctic">{formatCurrency(2682.0)}</p>
              <span className="text-[10px] text-st-muted font-semibold block">3 profissionais</span>
            </div>
          </div>

          {/* DRE Resumo Simplificado */}
          <div className="card p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3">
              Balanço Financeiro DRE Simplificado (Agosto / 2026)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-st-surface">
                <span className="font-semibold text-st-arctic">Receita Bruta Total (Serviços + Produtos + Assinaturas)</span>
                <span className="font-extrabold text-st-success text-sm">+ {formatCurrency(18940.0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-st-surface">
                <span className="font-semibold text-st-arctic">(-) Custos de Insumos & Fornecedores</span>
                <span className="font-extrabold text-st-danger text-sm">- {formatCurrency(3250.0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-st-surface">
                <span className="font-semibold text-st-arctic">(-) Comissões da Equipe Técnica</span>
                <span className="font-extrabold text-st-danger text-sm">- {formatCurrency(2682.0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-st-surface">
                <span className="font-semibold text-st-arctic">(-) Despesas Operacionais (Aluguel, Luz, Internet)</span>
                <span className="font-extrabold text-st-danger text-sm">- {formatCurrency(1630.0)}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-st-electric/15 border border-st-electric/30">
                <span className="font-extrabold text-st-arctic text-sm">(=) Lucro Líquido Operacional</span>
                <span className="font-extrabold text-st-electric text-base">{formatCurrency(11378.0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAIXA PDV / VENDAS BALCÃO */}
      {activeTab === 'pdv' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Item Selector */}
          <div className="lg:col-span-2 card p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3 flex items-center justify-between">
              <span>Nova Venda / Checkout no Balcão</span>
              <span className="text-xs text-st-electric font-mono">Caixa Aberto #001</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-st-muted mb-1">Cliente / Tutor</label>
                <input
                  type="text"
                  value={pdvClient}
                  onChange={(e) => setPdvClient(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                />
              </div>
              <div>
                <label className="block font-semibold text-st-muted mb-1">Pet Atendido</label>
                <input
                  type="text"
                  value={pdvPet}
                  onChange={(e) => setPdvPet(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                />
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold uppercase text-st-muted block">Adicionar Itens Rápidos:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setPdvItems([...pdvItems, { id: Date.now().toString(), name: 'Consulta Geral', price: 150.0, qty: 1, type: 'service' }])
                  }
                  className="px-3 py-1.5 rounded-lg bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border whitespace-nowrap"
                >
                  + Consulta (R$ 150)
                </button>
                <button
                  onClick={() =>
                    setPdvItems([...pdvItems, { id: Date.now().toString(), name: 'Vacina V10 Cão', price: 110.0, qty: 1, type: 'service' }])
                  }
                  className="px-3 py-1.5 rounded-lg bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border whitespace-nowrap"
                >
                  + Vacina V10 (R$ 110)
                </button>
                <button
                  onClick={() =>
                    setPdvItems([...pdvItems, { id: Date.now().toString(), name: 'Ração Premier 3kg', price: 89.9, qty: 1, type: 'product' }])
                  }
                  className="px-3 py-1.5 rounded-lg bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border whitespace-nowrap"
                >
                  + Ração Premier 3kg (R$ 89,90)
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2 pt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-st-border/40 text-st-muted font-bold">
                      <th className="py-2">Item / Serviço</th>
                      <th className="py-2 text-center">Qtd</th>
                      <th className="py-2 text-right">Valor Un.</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-st-border/20">
                    {pdvItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 font-semibold text-st-arctic">{item.name}</td>
                        <td className="py-2.5 text-center">{item.qty}</td>
                        <td className="py-2.5 text-right">{formatCurrency(item.price)}</td>
                        <td className="py-2.5 text-right font-bold text-st-electric">{formatCurrency(item.price * item.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Checkout Payment Summary Card */}
          <div className="card p-6 rounded-2xl space-y-4 h-fit border border-st-electric/30">
            <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3">Resumo da Venda</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-st-muted">
                <span>Subtotal Itens:</span>
                <span className="font-semibold text-st-arctic">{formatCurrency(subtotalPdv)}</span>
              </div>
              <div className="flex justify-between text-st-muted">
                <span>Desconto:</span>
                <span className="font-semibold text-st-success">R$ 0,00</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-st-arctic pt-2 border-t border-st-border/40">
                <span>Total a Pagar:</span>
                <span className="text-st-electric">{formatCurrency(subtotalPdv)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-st-muted">Forma de Pagamento:</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'pix' ? 'bg-st-electric text-white border-st-electric shadow-glow-sm' : 'bg-st-surface border-st-border text-st-muted'
                  }`}
                >
                  Pix Instantâneo
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'credit' ? 'bg-st-electric text-white border-st-electric shadow-glow-sm' : 'bg-st-surface border-st-border text-st-muted'
                  }`}
                >
                  Cartão Crédito
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('debit')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'debit' ? 'bg-st-electric text-white border-st-electric shadow-glow-sm' : 'bg-st-surface border-st-border text-st-muted'
                  }`}
                >
                  Cartão Débito
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'cash' ? 'bg-st-electric text-white border-st-electric shadow-glow-sm' : 'bg-st-surface border-st-border text-st-muted'
                  }`}
                >
                  Dinheiro
                </button>
              </div>
            </div>

            {saleCompleted ? (
              <div className="p-3 bg-st-success/15 border border-st-success/30 text-st-success rounded-xl text-xs font-bold text-center animate-fade-in">
                Venda Finalizada com Sucesso! Comprovante emitido.
              </div>
            ) : (
              <button
                onClick={handleFinishSale}
                className="w-full py-3 rounded-xl bg-st-electric hover:bg-st-steel text-white font-extrabold text-xs shadow-glow transition-all whitespace-nowrap border-none"
              >
                Concluir Venda & Emitir Recibo
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CONTAS A RECEBER */}
      {activeTab === 'receivables' && (
        <div className="card p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3 flex items-center justify-between">
            <span>Contas a Receber (Faturas & Serviços)</span>
            <span className="text-xs text-st-muted font-normal">Total Pendente: {formatCurrency(600.0)}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-st-border/40 text-st-muted font-bold uppercase text-[10px]">
                  <th className="py-2.5">Tutor / Cliente</th>
                  <th className="py-2.5">Pet</th>
                  <th className="py-2.5">Serviço</th>
                  <th className="py-2.5">Vencimento</th>
                  <th className="py-2.5 text-right">Valor</th>
                  <th className="py-2.5 text-center">Status</th>
                  <th className="py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-st-border/20">
                {receivables.map((item) => (
                  <tr key={item.id} className="hover:bg-st-surface-2/40 transition-colors">
                    <td className="py-3 font-semibold text-st-arctic">{item.customer}</td>
                    <td className="py-3 text-st-muted">{item.pet}</td>
                    <td className="py-3 text-st-muted">{item.service}</td>
                    <td className="py-3 font-mono">{formatDate(item.dueDate)}</td>
                    <td className="py-3 text-right font-extrabold text-st-arctic">{formatCurrency(item.amount)}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border whitespace-nowrap ${
                          item.status === 'paid'
                            ? 'bg-st-success/20 text-st-success border-st-success/30'
                            : item.status === 'overdue'
                            ? 'bg-st-danger/20 text-st-danger border-st-danger/30'
                            : 'bg-st-warning/20 text-st-warning border-st-warning/30'
                        }`}
                      >
                        {item.status === 'paid' ? 'Pago' : item.status === 'overdue' ? 'Vencida' : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {item.status !== 'paid' && (
                        <button
                          onClick={() => markAsPaid(item.id)}
                          className="px-3 py-1 rounded-lg bg-st-electric text-white text-[11px] font-semibold hover:bg-st-steel transition-colors whitespace-nowrap"
                        >
                          Marcar Pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONTAS A PAGAR */}
      {activeTab === 'payables' && (
        <div className="card p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3 flex items-center justify-between">
            <span>Contas a Pagar (Fornecedores & Despesas da Clínica)</span>
            <button className="px-3 py-1.5 rounded-xl bg-st-electric text-white text-xs font-semibold shadow-glow">
              + Nova Despesa
            </button>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-st-border/40 text-st-muted font-bold uppercase text-[10px]">
                  <th className="py-2.5">Fornecedor / Favorecido</th>
                  <th className="py-2.5">Descrição</th>
                  <th className="py-2.5">Vencimento</th>
                  <th className="py-2.5 text-right">Valor Total</th>
                  <th className="py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-st-border/20">
                {payables.map((item) => (
                  <tr key={item.id} className="hover:bg-st-surface-2/40 transition-colors">
                    <td className="py-3 font-semibold text-st-arctic">{item.supplier}</td>
                    <td className="py-3 text-st-muted">{item.description}</td>
                    <td className="py-3 font-mono">{formatDate(item.dueDate)}</td>
                    <td className="py-3 text-right font-extrabold text-st-danger">{formatCurrency(item.amount)}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border whitespace-nowrap ${
                          item.status === 'paid'
                            ? 'bg-st-success/20 text-st-success border-st-success/30'
                            : 'bg-st-warning/20 text-st-warning border-st-warning/30'
                        }`}
                      >
                        {item.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: COMISSÕES POR PROFISSIONAL */}
      {activeTab === 'commissions' && (
        <div className="card p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3">
            Cálculo Automático de Comissões por Profissional
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-st-border/40 text-st-muted font-bold uppercase text-[10px]">
                  <th className="py-2.5">Profissional</th>
                  <th className="py-2.5">Especialidade</th>
                  <th className="py-2.5 text-center">Atendimentos</th>
                  <th className="py-2.5 text-right">Faturamento Gerado</th>
                  <th className="py-2.5 text-center">% Comissão</th>
                  <th className="py-2.5 text-right">Comissão Devida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-st-border/20">
                {commissions.map((item) => (
                  <tr key={item.id} className="hover:bg-st-surface-2/40 transition-colors">
                    <td className="py-3 font-semibold text-st-arctic">{item.prof}</td>
                    <td className="py-3 text-st-muted">{item.role}</td>
                    <td className="py-3 text-center font-bold">{item.servicesCount}</td>
                    <td className="py-3 text-right font-semibold text-st-arctic">{formatCurrency(item.totalSales)}</td>
                    <td className="py-3 text-center font-bold text-st-electric">{item.percent}%</td>
                    <td className="py-3 text-right font-extrabold text-st-success text-sm">{formatCurrency(item.commissionDue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SolidaTechBadge variant="auth" />
    </div>
  );
}
