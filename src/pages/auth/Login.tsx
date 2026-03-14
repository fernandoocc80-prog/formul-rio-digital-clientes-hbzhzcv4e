import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
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
  const { login, users, clearCache } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    // Zero Cache Persistence: Clear caches when visiting the login page to prevent residue
    // This is safe because it only clears submission caches and session storage, not user auth databases
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

    // Ensure email has no trailing spaces from mobile keyboards and is lowercase
    const normalizedEmail = email.trim().toLowerCase()

    try {
      // Data Integrity on Login check happens inside the login context function
      const user = await login(normalizedEmail, password)

      if (user) {
        toast({ title: 'Login realizado com sucesso!' })
        // Session Continuity: correctly redirect to the original requested page or workspace
        const userRole = user.role || 'admin'
        const dest = userRole === 'colaborador' && from === '/' ? '/colaborador' : from
        navigate(dest, { replace: true })
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="mb-8 flex items-center gap-2 text-primary font-bold text-2xl">
        <Building2 className="w-8 h-8" />
        EmpresaFlow
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Acesso ao Sistema</CardTitle>
          <CardDescription>Insira suas credenciais para acessar o painel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <Alert variant="destructive" className="animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro de Autenticação</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresaflow.com.br"
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

          {users.length === 0 ? (
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground mb-2">Nenhum usuário cadastrado.</p>
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Primeiro acesso? Crie uma conta de configuração.
              </Link>
            </div>
          ) : (
            <div className="mt-8 text-center text-xs text-muted-foreground bg-slate-100 p-3 rounded-md">
              <p className="font-semibold mb-1">Dica de acesso para testes:</p>
              <p className="font-mono">
                {users[0]?.email || 'admin@empresaflow.com.br'} / [sua senha]
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
