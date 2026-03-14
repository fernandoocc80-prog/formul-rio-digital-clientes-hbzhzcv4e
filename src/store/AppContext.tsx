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

// Version bumped to v3 to enforce Database Hard Reset across all devices
const MOCK_REMOTE_DB_KEY = 'empresaflow_remote_db_v3'
const LOCAL_CACHE_KEY = 'empresaflow_submissions_cache_v3'
const EMAIL_TEMPLATE_KEY = 'empresaflow_email_template'
const USERS_STORAGE_KEY = 'empresaflow_users_v1'
const CURRENT_USER_KEY = 'empresaflow_current_user_v1'

// Explicit Cache Invalidation: clear old versions and local/session storage during initialization
// This ensures the "Source of Truth" purges all old disjointed records on fresh loads
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('empresaflow_remote_db_v1')
    localStorage.removeItem('empresaflow_submissions_cache_v1')
    localStorage.removeItem('empresaflow_remote_db_v2')
    localStorage.removeItem('empresaflow_submissions_cache_v2')
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

// Sample Data Seeding: A single baseline Model submission
const mockData: Submission[] = [
  {
    id: 'sub-model-1',
    protocol: '2023-11-01-0001',
    clientName: 'Cliente Modelo',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    partners: [
      {
        id: 'p-model-1',
        name: 'Sócio Modelo',
        cpf: '111.222.333-44',
        rg: '11.222.333-4',
        address: 'Rua Exemplo, 123',
        sharePercentage: 100,
      },
    ],
    company: {
      type: 'ltda',
      tradeName: 'Empresa Modelo',
      email: 'contato@empresamodelo.com.br',
      phone: '(11) 98888-7777',
      zipCode: '01000-000',
      suggestedName1: 'Empresa Modelo Ltda',
      suggestedName2: '',
      suggestedName3: '',
      capitalSocial: 100000,
    },
    activity: {
      mainCnae: '6201-5/01',
      secondaryCnaes: '',
      businessAddress: 'Centro Comercial Modelo',
      description: 'Desenvolvimento de software e serviços de TI.',
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

        // Login Synchronization: Force fresh fetch, ignoring local state
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
