export type UserRole = 'owner' | 'manager' | 'vet' | 'attendant';
export type MedicalRecordType = 'vaccine' | 'deworming' | 'exam' | 'surgery' | 'consultation';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'done' | 'cancelled' | 'no_show';
export type ServiceCategory = 'banho' | 'tosa' | 'consulta' | 'vacina' | 'cirurgia' | 'outro';
export type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'paused';
export type NotificationChannel = 'email' | 'whatsapp';

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  logo_url?: string;
  plan: string;
  stripe_customer_id?: string;
  created_at: string;
}

export interface StaffUser {
  id: string;
  clinic_id: string;
  auth_id?: string;
  name: string;
  role: UserRole;
  email: string;
  created_at: string;
}

export interface Customer {
  id: string;
  clinic_id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp_opt_in: boolean;
  created_at: string;
  pets_count?: number;
}

export interface Pet {
  id: string;
  clinic_id: string;
  customer_id: string;
  customer_name?: string;
  name: string;
  species: string; // Cão, Gato, etc.
  breed: string;
  birth_date?: string;
  weight: number;
  sex: 'M' | 'F';
  neutered: boolean;
  photo_url?: string;
  notes?: string;
  created_at: string;
}

export interface PetMedicalRecord {
  id: string;
  pet_id: string;
  type: MedicalRecordType;
  description: string;
  date: string;
  next_due_date?: string;
  vet_id?: string;
  vet_name?: string;
  attachments?: string[];
  created_at: string;
}

export interface ServiceItem {
  id: string;
  clinic_id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  duration_minutes: number;
  active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  pet_id: string;
  pet_name?: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  service_type: string;
  staff_id?: string;
  staff_name?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  price: number;
  notes?: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  clinic_id: string;
  name: string;
  price: number;
  frequency: 'mensal' | 'semestral' | 'anual';
  services_included: string[];
  created_at: string;
}

export interface CustomerSubscription {
  id: string;
  customer_id: string;
  customer_name?: string;
  plan_id: string;
  plan_name?: string;
  stripe_subscription_id?: string;
  status: SubscriptionStatus;
  current_period_end: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  clinic_id: string;
  name: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_cost: number;
  updated_at: string;
}

export interface Invoice {
  id: string;
  clinic_id: string;
  customer_id: string;
  customer_name?: string;
  appointment_id?: string;
  amount: number;
  status: InvoiceStatus;
  stripe_payment_id?: string;
  paid_at?: string;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  clinic_id: string;
  customer_id?: string;
  customer_name?: string;
  channel: NotificationChannel;
  type: string;
  sent_at: string;
  status: 'delivered' | 'failed' | 'queued';
}
