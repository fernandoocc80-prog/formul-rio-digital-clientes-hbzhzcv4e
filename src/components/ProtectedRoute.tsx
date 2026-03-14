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
    return <Navigate to={role === 'colaborador' ? '/colaborador' : '/'} replace />
  }

  return <Outlet />
}
