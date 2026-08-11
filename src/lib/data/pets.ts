import { supabase } from '@/lib/supabaseClient';
import { Pet, PetMedicalRecord } from '@/types/database';
import { INITIAL_PETS, INITIAL_MEDICAL_RECORDS } from '@/lib/mockData';

export async function fetchPets(): Promise<Pet[]> {
  try {
    const { data, error } = await supabase.from('pets').select('*, customers(name)').order('name');
    if (error || !data || data.length === 0) return INITIAL_PETS;

    return data.map((p: any) => ({
      ...p,
      customer_name: p.customers?.name || 'Tutor Desconhecido',
    }));
  } catch (err) {
    return INITIAL_PETS;
  }
}

export async function fetchMedicalRecordsByPetId(petId: string): Promise<PetMedicalRecord[]> {
  try {
    const { data, error } = await supabase
      .from('pet_medical_records')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_MEDICAL_RECORDS.filter((m) => m.pet_id === petId);
    }
    return data as PetMedicalRecord[];
  } catch (err) {
    return INITIAL_MEDICAL_RECORDS.filter((m) => m.pet_id === petId);
  }
}

export async function createPet(pet: Partial<Pet>): Promise<Pet> {
  const newPet: Pet = {
    id: pet.id || `pet-${Date.now()}`,
    clinic_id: pet.clinic_id || 'c101',
    customer_id: pet.customer_id || 'cust-1',
    name: pet.name || 'Pet sem nome',
    species: pet.species || 'Cão',
    breed: pet.breed || 'SRD',
    birth_date: pet.birth_date,
    weight: pet.weight || 0,
    sex: pet.sex || 'M',
    neutered: pet.neutered || false,
    photo_url: pet.photo_url || '',
    notes: pet.notes || '',
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('pets').insert([newPet]).select().single();
    if (!error && data) return data as Pet;
  } catch (err) {
    console.warn('[Pets] Supabase fallback');
  }

  return newPet;
}

export async function createMedicalRecord(record: Partial<PetMedicalRecord>): Promise<PetMedicalRecord> {
  const newRecord: PetMedicalRecord = {
    id: record.id || `med-${Date.now()}`,
    pet_id: record.pet_id || 'pet-1',
    type: record.type || 'vaccine',
    description: record.description || 'Procedimento realizado',
    date: record.date || new Date().toISOString().split('T')[0],
    next_due_date: record.next_due_date,
    vet_id: record.vet_id,
    vet_name: record.vet_name || 'Dr. Lucas Mendes',
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('pet_medical_records').insert([newRecord]).select().single();
    if (!error && data) return data as PetMedicalRecord;
  } catch (err) {
    console.warn('[MedicalRecords] Supabase fallback');
  }

  return newRecord;
}
