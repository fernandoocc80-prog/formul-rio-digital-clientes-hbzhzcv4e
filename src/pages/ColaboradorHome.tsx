import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { PlusCircle, Link as LinkIcon, Eye, Sparkles, Copy } from 'lucide-react'
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

export default function ColaboradorHome() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentUser, submissions } = useAppStore()
  const { toast } = useToast()

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
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              {currentUser?.name ? `Bem-vindo, ${currentUser.name}!` : 'Portal de Colaboradores.'}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
              Pronto para gerenciar seus formulários e links de clientes?
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="actions">Nova Submissão</TabsTrigger>
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
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Mensagem
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="returns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Retornos</CardTitle>
              <CardDescription>
                Acompanhe os formulários submetidos e visualize os dados detalhados.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  {submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum retorno de formulário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((sub) => (
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
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/${sub.id}`}>
                              <Eye className="w-4 h-4 sm:mr-2" />
                              <span className="hidden sm:inline">Visualizar</span>
                            </Link>
                          </Button>
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
