import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('Erro 404: Rota não encontrada', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          O link que você acessou pode estar quebrado ou a página foi removida.
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Voltar para o Início</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
