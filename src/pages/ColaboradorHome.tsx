import { useNavigate } from 'react-router-dom'
import { PlusCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareFormDialog } from '@/components/share/ShareFormDialog'
import { useAppStore } from '@/store/AppContext'

export default function ColaboradorHome() {
  const navigate = useNavigate()
  const { currentUser } = useAppStore()

  return (
    <div className="container py-6 max-w-4xl space-y-8 animate-fade-in">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {currentUser?.name || 'Colaborador'}
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu espaço de trabalho. Aqui você pode iniciar novos processos de abertura de
          empresas e gerar links de formulários para seus clientes.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col items-center text-center p-6 border-2 hover:border-primary/50 transition-colors bg-white">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-6 h-6" />
            </div>
            <CardTitle>Novo Formulário</CardTitle>
            <CardDescription>
              Preencha os dados do cliente e inicie um novo processo diretamente no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/form/new')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Preencher Formulário
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center text-center p-6 border-2 hover:border-primary/50 transition-colors bg-white">
          <CardHeader>
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <CardTitle>Compartilhar Link</CardTitle>
            <CardDescription>
              Gere um link ou QR Code e envie para o próprio cliente preencher os dados.
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full pt-2">
            <ShareFormDialog id="new">
              <Button size="lg" variant="outline" className="w-full">
                Gerar Link / QR Code
              </Button>
            </ShareFormDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
