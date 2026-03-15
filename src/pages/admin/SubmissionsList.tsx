import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Share2, Download, RefreshCw, CalendarIcon, X, Search, Loader2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useAppStore } from '@/store/AppContext'
import { ShareFormDialog } from '@/components/share/ShareFormDialog'
import { EmailSettingsDialog } from '@/components/admin/EmailSettingsDialog'
import { SyncIndicator } from '@/components/dashboard/SyncIndicator'
import { SubmissionStatus, Submission } from '@/types'
import { cn } from '@/lib/utils'

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-600 hover:bg-green-700 text-white">Aprovado</Badge>
    case 'under_review':
      return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Em análise</Badge>
    case 'pending':
      return <Badge className="bg-slate-500 hover:bg-slate-600 text-white">Pendente</Badge>
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
  const { submissions, updateSubmission, syncStatus, syncSubmissions, downloadGeneratedPDF } =
    useAppStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    setStatusFilter('all')
    setTypeFilter('all')
    setStartDate(undefined)
    setEndDate(undefined)
    setSearchQuery('')
    syncSubmissions({ force: true, background: false, skipCache: true }).catch(() => {
      /* ignore */
    })
  }, [syncSubmissions])

  const handleClearFilters = () => {
    setStatusFilter('all')
    setTypeFilter('all')
    setStartDate(undefined)
    setEndDate(undefined)
    setSearchQuery('')
  }

  const handleDownloadPDF = async (sub: Submission) => {
    setDownloading(sub.id)
    await downloadGeneratedPDF(sub)
    setDownloading(null)
  }

  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (typeFilter !== 'all' && s.company?.type !== typeFilter) return false

    if (startDate || endDate) {
      const subDate = new Date(s.createdAt)
      subDate.setHours(0, 0, 0, 0)
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        if (subDate.getTime() < start.getTime()) return false
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(0, 0, 0, 0)
        if (subDate.getTime() > end.getTime()) return false
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const companyName = (s.company?.tradeName || s.company?.suggestedName1 || '').toLowerCase()
      const clientName = (s.clientName || '').toLowerCase()
      const protocol = (s.protocol || '').toLowerCase()
      const email = (s.company?.email || '').toLowerCase()

      if (
        !clientName.includes(query) &&
        !companyName.includes(query) &&
        !protocol.includes(query) &&
        !email.includes(query)
      )
        return false
    }

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
      const docsCount = `${s.documents?.filter((d) => d.fileName).length || 0}/${s.documents?.length || 0}`
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

  const dateFormatter = new Intl.DateTimeFormat('pt-BR')

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Gestão de Formulários</h1>
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
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
          <ShareFormDialog id="new">
            <Button variant="outline" className="flex-1 md:flex-none">
              <Share2 className="h-4 w-4 mr-2" /> Compartilhar Link
            </Button>
          </ShareFormDialog>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 flex flex-wrap items-center gap-3 w-full shadow-sm">
        <span className="text-sm font-medium text-slate-700 w-full sm:w-auto mr-1">Filtros:</span>

        <div className="relative flex-1 min-w-[200px] w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, empresa ou protocolo..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-full sm:w-[130px] justify-start text-left font-normal',
                !startDate && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {startDate ? dateFormatter.format(startDate) : 'Data Inicial'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-full sm:w-[130px] justify-start text-left font-normal',
                !endDate && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {endDate ? dateFormatter.format(endDate) : 'Data Final'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
          </PopoverContent>
        </Popover>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[130px] h-9">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tipos</SelectItem>
            <SelectItem value="mei">MEI</SelectItem>
            <SelectItem value="ltda">LTDA</SelectItem>
            <SelectItem value="slu">SLU</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px] h-9">
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

        {(startDate ||
          endDate ||
          statusFilter !== 'all' ||
          typeFilter !== 'all' ||
          searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs w-full sm:w-auto"
          >
            <X className="h-3.5 w-3.5 mr-1" /> Limpar Filtros
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>Resultados ({filtered.length})</CardTitle>
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
                <TableHead className="whitespace-nowrap">Protocolo</TableHead>
                <TableHead className="min-w-[200px]">Empresa</TableHead>
                <TableHead className="min-w-[150px]">Contato</TableHead>
                <TableHead className="whitespace-nowrap">Data</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? 'Nenhum resultado encontrado para sua busca.'
                      : 'Nenhum registro encontrado para os filtros selecionados.'}
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
                    <TableCell className="whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
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
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(sub)}
                          disabled={downloading === sub.id}
                          title="Baixar Arquivo PDF"
                        >
                          {downloading === sub.id ? (
                            <Loader2 className="h-4 w-4 xl:mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 xl:mr-2" />
                          )}
                          <span className="hidden xl:inline">PDF</span>
                        </Button>
                        <ShareFormDialog id={sub.id}>
                          <Button variant="ghost" size="sm" title="Compartilhar link específico">
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
