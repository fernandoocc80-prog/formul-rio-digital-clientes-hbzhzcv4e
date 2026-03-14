import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/AppContext'

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'colaborador')[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser } = useAppStore()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const role = currentUser.role || 'admin'

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirecionamento unificado para o dashboard global (home) em caso de acesso restrito
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
