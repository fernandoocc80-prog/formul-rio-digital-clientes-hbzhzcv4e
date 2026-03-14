import { Link } from 'react-router-dom'
import { PlusCircle, Shield, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/AppContext'
import { useToast } from '@/hooks/use-toast'

export default function UsersList() {
  const { users, currentUser, removeUser } = useAppStore()
  const { toast } = useToast()

  const handleRemove = (id: string) => {
    if (id === currentUser?.id) {
      toast({
        title: 'Ação não permitida',
        description: 'Você não pode remover seu próprio usuário.',
        variant: 'destructive',
      })
      return
    }
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      removeUser(id)
      toast({ title: 'Usuário removido com sucesso!' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie quem tem acesso ao painel do sistema.</p>
        </div>
        <Button
          asChild
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-elevation hover:scale-[1.02] transition-transform"
        >
          <Link to="/admin/register-user">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Usuário
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados ({users.length})</CardTitle>
          <CardDescription>Lista de todos os usuários com acesso ao sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name}
                    {user.id === currentUser?.id && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        Você
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex w-fit items-center gap-1">
                      <Shield className="h-3 w-3" />{' '}
                      {user.role === 'colaborador' ? 'Colaborador' : 'Administrador'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => handleRemove(user.id)}
                      disabled={user.id === currentUser?.id}
                      title={
                        user.id === currentUser?.id ? 'Você não pode remover a si mesmo' : 'Remover'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
