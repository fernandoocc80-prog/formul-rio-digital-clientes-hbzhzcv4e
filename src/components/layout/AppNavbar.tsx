import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Building2, UserCircle, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store/AppContext'
import { cn } from '@/lib/utils'

export function AppNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAppStore()

  const role = currentUser?.role || 'admin'

  const navLinks = currentUser
    ? role === 'admin'
      ? [
          { name: 'Dashboard', path: '/' },
          { name: 'Gestão', path: '/admin' },
        ]
      : [{ name: 'Início', path: '/colaborador' }]
    : []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm no-print">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-xl text-primary">EmpresaFlow</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === link.path ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currentUser ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin/settings"
                        className="w-full cursor-pointer flex items-center"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/login" className="w-full cursor-pointer">
                    Fazer Login
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
