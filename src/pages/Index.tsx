import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, FileText, Activity, Clock, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StatusChart } from '@/components/dashboard/StatusChart'
import { useAppStore } from '@/store/AppContext'
import { ShareFormDialog } from '@/components/share/ShareFormDialog'
import { SyncIndicator } from '@/components/dashboard/SyncIndicator'

export default function Index() {
  const navigate = useNavigate()
  const { submissions, syncSubmissions } = useAppStore()

  // Real-Time Data Revalidation: ensure data is always the most recent version on mount
  useEffect(() => {
    syncSubmissions({ force: true })
  }, [syncSubmissions])

  const handleCreateForm = () => {
    navigate('/form/new')
  }

  return (
    <div className="container py-8 max-w-6xl space-y-8">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, Contador</h1>
            <SyncIndicator />
          </div>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo dos seus processos de abertura de empresas.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64 hidden sm:block">
            <Input placeholder="Buscar cliente ou CNPJ..." className="pl-8" />
          </div>
          <Button
            onClick={handleCreateForm}
            className="shadow-elevation hover:scale-[1.02] transition-transform"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Formulário
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Processos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Aguardando Cliente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter((s) => s.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/admin')}>
              <FileText className="mr-2 h-4 w-4" />
              Ver Respostas
            </Button>
            <ShareFormDialog id="new">
              <Button variant="secondary" className="flex-1 w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar Formulário
              </Button>
            </ShareFormDialog>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recentes</CardTitle>
            <CardDescription>Últimas solicitações atualizadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50"
                >
                  <div>
                    <p className="font-medium">{sub.clientName || 'Cliente sem nome'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sub.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Link to={`/admin/${sub.id}`}>
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Status dos Processos</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <StatusChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
