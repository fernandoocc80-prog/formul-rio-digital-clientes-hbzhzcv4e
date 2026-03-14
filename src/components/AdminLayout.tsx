import { useEffect, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from './layout/AdminSidebar'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/AppContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function AdminLayout() {
  const { toast } = useToast()
  const { currentUser, logout, syncSubmissions, clearCache } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Feature: Session Consistency - Navigating between different routes triggers data verification and cache purging
  useEffect(() => {
    if (currentUser) {
      clearCache()
      // Enforce real-time sync with backend to maintain strictly verified view state
      syncSubmissions({ force: true, background: true, skipCache: true }).catch(() => {
        /* ignore */
      })
    }
  }, [location.pathname, currentUser, syncSubmissions, clearCache])

  const playAlertSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      // Create a short, pleasant double beep for notification
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch (err) {
      console.error('Audio playback failed', err)
    }
  }, [])

  // Listen for real-time notifications from client form submissions
  useEffect(() => {
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('empresaflow_notifications')
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_SUBMISSION') {
          playAlertSound()
          toast({
            title: '🔔 Nova submissão recebida',
            description: `Formulário de ${event.data.data.clientName} recebido com sucesso. (Protocolo: ${event.data.data.protocol})`,
            duration: 8000,
          })
        }
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported', e)
    }

    return () => {
      if (channel) channel.close()
    }
  }, [toast, playAlertSound])

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast({
      title: 'Sessão encerrada',
      description: 'Você saiu com sucesso.',
    })
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1 w-full overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-white no-print flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="font-semibold text-sm text-muted-foreground hidden sm:block">
                Painel de Controle
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium hidden sm:block pr-3 border-r text-slate-700">
                {currentUser?.name || 'Administrador'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
          <main className="flex-1 p-6 overflow-auto bg-slate-50/50 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
