import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/AppContext'

export default function ProtectedRoute() {
  const { currentUser } = useAppStore()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
