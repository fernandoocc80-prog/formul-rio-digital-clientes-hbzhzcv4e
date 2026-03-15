import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useAppStore } from '@/store/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Building2, AlertCircle, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { signIn } = useAuth()
  const { clearCache, users } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    clearCache()
    try {
      sessionStorage.clear()
    } catch (e) {
      // ignore
    }
  }, [clearCache])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setErrorMsg(null)
    setIsLoading(true)

    try {
      let res
      const retries = 2

      // Retry strategy for network oscillations
      for (let i = 0; i <= retries; i++) {
        try {
          res = await signIn(email.trim().toLowerCase(), password)
          if (
            res.error &&
            (res.error.message?.includes('Failed to fetch') ||
              res.error.message?.includes('NetworkError')) &&
            i < retries
          ) {
            await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
            continue
          }
          break
        } catch (fetchErr: any) {
          if (
            (fetchErr.message?.includes('Failed to fetch') ||
              fetchErr.message?.includes('NetworkError')) &&
            i < retries
          ) {
            await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
            continue
          }
          throw fetchErr
        }
      }

      if (!res?.error) {
        toast({
          title: 'Acesso Liberado',
          description: 'Sessão iniciada com sucesso.',
        })
        navigate('/welcome', { replace: true, state: { from } })
      } else {
        const errMsg = res.error.message?.toLowerCase() || ''
        const isRateLimit =
          errMsg.includes('rate limit') ||
          (res.error as any).status === 429 ||
          (res.error as any).code === 'over_email_send_rate_limit' ||
          errMsg.includes('too many requests')

        if (isRateLimit) {
          const msg =
            'Limite de tentativas atingido. Por favor, aguarde alguns minutos antes de tentar novamente.'
          setErrorMsg(msg)
          toast({
            title: 'Muitas tentativas',
            description: msg,
            variant: 'destructive',
          })
        } else if (errMsg.includes('invalid login credentials') || errMsg.includes('credenciais')) {
          setErrorMsg('Credenciais inválidas. Verifique seu e-mail e senha e tente novamente.')
          toast({
            title: 'Credenciais inválidas',
            description: 'O e-mail ou a senha estão incorretos.',
            variant: 'destructive',
          })
        } else if (
          errMsg.includes('failed to fetch') ||
          errMsg.includes('network error') ||
          errMsg.includes('timeout')
        ) {
          const msg = 'Verifique sua conexão com a internet e tente novamente.'
          setErrorMsg(msg)
          toast({
            title: 'Falha na conexão',
            description: msg,
            variant: 'destructive',
          })
        } else {
          setErrorMsg('Não foi possível realizar o login. Tente novamente mais tarde.')
        }
      }
    } catch (err: any) {
      const errMsg = err?.message?.toLowerCase() || ''
      const isRateLimit =
        errMsg.includes('rate limit') || err?.status === 429 || errMsg.includes('too many requests')

      if (isRateLimit) {
        const msg =
          'Limite de tentativas atingido. Por favor, aguarde alguns minutos antes de tentar novamente.'
        setErrorMsg(msg)
        toast({
          title: 'Muitas tentativas',
          description: msg,
          variant: 'destructive',
        })
      } else if (
        errMsg.includes('failed to fetch') ||
        errMsg.includes('network error') ||
        errMsg.includes('timeout')
      ) {
        const msg = 'Verifique sua conexão com a internet e tente novamente.'
        setErrorMsg(msg)
        toast({
          title: 'Falha na conexão',
          description: msg,
          variant: 'destructive',
        })
      } else {
        setErrorMsg('Ocorreu um erro inesperado ao tentar fazer login. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail)
    setPassword('123456')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="mb-8 flex items-center gap-2 text-primary font-bold text-2xl">
        <Building2 className="w-8 h-8" />
        EmpresaFlow
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Acesso ao Sistema</CardTitle>
          <CardDescription>
            Insira suas credenciais exclusivas para acessar o painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <Alert
              variant="destructive"
              className="mb-4 animate-in fade-in zoom-in-95 duration-200"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? 'Processando...' : 'Entrar'}
            </Button>
          </form>

          {users.length === 0 ? (
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground mb-2">Nenhum usuário cadastrado.</p>
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Primeiro acesso? Crie a conta de administrador principal.
              </Link>
            </div>
          ) : (
            <div className="mt-8 text-center text-xs text-muted-foreground bg-slate-100/80 p-3 rounded-md border border-slate-200">
              <p className="font-semibold mb-2 text-slate-700">Contas disponíveis para teste:</p>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {users.slice(0, 4).map((u) => (
                  <div
                    key={u.id}
                    className={`flex justify-between items-center bg-white px-2.5 py-1.5 rounded-sm border border-slate-200 shadow-sm transition-colors ${
                      isLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-blue-300 cursor-pointer'
                    }`}
                    onClick={() => !isLoading && handleQuickFill(u.email)}
                    title="Clique para preencher o e-mail"
                  >
                    <span className="font-mono text-slate-800 truncate mr-2" title={u.email}>
                      {u.email}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                        u.role === 'colaborador'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {u.role === 'colaborador' ? 'Colab' : 'Admin'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-slate-500">
                Selecione uma conta acima para testar com a senha <strong>123456</strong>.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
