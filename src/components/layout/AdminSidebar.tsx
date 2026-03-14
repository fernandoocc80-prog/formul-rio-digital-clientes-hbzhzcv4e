import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, ShieldCheck, History, PlusCircle, Settings } from 'lucide-react'
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
import { useAppStore } from '@/store/AppContext'

export function AdminSidebar() {
  const location = useLocation()
  const { currentUser } = useAppStore()
  const role = currentUser?.role || 'admin'

  const adminItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { title: 'Todas Submissões', icon: FileText, path: '/admin' },
    { title: 'Usuários', icon: ShieldCheck, path: '/admin/users' },
    { title: 'Histórico de Acesso', icon: History, path: '/admin/access-history' },
    { title: 'Configurações', icon: Settings, path: '/settings' },
  ]

  const colaboradorItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { title: 'Todas Submissões', icon: FileText, path: '/admin' },
    { title: 'Ações Rápidas', icon: PlusCircle, path: '/colaborador' },
    { title: 'Configurações', icon: Settings, path: '/settings' },
  ]

  const menuItems = role === 'colaborador' ? colaboradorItems : adminItems

  const getIsActive = (path: string) => {
    const currentPathWithSearch = location.pathname + location.search
    if (path === '/colaborador' && currentPathWithSearch.includes('tab=')) return false
    if (path.includes('?')) return currentPathWithSearch === path
    return location.pathname === path
  }

  return (
    <Sidebar className="no-print">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={getIsActive(item.path)}>
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
