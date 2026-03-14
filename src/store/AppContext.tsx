import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react'
import { Submission, AdminUser, AccessLog, ActiveSession } from '@/types'

const MOCK_REMOTE_DB_KEY = 'empresaflow_remote_db_v5'
const EMAIL_TEMPLATE_KEY = 'empresaflow_email_template'
const USERS_STORAGE_KEY = 'empresaflow_users_v1'
const CURRENT_USER_KEY = 'empresaflow_current_user_v1'
const ACCESS_LOGS_KEY = 'empresaflow_access_logs_v1'
const SESSIONS_STORAGE_KEY = 'empresaflow_sessions_v1'
const CURRENT_SESSION_KEY = 'empresaflow_current_session_id_v1'

if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'empresaflow_remote_db_v1',
      'empresaflow_remote_db_v2',
      'empresaflow_remote_db_v3',
      'empresaflow_remote_db_v4',
      'empresaflow_submissions_cache_v1',
      'empresaflow_submissions_cache_v2',
      'empresaflow_submissions_cache_v3',
      'empresaflow_submissions_cache_v4',
      'empresaflow_submissions_cache_v5',
    ]
    legacyKeys.forEach((k) => localStorage.removeItem(k))
    sessionStorage.clear()
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
  accessLogs: AccessLog[]
  sessions: ActiveSession[]
  currentSessionId: string | null
  addSubmission: (sub: Omit<Submission, 'id' | 'createdAt' | 'updatedAt' | 'protocol'>) => string
  updateSubmission: (id: string, data: Partial<Submission>) => Promise<void>
  getSubmission: (id: string) => Submission | undefined
  updateEmailTemplate: (template: string) => void
  syncSubmissions: (options?: {
    force?: boolean
    background?: boolean
    skipCache?: boolean
  }) => Promise<void>
  login: (
    email: string,
    passwordHash: string,
  ) => Promise<{ success: boolean; requires2FA?: boolean; user?: AdminUser | null }>
  verify2FA: (email: string, code: string) => Promise<{ success: boolean; user?: AdminUser | null }>
  logout: () => void
  registerUser: (
    name: string,
    email: string,
    passwordHash: string,
    role?: 'admin' | 'colaborador',
  ) => void
  removeUser: (id: string) => void
  clearCache: () => void
  changePassword: (currentPass: string, newPass: string) => boolean
  toggle2FA: (enabled: boolean) => void
  disconnectSession: (sessionId: string) => void
}

const mockData: Submission[] = []

const getRemoteDB = (): Submission[] => {
  try {
    const saved = localStorage.getItem(MOCK_REMOTE_DB_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    /* ignore */
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
  return new Promise((resolve) => setTimeout(() => resolve(getRemoteDB()), 50))
}

const getUsersDB = (): AdminUser[] => {
  let users: AdminUser[] = []
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        users = parsed.map((u: any) => ({ ...u, role: u.role || 'admin' }))
      }
    }
  } catch (e) {
    /* ignore */
  }

  let modified = false
  const SEED_USERS: AdminUser[] = [
    {
      id: 'usr-admin-seed',
      name: 'Administrador EmpresaFlow',
      email: 'admin@empresaflow.com.br',
      passwordHash: '123456',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-fernando',
      name: 'Fernando Castro',
      email: 'fernando@organizacaocastro.com.br',
      passwordHash: '123456',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-carla',
      name: 'Carla Castro',
      email: 'carla@organizacaocastro.com.br',
      passwordHash: '123456',
      role: 'colaborador',
      createdAt: new Date().toISOString(),
    },
  ]

  SEED_USERS.forEach((seedUser) => {
    if (!users.some((u) => u.email.toLowerCase() === seedUser.email.toLowerCase())) {
      users.push(seedUser)
      modified = true
    }
  })

  if (modified) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  }

  return users
}

const getCurrentUserDB = (): AdminUser | null => {
  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...parsed, role: parsed.role || 'admin' }
    }
  } catch (e) {
    /* ignore */
  }
  return null
}

