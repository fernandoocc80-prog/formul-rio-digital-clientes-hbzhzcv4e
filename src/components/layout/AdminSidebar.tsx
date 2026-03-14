import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Settings, ShieldCheck, History } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function AdminSidebar() {
  const location = useLocation()

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { title: 'Todos Processos', icon: FileText, path: '/admin' },
    { title: 'Administradores', icon: ShieldCheck, path: '/admin/users' },
    { title: 'Histórico de Acesso', icon: History, path: '/admin/access-history' },
    { title: 'Configurações', icon: Settings, path: '/admin/settings' },
  ]

  return (
    <Sidebar className="no-print">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
