import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { submissionId } = await req.json()
    if (!submissionId) throw new Error('Missing submissionId')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: sub, error: subError } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (subError || !sub) throw new Error('Submission not found')

    const data = sub.data

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    let page = pdfDoc.addPage([595.28, 841.89])

    let y = 800
    const x = 50

    const drawText = (text: string, isBold = false, size = 12) => {
      page.drawText(text || '', { x, y, size, font: isBold ? boldFont : font, color: rgb(0, 0, 0) })
      y -= size + 10
    }

    drawText('Ficha Cadastral de Abertura de Empresa', true, 18)
    y -= 10
    drawText(`Protocolo: ${data.protocol}`, true, 12)
    drawText(`Cliente: ${data.clientName}`)
    drawText(`Data: ${new Date(sub.created_at).toLocaleDateString('pt-BR')}`)

    y -= 20
    drawText('1. Dados da Empresa', true, 14)
    drawText(`Tipo Societário: ${data.company?.type || '-'}`)
    drawText(`Nome Fantasia: ${data.company?.tradeName || '-'}`)
    drawText(`Razão Social 1: ${data.company?.suggestedName1 || '-'}`)
    drawText(`E-mail: ${data.company?.email || '-'}`)
    drawText(`Telefone: ${data.company?.phone || '-'}`)

    y -= 20
    drawText('2. Atividades e Localização', true, 14)
    drawText(`CNAE Principal: ${data.activity?.mainCnae || '-'}`)
    drawText(`Endereço: ${data.activity?.businessAddress || '-'}`)

    y -= 20
    drawText('3. Quadro Societário', true, 14)
    if (data.partners && data.partners.length > 0) {
      data.partners.forEach((p: any, i: number) => {
        drawText(`Sócio ${i + 1}: ${p.name}`)
        drawText(`CPF: ${p.cpf} | Participação: ${p.sharePercentage}%`)
        y -= 10
      })
    } else {
      drawText('Nenhum sócio informado.')
    }

    const signaturePath = data.signature || data.clientSignature || data.client_signature
    if (signaturePath) {
      try {
        let imageBytes: ArrayBuffer | null = null
        if (typeof signaturePath === 'string') {
          if (signaturePath.startsWith('http')) {
            const res = await fetch(signaturePath)
            if (res.ok) imageBytes = await res.arrayBuffer()
          } else {
            const parts = signaturePath.split('/')
            const bucket = parts.length > 1 ? parts[0] : 'documents'
            const path = parts.length > 1 ? parts.slice(1).join('/') : signaturePath

            const { data: fileData, error: downloadError } = await supabase.storage
              .from(bucket)
              .download(path)

            if (!downloadError && fileData) {
              imageBytes = await fileData.arrayBuffer()
            } else {
              const { data: fileData2 } = await supabase.storage
                .from('documents')
                .download(signaturePath)
              if (fileData2) imageBytes = await fileData2.arrayBuffer()
            }
          }
        }

        if (imageBytes) {
          let image
          try {
            image = await pdfDoc.embedPng(imageBytes)
          } catch {
            try {
              image = await pdfDoc.embedJpg(imageBytes)
            } catch (e) {
              console.error('Failed to embed signature', e)
            }
          }

          if (image) {
            const maxWidth = 200
            const dims = image.scaleToFit(maxWidth, 100)

            if (y < dims.height + 60) {
              page = pdfDoc.addPage([595.28, 841.89])
              y = 800
            } else {
              y -= 40
            }

            drawText('4. Assinatura do Cliente', true, 14)
            y -= dims.height

            page.drawImage(image, {
              x: 50,
              y: y,
              width: dims.width,
              height: dims.height,
            })
            y -= 20
          }
        }
      } catch (err) {
        console.error('Error processing signature for PDF:', err)
      }
    }

    const pdfBytes = await pdfDoc.save()
    const filePath = `${submissionId}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, pdfBytes, { contentType: 'application/pdf', upsert: true })

    if (uploadError) throw uploadError

    await supabase.from('generated_documents').insert({
      submission_id: submissionId,
      file_path: filePath,
    })

    return new Response(JSON.stringify({ success: true, filePath }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
