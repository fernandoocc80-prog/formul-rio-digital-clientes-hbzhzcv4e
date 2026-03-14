import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
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
import ClientForm from './pages/form/ClientForm'
import FormSuccess from './pages/form/FormSuccess'
import ShortLinkRedirect from './pages/form/ShortLinkRedirect'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Client Form Routes */}
          <Route element={<Layout />}>
            <Route path="/form/:id" element={<ClientForm />} />
            <Route path="/form/:id/success" element={<FormSuccess />} />
          </Route>

          {/* Protected Administrative Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<SubmissionsList />} />
              <Route path="/admin/users" element={<UsersList />} />
              <Route path="/admin/register-user" element={<RegisterUser />} />
              <Route path="/admin/:id" element={<SubmissionDetail />} />
            </Route>
          </Route>

          {/* Rotas curtas para fácil compartilhamento e acesso via QR Code */}
          <Route path="/s/:id" element={<ShortLinkRedirect />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AppProvider>
  </BrowserRouter>
)

export default App
