import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export default function ShortLinkRedirect() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      navigate(`/form/${id}`, { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [id, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground font-medium">Redirecionando para o formulário...</p>
    </div>
  )
}
