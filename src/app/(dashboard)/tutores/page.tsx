'use client';

import React, { useState } from 'react';
import { Users, Plus, Search, MessageSquare, Phone, Mail, Dog, CheckCircle2 } from 'lucide-react';
import { INITIAL_CUSTOMERS, INITIAL_PETS } from '@/lib/mockData';
import { whatsappService } from '@/services/notifications/whatsapp';

export default function TutoresPage() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenWhatsApp = (customer: any) => {
    const text = `Olá ${customer.name}! Estamos entrando em contato do Petia. Como podemos ajudar hoje?`;
    const url = whatsappService.generateWhatsAppClickUrl(customer.phone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-st-electric" />
            <span>Tutores (Clientes)</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Cadastros de tutores, opt-in para WhatsApp e históricos de pets no Petia</p>
        </div>

        <button className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all">
          <Plus className="w-4 h-4" />
          <span>Novo Tutor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-st-muted" />
        <input
          type="text"
          placeholder="Buscar tutor por nome, celular ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-st-surface pl-10 pr-4 py-2.5 rounded-xl border border-st-border text-st-arctic text-xs lg:text-sm shadow-sm"
        />
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const tutorPets = INITIAL_PETS.filter((p) => p.customer_id === customer.id);

          return (
            <div
              key={customer.id}
              className="card p-5 rounded-2xl space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-st-electric/20 text-st-electric font-extrabold flex items-center justify-center text-base border border-st-electric/30">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-st-arctic text-base">{customer.name}</h3>
                    <span className="text-[10px] font-bold bg-st-surface-2 text-st-muted px-2 py-0.5 rounded-full border border-st-border flex items-center gap-1 w-fit mt-1">
                      {customer.whatsapp_opt_in ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-st-success inline" /> WhatsApp Opt-in
                        </>
                      ) : (
                        'Sem WhatsApp'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-st-muted">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-st-electric" />
                  <span className="font-mono font-medium text-st-arctic">{customer.phone}</span>
                </p>
                {customer.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-st-muted" />
                    <span>{customer.email}</span>
                  </p>
                )}
              </div>

              {/* Pets Owned */}
              <div className="bg-st-navy p-3 rounded-xl border border-st-border/60 space-y-2">
                <span className="text-[10px] font-bold uppercase text-st-muted flex items-center gap-1">
                  <Dog className="w-3 h-3 text-st-electric" />
                  Pets Cadastrados ({tutorPets.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tutorPets.map((pet) => (
                    <span
                      key={pet.id}
                      className="text-xs bg-st-surface border border-st-border px-2.5 py-1 rounded-lg font-bold text-st-arctic shadow-2xs flex items-center gap-1"
                    >
                      <Dog className="w-3 h-3 text-st-electric" /> {pet.name} ({pet.breed})
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleOpenWhatsApp(customer)}
                  className="flex-1 py-2 bg-st-success/20 hover:bg-st-success/30 text-st-success border border-st-success/40 font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Conversar no WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
