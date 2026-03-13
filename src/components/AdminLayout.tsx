import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from './layout/AdminSidebar'

export default function AdminLayout() {
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
