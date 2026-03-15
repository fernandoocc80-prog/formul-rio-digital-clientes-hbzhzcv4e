import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { AppProvider } from '@/store/AppContext'

import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Index from './pages/Index'
import NotFound from './pages/NotFound'
import SubmissionsList from './pages/admin/SubmissionsList'
import SubmissionDetail from './pages/admin/SubmissionDetail'
import UsersList from './pages/admin/UsersList'
import RegisterUser from './pages/admin/RegisterUser'
import AccessHistory from './pages/admin/AccessHistory'
import ClientForm from './pages/form/ClientForm'
import FormSuccess from './pages/form/FormSuccess'
import ShortLinkRedirect from './pages/form/ShortLinkRedirect'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import QuickActions from './pages/QuickActions'
import Welcome from './pages/Welcome'
import Settings from './pages/settings/Settings'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<Layout />}>
              <Route path="/form/:id" element={<ClientForm />} />
              <Route path="/form/:id/success" element={<FormSuccess />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/welcome" element={<Welcome />} />

              <Route element={<AdminLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/acoes-rapidas" element={<QuickActions />} />
                <Route path="/admin" element={<SubmissionsList />} />
                <Route path="/admin/:id" element={<SubmissionDetail />} />
                <Route path="/settings" element={<Settings />} />

                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/users" element={<UsersList />} />
                  <Route path="/admin/register-user" element={<RegisterUser />} />
                  <Route path="/admin/access-history" element={<AccessHistory />} />
                </Route>
              </Route>
            </Route>

            <Route path="/s/:id" element={<ShortLinkRedirect />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
