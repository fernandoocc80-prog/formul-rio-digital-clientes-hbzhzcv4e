import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/store/AppContext'

import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'

import Index from './pages/Index'
import NotFound from './pages/NotFound'
import SubmissionsList from './pages/admin/SubmissionsList'
import SubmissionDetail from './pages/admin/SubmissionDetail'
import ClientForm from './pages/form/ClientForm'
import FormSuccess from './pages/form/FormSuccess'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/form/:id" element={<ClientForm />} />
            <Route path="/form/:id/success" element={<FormSuccess />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<SubmissionsList />} />
            <Route path="/admin/:id" element={<SubmissionDetail />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AppProvider>
  </BrowserRouter>
)

export default App
