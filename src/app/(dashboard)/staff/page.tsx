'use client';

import React, { useState } from 'react';
import { Shield, UserPlus, Check, X, Mail, Eye, Plus, Edit2, Trash2, Lock, UserCheck } from 'lucide-react';
import { StaffUser, UserRole } from '@/types/database';
import { ALL_MENU_KEYS, getRolePresetPermissions, StaffPermissionRule, upsertStaffPermissions } from '@/lib/data/permissions';
import { PlanGate } from '@/components/ui/PlanGate';
import { usePlanLimits } from '@/hooks/usePlanLimits';

export default function StaffPage() {
  const { canAddStaff } = usePlanLimits();
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [permissions, setPermissions] = useState<StaffPermissionRule[]>([]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('vet');
  const [inviteSent, setInviteSent] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectStaff = (staff: StaffUser) => {
    setSelectedStaff(staff);
    setPermissions(getRolePresetPermissions(staff.role, staff.id));
  };

  const handleTogglePermission = (menuKey: string, field: 'is_hidden' | 'can_view' | 'can_create' | 'can_edit' | 'can_delete') => {
    setPermissions((prev) =>
      prev.map((rule) => {
        if (rule.menu_key === menuKey) {
          const updated = { ...rule, [field]: !rule[field] };
          if (field === 'is_hidden' && updated.is_hidden) {
            updated.can_view = false;
            updated.can_create = false;
            updated.can_edit = false;
            updated.can_delete = false;
          }
          return updated;
        }
        return rule;
      })
    );
  };

  const handleApplyRolePreset = (role: UserRole) => {
    if (!selectedStaff) return;
    setPermissions(getRolePresetPermissions(role, selectedStaff.id));
  };

  const handleSavePermissions = async () => {
    await upsertStaffPermissions(permissions);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff: StaffUser = {
      id: `u-${Date.now()}`,
      clinic_id: 'c101',
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      created_at: new Date().toISOString(),
    };

    // Send real email invite via Resend API
    try {
      const clinicData = JSON.parse(localStorage.getItem('petia_clinic_data') || '{}');
      const appUrl = window.location.origin;
      await fetch('/api/email/invite-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteeEmail: inviteEmail,
          inviteeName: inviteName,
          inviterClinicName: clinicData.name || 'Petia',
          role: inviteRole,
          inviteLink: `${appUrl}/login?invite=true&email=${encodeURIComponent(inviteEmail)}`,
        }),
      });
    } catch (_err) {
      // email not critical — continue
    }

    setStaffList([...staffList, newStaff]);
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
    }, 1500);
  };

  return (
    <PlanGate
      requiredPlan="profissional"
      featureName="Gestão de Equipe & Permissões Granulares"
      featureDescription="Controle granular de acesso por menu para cada funcionário da sua clínica. Disponível no plano Profissional Prata ou superior."
    >
    <div className="space-y-6 animate-fade-up w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-st-arctic tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-st-electric" />
            <span>Gestão de Equipe & Permissões Granulares</span>
          </h1>
          <p className="text-xs text-st-muted mt-0.5">Controle por menu: Oculto, Visualizar, Criar, Editar e Excluir para cada funcionário</p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 bg-st-electric hover:bg-st-steel text-white text-xs lg:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow transition-all whitespace-nowrap shrink-0"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Convidar Funcionário</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-st-success/15 border border-st-success/30 text-st-success text-xs font-semibold flex items-center gap-2 animate-fade-in whitespace-nowrap">
          <Check className="w-4 h-4 shrink-0" />
          <span>Matriz de permissões salva com sucesso para {selectedStaff?.name}!</span>
        </div>
      )}

      {/* Main Grid: Staff List + Permissions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left Column: Staff Directory */}
        <div className="card rounded-2xl p-6 space-y-4 h-fit">
          <h3 className="font-bold text-st-arctic text-base border-b border-st-border/40 pb-3 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-st-electric" />
            <span>Funcionários ({staffList.length})</span>
          </h3>

          <div className="space-y-2.5">
            {staffList.map((staff) => {
              const isSelected = selectedStaff?.id === staff.id;
              return (
                <div
                  key={staff.id}
                  onClick={() => handleSelectStaff(staff)}
                  className={`cursor-pointer p-4 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-st-electric/15 border-st-electric text-st-arctic shadow-glow-sm'
                      : 'bg-st-surface-2/60 border-st-border hover:border-st-electric/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-st-arctic">{staff.name}</h4>
                      <p className="text-xs text-st-muted">{staff.email}</p>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-st-surface border border-st-border text-st-electric whitespace-nowrap shrink-0">
                      {staff.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Granular Permissions Matrix */}
        <div className="lg:col-span-2 card rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-st-border/40 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-st-arctic">
                Matriz de Permissões: <span className="text-st-electric">{selectedStaff?.name ?? 'Selecione um funcionário'}</span>
              </h3>
              <p className="text-xs text-st-muted">Cargo Atual: {selectedStaff?.role?.toUpperCase() ?? '—'}</p>
            </div>

            {/* Role Preset Quick Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-st-muted uppercase font-bold whitespace-nowrap">Presets:</span>
              <button
                onClick={() => handleApplyRolePreset('owner')}
                className="px-2.5 py-1 rounded-lg bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border whitespace-nowrap shrink-0"
              >
                Owner
              </button>
              <button
                onClick={() => handleApplyRolePreset('manager')}
                className="px-2.5 py-1 rounded-lg bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border whitespace-nowrap shrink-0"
              >
                Manager
              </button>
              <button
                onClick={() => handleApplyRolePreset('vet')}
                className="px-2.5 py-1 rounded-lg bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border whitespace-nowrap shrink-0"
              >
                Vet
              </button>
              <button
                onClick={() => handleApplyRolePreset('attendant')}
                className="px-2.5 py-1 rounded-lg bg-st-surface hover:bg-st-surface-2 text-st-arctic text-xs font-semibold border border-st-border whitespace-nowrap shrink-0"
              >
                Attendant
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-st-border/40 text-st-muted font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Menu / Módulo</th>
                  <th className="py-3 px-3 text-center">Oculto</th>
                  <th className="py-3 px-3 text-center">Visualizar</th>
                  <th className="py-3 px-3 text-center">Criar</th>
                  <th className="py-3 px-3 text-center">Editar</th>
                  <th className="py-3 px-3 text-center">Excluir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-st-border/30">
                {permissions.map((rule) => (
                  <tr key={rule.menu_key} className="hover:bg-st-surface-2/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-st-arctic text-xs">
                      {ALL_MENU_KEYS.find(m => m.key === rule.menu_key)?.label || rule.menu_key}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={rule.is_hidden}
                        onChange={() => handleTogglePermission(rule.menu_key, 'is_hidden')}
                        className="w-4 h-4 rounded text-st-electric focus:ring-0 cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        disabled={rule.is_hidden}
                        checked={rule.can_view}
                        onChange={() => handleTogglePermission(rule.menu_key, 'can_view')}
                        className="w-4 h-4 rounded text-st-electric focus:ring-0 cursor-pointer disabled:opacity-30"
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        disabled={rule.is_hidden}
                        checked={rule.can_create}
                        onChange={() => handleTogglePermission(rule.menu_key, 'can_create')}
                        className="w-4 h-4 rounded text-st-electric focus:ring-0 cursor-pointer disabled:opacity-30"
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        disabled={rule.is_hidden}
                        checked={rule.can_edit}
                        onChange={() => handleTogglePermission(rule.menu_key, 'can_edit')}
                        className="w-4 h-4 rounded text-st-electric focus:ring-0 cursor-pointer disabled:opacity-30"
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        disabled={rule.is_hidden}
                        checked={rule.can_delete}
                        onChange={() => handleTogglePermission(rule.menu_key, 'can_delete')}
                        className="w-4 h-4 rounded text-st-electric focus:ring-0 cursor-pointer disabled:opacity-30"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-st-border/40 flex justify-end">
            <button
              onClick={handleSavePermissions}
              className="px-6 py-2.5 bg-st-electric hover:bg-st-steel text-white font-extrabold text-xs rounded-xl shadow-glow transition-all whitespace-nowrap shrink-0"
            >
              Salvar Matriz de Permissões
            </button>
          </div>
        </div>
      </div>

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-st-border/40 pb-3">
              <h3 className="font-bold text-st-arctic text-base">Convidar Novo Funcionário</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-st-muted hover:text-st-arctic">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSent ? (
              <div className="py-8 text-center space-y-2">
                <Check className="w-10 h-10 text-st-success mx-auto" />
                <h4 className="font-bold text-st-arctic">Convite Enviado!</h4>
                <p className="text-xs text-st-muted">Um e-mail de acesso foi enviado para {inviteEmail}.</p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-st-muted mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Roberto Lima"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-st-muted mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    required
                    placeholder="roberto@petia.com.br"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-st-muted mb-1">Cargo Inicial</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full p-3 rounded-xl bg-st-surface border border-st-border text-st-arctic font-medium"
                  >
                    <option value="manager">Manager (Gerente)</option>
                    <option value="vet">Veterinário(a)</option>
                    <option value="attendant">Atendente / Recepção</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-st-border text-st-muted font-semibold whitespace-nowrap shrink-0"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-st-electric text-white font-semibold shadow-glow whitespace-nowrap shrink-0"
                  >
                    Enviar Convite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
    </PlanGate>
  );
}