const getAccessLogsDB = (): AccessLog[] => {
  try {
    const saved = localStorage.getItem(ACCESS_LOGS_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    /* ignore */
  }
  return []
}

const getSessionsDB = (): ActiveSession[] => {
  try {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    /* ignore */
  }
  return []
}

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const syncInProgress = useRef(false)

  const [users, setUsers] = useState<AdminUser[]>(getUsersDB)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(getCurrentUserDB)
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(getAccessLogsDB)
  const [sessions, setSessions] = useState<ActiveSession[]>(getSessionsDB)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() =>
    localStorage.getItem(CURRENT_SESSION_KEY),
  )

  const [emailTemplate, setEmailTemplate] = useState(() => {
    return (
      localStorage.getItem(EMAIL_TEMPLATE_KEY) ||
      'Olá {nome},\n\nRecebemos sua solicitação de abertura de empresa com sucesso!\n\nSeu número de protocolo é: {protocolo}'
    )
  })

  const clearCache = useCallback(() => {
    try {
      sessionStorage.clear()
      const keys = Object.keys(localStorage)
      for (const k of keys) {
        if (k.startsWith('empresaflow_submissions_cache')) {
          localStorage.removeItem(k)
        }
      }
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
        if (options?.skipCache) clearCache()
        const serverData = await fetchFromServerMock()
        setSubmissions([...serverData])
        setLastSyncAt(new Date())

        setSyncStatus((prev) =>
          options?.background && prev !== 'syncing' && prev !== 'error' ? prev : 'idle',
        )
        setSyncError(null)
      } catch (error) {
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
        protocol,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }

      const updatedDB = [newSubmission, ...remoteDB]
      saveRemoteDB(updatedDB)
      setSubmissions(updatedDB)

      try {
        const channel = new BroadcastChannel('empresaflow_notifications')
        channel.postMessage({ type: 'NEW_SUBMISSION', data: newSubmission })
        channel.close()
      } catch (e) {
        /* ignore */
      }

      syncSubmissions({ force: true, background: true, skipCache: true }).catch(() => {})
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
      setSubmissions(updatedDB)

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

  const completeLogin = useCallback(
    async (user: AdminUser) => {
      const ua = navigator.userAgent
      let browser = 'Outro'
      if (ua.includes('Edg')) browser = 'Edge'
      else if (ua.includes('Chrome')) browser = 'Chrome'
      else if (ua.includes('Firefox')) browser = 'Firefox'
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'

      const device = /Mobile|Android|iP(hone|od)/.test(ua) ? 'Mobile' : 'Desktop'

      const newLog: AccessLog = {
        id: `log-${Math.random().toString(36).substring(2, 9)}`,
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        device,
        browser,
        status: 'success',
      }

      setAccessLogs((prev) => {
        const logs = [newLog, ...prev].slice(0, 500)
        localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(logs))
        return logs
      })

      const newSession: ActiveSession = {
        id: `sess-${Math.random().toString(36).substring(2, 9)}`,
        userId: user.id,
        device,
        browser,
        lastActive: new Date().toISOString(),
      }

      setSessions((prev) => {
        const updated = [newSession, ...prev].slice(0, 20)
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated))
        return updated
      })

      setCurrentSessionId(newSession.id)
      localStorage.setItem(CURRENT_SESSION_KEY, newSession.id)

      setCurrentUser(user)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
      clearCache()

      try {
        const channel = new BroadcastChannel('empresaflow_notifications')
        channel.postMessage({ type: 'AUTH_STATE_CHANGE' })
        channel.close()
      } catch (e) {
        /* ignore */
      }

      await syncSubmissions({ force: true, background: false, skipCache: true })
      return { success: true, user }
    },
    [syncSubmissions, clearCache],
  )

  const login = useCallback(
    async (email: string, passwordHash: string) => {
      const normalizedEmail = email.trim().toLowerCase()
      const user = users.find(
        (u) => u.email.trim().toLowerCase() === normalizedEmail && u.passwordHash === passwordHash,
      )

      if (!user) {
        const newLog: AccessLog = {
          id: `log-${Math.random().toString(36).substring(2, 9)}`,
          userId: 'unknown',
          userEmail: normalizedEmail,
          timestamp: new Date().toISOString(),
          device: /Mobile|Android|iP(hone|od)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Outro',
          status: 'failed',
        }
        setAccessLogs((prev) => {
          const logs = [newLog, ...prev].slice(0, 500)
          localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(logs))
          return logs
        })
        return { success: false }
      }

      if (user.twoFactorEnabled) {
        return { success: true, requires2FA: true, user }
      }

      return await completeLogin(user)
    },
    [users, completeLogin],
  )

  const verify2FA = useCallback(
    async (email: string, code: string) => {
      const normalizedEmail = email.trim().toLowerCase()
      const user = users.find((u) => u.email.trim().toLowerCase() === normalizedEmail)
      if (user && code.length === 6) {
        return await completeLogin(user)
      }
      return { success: false }
    },
    [users, completeLogin],
  )

  const logout = useCallback(() => {
    if (currentSessionId) {
      const sessionsDb = getSessionsDB()
      const updated = sessionsDb.filter((s) => s.id !== currentSessionId)
      setSessions(updated)
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated))
    }

    setCurrentSessionId(null)
    localStorage.removeItem(CURRENT_SESSION_KEY)

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
  }, [currentSessionId, clearCache])

  const changePassword = useCallback(
    (currentPass: string, newPass: string) => {
      if (!currentUser) return false

      const user = users.find((u) => u.id === currentUser.id)
      if (!user || user.passwordHash !== currentPass) return false

      const updatedUsers = users.map((u) =>
        u.id === currentUser.id ? { ...u, passwordHash: newPass } : u,
      )
      setUsers(updatedUsers)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))

      const updatedUser = { ...currentUser, passwordHash: newPass }
      setCurrentUser(updatedUser)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser))

      return true
    },
    [currentUser, users],
  )

  const toggle2FA = useCallback(
    (enabled: boolean) => {
      if (!currentUser) return
      const updatedUsers = users.map((u) =>
        u.id === currentUser.id ? { ...u, twoFactorEnabled: enabled } : u,
      )
      setUsers(updatedUsers)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))

      const updatedUser = { ...currentUser, twoFactorEnabled: enabled }
      setCurrentUser(updatedUser)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser))
    },
    [currentUser, users],
  )

  const disconnectSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId)
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const registerUser = useCallback(
    (
      name: string,
      email: string,
      passwordHash: string,
      role: 'admin' | 'colaborador' = 'admin',
    ) => {
      const newUser: AdminUser = {
        id: `usr-${Math.random().toString(36).substring(2, 9)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role,
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
      if (e.key === ACCESS_LOGS_KEY) setAccessLogs(getAccessLogsDB())
      if (e.key === SESSIONS_STORAGE_KEY) setSessions(getSessionsDB())
      if (e.key === EMAIL_TEMPLATE_KEY)
        setEmailTemplate(localStorage.getItem(EMAIL_TEMPLATE_KEY) || '')
      if (e.key === MOCK_REMOTE_DB_KEY)
        syncSubmissions({ force: true, background: true, skipCache: true })
    }

    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('empresaflow_notifications')
      channel.onmessage = (event) => {
        if (['DB_UPDATED', 'NEW_SUBMISSION', 'UPDATE_SUBMISSION'].includes(event.data?.type)) {
          syncSubmissions({ force: true, background: true, skipCache: true })
        } else if (event.data?.type === 'AUTH_STATE_CHANGE') {
          setCurrentUser(getCurrentUserDB())
          setSessions(getSessionsDB())
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
    if (currentUser && currentSessionId) {
      const sessionExists = sessions.some((s) => s.id === currentSessionId)
      if (!sessionExists) {
        logout()
      }
    }
  }, [sessions, currentSessionId, currentUser, logout])

  useEffect(() => {
    syncSubmissions({ force: true, background: true, skipCache: true }).catch(() => {})
  }, [syncSubmissions])

  useEffect(() => {
    if (!currentUser) return
    const intervalId = setInterval(() => syncSubmissions({ background: true }), 2000)
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
        accessLogs,
        sessions,
        currentSessionId,
        addSubmission,
        updateSubmission,
        getSubmission,
        updateEmailTemplate,
        syncSubmissions,
        login,
        verify2FA,
        logout,
        registerUser,
        removeUser,
        clearCache,
        changePassword,
        toggle2FA,
        disconnectSession,
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
