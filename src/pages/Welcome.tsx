import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/AppContext'
import { Building2, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Welcome() {
  const { currentUser } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showButton, setShowButton] = useState(false)
  const [progressWidth, setProgressWidth] = useState(0)

  const from = location.state?.from || (currentUser?.role === 'colaborador' ? '/colaborador' : '/')

  useEffect(() => {
    // Start progress bar animation
    const progressTimer = setTimeout(() => {
      setProgressWidth(100)
    }, 100)

    const buttonTimer = setTimeout(() => {
      setShowButton(true)
    }, 1500)

    const redirectTimer = setTimeout(() => {
      navigate(from, { replace: true })
    }, 3500)

    return () => {
      clearTimeout(progressTimer)
      clearTimeout(buttonTimer)
      clearTimeout(redirectTimer)
    }
  }, [navigate, from])

  if (!currentUser) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center relative z-10 w-full max-w-lg">
        <div className="bg-white p-5 rounded-2xl shadow-2xl mb-8 transform transition-transform hover:scale-105">
          <Building2 className="w-14 h-14 text-primary" />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center flex flex-wrap items-center justify-center gap-3">
          Bem-vindo(a) de volta,
          <span className="block w-full sm:w-auto">{currentUser.name.split(' ')[0]}!</span>
          <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse hidden sm:block" />
        </h1>

        <p className="text-primary-foreground/80 text-lg mb-12 text-center">
          Estamos preparando o seu painel de controle de forma segura.
        </p>

        <div className="w-full sm:w-80 h-2 bg-primary-foreground/20 rounded-full overflow-hidden mb-10">
          <div
            className="h-full bg-white rounded-full transition-all ease-out"
            style={{ width: `${progressWidth}%`, transitionDuration: '3s' }}
          />
        </div>

        <div className="min-h-[60px] flex justify-center w-full">
          {showButton && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(from, { replace: true })}
              className="animate-in fade-in zoom-in duration-300 w-full sm:w-auto px-8 rounded-full text-primary hover:scale-105 transition-transform"
            >
              Acessar Agora <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
