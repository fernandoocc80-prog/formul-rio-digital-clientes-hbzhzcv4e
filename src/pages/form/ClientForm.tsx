import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check, Moon, Sun, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/AppContext'
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
    if (id && id !== 'new') {
      const existing = getSubmission(id)
      if (existing) {
        setClientName(existing.clientName)
        setCompany(existing.company || company)
        setPartners(existing.partners || [])
        setActivity(existing.activity || activity)

        const mergedDocs = [...(existing.documents || [])]
        DEFAULT_DOCS.forEach((d) => !mergedDocs.some((x) => x.id === d.id) && mergedDocs.push(d))
        setDocuments(mergedDocs.length ? mergedDocs : DEFAULT_DOCS)

        setSignature(existing.signature || '')
      }
    }
  }, [id, getSubmission])

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
      if (company.type === 'ltda' && !company.suggestedName1) {
        toast({
          title: 'Campo Obrigatório',
          description: 'Preencha ao menos a 1ª opção de razão social.',
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
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentStepId(visibleSteps[currentIndex - 1].id)
  }

  const handleSubmit = () => {
    const data = {
      clientName: clientName || company.tradeName || company.suggestedName1 || 'Cliente Novo',
      status: 'pending' as const,
      company,
      partners: company.type === 'mei' ? [] : partners,
      activity,
      documents,
      signature,
    }

    if (id && id !== 'new') {
      updateSubmission(id, data)
      toast({
        title: 'Sucesso!',
        description: 'Seus dados foram atualizados e enviados com sucesso.',
      })
      navigate(`/form/${id}/success`)
    } else {
      const newId = addSubmission(data)
      toast({
        title: 'Sucesso!',
        description: 'Seu formulário foi enviado com sucesso e recebido pela nossa equipe.',
      })
      navigate(`/form/${newId}/success`)
    }
  }

  const progress = ((currentIndex + 1) / visibleSteps.length) * 100

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 transition-colors">
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

      <div className="flex justify-between pt-8 border-t border-border mt-8 pb-12 sm:pb-8">
        <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        {currentIndex === visibleSteps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          >
            Finalizar formulário <Check className="w-4 h-4 ml-2" />
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
