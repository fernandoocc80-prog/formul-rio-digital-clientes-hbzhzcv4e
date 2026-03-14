import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react'
import { Submission, AdminUser } from '@/types'

const MOCK_REMOTE_DB_KEY = 'empresaflow_remote_db_v2'
const LOCAL_CACHE_KEY = 'empresaflow_submissions_cache_v2'
const EMAIL_TEMPLATE_KEY = 'empresaflow_email_template'
const USERS_STORAGE_KEY = 'empresaflow_users_v1'
const CURRENT_USER_KEY = 'empresaflow_current_user_v1'

// Explicit Cache Invalidation: clear local/session storage during initialization
// This ensures the "Source of Truth" always comes from the server on fresh loads
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(LOCAL_CACHE_KEY)
    sessionStorage.removeItem(LOCAL_CACHE_KEY)
  } catch (e) {
    /* ignore */
  }
}

interface AppState {
  submissions: Submission[]
  emailTemplate: string
  syncStatus: 'idle' | 'syncing' | 'error'
  syncError: string | null
  lastSyncAt: Date | null
  users: AdminUser[]
  currentUser: AdminUser | null
  addSubmission: (sub: Omit<Submission, 'id' | 'createdAt' | 'updatedAt' | 'protocol'>) => string
  updateSubmission: (id: string, data: Partial<Submission>) => Promise<void>
  getSubmission: (id: string) => Submission | undefined
  updateEmailTemplate: (template: string) => void
  syncSubmissions: (options?: {
    force?: boolean
    background?: boolean
    skipCache?: boolean
  }) => Promise<void>
  login: (email: string, passwordHash: string) => Promise<boolean>
  logout: () => void
  registerUser: (name: string, email: string, passwordHash: string) => void
  removeUser: (id: string) => void
  clearCache: () => void
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
  {
    id: 'sub-2',
    protocol: '2023-10-16-0002',
    clientName: 'Maria Silva MEI',
    status: 'pending',
    createdAt: '2023-10-16T14:20:00Z',
    updatedAt: '2023-10-16T14:20:00Z',
    partners: [],
    company: {
      type: 'mei',
      tradeName: 'Maria Doces',
      email: 'maria@doces.com.br',
      phone: '(11) 97777-6666',
      zipCode: '02000-000',
      suggestedName1: 'Maria Silva Doces MEI',
      suggestedName2: '',
      suggestedName3: '',
      capitalSocial: 5000,
    },
    activity: {
      mainCnae: '1099-6/99',
      secondaryCnaes: '',
      businessAddress: 'Rua das Flores, 45',
      description: 'Fabricação de doces e salgados',
    },
    documents: [],
    signature: '',
  },
  {
    id: 'sub-3',
    protocol: '2023-10-17-0003',
    clientName: 'Pedro Santos',
    status: 'under_review',
    createdAt: '2023-10-17T09:15:00Z',
    updatedAt: '2023-10-18T10:30:00Z',
    partners: [
      {
        id: 'p2',
        name: 'Pedro Santos',
        cpf: '222.333.444-55',
        rg: '22.333.444-5',
        address: 'Av Brasil, 1500',
        sharePercentage: 100,
      },
    ],
    company: {
      type: 'ltda',
      tradeName: 'Santos Logística',
      email: 'pedro@santoslog.com.br',
      phone: '(21) 98888-5555',
      zipCode: '20000-000',
      suggestedName1: 'Santos Logística e Transportes Ltda',
      suggestedName2: 'Pedro Santos Logística Ltda',
      suggestedName3: '',
      capitalSocial: 100000,
    },
    activity: {
      mainCnae: '4930-2/02',
      secondaryCnaes: '',
      businessAddress: 'Pátio Industrial, Galpão 3',
      description: 'Transporte rodoviário de carga',
    },
    documents: [],
    signature: '',
  },
  {
    id: 'sub-4',
    protocol: '2023-10-18-0004',
    clientName: 'Ana Oliveira',
    status: 'draft',
    createdAt: '2023-10-18T16:45:00Z',
    updatedAt: '2023-10-18T16:45:00Z',
    partners: [],
    company: {
      type: 'ltda',
      tradeName: 'Ana Clínica',
      email: 'ana@clinica.com.br',
      phone: '(31) 99999-1111',
      zipCode: '30000-000',
      suggestedName1: 'Ana Oliveira Serviços Médicos Ltda',
      suggestedName2: '',
      suggestedName3: '',
      capitalSocial: 20000,
    },
    activity: {
      mainCnae: '8630-5/03',
      secondaryCnaes: '',
      businessAddress: 'Rua da Saúde, 100',
      description: 'Atividade médica ambulatorial',
    },
    documents: [],
    signature: '',
  },
  {
    id: 'sub-5',
    protocol: '2023-10-19-0005',
    clientName: 'Lucas Costa TI',
    status: 'pending',
    createdAt: '2023-10-19T11:20:00Z',
    updatedAt: '2023-10-19T11:20:00Z',
    partners: [],
    company: {
      type: 'mei',
      tradeName: 'Lucas TI',
      email: 'lucas@ti.com.br',
      phone: '(41) 97777-2222',
      zipCode: '40000-000',
      suggestedName1: 'Lucas Costa MEI',
      suggestedName2: '',
      suggestedName3: '',
      capitalSocial: 1000,
    },
    activity: {
      mainCnae: '6209-1/00',
      secondaryCnaes: '',
      businessAddress: 'Trabalho Remoto',
      description: 'Suporte técnico e manutenção',
    },
    documents: [],
    signature: '',
  },
]

