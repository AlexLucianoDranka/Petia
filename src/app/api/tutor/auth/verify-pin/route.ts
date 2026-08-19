import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key-for-dev'
);

export async function POST(request: Request) {
  try {
    const { contact, pin, clinicSlug } = await request.json();

    if (!contact || !pin || !clinicSlug) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Find the clinic by slug
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id')
      .eq('slug', clinicSlug)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 });
    }

    // 2. Find the customer
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name')
      .eq('clinic_id', clinic.id)
      .or(`email.ilike.${contact},phone.ilike.%${contact}%`);

    if (customerError || !customers || customers.length === 0) {
      return NextResponse.json({ error: 'Cadastro não encontrado.' }, { status: 404 });
    }

    const customer = customers[0];

    // 3. Find valid PIN
    const { data: codes, error: codeError } = await supabase
      .from('tutor_auth_codes')
      .select('id, pin, expires_at, used_at')
      .eq('clinic_id', clinic.id)
      .eq('customer_id', customer.id)
      .eq('pin', pin)
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (codeError || !codes || codes.length === 0) {
      return NextResponse.json({ error: 'Código inválido.' }, { status: 400 });
    }

    const authCode = codes[0];

    if (new Date(authCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Este código expirou. Solicite um novo.' }, { status: 400 });
    }

    // 4. Mark PIN as used
    await supabase
      .from('tutor_auth_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', authCode.id);

    // 5. Generate Session JWT Cookie
    const token = await new SignJWT({ customerId: customer.id, clinicId: clinic.id, role: 'tutor' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d') // Valid for 30 days
      .sign(JWT_SECRET);

    // 6. Set HttpOnly Cookie
    const cookieStore = cookies();
    cookieStore.set('petia_tutor_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Login realizado com sucesso',
      customerName: customer.name
    });

  } catch (err: any) {
    console.error('Verify PIN Error:', err);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
