import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { PlusCircle, Link as LinkIcon, Eye } from 'lucide-react'
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
    navigator.clipboard.writeText(PUBLIC_URL).then(() => {
      toast({
        title: 'Link copiado com sucesso!',
        description: 'O link do formulário foi copiado para a área de transferência.',
      })
    })
  }

  return (
    <div className="container py-6 max-w-5xl space-y-8 animate-fade-in">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {currentUser?.name || 'Colaborador'}
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu espaço de trabalho. Gerencie novos processos e acompanhe os retornos.
        </p>
      </section>

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
                  Gere um link público para que o cliente preencha os dados de forma independente.
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full mt-auto pt-4 space-y-4">
                <Input
                  value={PUBLIC_URL}
                  readOnly
                  className="text-center bg-muted/50 font-mono text-sm"
                />
                <Button size="lg" variant="outline" onClick={handleCopyLink} className="w-full">
                  Gerar Link para Cliente
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
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo de Empresa</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
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
                        <TableCell>{new Date(sub.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/colaborador/${sub.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
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
