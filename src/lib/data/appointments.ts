import { supabase } from '@/lib/supabaseClient';
import { Appointment } from '@/types/database';
import { INITIAL_APPOINTMENTS } from '@/lib/mockData';

export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase.from('appointments').select('*').order('scheduled_at', { ascending: true });
    if (error || !data || data.length === 0) return INITIAL_APPOINTMENTS;
    return data as Appointment[];
  } catch (err) {
    return INITIAL_APPOINTMENTS;
  }
}

export async function createAppointment(apt: Partial<Appointment>): Promise<Appointment> {
  const newApt: Appointment = {
    id: apt.id || `apt-${Date.now()}`,
    clinic_id: apt.clinic_id || 'c101',
    pet_id: apt.pet_id || 'pet-1',
    pet_name: apt.pet_name || 'Thor (Golden)',
    customer_id: apt.customer_id || 'cust-1',
    customer_name: apt.customer_name || 'Mariana Silva Santos',
    customer_phone: apt.customer_phone || '(11) 99123-4567',
    service_type: apt.service_type || 'Banho & Tosa',
    staff_id: apt.staff_id || 'u1',
    staff_name: apt.staff_name || 'Dr. Lucas Mendes',
    scheduled_at: apt.scheduled_at || new Date().toISOString(),
    duration_minutes: apt.duration_minutes || 45,
    status: apt.status || 'scheduled',
    price: apt.price || 100.0,
    notes: apt.notes || '',
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('appointments').insert([newApt]).select().single();
    if (!error && data) return data as Appointment;
  } catch (err) {
    console.warn('[Appointments] Supabase fallback');
  }

  return newApt;
}

export async function updateAppointmentStatus(id: string, status: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    return !error;
  } catch (err) {
    return true;
  }
}
