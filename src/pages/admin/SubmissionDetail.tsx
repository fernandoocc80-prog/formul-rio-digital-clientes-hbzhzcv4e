import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, Code, ArrowLeft, CheckCircle2, Share2 } from 'lucide-react'
import { useAppStore } from '@/store/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ShareFormDialog } from '@/components/share/ShareFormDialog'

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Processo</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareFormDialog id={id}>
            <Button variant="secondary">
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
          </ShareFormDialog>
          <Button variant="outline" onClick={() => setViewHtml(!viewHtml)}>
            <Code className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {viewHtml ? 'Ver Formatado' : 'Exportar Dados'}
            </span>
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
            <CardTitle>Dados Brutos (JSON/Export)</CardTitle>
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
            <p className="text-muted-foreground mt-2 font-mono text-lg">
              Protocolo: {submission.protocol}
            </p>
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
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-sm text-muted-foreground">Tipo Societário</p>
                <p className="font-medium uppercase">{submission.company?.type || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nome Fantasia</p>
                <p className="font-medium">{submission.company?.tradeName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p>{submission.company?.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p>{submission.company?.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CEP</p>
                <p>{submission.company?.zipCode || '-'}</p>
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
              {(submission.company?.type === 'ltda' || submission.company?.type === 'slu') && (
                <div className="col-span-2 mt-2">
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Opções de Razão Social
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>{submission.company?.suggestedName1 || '-'}</li>
                    <li>{submission.company?.suggestedName2 || '-'}</li>
                    <li>{submission.company?.suggestedName3 || '-'}</li>
                  </ul>
                </div>
              )}
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
                <p className="text-sm text-muted-foreground">Descrição da Atividade</p>
                <p className="bg-slate-50 p-3 rounded text-sm mt-1">
                  {submission.activity?.description || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Endereço do Negócio</p>
                <p>{submission.activity?.businessAddress || '-'}</p>
              </div>
            </div>
          </section>

          <Separator />

          {submission.company?.type !== 'mei' && (
            <>
              <section className="print-break-inside-avoid">
                <h3 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                  3. Quadro Societário
                </h3>
                <div className="space-y-4">
                  {submission.partners?.map((p, i) => (
                    <div key={p.id} className="bg-slate-50 p-4 rounded-md border">
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
              <Separator />
            </>
          )}

          <section className="print-break-inside-avoid">
            <h3 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
              {submission.company?.type === 'mei' ? '3' : '4'}. Documentos Anexados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {submission.documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 border rounded-md bg-slate-50"
                >
                  {doc.fileName ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">{doc.fileName || 'Pendente'}</p>
                  </div>
                </div>
              ))}
              {(!submission.documents || submission.documents.length === 0) && (
                <p className="text-muted-foreground italic">Nenhum documento registrado.</p>
              )}
            </div>
          </section>

          <Separator />

          <section className="print-break-inside-avoid text-center pt-8 pb-16">
            <h3 className="text-lg font-medium mb-12">Assinatura Digital</h3>
            <div className="max-w-md mx-auto">
              {submission.signature ? (
                <div className="border-b border-black pb-2 mb-2 inline-block px-12">
                  <img
                    src={submission.signature}
                    alt="Assinatura"
                    className="h-24 object-contain mx-auto mix-blend-multiply"
                  />
                </div>
              ) : (
                <div className="border-b border-black pb-2 mb-2 w-full max-w-sm mx-auto h-24" />
              )}
              <p className="font-semibold text-sm">{submission.clientName}</p>
              <p className="text-xs text-muted-foreground">Representante Legal / Solicitante</p>
              {submission.signature && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  Assinado digitalmente em {new Date(submission.updatedAt).toLocaleString('pt-BR')}.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
