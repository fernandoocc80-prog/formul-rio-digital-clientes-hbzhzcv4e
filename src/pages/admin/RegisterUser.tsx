import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, UserPlus } from 'lucide-react'

export default function RegisterUser() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'colaborador'>('colaborador')
  const { registerUser } = useAppStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: 'Senhas não conferem', variant: 'destructive' })
      return
    }
    const normalizedEmail = email.trim().toLowerCase()
    registerUser(name, normalizedEmail, password, role)
    toast({ title: 'Usuário cadastrado com sucesso!' })
    navigate('/admin/users')
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Novo Usuário</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
          <CardDescription>Cadastre um novo usuário com acesso ao sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
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
              <Label htmlFor="role">Nível de Acesso</Label>
              <Select value={role} onValueChange={(val: 'admin' | 'colaborador') => setRole(val)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione o nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar Usuário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
