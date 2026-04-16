import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, Moon, Sun, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/AppContext'
import { supabase } from '@/lib/supabase/client'
import { CompanyData, Partner, ActivityData, DocumentItem } from '@/types'

import { CompanyStep } from '@/components/form/CompanyStep'
import { PartnersStep } from '@/components/form/PartnersStep'
import { ActivityStep } from '@/components/form/ActivityStep'
import { DocumentsStep } from '@/components/form/DocumentsStep'
import { SignatureStep } from '@/components/form/SignatureStep'

const DEFAULT_DOCS: DocumentItem[] = [
  { id: 'rg', label: 'Documento de Identidade (RG/CNH)' },
  { id: 'residencia', label: 'Comprovante de Residência' },
  { id: 'iptu', label: 'Capa do IPTU (Endereço Comercial)' },
  {
    id: 'posse',
    label:
      'Documento que comprove a posse ou a propriedade regular do empresário no imóvel aonde será estabelecida a empresa',
  },
  { id: 'casamento', label: 'Certidão de casamento' },
]

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addSubmission, updateSubmission, getSubmission } = useAppStore()

  const [isDark, setIsDark] = useState(false)
  const [currentStepId, setCurrentStepId] = useState('company')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [clientName, setClientName] = useState('')
  const [company, setCompany] = useState<CompanyData>({
    type: 'ltda',
    tradeName: '',
    email: '',
    phone: '',
    zipCode: '',
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
    description: '',
  })
  const [documents, setDocuments] = useState<DocumentItem[]>(DEFAULT_DOCS)
  const [signature, setSignature] = useState('')

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')

    return () => document.documentElement.classList.remove('dark')
  }, [isDark])

  useEffect(() => {
    // Formulário público não deve buscar rascunhos locais via ID para evitar conflitos de sessão
  }, [id])

  const visibleSteps = useMemo(() => {
    return [
      { id: 'company', label: 'Empresa' },
      { id: 'partners', label: 'Sócios', hideIf: company.type === 'mei' },
      { id: 'activity', label: 'Atividades' },
      { id: 'documents', label: 'Documentos' },
      { id: 'signature', label: 'Assinatura' },
      { id: 'review', label: 'Revisão' },
    ].filter((s) => !s.hideIf)
  }, [company.type])

  let currentIndex = visibleSteps.findIndex((s) => s.id === currentStepId)
  if (currentIndex === -1) currentIndex = 0
  const activeStepId = visibleSteps[currentIndex].id

  const handleNext = () => {
    if (activeStepId === 'company') {
      if (!company.tradeName || !company.email) {
        toast({
          title: 'Campos Obrigatórios',
          description: 'Nome Fantasia e E-mail corporativo são obrigatórios.',
          variant: 'destructive',
        })
        return
      }
      if ((company.type === 'ltda' || company.type === 'slu') && !company.suggestedName1) {
        toast({
          title: 'Campo Obrigatório',
          description: 'Preencha ao menos a 1ª opção de razão social.',
          variant: 'destructive',
        })
        return
      }
    }

    if (activeStepId === 'partners' && company.type !== 'mei') {
      if (partners.length === 0) {
        toast({
          title: 'Campo Obrigatório',
          description: 'Adicione pelo menos um sócio.',
          variant: 'destructive',
        })
        return
      }
      const hasInvalid = partners.some((p) => !p.name || !p.cpf || !p.sharePercentage)
      if (hasInvalid) {
        toast({
          title: 'Dados Incompletos',
          description: 'Preencha Nome, CPF e Participação para todos os sócios.',
          variant: 'destructive',
        })
        return
      }
      const totalShare = partners.reduce((acc, p) => acc + (Number(p.sharePercentage) || 0), 0)
      if (totalShare !== 100) {
        toast({
          title: 'Participação Inválida',
          description: `A soma das participações societárias deve ser exatamente 100%. Atualmente: ${totalShare}%.`,
          variant: 'destructive',
        })
        return
      }
    }

    if (activeStepId === 'activity') {
      if (!activity.mainCnae || !activity.businessAddress || !activity.description) {
        toast({
          title: 'Dados Incompletos',
          description: 'CNAE Principal, Endereço e Descrição são obrigatórios.',
          variant: 'destructive',
        })
        return
      }
    }

    if (activeStepId === 'signature' && !signature) {
      toast({
        title: 'Assinatura pendente',
        description: 'Por favor, assine o formulário antes de revisar e enviar.',
        variant: 'destructive',
      })
      return
    }

    if (currentIndex < visibleSteps.length - 1) {
      setCurrentStepId(visibleSteps[currentIndex + 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentStepId(visibleSteps[currentIndex - 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const data = {
        clientName: clientName || company.tradeName || company.suggestedName1 || 'Cliente Novo',
        status: 'pending' as const,
        company,
        partners: company.type === 'mei' ? [] : partners,
        activity,
        documents,
        signature,
      }

      // Envio direto para o Supabase garantindo centralização na nuvem
      const protocol = `PRT-${Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(8, '0')}`

      const submissionPayload = {
        ...data,
        protocol,
        type: 'company_registration',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const formId = id && id !== 'new' ? id : null

      const { data: insertedRecord, error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          data: submissionPayload,
        })
        .select('id')
        .single()

      if (error) throw error

      const finalSubmissionId = insertedRecord.id

      // Dispara envio de email automático via Edge Function
      if (company.email) {
        supabase.functions
          .invoke('send-confirmation-email', {
            body: {
              submissionId: finalSubmissionId,
              clientName: data.clientName,
              email: company.email,
              protocol,
            },
          })
          .catch(console.error)
      }

      try {
        await addSubmission({ ...submissionPayload, id: finalSubmissionId })
      } catch (e) {
        // Ignora erro local se o envio na nuvem funcionou com sucesso
      }

      toast({
        title: 'Sucesso!',
        description:
          'Seu formulário foi enviado com sucesso e recebido pela nossa equipe. Um e-mail de confirmação foi enviado.',
      })
      navigate(`/form/${finalSubmissionId}/success`)
    } catch (err: any) {
      console.error('Submission error:', err)
      toast({
        title: 'Erro ao processar',
        description:
          err?.message ||
          'Houve um problema de rede ou permissão ao enviar o formulário. Por favor, tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentIndex + 1) / visibleSteps.length) * 100

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 transition-colors relative min-h-screen pb-32 sm:pb-8">
      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Building2 className="w-6 h-6" /> EmpresaFlow
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="rounded-full hover:bg-muted"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </Button>
      </div>

      <div className="mb-8 hidden sm:block">
        <Progress value={progress} className="h-2 mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          {visibleSteps.map((s, i) => (
            <span key={s.id} className={i <= currentIndex ? 'text-primary' : ''}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 sm:hidden">
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-sm text-center text-muted-foreground font-medium">
          Passo {currentIndex + 1} de {visibleSteps.length}: {visibleSteps[currentIndex].label}
        </p>
      </div>

      <div className="min-h-[400px]">
        {activeStepId === 'company' && <CompanyStep data={company} onChange={setCompany} />}
        {activeStepId === 'partners' && <PartnersStep partners={partners} onChange={setPartners} />}
        {activeStepId === 'activity' && <ActivityStep data={activity} onChange={setActivity} />}
        {activeStepId === 'documents' && (
          <DocumentsStep documents={documents} onChange={setDocuments} />
        )}
        {activeStepId === 'signature' && (
          <SignatureStep signature={signature} onChange={setSignature} />
        )}
        {activeStepId === 'review' && (
          <div className="space-y-6 animate-fade-in text-center py-12">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Tudo Certo!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Revisamos os dados preenchidos e documentos anexados. Clique em "Finalizar formulário"
              para enviar a solicitação para nossa equipe.
            </p>
          </div>
        )}
      </div>

      <div className="fixed sm:static bottom-0 left-0 right-0 bg-background/95 sm:bg-transparent backdrop-blur-md sm:bg-transparent z-50 p-4 sm:p-0 pt-4 sm:pt-8 border-t border-border mt-8 flex justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.05)] sm:shadow-none">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0 || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        {currentIndex === visibleSteps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all active:scale-95"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Finalizar formulário <Check className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={isSubmitting}>
            Próximo <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
