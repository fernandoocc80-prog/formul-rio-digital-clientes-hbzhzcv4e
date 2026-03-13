import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Download, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/AppContext'

export default function FormSuccess() {
  const { id } = useParams()
  const { toast } = useToast()
  const { getSubmission } = useAppStore()

  const submission = id ? getSubmission(id) : undefined

  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: 'Notificação Enviada',
        description: 'Um e-mail de confirmação foi enviado para o contato informado com sucesso.',
      })
    }, 1500)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center border-none shadow-elevation">
        <CardContent className="pt-12 pb-12 px-8 space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
              <CheckCircle2 className="h-20 w-20 text-success relative z-10" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Formulário Enviado!</h1>
            <p className="text-muted-foreground">Recebemos os dados e documentos com sucesso.</p>
            <div className="bg-muted/50 py-3 px-4 rounded-md">
              <p className="text-sm font-medium">
                Protocolo de Atendimento:{' '}
                <span className="font-mono font-bold text-primary block text-lg mt-1">
                  {submission?.protocol || id?.toUpperCase() || 'NOVO'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button className="w-full" asChild>
              <Link to={`/admin/${id}`}>
                <Download className="mr-2 h-4 w-4" />
                Baixar Resumo em PDF
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
