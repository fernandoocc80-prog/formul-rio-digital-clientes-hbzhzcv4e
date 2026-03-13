import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/AppContext'

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-success text-success-foreground">Concluído</Badge>
    case 'submitted':
      return <Badge variant="default">Enviado</Badge>
    case 'processing':
      return <Badge variant="secondary">Processando</Badge>
    default:
      return <Badge variant="outline">Rascunho</Badge>
  }
}

export default function SubmissionsList() {
  const { submissions } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Formulários</h1>
        <p className="text-muted-foreground">
          Acompanhe e gerencie as solicitações de abertura de empresa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Processos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente / Empresa</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium">{sub.company?.suggestedName1 || 'Pendente'}</div>
                      <div className="text-sm text-muted-foreground">{sub.clientName}</div>
                    </TableCell>
                    <TableCell>{new Date(sub.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/${sub.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
