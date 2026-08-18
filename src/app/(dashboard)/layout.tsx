'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { VersionBadge } from '@/components/navigation/VersionBadge';
import { X, Calendar, CheckCircle2 } from 'lucide-react';
import { getScopedData } from '@/lib/data/clinicDataScope';

import { ClientPortal } from '@/components/ui/ClientPortal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pets] = useState<any[]>(() => getScopedData('petia_pets'));
  const [servicesList] = useState<any[]>(() => getScopedData('petia_services'));
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Lock background scroll when modal is open
  React.useEffect(() => {
    if (isAppointmentModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAppointmentModalOpen]);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setIsAppointmentModalOpen(false);
      setNotes('');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-st-navy text-st-arctic flex">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex-1 md:pl-72 flex flex-col min-w-0 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Header
          onOpenQuickAppointment={() => setIsAppointmentModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 p-3 sm:p-4 lg:p-8 w-full">{children}</main>
      </div>

      <BottomNav />
      <VersionBadge />

      {/* Quick Appointment Modal (Centralizado + Lock de Scroll + Portal) */}
      {isAppointmentModalOpen && (
        <ClientPortal>
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none">
            <div className="relative my-auto w-full max-w-lg card rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-st-border/40 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-st-electric/20 text-st-electric flex items-center justify-center font-bold shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-st-arctic">Novo Agendamento Rápido</h3>
                    <p className="text-xs text-st-muted">Banho, tosa, consulta ou vacinação</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="p-2 rounded-xl text-st-muted hover:text-st-arctic hover:bg-st-surface-2 shrink-0 whitespace-nowrap"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-st-success/20 text-st-success rounded-full flex items-center justify-center mx-auto text-2xl border border-st-success/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-lg text-st-arctic">Agendamento Confirmado</h4>
                  <p className="text-xs text-st-muted">
                    Notificação automática via WhatsApp e E-mail configurada no Petia.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs lg:text-sm overflow-y-auto sidebar-scrollbar flex-1 pr-1">
                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Selecione o Pet / Tutor</label>
                    <select
                      value={selectedPet}
                      onChange={(e) => setSelectedPet(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    >
                      {pets.length === 0 ? (
                        <option value="">Nenhum pet cadastrado ainda</option>
                      ) : (
                        pets.map((pet: any) => (
                          <option key={pet.id} value={pet.id}>
                            {pet.name} ({pet.breed}) — Tutor: {pet.customer_name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Serviço Desejado</label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                    >
                      {servicesList.length === 0 ? (
                        <option value="">Nenhum serviço cadastrado ainda</option>
                      ) : (
                        servicesList.map((srv: any) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.name} — R$ {Number(srv.price).toFixed(2)} ({srv.duration_minutes} min)
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-st-muted mb-1">Data e Horário</label>
                      <input
                        type="datetime-local"
                        required
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-st-muted mb-1">Profissional / Vet</label>
                      <select className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium">
                        <option value="">Selecione um profissional</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-st-muted mb-1">Observações Internas</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Solicitado shampoo neutro, pet arredio..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                    ></textarea>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAppointmentModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-st-border text-st-muted hover:text-st-arctic font-semibold whitespace-nowrap shrink-0"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-st-electric hover:bg-st-steel text-white font-semibold shadow-glow whitespace-nowrap shrink-0"
                    >
                      Confirmar Agendamento
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
