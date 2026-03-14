import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Share2, Download, RefreshCw } from 'lucide-react'
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
import { ShareFormDialog } from '@/components/share/ShareFormDialog'
import { EmailSettingsDialog } from '@/components/admin/EmailSettingsDialog'
import { SyncIndicator } from '@/components/dashboard/SyncIndicator'
import { SubmissionStatus } from '@/types'
import { cn } from '@/lib/utils'

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-600 hover:bg-green-700 text-white">Aprovado</Badge>
    case 'under_review':
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Em análise</Badge>
    case 'pending':
      return <Badge className="bg-slate-500 hover:bg-slate-600 text-white">Pendente</Badge>
    case 'draft':
    default:
      return <Badge variant="outline">Rascunho</Badge>
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Aprovado'
    case 'under_review':
      return 'Em análise'
    case 'pending':
      return 'Pendente'
    default:
      return 'Rascunho'
  }
}

export default function SubmissionsList() {
  const { submissions, updateSubmission, syncStatus, syncSubmissions } = useAppStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Feature: Unified List Querying - Ensure filters are reset on mount to guarantee data parity
  useEffect(() => {
    setStatusFilter('all')
    setTypeFilter('all')
  }, [])

  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (typeFilter !== 'all' && s.company?.type !== typeFilter) return false
    return true
  })

  const handleExportCSV = () => {
    const headers = [
      'Protocolo',
      'Cliente',
      'Status',
      'Data de Criação',
      'Tipo de Empresa',
      'Nome Fantasia / Razão Social',
      'Email',
      'Telefone',
      'Qtd Sócios',
      'Docs Anexados',
    ]

    const rows = filtered.map((s) => {
      const companyName = s.company?.tradeName || s.company?.suggestedName1 || 'Não informado'
      const docsCount = `${s.documents?.filter((d) => d.fileName).length || 0}/${
        s.documents?.length || 0
      }`

      return [
        s.protocol,
        s.clientName,
        getStatusLabel(s.status),
        new Date(s.createdAt).toLocaleDateString('pt-BR'),
        s.company?.type?.toUpperCase() || '-',
        companyName,
        s.company?.email || '-',
        s.company?.phone || '-',
        s.partners?.length || 0,
        docsCount,
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `exportacao-formularios-${new Date().toISOString().split('T')[0]}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Gestão de Formulários</h1>
            {/* Visual Parity Confirmation */}
            <Badge variant="outline" className="bg-white dark:bg-slate-950 font-mono text-sm px-2">
              Total: {submissions.length} Processo{submissions.length !== 1 && 's'}
            </Badge>
            <div className="hidden sm:block">
              <SyncIndicator />
            </div>
          </div>
          <p className="text-muted-foreground">
            Acompanhe e gerencie as solicitações de abertura de empresa em tempo real.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <EmailSettingsDialog />
          <Button variant="outline" onClick={handleExportCSV} className="flex-1 md:flex-none">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <ShareFormDialog id="new">
            <Button variant="outline" className="flex-1 md:flex-none">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar Formulário
            </Button>
          </ShareFormDialog>
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
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="under_review">Em análise</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>Todos os Processos ({filtered.length})</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden -mr-2"
            onClick={() => syncSubmissions({ force: true, skipCache: true })}
            disabled={syncStatus === 'syncing'}
          >
            <RefreshCw className={cn('h-4 w-4', syncStatus === 'syncing' && 'animate-spin')} />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocolo</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-mono text-sm whitespace-nowrap">
                      {sub.protocol}
                    </TableCell>
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
                    <TableCell>
                      <Select
                        value={sub.status}
                        onValueChange={(val) =>
                          updateSubmission(sub.id, { status: val as SubmissionStatus })
                        }
                      >
                        <SelectTrigger className="w-[140px] h-9 border-none bg-transparent shadow-none p-0 focus:ring-0">
                          {getStatusBadge(sub.status)}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="under_review">Em análise</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ShareFormDialog id={sub.id}>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Compartilhar link específico deste processo"
                          >
                            <Share2 className="h-4 w-4 xl:mr-2" />
                            <span className="hidden xl:inline">Share</span>
                          </Button>
                        </ShareFormDialog>
                        <Link to={`/admin/${sub.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 xl:mr-2" />
                            <span className="hidden xl:inline">Ver</span>
                          </Button>
                        </Link>
                      </div>
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
