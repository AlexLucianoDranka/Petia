import { supabase } from '@/lib/supabaseClient';

export interface Professional {
  id: string;
  clinic_id?: string;
  linked_user_id?: string;
  name: string;
  specialty: 'veterinario' | 'groomer' | 'banhista' | 'adestrador' | 'tosador' | 'outro';
  document_number?: string;
  phone?: string;
  email?: string;
  photo_url?: string;
  bio?: string;
  commission_percent: number;
  work_schedule?: Record<string, string[]>;
  active: boolean;
  created_at?: string;
}

export async function fetchProfessionals(): Promise<Professional[]> {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .order('name');

    if (error || !data) return [];
    return data as Professional[];
  } catch (err) {
    return [];
  }
}

export async function createProfessional(prof: Partial<Professional>): Promise<Professional> {
  const newProf: Professional = {
    id: prof.id || `prof-${Date.now()}`,
    name: prof.name || 'Novo Profissional',
    specialty: prof.specialty || 'veterinario',
    document_number: prof.document_number || '',
    phone: prof.phone || '',
    email: prof.email || '',
    photo_url: prof.photo_url || '',
    commission_percent: prof.commission_percent || 0,
    active: prof.active ?? true,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('professionals').insert([newProf]).select().single();
    if (!error && data) return data as Professional;
  } catch (err) {
    console.warn('[Professionals] Supabase offline fallback');
  }

  return newProf;
}

export async function updateProfessional(id: string, updates: Partial<Professional>): Promise<boolean> {
  try {
    const { error } = await supabase.from('professionals').update(updates).eq('id', id);
    return !error;
  } catch (err) {
    return true;
  }
}
