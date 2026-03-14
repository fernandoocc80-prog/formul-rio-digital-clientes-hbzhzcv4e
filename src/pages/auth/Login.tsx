import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Building2, AlertCircle, Loader2, Shield } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'login' | '2fa'>('login')
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { login, verify2FA, users, clearCache } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    // Zero Cache Persistence: Clear caches when visiting the login page to prevent residue
    clearCache()
    try {
      sessionStorage.clear()
    } catch (e) {
      /* ignore */
    }
  }, [clearCache])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsLoading(true)

    const normalizedEmail = email.trim().toLowerCase()

    try {
      const res = await login(normalizedEmail, password)

      if (res.requires2FA) {
        setStep('2fa')
        return
      }

      if (res.success && res.user) {
        toast({
          title: `Bem-vindo(a), ${res.user.name}!`,
          description: `Sessão iniciada como ${res.user.role === 'colaborador' ? 'Colaborador' : 'Administrador'}.`,
        })

        navigate('/welcome', { replace: true, state: { from } })
      } else {
        setErrorMsg('Credenciais inválidas. Verifique seu e-mail e senha e tente novamente.')
        toast({
          title: 'Credenciais inválidas',
          description: 'O e-mail ou a senha estão incorretos.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro inesperado ao tentar fazer login.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg(null)

    try {
      if (token.length < 6) {
        setErrorMsg('Código inválido. Digite os 6 números.')
        setIsLoading(false)
        return
      }

      const res = await verify2FA(email.trim().toLowerCase(), token)

      if (res.success && res.user) {
        toast({
          title: `Bem-vindo(a), ${res.user.name}!`,
          description: `Sessão iniciada com segurança reforçada.`,
        })
        navigate('/welcome', { replace: true, state: { from } })
      } else {
        setErrorMsg('Token inválido ou expirado.')
      }
    } catch (err) {
      setErrorMsg('Erro inesperado durante a verificação.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail)
    const knownTestAccounts = [
      'admin@empresaflow.com.br',
      'fernando@organizacaocastro.com.br',
      'carla@organizacaocastro.com.br',
    ]
    if (knownTestAccounts.includes(testEmail)) {
      setPassword('123456')
    } else {
      setPassword('')
      setTimeout(() => document.getElementById('password')?.focus(), 10)
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
          <CardTitle className="text-2xl">Acesso ao Sistema</CardTitle>
          <CardDescription>
            {step === 'login'
              ? 'Insira suas credenciais exclusivas para acessar o painel'
              : 'Confirme sua identidade para prosseguir'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <Alert
              variant="destructive"
              className="mb-4 animate-in fade-in zoom-in-95 duration-200"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro de Autenticação</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {step === 'login' ? (
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleVerify2FA}
              className="space-y-4 animate-in fade-in zoom-in duration-300"
            >
              <div className="space-y-2 text-center pb-2">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Verificação em Duas Etapas</h3>
                <p className="text-sm text-muted-foreground">
                  Insira o token de segurança gerado no seu aplicativo autenticador.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Token de Segurança</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="text-center tracking-widest text-xl font-mono h-12"
                  autoFocus
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || token.length < 6}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verificar Código
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('login')}
                disabled={isLoading}
              >
                Voltar
              </Button>
            </form>
          )}

          {step === 'login' &&
            (users.length === 0 ? (
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
                      className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-sm border border-slate-200 shadow-sm hover:border-blue-300 cursor-pointer transition-colors"
                      onClick={() => handleQuickFill(u.email)}
                      title="Clique para preencher o e-mail"
                    >
                      <span className="font-mono text-slate-800 truncate mr-2" title={u.email}>
                        {u.email}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${u.role === 'colaborador' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}
                      >
                        {u.role === 'colaborador' ? 'Colab' : 'Admin'}
                      </span>
                    </div>
                  ))}
                  {users.length > 4 && (
                    <div className="text-slate-500 pt-1">... e mais {users.length - 4} contas</div>
                  )}
                </div>
                <p className="mt-3 text-[10px] text-slate-500">
                  Selecione uma conta acima para testar. As contas de teste usam a senha{' '}
                  <strong>123456</strong>.
                </p>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
