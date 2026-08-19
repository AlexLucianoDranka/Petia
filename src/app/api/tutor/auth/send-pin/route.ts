import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { contact, clinicSlug } = await request.json();

    if (!contact || !clinicSlug) {
      return NextResponse.json({ error: 'Contato e clínica são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Find the clinic by slug
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('slug', clinicSlug)
      .single();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 });
    }

    // 2. Find the customer in this clinic by email or phone
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name, email, phone')
      .eq('clinic_id', clinic.id)
      .or(`email.ilike.${contact},phone.ilike.%${contact}%`);

    if (customerError || !customers || customers.length === 0) {
      return NextResponse.json({ error: 'Cadastro não encontrado nesta clínica.' }, { status: 404 });
    }

    const customer = customers[0];
    
    if (!customer.email && contact.includes('@')) {
       // if they searched by phone but provided email, or whatever
    }
    
    // We will send via Email if they provided an email, or if we found their email.
    // Since we are integrating with Resend, we need an email.
    if (!customer.email) {
       return NextResponse.json({ error: 'Este cadastro não possui um e-mail válido para envio do código.' }, { status: 400 });
    }

    // 3. Generate a 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Save PIN to tutor_auth_codes (valid for 15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const { error: insertError } = await supabase
      .from('tutor_auth_codes')
      .insert({
        clinic_id: clinic.id,
        customer_id: customer.id,
        pin,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Insert PIN Error:', insertError);
      return NextResponse.json({ error: 'Erro ao gerar o código de acesso.' }, { status: 500 });
    }

    // 5. Send Email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'Petia <nao-responda@petia.com.br>',
          to: customer.email,
          subject: `Seu código de acesso ao Portal do Tutor - ${clinic.name}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Olá, ${customer.name.split(' ')[0]}!</h2>
              <p>Você solicitou acesso ao <strong>Portal do Tutor</strong> da clínica <strong>${clinic.name}</strong>.</p>
              <p>Seu código de acesso é:</p>
              <h1 style="font-size: 32px; letter-spacing: 5px; color: #3B82F6;">${pin}</h1>
              <p><em>Este código expira em 15 minutos.</em></p>
              <br/>
              <p>Se você não solicitou este acesso, ignore este e-mail.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Resend Error:', emailError);
        // Continue anyway, maybe we print to console in dev mode
      }
    } else {
      console.log('============= MOCK EMAIL OTP =============');
      console.log(`To: ${customer.email}`);
      console.log(`PIN: ${pin}`);
      console.log('==========================================');
    }

    // For security, don't return the PIN to the client.
    return NextResponse.json({ 
      success: true, 
      message: 'Código enviado com sucesso',
      email: customer.email
    });

  } catch (err: any) {
    console.error('Send PIN Error:', err);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