const getRemoteDB = (): Submission[] => {
  try {
    const saved = localStorage.getItem(MOCK_REMOTE_DB_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Could not parse remote data', e)
  }
  localStorage.setItem(MOCK_REMOTE_DB_KEY, JSON.stringify(mockData))
  return mockData
}

const saveRemoteDB = (data: Submission[]) => {
  localStorage.setItem(MOCK_REMOTE_DB_KEY, JSON.stringify(data))
  try {
    const channel = new BroadcastChannel('empresaflow_notifications')
    channel.postMessage({ type: 'DB_UPDATED' })
    channel.close()
  } catch (e) {
    /* ignore */
  }
}

const fetchFromServerMock = async (): Promise<Submission[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getRemoteDB()), 50)
  })
}

const getUsersDB = (): AdminUser[] => {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Could not parse users local storage', e)
  }
  return [] // No default users to allow clean registration flow
}

const getCurrentUserDB = (): AdminUser | null => {
  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Could not parse current user local storage', e)
  }
  return null
}

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY)
      if (cached) return JSON.parse(cached)
    } catch (e) {
      /* ignore */
    }
    return getRemoteDB()
  })

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const syncInProgress = useRef(false)

  const [users, setUsers] = useState<AdminUser[]>(getUsersDB)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(getCurrentUserDB)

  const [emailTemplate, setEmailTemplate] = useState(() => {
    return (
      localStorage.getItem(EMAIL_TEMPLATE_KEY) ||
      'Olá {nome},\n\nRecebemos sua solicitação de abertura de empresa com sucesso!\n\nSeu número de protocolo é: {protocolo}'
    )
  })

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_CACHE_KEY)
      sessionStorage.removeItem(LOCAL_CACHE_KEY)
    } catch (e) {
      /* ignore */
    }
  }, [])

  const syncSubmissions = useCallback(
    async (options?: { force?: boolean; background?: boolean; skipCache?: boolean }) => {
      if (!navigator.onLine) {
        if (!options?.background) {
          setSyncStatus('error')
          setSyncError('Você está offline.')
        }
        return
      }

      if (syncInProgress.current && !options?.force) return
      syncInProgress.current = true

      if (!options?.background) {
        setSyncStatus('syncing')
        setSyncError(null)
      }

      try {
        if (options?.skipCache) {
          clearCache()
        }

        if (!options?.background && options?.force) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }

        const serverData = await fetchFromServerMock()

        setSubmissions((prev) => {
          const isDifferent = JSON.stringify(prev) !== JSON.stringify(serverData)
          if (isDifferent || options?.skipCache) {
            localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(serverData))
            return [...serverData]
          }
          return prev
        })

        setLastSyncAt(new Date())
        setSyncStatus((prev) =>
          options?.background && prev !== 'syncing' && prev !== 'error' ? prev : 'idle',
        )
        setSyncError(null)
      } catch (error) {
        console.error('Failed to sync:', error)
        if (!options?.background) {
          setSyncStatus('error')
          setSyncError('Falha ao conectar com o servidor.')
        }
      } finally {
        syncInProgress.current = false
      }
    },
    [clearCache],
  )

  const updateEmailTemplate = useCallback((template: string) => {
    setEmailTemplate(template)
    localStorage.setItem(EMAIL_TEMPLATE_KEY, template)
  }, [])

  const addSubmission = useCallback(
    (data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt' | 'protocol'>) => {
      const newId = `sub-${Math.random().toString(36).substring(2, 9)}`
      const now = new Date()
      const isoString = now.toISOString()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')

      const remoteDB = getRemoteDB()
      const seq = String(remoteDB.length + 1).padStart(4, '0')
      const protocol = `${yyyy}-${mm}-${dd}-${seq}`

      const newSubmission: Submission = {
        ...data,
        id: newId,
        protocol,
        createdAt: isoString,
        updatedAt: isoString,
      }

      const updatedDB = [newSubmission, ...remoteDB]
      saveRemoteDB(updatedDB)

      try {
        const channel = new BroadcastChannel('empresaflow_notifications')
        channel.postMessage({ type: 'NEW_SUBMISSION', data: newSubmission })
        channel.close()
      } catch (e) {
        /* ignore */
      }

      syncSubmissions({ force: true, background: true, skipCache: true }).catch(() => {
        /* ignore */
      })
      return newId
    },
    [syncSubmissions],
  )

  const updateSubmission = useCallback(
    async (id: string, data: Partial<Submission>) => {
      const remoteDB = getRemoteDB()
      const updatedDB = remoteDB.map((s) =>
        s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s,
      )
      saveRemoteDB(updatedDB)

      try {
        const channel = new BroadcastChannel('empresaflow_notifications')
        channel.postMessage({ type: 'UPDATE_SUBMISSION', data: { id, ...data } })
        channel.close()
      } catch (e) {
        /* ignore */
      }

      await syncSubmissions({ force: true, background: true, skipCache: true })
    },
    [syncSubmissions],
  )

  const getSubmission = useCallback(
    (id: string) => submissions.find((s) => s.id === id),
    [submissions],
  )

  const login = useCallback(
    async (email: string, passwordHash: string) => {
      const user = users.find((u) => u.email === email && u.passwordHash === passwordHash)
      if (user) {
        setCurrentUser(user)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))

        // Session Data Cleanup during authentication flow
        clearCache()

        try {
          const channel = new BroadcastChannel('empresaflow_notifications')
          channel.postMessage({ type: 'AUTH_STATE_CHANGE' })
          channel.close()
        } catch (e) {
          /* ignore */
        }

        // Login Synchronization: Force fresh fetch, ignoring local state (background false to ensure it completes visually)
        await syncSubmissions({ force: true, background: false, skipCache: true })
        return true
      }
      return false
    },
    [users, syncSubmissions, clearCache],
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
    clearCache()
    setSubmissions([])

    try {
      const channel = new BroadcastChannel('empresaflow_notifications')
      channel.postMessage({ type: 'AUTH_STATE_CHANGE' })
      channel.close()
    } catch (e) {
      /* ignore */
    }
  }, [clearCache])

  const registerUser = useCallback(
    (name: string, email: string, passwordHash: string) => {
      const newUser: AdminUser = {
        id: `usr-${Math.random().toString(36).substring(2, 9)}`,
        name,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      }
      const updatedUsers = [...users, newUser]
      setUsers(updatedUsers)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))
      try {
        const channel = new BroadcastChannel('empresaflow_notifications')
        channel.postMessage({ type: 'USERS_STATE_CHANGE' })
        channel.close()
      } catch (e) {
        /* ignore */
      }
    },
    [users],
  )

  const removeUser = useCallback(
    (id: string) => {
      const updatedUsers = users.filter((u) => u.id !== id)
      setUsers(updatedUsers)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))
      try {
        const channel = new BroadcastChannel('empresaflow_notifications')
        channel.postMessage({ type: 'USERS_STATE_CHANGE' })
        channel.close()
      } catch (e) {
        /* ignore */
      }
    },
    [users],
  )

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CURRENT_USER_KEY) setCurrentUser(getCurrentUserDB())
      if (e.key === USERS_STORAGE_KEY) setUsers(getUsersDB())
      if (e.key === EMAIL_TEMPLATE_KEY)
        setEmailTemplate(localStorage.getItem(EMAIL_TEMPLATE_KEY) || '')
      if (e.key === MOCK_REMOTE_DB_KEY)
        syncSubmissions({ force: true, background: true, skipCache: true })
    }

    let channel: BroadcastChannel | null = null
    try {
      // Real-time Hub Integrity initialization
      channel = new BroadcastChannel('empresaflow_notifications')
      channel.onmessage = (event) => {
        if (
          event.data?.type === 'DB_UPDATED' ||
          event.data?.type === 'NEW_SUBMISSION' ||
          event.data?.type === 'UPDATE_SUBMISSION'
        ) {
          syncSubmissions({ force: true, background: true, skipCache: true })
        } else if (event.data?.type === 'AUTH_STATE_CHANGE') {
          setCurrentUser(getCurrentUserDB())
        } else if (event.data?.type === 'USERS_STATE_CHANGE') {
          setUsers(getUsersDB())
        }
      }
    } catch (e) {
      /* ignore */
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      if (channel) channel.close()
    }
  }, [syncSubmissions])

  useEffect(() => {
    if (!currentUser) return

    syncSubmissions({ force: true, background: true, skipCache: true })

    const intervalId = setInterval(() => {
      syncSubmissions({ background: true })
    }, 2000)

    const handleFocus = () => syncSubmissions({ force: true, background: true, skipCache: true })
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible')
        syncSubmissions({ force: true, background: true, skipCache: true })
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [syncSubmissions, currentUser])

  return (
    <AppContext.Provider
      value={{
        submissions,
        emailTemplate,
        syncStatus,
        syncError,
        lastSyncAt,
        users,
        currentUser,
        addSubmission,
        updateSubmission,
        getSubmission,
        updateEmailTemplate,
        syncSubmissions,
        login,
        logout,
        registerUser,
        removeUser,
        clearCache,
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
