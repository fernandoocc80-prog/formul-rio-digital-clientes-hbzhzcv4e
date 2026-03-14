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
  syncSubmissions: (options?: { force?: boolean; background?: boolean }) => Promise<void>
  login: (email: string, passwordHash: string) => boolean
  logout: () => void
  registerUser: (name: string, email: string, passwordHash: string) => void
  removeUser: (id: string) => void
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

const mockUsers: AdminUser[] = [
  {
    id: 'usr-admin-01',
    name: 'Administrador Principal',
    email: 'admin@empresaflow.com.br',
    passwordHash: 'admin123',
    createdAt: new Date().toISOString(),
  },
]

const AppContext = createContext<AppState | undefined>(undefined)
const LOCAL_STORAGE_KEY = 'empresaflow_submissions_v1'
const EMAIL_TEMPLATE_KEY = 'empresaflow_email_template'
const USERS_STORAGE_KEY = 'empresaflow_users_v1'
const CURRENT_USER_KEY = 'empresaflow_current_user_v1'

const getDB = (): Submission[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Could not parse local storage data', e)
  }
  return mockData
}

const getUsersDB = (): AdminUser[] => {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.warn('Could not parse users local storage', e)
  }
  return mockUsers
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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>(getDB)
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

  // Feature: Data listener detecting changes in the DB and updating state immediately without flickering
  const syncSubmissions = useCallback(
    async (options?: { force?: boolean; background?: boolean }) => {
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
        if (!options?.background && options?.force) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }

        // Read from the simulated external source (acts as DB truth)
        const serverData = getDB()

        setSubmissions((prev) => {
          const isCountDifferent = prev.length !== serverData.length
          const isDataDifferent = prev.some(
            (p, i) =>
              p.id !== serverData[i]?.id ||
              p.updatedAt !== serverData[i]?.updatedAt ||
              p.status !== serverData[i]?.status,
          )

          // Feature: Source of truth mapping
          // We only overwrite the local array reference if data genuinely changed to avoid UI flickering
          if (isCountDifferent || isDataDifferent) {
            return [...serverData]
          }
          return prev
        })

        setLastSyncAt(new Date())
        setSyncStatus((prev) => {
          if (options?.background && prev !== 'syncing' && prev !== 'error') {
            return prev
          }
          return 'idle'
        })
        setSyncError(null)

        if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverData))
        }
      } catch (error) {
        console.error('Failed to sync:', error)
        if (!options?.background) {
          setSyncStatus('error')
          setSyncError('Falha ao conectar.')
        }
      } finally {
        syncInProgress.current = false
      }
    },
    [],
  )

  useEffect(() => {
    localStorage.setItem(EMAIL_TEMPLATE_KEY, emailTemplate)
  }, [emailTemplate])

  // Feature: Auth State Parity & Global Cross-Device Consistency events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CURRENT_USER_KEY) setCurrentUser(getCurrentUserDB())
      if (e.key === USERS_STORAGE_KEY) setUsers(getUsersDB())
      if (e.key === EMAIL_TEMPLATE_KEY)
        setEmailTemplate(localStorage.getItem(EMAIL_TEMPLATE_KEY) || '')
      if (e.key === LOCAL_STORAGE_KEY) syncSubmissions({ force: true, background: true })
    }

    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('empresaflow_notifications')
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_SUBMISSION' || event.data?.type === 'UPDATE_SUBMISSION') {
          syncSubmissions({ force: true, background: true })
        } else if (event.data?.type === 'AUTH_STATE_CHANGE') {
          setCurrentUser(getCurrentUserDB())
        } else if (event.data?.type === 'USERS_STATE_CHANGE') {
          setUsers(getUsersDB())
        }
      }
    } catch (e) {
      // Ignored if BroadcastChannel is not supported by environment
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      if (channel) channel.close()
    }
  }, [syncSubmissions])

  // Feature: Dashboard Synchronization Polling
  useEffect(() => {
    if (!currentUser) return

    // Ensure state is fresh when user mounts context (e.g. login)
    syncSubmissions({ force: true, background: true })

    // Database polling equivalent: Check for updates across sessions every 2s in background
    const intervalId = setInterval(() => {
      syncSubmissions({ background: true })
    }, 2000)

    const handleFocus = () => syncSubmissions({ background: true })
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncSubmissions({ background: true })
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [syncSubmissions, currentUser])

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
      // Ignored if BroadcastChannel is not supported by environment
    }

    if (currentUser) {
      syncSubmissions({ force: true, background: true }).catch(() => {})
    }
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
      // Ignored if BroadcastChannel is not supported by environment
    }

    if (currentUser) {
      await syncSubmissions({ force: true, background: true })
    }
  }

  const getSubmission = (id: string) => submissions.find((s) => s.id === id)

  const login = useCallback(
    (email: string, passwordHash: string) => {
      const user = users.find((u) => u.email === email && u.passwordHash === passwordHash)
      if (user) {
        setCurrentUser(user)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
        try {
          const channel = new BroadcastChannel('empresaflow_notifications')
          channel.postMessage({ type: 'AUTH_STATE_CHANGE' })
          channel.close()
        } catch (e) {
          // Ignored if BroadcastChannel is not supported by environment
        }
        return true
      }
      return false
    },
    [users],
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
    try {
      const channel = new BroadcastChannel('empresaflow_notifications')
      channel.postMessage({ type: 'AUTH_STATE_CHANGE' })
      channel.close()
    } catch (e) {
      // Ignored if BroadcastChannel is not supported by environment
    }
  }, [])

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
        // Ignored if BroadcastChannel is not supported by environment
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
        // Ignored if BroadcastChannel is not supported by environment
      }
    },
    [users],
  )

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
