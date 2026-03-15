import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft, Check, Loader2, UploadCloud } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface FormDef {
  id: string
  title: string
  schema: {
    sections: Array<{
      id: string
      title: string
      questions: Array<{
        id: string
        type: 'text' | 'textarea' | 'choice' | 'file' | 'upload'
        label: string
        options?: string[]
        multiple?: boolean
        logic?: { if: string; goTo: string } | null
        required?: boolean
        validation?: {
          email?: boolean
          maxLength?: number
        }
      }>
    }>
  }
  settings?: {
    themeColor?: string
    logoUrl?: string
    title?: string
  }
}

const validateQuestion = (q: any, value: string | undefined) => {
  const val = value || ''
  if (q.required && !val.trim()) return 'Este campo é obrigatório'
  if (val && q.validation?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
    return 'E-mail inválido'
  if (val && q.validation?.maxLength && val.length > q.validation.maxLength)
    return `Máximo de ${q.validation.maxLength} caracteres`
  return null
}

export default function DynamicFormViewer({ formDef }: { formDef: FormDef }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<Record<string, File[]>>({})
  const [currentSectionId, setCurrentSectionId] = useState<string>(formDef.schema.sections[0]?.id)
  const [history, setHistory] = useState<string[]>([])
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [isLoadingDraft, setIsLoadingDraft] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true
    const loadDraft = async () => {
      if (!user) {
        if (mounted) setIsLoadingDraft(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('form_drafts')
          .select('*')
          .eq('user_id', user.id)
          .eq('form_id', formDef.id)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle()

        if (data && !error && mounted) {
          const draftData = data.data as any
          if (draftData.answers) {
            const restoredAnswers = { ...draftData.answers }
            formDef.schema.sections.forEach((s) => {
              s.questions.forEach((q) => {
                if (q.type === 'file' || q.type === 'upload') {
                  delete restoredAnswers[q.id]
                }
              })
            })
            setAnswers(restoredAnswers)
          }
          if (
            draftData.currentSectionId &&
            formDef.schema.sections.some((s) => s.id === draftData.currentSectionId)
          ) {
            setCurrentSectionId(draftData.currentSectionId)
          }
          if (draftData.history) setHistory(draftData.history)

          toast({
            title: 'Rascunho recuperado',
            description: 'Continuando de onde você parou.',
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setIsLoadingDraft(false)
      }
    }
    loadDraft()
    return () => {
      mounted = false
    }
  }, [user, formDef.id, formDef.schema.sections, toast])

  const saveDraft = useCallback(
    async (currentAnswers: Record<string, string>, sectionId: string, hist: string[]) => {
      if (!user) return
      try {
        const now = new Date()
        const expires = new Date()
        expires.setDate(expires.getDate() + 30)

        await supabase.from('form_drafts').upsert(
          {
            user_id: user.id,
            form_id: formDef.id,
            data: {
              answers: currentAnswers,
              currentSectionId: sectionId,
              history: hist,
            },
            updated_at: now.toISOString(),
            expires_at: expires.toISOString(),
          },
          { onConflict: 'user_id, form_id' },
        )
      } catch (e) {
        console.error(e)
      }
    },
    [user, formDef.id],
  )

  useEffect(() => {
    if (isLoadingDraft) return
    if (!hasInitialized) {
      setHasInitialized(true)
      return
    }

    const timeout = setTimeout(() => {
      saveDraft(answers, currentSectionId, history)
    }, 2500)

    return () => clearTimeout(timeout)
  }, [answers, currentSectionId, history, isLoadingDraft, saveDraft, hasInitialized])

  const sections = formDef.schema.sections
  const currentSection = sections.find((s) => s.id === currentSectionId)

  const currentSectionHasErrors = useMemo(() => {
    if (!currentSection) return false
    return currentSection.questions.some((q) => validateQuestion(q, answers[q.id]) !== null)
  }, [currentSection, answers])

  const customStyles = useMemo(() => {
    if (!formDef.settings?.themeColor) return null
    return (
      <style>{`
        .dynamic-form-theme {
          --primary-override: ${formDef.settings.themeColor};
        }
        .bg-primary-dynamic { background-color: var(--primary-override) !important; color: #fff !important; }
        .text-primary-dynamic { color: var(--primary-override) !important; }
        .border-primary-dynamic { border-color: var(--primary-override) !important; }
        .ring-primary-dynamic:focus-visible { outline-color: var(--primary-override) !important; box-shadow: 0 0 0 2px var(--primary-override) !important; }
      `}</style>
    )
  }, [formDef.settings])

  const handleNext = () => {
    if (!currentSection) return

    let nextSectionId = null
    for (const q of currentSection.questions) {
      if (q.logic && answers[q.id] === q.logic.if) {
        nextSectionId = q.logic.goTo
        break
      }
    }

    if (!nextSectionId) {
      const idx = sections.findIndex((s) => s.id === currentSectionId)
      if (idx >= 0 && idx < sections.length - 1) {
        nextSectionId = sections[idx + 1].id
      }
    }

    if (nextSectionId) {
      const newHistory = [...history, currentSectionId]
      setHistory(newHistory)
      setCurrentSectionId(nextSectionId)
      saveDraft(answers, nextSectionId, newHistory)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1]
      const newHistory = history.slice(0, -1)
      setHistory(newHistory)
      setCurrentSectionId(prev)
      saveDraft(answers, prev, newHistory)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setUploadStatus('Preparando envio...')
    try {
      const now = new Date()
      const protocol = `DYN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      const submissionId = crypto.randomUUID()

      const uploadedUrls: Record<string, any> = {}
      let totalFiles = 0
      Object.values(files).forEach((list) => {
        totalFiles += list.length
      })
      let uploadedCount = 0

      for (const [qId, fileList] of Object.entries(files)) {
        const urls: string[] = []
        for (const file of fileList) {
          uploadedCount++
          setUploadStatus(`Enviando arquivo ${uploadedCount} de ${totalFiles}...`)
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const filePath = `forms/${formDef.id}/${submissionId}/${safeName}`

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file)
          if (!uploadError) {
            await supabase.from('generated_documents').insert({
              submission_id: submissionId,
              file_path: filePath,
            })
            const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
            urls.push(urlData.publicUrl)
          } else {
            toast({
              title: 'Erro no upload',
              description: `Não foi possível fazer upload do arquivo ${file.name}`,
              variant: 'destructive',
            })
          }
        }
        if (urls.length > 0) {
          uploadedUrls[qId] = urls.length === 1 ? urls[0] : urls
        }
      }

      setUploadStatus('Finalizando...')
      const finalAnswers = { ...answers, ...uploadedUrls }

      const dynamicAnswers = formDef.schema.sections
        .flatMap((s) => s.questions)
        .map((q) => ({
          label: q.label,
          value: finalAnswers[q.id],
        }))

      const { error: insertError } = await supabase.from('form_submissions').insert({
        id: submissionId,
        form_id: formDef.id,
        data: {
          clientName: finalAnswers[currentSection?.questions[0]?.id] || 'Respostas do Form',
          protocol,
          answers: finalAnswers,
          dynamicAnswers,
          type: 'dynamic',
          status: 'pending',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      })

      if (insertError) throw insertError

      if (user) {
        await supabase.from('form_drafts').delete().eq('user_id', user.id).eq('form_id', formDef.id)
      }

      toast({
        title: 'Sucesso!',
        description: 'Seu formulário foi enviado com sucesso e recebido pela nossa equipe.',
      })
      navigate(`/form/${formDef.id}/success`)
    } catch (err) {
      toast({
        title: 'Erro ao processar',
        description: 'Não foi possível enviar o formulário. Seus dados continuam salvos.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setUploadStatus('')
    }
  }

  const isLast =
    !currentSection ||
    (() => {
      let nextSectionId = null
      for (const q of currentSection.questions) {
        if (q.logic && answers[q.id] === q.logic.if) {
          nextSectionId = q.logic.goTo
          break
        }
      }
      if (!nextSectionId) {
        const idx = sections.findIndex((s) => s.id === currentSectionId)
        return idx === sections.length - 1
      }
      return false
    })()

  if (isLoadingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!currentSection)
    return <div className="p-8 text-center">Formulário inválido ou incompleto</div>

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 relative min-h-screen pb-32 sm:pb-8 dynamic-form-theme">
      {customStyles}

      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        {formDef.settings?.logoUrl ? (
          <img src={formDef.settings.logoUrl} alt="Logo" className="h-8 object-contain" />
        ) : (
          <h1 className="text-xl font-bold text-primary-dynamic flex items-center gap-2">
            {formDef.settings?.title || formDef.title}
          </h1>
        )}
      </div>

      <div className="animate-fade-in-up">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{currentSection.title}</h2>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-8">
            {currentSection.questions.map((q) => {
              const errorMsg = validateQuestion(q, answers[q.id])
              const showError = touched[q.id] && errorMsg

              return (
                <div key={q.id} className="space-y-3">
                  <Label className="text-base font-semibold text-slate-800 flex items-center gap-1">
                    {q.label}{' '}
                    {q.required && (
                      <span className="text-destructive font-bold text-lg leading-none">*</span>
                    )}
                  </Label>

                  {q.type === 'text' && (
                    <Input
                      value={answers[q.id] || ''}
                      onChange={(e) => {
                        setAnswers({ ...answers, [q.id]: e.target.value })
                        setTouched({ ...touched, [q.id]: true })
                      }}
                      onBlur={() => setTouched({ ...touched, [q.id]: true })}
                      className={cn(
                        'ring-primary-dynamic transition-shadow',
                        showError &&
                          'border-destructive ring-destructive/20 focus-visible:ring-destructive',
                      )}
                      placeholder="Sua resposta"
                    />
                  )}

                  {q.type === 'textarea' && (
                    <Textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => {
                        setAnswers({ ...answers, [q.id]: e.target.value })
                        setTouched({ ...touched, [q.id]: true })
                      }}
                      onBlur={() => setTouched({ ...touched, [q.id]: true })}
                      className={cn(
                        'ring-primary-dynamic min-h-[100px] transition-shadow',
                        showError &&
                          'border-destructive ring-destructive/20 focus-visible:ring-destructive',
                      )}
                      placeholder="Sua resposta"
                    />
                  )}

                  {(q.type === 'file' || q.type === 'upload') && (
                    <div className="space-y-3">
                      <div className="relative">
                        <Input
                          type="file"
                          multiple={q.multiple}
                          onChange={(e) => {
                            if (e.target.files) {
                              const selectedFiles = Array.from(e.target.files)
                              setFiles((prev) => ({ ...prev, [q.id]: selectedFiles }))
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: selectedFiles.map((f) => f.name).join(', '),
                              }))
                              setTouched((prev) => ({ ...prev, [q.id]: true }))
                            }
                          }}
                          className={cn(
                            'absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10',
                          )}
                        />
                        <div
                          className={cn(
                            'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors',
                            showError
                              ? 'border-destructive bg-destructive/5'
                              : 'border-muted-foreground/25 hover:bg-slate-50',
                            files[q.id]?.length ? 'bg-slate-50 border-primary/20' : '',
                          )}
                        >
                          <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium text-slate-700">
                            Clique para selecionar ou arraste arquivos
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, JPG, PNG {q.multiple ? '(Múltiplos permitidos)' : ''}
                          </p>
                        </div>
                      </div>

                      {files[q.id] && files[q.id].length > 0 && (
                        <div className="space-y-2 mt-3 bg-slate-50 p-3 rounded-md border">
                          {files[q.id].map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                              <Check className="w-4 h-4 text-success shrink-0" />
                              <span className="truncate flex-1">{f.name}</span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {(f.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {q.type === 'choice' && q.options && (
                    <RadioGroup
                      value={answers[q.id] || ''}
                      onValueChange={(v) => {
                        setAnswers({ ...answers, [q.id]: v })
                        setTouched({ ...touched, [q.id]: true })
                      }}
                      className="flex flex-col gap-3 mt-3"
                    >
                      {q.options.map((opt) => (
                        <div
                          key={opt}
                          className={cn(
                            'flex items-center space-x-3 bg-slate-50 p-3 rounded-md border transition-colors',
                            showError
                              ? 'border-destructive/50 bg-destructive/5'
                              : 'border-slate-100 hover:border-slate-200',
                          )}
                        >
                          <RadioGroupItem
                            value={opt}
                            id={`${q.id}-${opt}`}
                            className="border-primary-dynamic text-primary-dynamic h-5 w-5"
                          />
                          <Label
                            htmlFor={`${q.id}-${opt}`}
                            className="cursor-pointer font-medium text-slate-700 w-full"
                          >
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {showError && (
                    <p className="text-sm font-medium text-destructive animate-fade-in">
                      {errorMsg}
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="fixed sm:static bottom-0 left-0 right-0 bg-background/95 sm:bg-transparent backdrop-blur-md sm:bg-transparent z-50 p-4 sm:p-0 pt-4 sm:pt-8 border-t border-border mt-8 flex justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.05)] sm:shadow-none items-center">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={history.length === 0 || isSubmitting}
          className="bg-white"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <div className="flex items-center gap-3">
          {isSubmitting && uploadStatus && (
            <span className="text-xs font-medium text-muted-foreground animate-pulse hidden sm:inline-block">
              {uploadStatus}
            </span>
          )}
          {isLast ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || currentSectionHasErrors}
              className="bg-primary-dynamic text-white hover:opacity-90 shadow-md transition-all active:scale-95 border-none font-medium disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Finalizar <Check className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isSubmitting || currentSectionHasErrors}
              className="bg-primary-dynamic text-white hover:opacity-90 border-none font-medium disabled:opacity-50"
            >
              Próximo <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
