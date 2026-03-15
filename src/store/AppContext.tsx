import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { downloadSubmissionPDF } from '@/lib/documentGenerator'
import { Submission, AdminUser, AccessLog, ActiveSession } from '@/types'

const EMAIL_TEMPLATE_KEY = 'empresaflow_email_template'
const ACCESS_LOGS_KEY = 'empresaflow_access_logs_v1'
const SESSIONS_STORAGE_KEY = 'empresaflow_sessions_v1'
const CURRENT_SESSION_KEY = 'empresaflow_current_session_id_v1'

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
  addSubmission: (
    sub: Omit<Submission, 'id' | 'createdAt' | 'updatedAt' | 'protocol'>,
  ) => Promise<string>
  updateSubmission: (id: string, data: Partial<Submission>) => Promise<void>
  getSubmission: (id: string) => Submission | undefined
  downloadGeneratedPDF: (sub: Submission) => Promise<void>
  updateEmailTemplate: (template: string) => void
  syncSubmissions: (options?: {
    force?: boolean
    background?: boolean
    skipCache?: boolean
  }) => Promise<void>
  logout: () => void
  registerUser: (
    name: string,
    email: string,
    passwordHash: string,
    role?: 'admin' | 'colaborador',
  ) => Promise<void>
  removeUser: (id: string) => Promise<void>
  clearCache: () => void
  changePassword: (currentPass: string, newPass: string) => Promise<boolean>
  toggle2FA: (enabled: boolean) => void
  disconnectSession: (sessionId: string) => void
}

const getAccessLogsDB = (): AccessLog[] => {
  try {
    const saved = localStorage.getItem(ACCESS_LOGS_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return []
}

const getSessionsDB = (): ActiveSession[] => {
  try {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return []
}

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth()

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const syncInProgress = useRef(false)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
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

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setCurrentUser({
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role as any,
              passwordHash: '',
              createdAt: data.created_at,
            })
          }
        })
    } else {
      setCurrentUser(null)
      setSubmissions([])
    }
  }, [user])

  const clearCache = useCallback(() => {
    try {
      sessionStorage.clear()
    } catch (e) {}
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
        const { data: formSubmissions, error: formError } = await supabase
          .from('form_submissions')
          .select('*')
          .order('created_at', { ascending: false })
        if (!formError && formSubmissions) {
          setSubmissions(
            formSubmissions.map((r) => ({
              id: r.id,
              ...(typeof r.data === 'string' ? JSON.parse(r.data) : r.data),
            })) as Submission[],
          )
        }

        if (user) {
          const { data: profilesData } = await supabase.from('profiles').select('*')
          if (profilesData) {
            setUsers(
              profilesData.map((r) => ({
                id: r.id,
                name: r.name,
                email: r.email,
                role: r.role as any,
                passwordHash: '',
                createdAt: r.created_at,
              })),
            )
          }
        }

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
    [user],
  )

  const updateEmailTemplate = useCallback((template: string) => {
    setEmailTemplate(template)
    localStorage.setItem(EMAIL_TEMPLATE_KEY, template)
  }, [])

  const addSubmission = useCallback(
    async (data: Omit<Submission, 'id' | 'createdAt' | 'updatedAt' | 'protocol'>) => {
      const now = new Date()
      const protocol = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

      const payload = {
        ...data,
        protocol,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }

      const { data: inserted, error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: '00000000-0000-0000-0000-000000000001',
          data: payload,
        })
        .select()
        .single()

      if (error || !inserted) throw new Error('Falha ao salvar submissão')

      const newSubmission: Submission = { id: inserted.id, ...payload }
      setSubmissions((prev) => [newSubmission, ...prev])

      supabase.functions
        .invoke('generate-pdf', { body: { submissionId: inserted.id } })
        .catch(() => {})

      return inserted.id
    },
    [],
  )

  const updateSubmission = useCallback(
    async (id: string, data: Partial<Submission>) => {
      const existing = submissions.find((s) => s.id === id)
      if (!existing) return

      const updatedPayload = { ...existing, ...data, updatedAt: new Date().toISOString() }
      const { id: _, ...dataToSave } = updatedPayload

      const { error } = await supabase
        .from('form_submissions')
        .update({
          data: dataToSave,
        })
        .eq('id', id)

      if (!error) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? (updatedPayload as Submission) : s)),
        )
      }
    },
    [submissions],
  )

  const getSubmission = useCallback(
    (id: string) => submissions.find((s) => s.id === id),
    [submissions],
  )

  const downloadGeneratedPDF = useCallback(async (sub: Submission) => {
    try {
      const { data } = await supabase
        .from('generated_documents')
        .select('file_path')
        .eq('submission_id', sub.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) {
        const { data: fileData, error } = await supabase.storage
          .from('documents')
          .download(data.file_path)
        if (fileData && !error) {
          const url = URL.createObjectURL(fileData)
          const link = document.createElement('a')
          link.href = url
          link.download = `Protocolo_${sub.protocol}.pdf`
          link.click()
          URL.revokeObjectURL(url)
          return
        }
      }
      downloadSubmissionPDF(sub)
    } catch (e) {
      downloadSubmissionPDF(sub)
    }
  }, [])

  const logout = useCallback(() => {
    signOut()
    setCurrentSessionId(null)
    localStorage.removeItem(CURRENT_SESSION_KEY)
    clearCache()
    setSubmissions([])
  }, [signOut, clearCache])

  const changePassword = useCallback(async (currentPass: string, newPass: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session || !session.user.email) return false

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPass,
    })
    if (signInError) return false

    const { error } = await supabase.auth.updateUser({ password: newPass })
    return !error
  }, [])

  const registerUser = useCallback(
    async (
      name: string,
      email: string,
      passwordHash: string,
      role: 'admin' | 'colaborador' = 'admin',
    ) => {
      const secondarySupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        { auth: { persistSession: false } },
      )
      const { data } = await secondarySupabase.auth.signUp({
        email,
        password: passwordHash,
        options: { data: { name } },
      })
      if (data.user) {
        await supabase.from('profiles').update({ role }).eq('id', data.user.id)
        syncSubmissions({ background: true })
      }
    },
    [syncSubmissions],
  )

  const removeUser = useCallback(async (id: string) => {
    await supabase.from('profiles').delete().eq('id', id)
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const toggle2FA = useCallback(
    (enabled: boolean) => {
      if (!currentUser) return
      setCurrentUser({ ...currentUser, twoFactorEnabled: enabled })
    },
    [currentUser],
  )

  const disconnectSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId)
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  useEffect(() => {
    syncSubmissions({ force: true, background: true, skipCache: true }).catch(() => {})
  }, [syncSubmissions])

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
        downloadGeneratedPDF,
        updateEmailTemplate,
        syncSubmissions,
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
