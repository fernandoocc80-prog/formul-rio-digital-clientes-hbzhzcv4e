import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Submission } from '@/types'

interface AppState {
  submissions: Submission[]
  emailTemplate: string
  addSubmission: (sub: Omit<Submission, 'id' | 'createdAt' | 'updatedAt' | 'protocol'>) => string
  updateSubmission: (id: string, data: Partial<Submission>) => void
  getSubmission: (id: string) => Submission | undefined
  updateEmailTemplate: (template: string) => void
}

const mockData: Submission[] = [
  {
    id: 'sub-1',
    protocol: '2023-10-15-0001',
    clientName: 'Tech Nova Solutions',
    status: 'approved',
    createdAt: '2023-10-15T10:00:00Z',
    updatedAt: '2023-10-16T10:00:00Z',
    partners: [
      {
        id: 'p1',
        name: 'João Souza',
        cpf: '111.222.333-44',
        rg: '12.345.678-9',
        address: 'Rua A, 123',
        sharePercentage: 60,
      },
      {
        id: 'p2',
        name: 'Maria Lima',
        cpf: '555.666.777-88',
        rg: '98.765.432-1',
        address: 'Av B, 456',
        sharePercentage: 40,
      },
    ],
    company: {
      type: 'ltda',
      tradeName: 'Tech Nova',
      email: 'contato@technova.com.br',
      phone: '(11) 98888-7777',
      zipCode: '01000-000',
      suggestedName1: 'Tech Nova Ltda',
      suggestedName2: 'Nova Tech SA',
      suggestedName3: 'Inova Tech',
      capitalSocial: 50000,
    },
    activity: {
      mainCnae: '6201-5/01',
      secondaryCnaes: '6202-3/00, 6204-0/00',
      businessAddress: 'Centro Comercial, Sala 100',
      description: 'Desenvolvimento de software e consultoria especializada em soluções web.',
    },
    documents: [
      {
        id: 'rg',
        label: 'Documento de Identidade',
        fileName: 'rg_joao.pdf',
        uploadedAt: '2023-10-15T10:05:00Z',
      },
    ],
    signature: '',
  },
  {
    id: 'sub-2',
    protocol: '2023-10-20-0002',
    clientName: 'Carlos Roberto (MEI)',
    status: 'pending',
    createdAt: '2023-10-20T14:30:00Z',
    updatedAt: '2023-10-20T14:30:00Z',
    partners: [],
    company: {
      type: 'mei',
      tradeName: 'Padaria Saborosa',
      email: 'carlos.padaria@email.com',
      phone: '(21) 97777-6666',
      zipCode: '20000-000',
      suggestedName1: '',
      suggestedName2: '',
      suggestedName3: '',
      capitalSocial: 5000,
    },
    activity: {
      mainCnae: '1071-6/00',
      secondaryCnaes: '',
      businessAddress: 'Av Principal, 1000',
      description: 'Fabricação de produtos de padaria e confeitaria.',
    },
    documents: [],
    signature: '',
  },
]

const AppContext = createContext<AppState | undefined>(undefined)
const LOCAL_STORAGE_KEY = 'empresaflow_submissions_v1'
const EMAIL_TEMPLATE_KEY = 'empresaflow_email_template'

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Could not read from local storage', e)
    }
    return mockData
  })

  const [emailTemplate, setEmailTemplate] = useState(() => {
    return (
      localStorage.getItem(EMAIL_TEMPLATE_KEY) ||
      'Olá {nome},\n\nRecebemos sua solicitação de abertura de empresa com sucesso!\n\nSeu número de protocolo é: {protocolo}\n\nNossa equipe está analisando os dados e documentos enviados. Em breve, você receberá atualizações sobre o andamento do processo.\n\nAtenciosamente,\nEquipe EmpresaFlow'
    )
  })

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(submissions))
  }, [submissions])

  useEffect(() => {
    localStorage.setItem(EMAIL_TEMPLATE_KEY, emailTemplate)
  }, [emailTemplate])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          setSubmissions(JSON.parse(e.newValue))
        } catch (err) {
          console.error('Error parsing synced data', err)
        }
      }
      if (e.key === EMAIL_TEMPLATE_KEY && e.newValue) {
        setEmailTemplate(e.newValue)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addSubmission = (data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt' | 'protocol'>) => {
    const newId = `sub-${Math.random().toString(36).substring(2, 9)}`
    const now = new Date()
    const isoString = now.toISOString()

    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const seq = String(submissions.length + 1).padStart(4, '0')
    const protocol = `${yyyy}-${mm}-${dd}-${seq}`

    const newSubmission: Submission = {
      ...data,
      id: newId,
      protocol,
      createdAt: isoString,
      updatedAt: isoString,
    }

    setSubmissions((prev) => [newSubmission, ...prev])

    try {
      const channel = new BroadcastChannel('empresaflow_notifications')
      channel.postMessage({ type: 'NEW_SUBMISSION', data: newSubmission })
      channel.close()
    } catch (e) {
      console.warn('BroadcastChannel not supported', e)
    }

    return newId
  }

  const updateSubmission = (id: string, data: Partial<Submission>) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s)),
    )
  }

  const getSubmission = (id: string) => submissions.find((s) => s.id === id)

  const updateEmailTemplate = (template: string) => setEmailTemplate(template)

  return (
    <AppContext.Provider
      value={{
        submissions,
        emailTemplate,
        addSubmission,
        updateSubmission,
        getSubmission,
        updateEmailTemplate,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within AppProvider')
  return context
}
