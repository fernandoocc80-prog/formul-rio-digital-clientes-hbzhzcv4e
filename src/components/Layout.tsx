import { Outlet } from 'react-router-dom'
import { AppNavbar } from './layout/AppNavbar'
import { Footer } from './layout/Footer'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppNavbar />
      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
