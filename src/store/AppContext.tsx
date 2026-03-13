import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Submission } from '@/types'

interface AppState {
  submissions: Submission[]
  addSubmission: (sub: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateSubmission: (id: string, data: Partial<Submission>) => void
  getSubmission: (id: string) => Submission | undefined
}

const mockData: Submission[] = [
  {
    id: 'sub-1',
    clientName: 'Tech Nova Solutions',
    status: 'completed',
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
      suggestedName1: 'Tech Nova Ltda',
      suggestedName2: 'Nova Tech SA',
      suggestedName3: 'Inova Tech',
      capitalSocial: 50000,
    },
    activity: {
      mainCnae: '6201-5/01',
      secondaryCnaes: '6202-3/00, 6204-0/00',
      businessAddress: 'Centro Comercial, Sala 100',
    },
  },
  {
    id: 'sub-2',
    clientName: 'Padaria do Bairro',
    status: 'submitted',
    createdAt: '2023-10-20T14:30:00Z',
    updatedAt: '2023-10-20T14:30:00Z',
    partners: [
      {
        id: 'p3',
        name: 'Carlos Roberto',
        cpf: '999.888.777-66',
        rg: '11.222.333-4',
        address: 'Rua das Flores, 55',
        sharePercentage: 100,
      },
    ],
    company: {
      suggestedName1: 'Padaria Saborosa',
      suggestedName2: 'Pão Quente Ltda',
      suggestedName3: 'Delícias do Trigo',
      capitalSocial: 20000,
    },
    activity: { mainCnae: '1071-6/00', secondaryCnaes: '', businessAddress: 'Av Principal, 1000' },
  },
]

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>(mockData)

  const addSubmission = (data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `sub-${Math.random().toString(36).substring(2, 9)}`
    const now = new Date().toISOString()
    const newSubmission: Submission = { ...data, id: newId, createdAt: now, updatedAt: now }
    setSubmissions((prev) => [newSubmission, ...prev])
    return newId
  }

  const updateSubmission = (id: string, data: Partial<Submission>) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s)),
    )
  }

  const getSubmission = (id: string) => submissions.find((s) => s.id === id)

  return (
    <AppContext.Provider value={{ submissions, addSubmission, updateSubmission, getSubmission }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within AppProvider')
  return context
}
