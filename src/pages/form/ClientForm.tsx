import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/AppContext'
import { CompanyData, Partner, ActivityData } from '@/types'

import { CompanyStep } from '@/components/form/CompanyStep'
import { PartnersStep } from '@/components/form/PartnersStep'
import { ActivityStep } from '@/components/form/ActivityStep'

const STEPS = ['Empresa', 'Sócios', 'Atividades', 'Revisão']

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addSubmission, updateSubmission, getSubmission } = useAppStore()

  const [currentStep, setCurrentStep] = useState(0)

  // Form State
  const [clientName, setClientName] = useState('')
  const [company, setCompany] = useState<CompanyData>({
    suggestedName1: '',
    suggestedName2: '',
    suggestedName3: '',
    capitalSocial: 0,
  })
  const [partners, setPartners] = useState<Partner[]>([])
  const [activity, setActivity] = useState<ActivityData>({
    mainCnae: '',
    secondaryCnaes: '',
    businessAddress: '',
  })

  useEffect(() => {
    if (id && id !== 'new') {
      const existing = getSubmission(id)
      if (existing) {
        setClientName(existing.clientName)
        setCompany(existing.company || company)
        setPartners(existing.partners || [])
        setActivity(existing.activity || activity)
      }
    }
  }, [id])

  const handleNext = () => {
    if (currentStep === 0 && !company.suggestedName1) {
      return toast({
        title: 'Campo Obrigatório',
        description: 'Preencha ao menos a 1ª opção de nome.',
        variant: 'destructive',
      })
    }
    if (currentStep < STEPS.length - 1) setCurrentStep((c) => c + 1)
  }

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((c) => c - 1)
  }

  const handleSubmit = () => {
    const data = {
      clientName: clientName || company.suggestedName1 || 'Cliente Novo',
      status: 'submitted' as const,
      company,
      partners,
      activity,
    }

    if (id && id !== 'new') {
      updateSubmission(id, data)
      navigate(`/form/${id}/success`)
    } else {
      const newId = addSubmission(data)
      navigate(`/form/${newId}/success`)
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          {STEPS.map((s, i) => (
            <span key={s} className={i <= currentStep ? 'text-primary' : ''}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {currentStep === 0 && <CompanyStep data={company} onChange={setCompany} />}
        {currentStep === 1 && <PartnersStep partners={partners} onChange={setPartners} />}
        {currentStep === 2 && <ActivityStep data={activity} onChange={setActivity} />}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in text-center py-12">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Tudo Certo!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Revisamos os dados preenchidos. Clique em "Finalizar" para enviar a solicitação para
              nossa equipe de contabilidade.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-8 border-t mt-8">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        {currentStep === STEPS.length - 1 ? (
          <Button onClick={handleSubmit} className="bg-success hover:bg-success/90">
            Finalizar Envio <Check className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Próximo <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
