import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useAppStore } from '@/store/AppContext'

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'colaborador')[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const { currentUser } = useAppStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Validando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Save attempted location for seamless redirect after login
    const targetPath = location.pathname + location.search
    return <Navigate to="/login" state={{ from: { pathname: targetPath } }} replace />
  }

  const role = currentUser?.role || 'admin'

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
