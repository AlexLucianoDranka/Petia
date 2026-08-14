import { supabase } from '@/lib/supabaseClient';
import { Appointment } from '@/types/database';

export async function fetchAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase.from('appointments').select('*').order('scheduled_at', { ascending: true });
    if (error || !data) return [];
    return data as Appointment[];
  } catch (err) {
    return [];
  }
}

export async function createAppointment(apt: Partial<Appointment>): Promise<Appointment> {
  const newApt: Appointment = {
    id: apt.id || `apt-${Date.now()}`,
    clinic_id: apt.clinic_id || 'real-clinic',
    pet_id: apt.pet_id || '',
    pet_name: apt.pet_name || 'Pet',
    customer_id: apt.customer_id || '',
    customer_name: apt.customer_name || 'Tutor',
    customer_phone: apt.customer_phone || '',
    service_type: apt.service_type || 'Serviço',
    staff_id: apt.staff_id || '',
    staff_name: apt.staff_name || 'Profissional',
    scheduled_at: apt.scheduled_at || new Date().toISOString(),
    duration_minutes: apt.duration_minutes || 45,
    status: apt.status || 'scheduled',
    price: apt.price || 0,
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
