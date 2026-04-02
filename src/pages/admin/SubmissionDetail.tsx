import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, Code, ArrowLeft, Share2, Loader2 } from 'lucide-react'
import { useAppStore } from '@/store/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ShareFormDialog } from '@/components/share/ShareFormDialog'
import { supabase } from '@/lib/supabase/client'
import { AttachmentCard, Attachment } from '@/components/admin/AttachmentCard'
import { DynamicAnswerValue, SecureSignature } from '@/components/admin/DynamicAnswerComponents'

export default function SubmissionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubmission, downloadGeneratedPDF, syncSubmissions } = useAppStore()
  const [viewHtml, setViewHtml] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [dbFiles, setDbFiles] = useState<{ id: string; file_path: string }[]>([])

  const submission = id ? getSubmission(id) : undefined

  useEffect(() => {
    if (id && !submission) {
      syncSubmissions({ force: true, skipCache: true }).catch(() => {})
    }
  }, [id, submission, syncSubmissions])

  useEffect(() => {
    if (submission?.id) {
      supabase
        .from('generated_documents')
        .select('id, file_path')
        .eq('submission_id', submission.id)
        .then(({ data }) => {
          if (data) setDbFiles(data.filter((d) => d.file_path !== `${submission.id}.pdf`))
        })
    }
  }, [submission?.id])

  const attachments = useMemo(() => {
    const list: Attachment[] = []

    dbFiles.forEach((file) => {
      const parts = file.file_path.split('/')
      const rawName = parts[parts.length - 1] || 'arquivo'
      const nameMatch = rawName.match(/^\d+_(.+)$/)
      const cleanName = nameMatch ? nameMatch[1] : rawName

      let label = 'Documento Anexo'
      if (submission?.documents) {
        const docDef = submission.documents.find(
          (d: any) =>
            d.fileName === cleanName ||
            (d.fileName && rawName.includes(d.fileName)) ||
            (d.fileName && d.fileName.includes(cleanName)),
        )
        if (docDef) label = docDef.label
      }

      list.push({ id: file.id, name: cleanName, label, pathOrUrl: file.file_path })
    })

    if (submission?.dynamicAnswers) {
      submission.dynamicAnswers.forEach((ans: any, i: number) => {
        const vals = Array.isArray(ans.value) ? ans.value : [ans.value]
        vals.forEach((val: any) => {
          if (
            typeof val === 'string' &&
            (val.startsWith('http') ||
              val.includes('/storage/') ||
              /\.(pdf|jpe?g|png|gif|webp|heic|zip|rar|csv|xlsx?|docx?|txt)$/i.test(val))
          ) {
            const alreadyAdded = list.some(
              (a) => a.pathOrUrl && (val.includes(a.pathOrUrl) || a.pathOrUrl.includes(val)),
            )
            if (!alreadyAdded) {
              let cleanName = `Anexo_${i + 1}`
              if (val.startsWith('http') || val.startsWith('/')) {
                try {
                  const urlToParse = val.startsWith('http')
                    ? val
                    : `http://localhost${val.startsWith('/') ? val : '/' + val}`
                  const parts = new URL(urlToParse).pathname.split('/')
                  let lastPart = parts[parts.length - 1]
                  if (lastPart) cleanName = decodeURIComponent(lastPart)
                } catch (e) {
                  cleanName = val.split('/').pop() || cleanName
                }
              } else {
                cleanName = val.split('/').pop() || val
              }

              list.push({
                id: `json-${i}-${Math.random()}`,
                name: cleanName,
                label: ans.label || 'Documento',
                pathOrUrl: val,
              })
            }
          }
        })
      })
    }

    if (!submission?.dynamicAnswers && list.length === 0) {
      const traverse = (obj: any, pathLabel: string) => {
        if (
          typeof obj === 'string' &&
          (obj.startsWith('http') ||
            obj.includes('/storage/') ||
            /\.(pdf|jpe?g|png|gif|webp|heic|zip|rar|csv|xlsx?|docx?|txt)$/i.test(obj))
        ) {
          if (!obj.toLowerCase().includes('signature')) {
            const alreadyAdded = list.some(
              (a) => a.pathOrUrl && (obj.includes(a.pathOrUrl) || a.pathOrUrl.includes(obj)),
            )
            if (!alreadyAdded) {
              let cleanName = 'Anexo'
              if (obj.startsWith('http') || obj.startsWith('/')) {
                try {
                  const urlToParse = obj.startsWith('http')
                    ? obj
                    : `http://localhost${obj.startsWith('/') ? obj : '/' + obj}`
                  const parts = new URL(urlToParse).pathname.split('/')
                  let lastPart = parts[parts.length - 1]
                  if (lastPart) cleanName = decodeURIComponent(lastPart)
                } catch (e) {
                  cleanName = obj.split('/').pop() || cleanName
                }
              } else {
                cleanName = obj.split('/').pop() || obj
              }
              list.push({
                id: `gen-${Math.random()}`,
                name: cleanName,
                label: pathLabel || 'Documento',
                pathOrUrl: obj,
              })
            }
          }
        } else if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            if (key === 'signature') continue
            traverse(obj[key], isNaN(Number(key)) ? key : pathLabel)
          }
        }
      }
      traverse(submission, 'Documento')
    }

    if (submission?.documents) {
      submission.documents.forEach((doc: any) => {
        const exists = list.some((a) => a.name === doc.fileName || a.label === doc.label)
        const path = doc.url || doc.path || doc.file_path || doc.fileUrl || doc.value || null
        if (!exists) {
          list.push({
            id: doc.id || `doc-${Math.random()}`,
            name: doc.fileName || (path ? 'Documento Anexado' : 'Pendente'),
            label: doc.label || 'Documento',
            pathOrUrl: path,
          })
        } else {
          const existingIdx = list.findIndex(
            (a) => a.name === doc.fileName || a.label === doc.label,
          )
          if (existingIdx >= 0 && !list[existingIdx].pathOrUrl && path) {
            list[existingIdx].pathOrUrl = path
            if (doc.fileName) list[existingIdx].name = doc.fileName
          }
        }
      })
    }

    return list
  }, [dbFiles, submission])

  if (!submission) {
    return <div className="p-8 text-center">Registro não encontrado.</div>
  }

  const handlePrint = async () => {
    setIsDownloading(true)
    await downloadGeneratedPDF(submission)
    setIsDownloading(false)
  }

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
              {JSON.stringify(submission, null, 2)}
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
            <>
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
                        <p className="text-sm text-muted-foreground font-medium mb-1">
                          {item.label}
                        </p>
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

              <Separator />

              <section className="print-break-inside-avoid mt-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                  Documentos Anexados
                </h3>
                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {attachments.map((att) => (
                      <AttachmentCard key={att.id} attachment={att} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Nenhum documento anexado.</p>
                )}
              </section>
            </>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <Separator />
                </>
              )}

              <section className="print-break-inside-avoid">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                  {submission.company?.type === 'mei' ? '3' : '4'}. Documentos Anexados
                </h3>
                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {attachments.map((att) => (
                      <AttachmentCard key={att.id} attachment={att} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Nenhum documento anexado.</p>
                )}
              </section>
            </>
          )}

          <Separator className="my-8" />

          <section className="print-break-inside-avoid text-center pb-16">
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
