import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, ShieldCheck, History, PlusCircle } from 'lucide-react'
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
    { title: 'Todos Processos', icon: FileText, path: '/admin' },
    { title: 'Usuários', icon: ShieldCheck, path: '/admin/users' },
    { title: 'Histórico de Acesso', icon: History, path: '/admin/access-history' },
  ]

  const colaboradorItems = [
    { title: 'Início', icon: LayoutDashboard, path: '/colaborador' },
    { title: 'Novo Formulário', icon: PlusCircle, path: '/form/new' },
  ]

  const menuItems = role === 'colaborador' ? colaboradorItems : adminItems

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
