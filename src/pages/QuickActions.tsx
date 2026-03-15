import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  PlusCircle,
  Link as LinkIcon,
  Eye,
  Sparkles,
  Copy,
  Search,
  RefreshCw,
  Download,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/AppContext'
import { useToast } from '@/hooks/use-toast'
import { SyncIndicator } from '@/components/dashboard/SyncIndicator'
import { cn } from '@/lib/utils'
import { Submission } from '@/types'

export default function QuickActions() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentUser, submissions, syncSubmissions, syncStatus, downloadGeneratedPDF } =
    useAppStore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)

  const currentTab = searchParams.get('tab') || 'actions'
  const PUBLIC_URL = 'https://formulario-digital-clientes-38ac0.goskip.app/form/new'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const handleCopyLink = () => {
    const message = `Olá! Para darmos andamento na abertura da sua empresa, por favor preencha o formulário no link a seguir: ${PUBLIC_URL}`
    navigator.clipboard.writeText(message).then(() => {
      toast({
        title: 'Mensagem copiada com sucesso!',
        description:
          'A mensagem contendo o link foi copiada e está pronta para ser enviada ao cliente.',
      })
    })
  }

  const handleDownloadPDF = async (sub: Submission) => {
    setDownloading(sub.id)
    await downloadGeneratedPDF(sub)
    setDownloading(null)
  }

  const filteredSubmissions = submissions.filter((s) => {
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
      ) {
        return false
      }
    }
    return true
  })

  return (
    <div className="container py-4 sm:py-6 max-w-5xl space-y-6 sm:space-y-8 animate-fade-in">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
          <Sparkles className="w-32 h-32 text-blue-600" />
        </div>
        <CardContent className="p-6 sm:p-8 flex items-center gap-5 relative z-10">
          <div className="bg-white p-3.5 rounded-full shadow-sm text-blue-600 hidden sm:flex shrink-0 border border-blue-50">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
                {currentUser?.name
                  ? `Bem-vindo, ${currentUser.name.split(' ')[0]}!`
                  : 'Ações Rápidas'}
              </h1>
              <div className="hidden sm:block">
                <SyncIndicator />
              </div>
            </div>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
              Acesse ferramentas essenciais, gerencie links de clientes e acompanhe os retornos
              recentes.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="actions">Ações e Links</TabsTrigger>
          <TabsTrigger value="returns">Ver Retornos</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="flex flex-col items-center text-center p-6 border-2 hover:border-primary/50 transition-colors bg-white shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <CardTitle>Novo Formulário</CardTitle>
                <CardDescription>
                  Acesse o Formulário Modelo para preencher os dados do cliente manualmente no
                  sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full mt-auto pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/form/new')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Preencher Formulário
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center text-center p-6 border-2 hover:border-primary/50 transition-colors bg-white shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <CardTitle>Link para Cliente</CardTitle>
                <CardDescription>
                  Gere um link público com mensagem para que o cliente preencha os dados de forma
                  independente.
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full mt-auto pt-4 space-y-4">
                <Input
                  value={PUBLIC_URL}
                  readOnly
                  className="text-center bg-muted/50 font-mono text-xs sm:text-sm truncate px-2"
                />
                <Button size="lg" variant="outline" onClick={handleCopyLink} className="w-full">
                  <Copy className="w-4 h-4 mr-2" /> Copiar Mensagem
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="returns" className="space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Histórico de Retornos</CardTitle>
                  <CardDescription>
                    Acompanhe os formulários submetidos e visualize os dados detalhados.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar formulário..."
                      className="pl-9 h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => syncSubmissions({ force: true, skipCache: true })}
                    title="Atualizar dados"
                  >
                    <RefreshCw
                      className={cn('h-4 w-4', syncStatus === 'syncing' && 'animate-spin')}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Cliente</TableHead>
                    <TableHead className="whitespace-nowrap">Tipo de Empresa</TableHead>
                    <TableHead className="whitespace-nowrap">Data de Envio</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchQuery
                          ? 'Nenhum resultado encontrado para sua busca.'
                          : 'Nenhum retorno de formulário encontrado.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {sub.clientName || 'Não informado'}
                        </TableCell>
                        <TableCell>
                          {sub.company?.type ? (
                            <Badge variant="outline" className="uppercase">
                              {sub.company.type}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(sub)}
                              disabled={downloading === sub.id}
                              title="Baixar Arquivo PDF"
                            >
                              {downloading === sub.id ? (
                                <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 sm:mr-2" />
                              )}
                              <span className="hidden sm:inline">PDF</span>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/${sub.id}`}>
                                <Eye className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Visualizar</span>
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
