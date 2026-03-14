import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, FileText, Activity, Clock, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusChart } from '@/components/dashboard/StatusChart'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { useAppStore } from '@/store/AppContext'
import { ShareFormDialog } from '@/components/share/ShareFormDialog'
import { SyncIndicator } from '@/components/dashboard/SyncIndicator'

export default function Index() {
  const navigate = useNavigate()
  const { submissions, syncSubmissions, currentUser } = useAppStore()

  useEffect(() => {
    syncSubmissions({ force: true, background: false, skipCache: true })
  }, [syncSubmissions])

  const todaysActivity = useMemo(() => {
    const now = new Date().getTime()
    return submissions.filter((s) => {
      const diff = now - new Date(s.createdAt).getTime()
      return diff <= 24 * 60 * 60 * 1000
    }).length
  }, [submissions])

  const activeModels = 1

  const handleCreateForm = () => {
    navigate('/form/new')
  }

  return (
    <div className="container py-2 max-w-6xl space-y-8 animate-fade-in">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <SyncIndicator />
          </div>
          <p className="text-muted-foreground mt-1">
            Resumo em tempo real dos seus processos de abertura de empresas.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ShareFormDialog id="new">
            <Button variant="outline" className="bg-white">
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar Formulário
            </Button>
          </ShareFormDialog>
          <Button
            onClick={handleCreateForm}
            className="shadow-elevation hover:scale-[1.02] transition-transform bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Formulário
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Formulários recebidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Atividade de Hoje</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysActivity}</div>
            <p className="text-xs text-muted-foreground mt-1">Submissões nas últimas 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Modelos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeModels}</div>
            <p className="text-xs text-muted-foreground mt-1">Formulários de base ativos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Volume de Submissões</CardTitle>
            <CardDescription>Quantidade de novos cadastros nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <TrendChart />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Status dos Processos</CardTitle>
            <CardDescription>Distribuição de acordo com o andamento</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center flex-1 pb-8">
            <StatusChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Processos Recentes</CardTitle>
            <CardDescription>As últimas solicitações cadastradas em nossa base.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            Ver todos <PlusCircle className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.slice(0, 5).map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium">{sub.clientName || 'Cliente sem nome'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(sub.updatedAt).toLocaleDateString('pt-BR')} - Protocolo:{' '}
                    {sub.protocol}
                  </p>
                </div>
                <Link to={`/admin/${sub.id}`}>
                  <Button variant="ghost" size="sm">
                    Detalhes
                  </Button>
                </Link>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma solicitação recente.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
