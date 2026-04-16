import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { submissionId, clientName, email, protocol } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    console.log(`Sending confirmation email to: ${email} for protocol: ${protocol}`)

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Acme <onboarding@resend.dev>',
          to: [email],
          subject: `Confirmação de Recebimento - Protocolo ${protocol}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #111827;">Olá, ${clientName || 'Cliente'}!</h2>
              <p style="color: #4b5563; line-height: 1.6;">Recebemos o seu formulário de abertura de empresa com sucesso.</p>
              <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0; color: #1f2937;"><strong>Protocolo de Atendimento:</strong> ${protocol}</p>
              </div>
              <p style="color: #4b5563; line-height: 1.6;">Nossa equipe já está analisando os dados e os documentos que você enviou. Em breve, entraremos em contato com as próximas etapas do processo.</p>
              <br/>
              <p style="color: #6b7280; font-size: 0.875rem;">Atenciosamente,<br/>Equipe de Relacionamento</p>
            </div>
          `,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Failed to send email via Resend:', errorText)
      } else {
        console.log('Email sent successfully via Resend')
      }
    } else {
      console.log('RESEND_API_KEY not configured. Skipping actual email delivery.')
    }

    return new Response(JSON.stringify({ success: true, message: 'Email process completed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error processing auto-responder:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
