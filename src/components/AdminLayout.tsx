import { useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from './layout/AdminSidebar'
import { useToast } from '@/hooks/use-toast'

export default function AdminLayout() {
  const { toast } = useToast()

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

  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <AdminSidebar />
        <div className="flex-1 w-full overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-white no-print flex items-center gap-4">
            <SidebarTrigger />
            <h2 className="font-semibold text-sm text-muted-foreground">Painel de Controle</h2>
          </div>
          <main className="flex-1 p-6 overflow-auto bg-background animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
