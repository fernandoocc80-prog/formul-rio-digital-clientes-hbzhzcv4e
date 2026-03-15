import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, Code, ArrowLeft, CheckCircle2, Share2, Loader2, Paperclip } from 'lucide-react'
import { useAppStore } from '@/store/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ShareFormDialog } from '@/components/share/ShareFormDialog'
import { supabase } from '@/lib/supabase/client'

const isImageUrl = (url: string) => /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(url)

const useSignedUrl = (value: string) => {
  const [url, setUrl] = useState<string>(value)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const getUrl = async () => {
      if (typeof value === 'string' && value.includes('/storage/v1/object/public/')) {
        setLoading(true)
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (!session) {
            navigate('/login')
            return
          }

          const urlObj = new URL(value)
          const pathParts = urlObj.pathname.split('/storage/v1/object/public/')[1]
          if (pathParts) {
            const bucket = pathParts.split('/')[0]
            const filePath = pathParts.substring(bucket.length + 1)

            const { data } = await supabase.storage
              .from(bucket)
              .createSignedUrl(decodeURIComponent(filePath), 3600)
            if (data?.signedUrl && isMounted) {
              setUrl(data.signedUrl)
            }
          }
        } catch (e) {
          console.error(e)
        } finally {
          if (isMounted) setLoading(false)
        }
      }
    }

    if (value && typeof value === 'string' && value.includes('/storage/v1/object/public/')) {
      getUrl()
    } else {
      setUrl(value)
    }

    return () => {
      isMounted = false
    }
  }, [value, navigate])

  return { url, loading }
}

const SecureAttachmentLink = ({ value }: { value: string }) => {
  const { url, loading } = useSignedUrl(value)

  if (loading) {
    return <div className="animate-pulse h-10 w-32 bg-slate-200 rounded mt-2"></div>
  }

  if (isImageUrl(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-2">
        <img
          src={url}
          alt="Anexo"
          className="max-w-xs max-h-48 rounded border border-border shadow-sm object-cover hover:opacity-90 transition-opacity"
        />
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline break-all inline-flex items-center gap-2 mt-1 bg-primary/5 px-3 py-2 rounded-md border border-primary/20 hover:bg-primary/10 transition-colors"
    >
      <Paperclip className="w-4 h-4 shrink-0" />
      <span className="text-sm font-medium">Visualizar Documento</span>
    </a>
  )
}

const DynamicAnswerValue = ({ value }: { value: any }) => {
  if (!value) return <p className="text-muted-foreground text-sm">-</p>

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {value.map((v, i) => (
          <DynamicAnswerValue key={i} value={v} />
        ))}
      </div>
    )
  }

  if (typeof value === 'string' && value.startsWith('http')) {
    return <SecureAttachmentLink value={value} />
  }

  return <p className="bg-slate-50 p-3 rounded text-sm mt-1">{String(value)}</p>
}

const SecureSignature = ({ src }: { src: string }) => {
  const { url, loading } = useSignedUrl(src)

  if (loading) {
    return <div className="animate-pulse h-24 w-64 bg-slate-200 mx-auto rounded"></div>
  }

  return (
    <img src={url} alt="Assinatura" className="h-24 object-contain mx-auto mix-blend-multiply" />
  )
}

export default function SubmissionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubmission, downloadGeneratedPDF } = useAppStore()
  const [viewHtml, setViewHtml] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const submission = id ? getSubmission(id) : undefined

  if (!submission) {
    return <div className="p-8 text-center">Registro não encontrado.</div>
  }

  const handlePrint = async () => {
    if (submission) {
      setIsDownloading(true)
      await downloadGeneratedPDF(submission)
      setIsDownloading(false)
    }
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
            <Button variant="secondary" className="flex-1 sm:flex-none">
              <Share2 className="h-4 w-4 mr-2" />
              <span>Compartilhar</span>
            </Button>
          </ShareFormDialog>
          <Button
            variant="outline"
            onClick={() => setViewHtml(!viewHtml)}
            className="flex-1 sm:flex-none"
          >
            <Code className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {viewHtml ? 'Ver Formatado' : 'Exportar Dados'}
            </span>
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isDownloading}
            className="flex-1 sm:flex-none bg-primary text-white"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Baixar PDF
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
        <div className="print-break-inside-avoid bg-white p-5 sm:p-8 rounded-lg border shadow-sm space-y-8">
          <div className="text-center border-b pb-6">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {submission.type === 'dynamic'
                ? submission.clientName || 'Respostas do Formulário'
                : 'Ficha de Abertura de Empresa'}
            </h2>
            <p className="text-muted-foreground mt-2 font-mono text-base sm:text-lg">
              Protocolo: {submission.protocol}
            </p>
            <div className="mt-4 flex justify-center gap-2 print-only">
              <Badge variant="outline">
                Data: {new Date(submission.createdAt).toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          </div>

          {submission.type === 'dynamic' ? (
            <section className="print-break-inside-avoid">
              <h3 className="text-lg sm:text-xl font-semibold mb-6 text-primary border-l-4 border-primary pl-3">
                Dados Submetidos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
                {submission.dynamicAnswers?.map((item: any, i: number) => {
                  const isFullWidth =
                    Array.isArray(item.value) ||
                    (typeof item.value === 'string' &&
                      (item.value.length > 50 || item.value.startsWith('http')))
                  return (
                    <div key={i} className={isFullWidth ? 'col-span-1 sm:col-span-2' : ''}>
                      <p className="text-sm text-muted-foreground font-medium mb-1">{item.label}</p>
                      <DynamicAnswerValue value={item.value} />
                    </div>
                  )
                })}
                {(!submission.dynamicAnswers || submission.dynamicAnswers.length === 0) && (
                  <p className="text-muted-foreground italic col-span-2">
                    Nenhuma resposta registrada.
                  </p>
                )}
              </div>
            </section>
          ) : (
            <>
              <section>
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                  1. Dados da Empresa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
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
                    <p className="break-all">{submission.company?.email || '-'}</p>
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
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(submission.company.capitalSocial)
                        : '-'}
                    </p>
                  </div>
                  {(submission.company?.type === 'ltda' || submission.company?.type === 'slu') && (
                    <div className="col-span-1 sm:col-span-2 mt-2">
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
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
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
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                      3. Quadro Societário
                    </h3>
                    <div className="space-y-4">
                      {submission.partners?.map((p, i) => (
                        <div key={p.id} className="bg-slate-50 p-4 rounded-md border">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold">Sócio {i + 1}</h4>
                            <Badge variant="secondary">{p.sharePercentage}% Quotas</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                            <div>
                              <span className="text-muted-foreground block">Nome</span> {p.name}
                            </div>
                            <div>
                              <span className="text-muted-foreground block">CPF</span> {p.cpf}
                            </div>
                            <div>
                              <span className="text-muted-foreground block">RG</span> {p.rg}
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                              <span className="text-muted-foreground block">
                                Endereço Residencial
                              </span>{' '}
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
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
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
                        <p className="text-xs text-muted-foreground break-all">
                          {doc.fileName || 'Pendente'}
                        </p>
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
                      <SecureSignature src={submission.signature} />
                    </div>
                  ) : (
                    <div className="border-b border-black pb-2 mb-2 w-full max-w-sm mx-auto h-24" />
                  )}
                  <p className="font-semibold text-sm">{submission.clientName}</p>
                  <p className="text-xs text-muted-foreground">Representante Legal / Solicitante</p>
                  {submission.signature && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Assinado digitalmente em{' '}
                      {new Date(submission.updatedAt).toLocaleString('pt-BR')}.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  )
}
