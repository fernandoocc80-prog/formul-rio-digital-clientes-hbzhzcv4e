import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, Code, ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function SubmissionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubmission } = useAppStore()
  const [viewHtml, setViewHtml] = useState(false)

  const submission = id ? getSubmission(id) : undefined

  if (!submission) {
    return <div className="p-8 text-center">Registro não encontrado.</div>
  }

  const handlePrint = () => {
    window.print()
  }

  const rawData = JSON.stringify(submission, null, 2)

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Processo</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewHtml(!viewHtml)}>
            <Code className="h-4 w-4 mr-2" />
            {viewHtml ? 'Ver Formatado' : 'Exportar HTML/JSON'}
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Gerar PDF
          </Button>
        </div>
      </div>

      {viewHtml ? (
        <Card className="no-print">
          <CardHeader>
            <CardTitle>Dados Brutos</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
              {rawData}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <div className="print-break-inside-avoid bg-white p-8 rounded-lg border shadow-sm space-y-8">
          <div className="text-center border-b pb-6">
            <h2 className="text-3xl font-bold">Ficha de Abertura de Empresa</h2>
            <p className="text-muted-foreground mt-2">Protocolo: {submission.id.toUpperCase()}</p>
            <div className="mt-4 flex justify-center gap-2 print-only">
              <Badge variant="outline">
                Data: {new Date(submission.createdAt).toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          </div>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
              1. Dados da Empresa
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome Sugerido 1</p>
                <p className="font-medium">{submission.company?.suggestedName1 || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capital Social</p>
                <p className="font-medium">
                  {submission.company?.capitalSocial
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        submission.company.capitalSocial,
                      )
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opção 2</p>
                <p>{submission.company?.suggestedName2 || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opção 3</p>
                <p>{submission.company?.suggestedName3 || '-'}</p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
              2. Atividades e Endereço
            </h3>
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CNAE Principal</p>
                <p className="font-medium">{submission.activity?.mainCnae || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CNAEs Secundários</p>
                <p>{submission.activity?.secondaryCnaes || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Endereço do Negócio</p>
                <p>{submission.activity?.businessAddress || '-'}</p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
              3. Quadro Societário
            </h3>
            <div className="space-y-6">
              {submission.partners?.map((p, i) => (
                <div
                  key={p.id}
                  className="bg-slate-50 p-4 rounded-md border print-break-inside-avoid"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold">Sócio {i + 1}</h4>
                    <Badge variant="secondary">{p.sharePercentage}% Quotas</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Nome</span> {p.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground block">CPF</span> {p.cpf}
                    </div>
                    <div>
                      <span className="text-muted-foreground block">RG</span> {p.rg}
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block">Endereço Residencial</span>{' '}
                      {p.address}
                    </div>
                  </div>
                </div>
              ))}
              {(!submission.partners || submission.partners.length === 0) && (
                <p className="text-muted-foreground italic">Nenhum sócio registrado.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
