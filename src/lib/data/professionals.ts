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

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-1',
    name: 'Dr. Lucas Mendes',
    specialty: 'veterinario',
    document_number: 'CRMV-SP 48.912',
    phone: '(11) 98765-4321',
    email: 'lucas@petia.com.br',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    commission_percent: 30.0,
    active: true,
  },
  {
    id: 'prof-2',
    name: 'Dra. Camila Rocha',
    specialty: 'veterinario',
    document_number: 'CRMV-SP 52.104',
    phone: '(11) 97654-3210',
    email: 'camila@petia.com.br',
    photo_url: 'https://images.unsplash.com/photo-1594824813566-88855ce78965?w=200&auto=format&fit=crop&q=80',
    commission_percent: 30.0,
    active: true,
  },
  {
    id: 'prof-3',
    name: 'Ana Beatris (Estética)',
    specialty: 'groomer',
    phone: '(11) 96543-2109',
    email: 'ana@petia.com.br',
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    commission_percent: 15.0,
    active: true,
  },
];

export async function fetchProfessionals(): Promise<Professional[]> {
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      return INITIAL_PROFESSIONALS;
    }
    return data as Professional[];
  } catch (err) {
    return INITIAL_PROFESSIONALS;
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
