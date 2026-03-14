import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '@/store/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Building2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, users } = useAppStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Data Integrity on Login check happens inside the login context function
    const success = await login(email, password)
    if (success) {
      toast({ title: 'Login realizado com sucesso!' })
      navigate('/')
    } else {
      toast({ title: 'Credenciais inválidas', variant: 'destructive' })
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
          <CardTitle className="text-2xl">Área Administrativa</CardTitle>
          <CardDescription>Insira suas credenciais para acessar o painel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@empresaflow.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Entrar
            </Button>
          </form>

          {users.length === 0 ? (
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground mb-2">Nenhum administrador cadastrado.</p>
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Primeiro acesso? Crie uma conta de configuração.
              </Link>
            </div>
          ) : (
            <div className="mt-8 text-center text-xs text-muted-foreground bg-slate-100 p-3 rounded-md">
              <p className="font-semibold mb-1">Dica de acesso para testes:</p>
              <p className="font-mono">admin@empresaflow.com.br / admin123</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
