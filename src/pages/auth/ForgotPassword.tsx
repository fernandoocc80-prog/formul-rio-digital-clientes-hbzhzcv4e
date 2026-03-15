import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { resetPassword } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await resetPassword(email.trim().toLowerCase())

      if (error) {
        const isRateLimit =
          error.message?.toLowerCase().includes('rate limit') ||
          (error as any).status === 429 ||
          (error as any).code === 'over_email_send_rate_limit'

        if (isRateLimit) {
          toast({
            variant: 'destructive',
            title: 'Atenção',
            description:
              'Limite de envio de e-mail excedido. Por favor, aguarde alguns minutos antes de tentar novamente.',
          })
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro na solicitação',
            description:
              error.message ||
              'Não foi possível enviar o e-mail de recuperação. Verifique se o e-mail está correto e tente novamente.',
          })
        }
      } else {
        setIsSubmitted(true)
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: 'Ocorreu um erro inesperado.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="mb-8 flex items-center gap-2 text-primary font-bold text-2xl">
        <Building2 className="w-8 h-8" />
        EmpresaFlow
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
          <CardDescription>
            Enviaremos um link para o seu e-mail para você redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg text-slate-800">E-mail enviado!</h3>
              <p className="text-muted-foreground text-sm">
                Se a conta existir, enviamos um link de recuperação para <strong>{email}</strong>.
                Por favor, verifique sua caixa de entrada e a pasta de spam.
              </p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/login">Voltar ao Login</Link>
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail cadastrado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresaflow.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para o Login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
