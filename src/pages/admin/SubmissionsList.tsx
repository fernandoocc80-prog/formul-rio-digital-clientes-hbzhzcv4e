import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Filter } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (typeFilter !== 'all' && s.company?.type !== typeFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Formulários</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie as solicitações de abertura de empresa.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              <SelectItem value="mei">MEI</SelectItem>
              <SelectItem value="ltda">LTDA</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="submitted">Enviado</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Processos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        {sub.company?.tradeName || sub.company?.suggestedName1 || 'Pendente'}
                        {sub.company?.type && (
                          <Badge variant="outline" className="uppercase text-[10px] h-5 py-0 px-1">
                            {sub.company.type}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{sub.clientName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{sub.company?.email || '-'}</div>
                      <div className="text-xs text-muted-foreground">
                        {sub.company?.phone || '-'}
                      </div>
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
