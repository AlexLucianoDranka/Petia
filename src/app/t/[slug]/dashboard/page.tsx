import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { TutorDashboardClient } from '@/components/tutor/TutorDashboardClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key-for-dev'
);

export default async function TutorPortalDashboardPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const token = cookieStore.get('petia_tutor_session')?.value;

  if (!token) {
    redirect(`/t/${params.slug}`);
  }

  let session: any = null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    session = payload;
  } catch (err) {
    // Invalid token
    redirect(`/t/${params.slug}`);
  }

  if (!session || !session.customerId || !session.clinicId) {
    redirect(`/t/${params.slug}`);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Validate Clinic & Check Plan Gate
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('id, name, logo_url, phone, slug, plan, subscription_status, trial_ends_at')
    .eq('id', session.clinicId)
    .eq('slug', params.slug)
    .single();

  if (clinicError || !clinic) {
    redirect(`/t/${params.slug}`);
  }

  const isTrial = clinic.subscription_status === 'trial' || (new Date(clinic.trial_ends_at) > new Date());
  const hasAccess = isTrial || ['ouro', 'platina', 'diamond'].includes(clinic.plan || '');

  if (!hasAccess) {
    // Treat as blocked if clinic doesn't have the premium feature
    redirect(`/t/${params.slug}?blocked=true`);
  }

  // 2. Fetch Customer Info
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', session.customerId)
    .single();

  if (!customer) {
    redirect(`/t/${params.slug}`);
  }

  // 3. Fetch Pets
  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('clinic_id', clinic.id);

  const petIds = (pets || []).map(p => p.id);

  // 4. Fetch Medical Records for these pets
  let medicalRecords: any[] = [];
  if (petIds.length > 0) {
    const { data: records } = await supabase
      .from('pet_medical_records')
      .select('*, users(name)')
      .in('pet_id', petIds)
      .order('date', { ascending: false });
    
    if (records) {
      medicalRecords = records.map(r => ({
        ...r,
        vet_name: r.users?.name
      }));
    }
  }

  // 5. Fetch Appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('clinic_id', clinic.id)
    .gte('scheduled_at', new Date().toISOString()) // Only future appointments
    .order('scheduled_at', { ascending: true });

  return (
    <TutorDashboardClient
      clinic={clinic}
      customer={customer}
      pets={pets || []}
      appointments={appointments || []}
      medicalRecords={medicalRecords}
    />
  );
}
