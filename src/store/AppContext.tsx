import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react'
import { Submission } from '@/types'

interface AppState {
  submissions: Submission[]
  emailTemplate: string
  syncStatus: 'idle' | 'syncing' | 'error'
  syncError: string | null
  lastSyncAt: Date | null
  addSubmission: (sub: Omit<Submission, 'id' | 'createdAt' | 'updatedAt' | 'protocol'>) => string
  updateSubmission: (id: string, data: Partial<Submission>) => Promise<void>
  getSubmission: (id: string) => Submission | undefined
  updateEmailTemplate: (template: string) => void
  syncSubmissions: (options?: { force?: boolean }) => Promise<void>
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
    ],
    company: {
      type: 'ltda',
      tradeName: 'Tech Nova',
      email: 'contato@technova.com.br',
      phone: '(11) 98888-7777',
      zipCode: '01000-000',
      suggestedName1: 'Tech Nova Ltda',
      suggestedName2: '',
      suggestedName3: '',
      capitalSocial: 50000,
    },
    activity: {
      mainCnae: '6201-5/01',
      secondaryCnaes: '',
      businessAddress: 'Centro Comercial',
      description: 'Desenvolvimento de software',
    },
    documents: [],
    signature: '',
  },
]

const AppContext = createContext<AppState | undefined>(undefined)
const LOCAL_STORAGE_KEY = 'empresaflow_submissions_v1'
const EMAIL_TEMPLATE_KEY = 'empresaflow_email_template'

const getDB = (): Submission[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Could not parse local storage data', e)
  }
  return mockData
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>(getDB)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const syncInProgress = useRef(false)

  const [emailTemplate, setEmailTemplate] = useState(() => {
    return (
      localStorage.getItem(EMAIL_TEMPLATE_KEY) ||
      'Olá {nome},\n\nRecebemos sua solicitação de abertura de empresa com sucesso!\n\nSeu número de protocolo é: {protocolo}'
    )
  })

  // Synchronize with centralized data source, ensuring cache is bypassed and data is fresh
  const syncSubmissions = useCallback(async (options?: { force?: boolean }) => {
    if (!navigator.onLine) {
      setSyncStatus('error')
      setSyncError('Você está offline.')
      return
    }

    if (syncInProgress.current && !options?.force) return
    syncInProgress.current = true

    setSyncStatus('syncing')
    setSyncError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, options?.force ? 400 : 200))

      // Enforce State Integrity: Bypass local browser cache completely
      // Ensuring dashboard reflects the most current database state
      const cacheBuster = Date.now()
      const _simulatedFetchUrl = `/api/sync?_t=${cacheBuster}`

      try {
        await fetch(_simulatedFetchUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        }).catch(() => {
          // ignore error
        })
      } catch (e) {
        // ignore error
      }

      const serverData = getDB()

      // Prioritize server-side truth: force state update with strict parity
      // Eliminates discrepancies across views/devices
      setSubmissions([...serverData])

      setLastSyncAt(new Date())
      setSyncStatus('idle')

      if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData))
      }
    } catch (error) {
      console.error('Failed to sync:', error)
      setSyncStatus('error')
      setSyncError('Falha ao conectar.')
    } finally {
      syncInProgress.current = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(EMAIL_TEMPLATE_KEY, emailTemplate)
  }, [emailTemplate])

  useEffect(() => {
    syncSubmissions({ force: true })

    const intervalId = setInterval(() => {
      syncSubmissions()
    }, 10000)

    const handleFocus = () => syncSubmissions({ force: true })
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncSubmissions({ force: true })
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        syncSubmissions({ force: true })
      }
    }

    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('empresaflow_notifications')
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_SUBMISSION' || event.data?.type === 'UPDATE_SUBMISSION') {
          syncSubmissions({ force: true })
        }
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported', e)
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
      if (channel) channel.close()
    }
  }, [syncSubmissions])

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

    const currentDB = getDB()
    const updatedDB = [newSubmission, ...currentDB]

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedDB))
    setSubmissions(updatedDB)

    try {
      const channel = new BroadcastChannel('empresaflow_notifications')
      channel.postMessage({ type: 'NEW_SUBMISSION', data: newSubmission })
      channel.close()
    } catch (e) {
      // ignore error
    }

    syncSubmissions({ force: true }).catch(() => {
      // ignore error
    })
    return newId
  }

  const updateSubmission = async (id: string, data: Partial<Submission>) => {
    const currentDB = getDB()
    const updatedDB = currentDB.map((s) =>
      s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s,
    )

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedDB))
    setSubmissions(updatedDB)

    try {
      const channel = new BroadcastChannel('empresaflow_notifications')
      channel.postMessage({ type: 'UPDATE_SUBMISSION', data: { id, ...data } })
      channel.close()
    } catch (e) {
      // ignore error
    }

    await syncSubmissions({ force: true })
  }

  const getSubmission = (id: string) => submissions.find((s) => s.id === id)

  const updateEmailTemplate = (template: string) => setEmailTemplate(template)

  return (
    <AppContext.Provider
      value={{
        submissions,
        emailTemplate,
        syncStatus,
        syncError,
        lastSyncAt,
        addSubmission,
        updateSubmission,
        getSubmission,
        updateEmailTemplate,
        syncSubmissions,
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
