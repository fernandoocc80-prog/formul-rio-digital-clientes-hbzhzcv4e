import { Submission } from '@/types'

export const downloadSubmissionPDF = (submission: Submission) => {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return

  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  const capitalStr = submission.company?.capitalSocial
    ? formatter.format(submission.company.capitalSocial)
    : 'Não informado'

  const partnersHtml = (submission.partners || [])
    .map(
      (p, i) => `
    <div class="partner-block">
      <h4>Sócio ${i + 1}</h4>
      <table class="data-table">
        <tr><th>Nome:</th><td>${p.name || '-'}</td><th>Participação:</th><td>${p.sharePercentage || 0}%</td></tr>
        <tr><th>CPF:</th><td>${p.cpf || '-'}</td><th>RG:</th><td>${p.rg || '-'}</td></tr>
        <tr><th>Endereço:</th><td colspan="3">${p.address || '-'}</td></tr>
      </table>
    </div>
  `,
    )
    .join('')

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Processo_${submission.protocol}</title>
        <style>
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            line-height: 1.5; 
            color: #000; 
            padding: 40px; 
            max-width: 800px;
            margin: 0 auto;
          }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
          .header p { margin: 5px 0 0 0; font-size: 14px; color: #555; }
          h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; font-size: 16px; text-transform: uppercase; background: #f4f4f4; padding: 8px; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 14px; }
          .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .data-table th { background-color: #fafafa; width: 25%; font-weight: 600; color: #333; }
          .partner-block { margin-bottom: 20px; }
          .partner-block h4 { margin: 0 0 10px 0; font-size: 15px; color: #444; }
          .signature-section { margin-top: 60px; text-align: center; page-break-inside: avoid; }
          .signature-line { width: 300px; border-top: 1px solid #000; margin: 0 auto 10px auto; }
          .signature-img { max-height: 80px; margin-bottom: -10px; }
          @media print {
            body { padding: 0; max-width: none; }
            @page { margin: 2cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Ficha Cadastral de Abertura de Empresa</h1>
          <p>Protocolo do Sistema: <strong>${submission.protocol}</strong> | Data de Submissão: ${new Date(submission.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>

        <h3>1. Identificação da Empresa</h3>
        <table class="data-table">
          <tr><th>Tipo Societário:</th><td colspan="3" style="text-transform: uppercase; font-weight: bold;">${submission.company?.type || '-'}</td></tr>
          <tr><th>Nome Fantasia:</th><td colspan="3">${submission.company?.tradeName || '-'}</td></tr>
          ${
            submission.company?.type !== 'mei'
              ? `
          <tr><th>Opções de Razão Social:</th><td colspan="3">
            1. ${submission.company?.suggestedName1 || '-'}<br/>
            2. ${submission.company?.suggestedName2 || '-'}<br/>
            3. ${submission.company?.suggestedName3 || '-'}
          </td></tr>`
              : ''
          }
          <tr><th>Capital Social:</th><td>${capitalStr}</td><th>CEP:</th><td>${submission.company?.zipCode || '-'}</td></tr>
          <tr><th>E-mail Corporativo:</th><td>${submission.company?.email || '-'}</td><th>Telefone:</th><td>${submission.company?.phone || '-'}</td></tr>
        </table>

        <h3>2. Atividades e Localização</h3>
        <table class="data-table">
          <tr><th>CNAE Principal:</th><td colspan="3">${submission.activity?.mainCnae || '-'}</td></tr>
          <tr><th>CNAEs Secundários:</th><td colspan="3">${submission.activity?.secondaryCnaes || '-'}</td></tr>
          <tr><th>Endereço do Negócio:</th><td colspan="3">${submission.activity?.businessAddress || '-'}</td></tr>
          <tr><th>Descrição Detalhada:</th><td colspan="3">${submission.activity?.description || '-'}</td></tr>
        </table>

        ${
          submission.company?.type !== 'mei'
            ? `
        <h3>3. Quadro Societário e Diretoria</h3>
        ${partnersHtml}
        `
            : ''
        }

        <div class="signature-section">
          ${submission.signature ? `<img src="${submission.signature}" class="signature-img" />` : '<div style="height: 70px;"></div>'}
          <div class="signature-line"></div>
          <strong>${submission.clientName || 'Representante Legal'}</strong><br/>
          Assinatura Digital - Declaração de Veracidade
        </div>
      </body>
    </html>
  `

  doc.open()
  doc.write(content)
  doc.close()

  setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()

    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 2000)
  }, 500)
}
