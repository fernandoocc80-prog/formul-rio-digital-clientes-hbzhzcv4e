import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Building2, AlertCircle, Loader2 } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (password !== confirmPassword) {
      setErrorMsg(
        'As senhas não conferem. Certifique-se de digitar a mesma senha em ambos os campos.',
      )
      return
    }

    if (password.length < 6) {
      setErrorMsg('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await updatePassword(password)
      if (error) {
        setErrorMsg(
          error.message ||
            'Ocorreu um erro ao atualizar a senha. O link de recuperação pode ter expirado ou ser inválido.',
        )
      } else {
        toast({
          title: 'Senha redefinida com sucesso!',
          description: 'Sua conta foi atualizada com a nova senha de acesso.',
        })
        navigate('/login', { replace: true })
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro inesperado. Tente novamente mais tarde.')
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
          <CardTitle className="text-2xl">Criar Nova Senha</CardTitle>
          <CardDescription>Escolha uma nova senha forte para proteger sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <Alert
              variant="destructive"
              className="mb-4 animate-in fade-in zoom-in-95 duration-200"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Não foi possível alterar</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
