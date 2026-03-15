import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FormDef {
  id: string
  title: string
  schema: {
    sections: Array<{
      id: string
      title: string
      questions: Array<{
        id: string
        type: 'text' | 'textarea' | 'choice'
        label: string
        options?: string[]
        logic?: { if: string; goTo: string } | null
      }>
    }>
  }
  settings?: {
    themeColor?: string
    logoUrl?: string
    title?: string
  }
}

export default function DynamicFormViewer({ formDef }: { formDef: FormDef }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentSectionId, setCurrentSectionId] = useState<string>(formDef.schema.sections[0]?.id)
  const [history, setHistory] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const sections = formDef.schema.sections
  const currentSection = sections.find((s) => s.id === currentSectionId)

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
      setHistory([...history, currentSectionId])
      setCurrentSectionId(nextSectionId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1]
      setHistory(history.slice(0, -1))
      setCurrentSectionId(prev)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const now = new Date()
      const protocol = `DYN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

      const { error } = await supabase.from('form_submissions').insert({
        form_id: formDef.id,
        data: {
          clientName: answers[currentSection?.questions[0]?.id] || 'Respostas do Form',
          protocol,
          answers,
          type: 'dynamic',
          status: 'pending',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      })

      if (error) throw error

      toast({
        title: 'Sucesso!',
        description: 'Seu formulário foi enviado com sucesso e recebido pela nossa equipe.',
      })
      navigate(`/form/${formDef.id}/success`)
    } catch (err) {
      toast({
        title: 'Erro ao processar',
        description: 'Houve um problema ao enviar o formulário.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
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
            {currentSection.questions.map((q) => (
              <div key={q.id} className="space-y-3">
                <Label className="text-base font-semibold text-slate-800">{q.label}</Label>
                {q.type === 'text' && (
                  <Input
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    className="ring-primary-dynamic transition-shadow"
                    placeholder="Sua resposta"
                  />
                )}
                {q.type === 'textarea' && (
                  <Textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    className="ring-primary-dynamic min-h-[100px] transition-shadow"
                    placeholder="Sua resposta"
                  />
                )}
                {q.type === 'choice' && q.options && (
                  <RadioGroup
                    value={answers[q.id] || ''}
                    onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}
                    className="flex flex-col gap-3 mt-3"
                  >
                    {q.options.map((opt) => (
                      <div
                        key={opt}
                        className="flex items-center space-x-3 bg-slate-50 p-3 rounded-md border border-slate-100 hover:border-slate-200 transition-colors"
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
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="fixed sm:static bottom-0 left-0 right-0 bg-background/95 sm:bg-transparent backdrop-blur-md sm:bg-transparent z-50 p-4 sm:p-0 pt-4 sm:pt-8 border-t border-border mt-8 flex justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.05)] sm:shadow-none">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={history.length === 0 || isSubmitting}
          className="bg-white"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        {isLast ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary-dynamic text-white hover:opacity-90 shadow-md transition-all active:scale-95 border-none font-medium"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Finalizar <Check className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className="bg-primary-dynamic text-white hover:opacity-90 border-none font-medium"
          >
            Próximo <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
