import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FormSummaryTab } from '@/components/admin/FormSummaryTab'
import { FormIndividualTab } from '@/components/admin/FormIndividualTab'

export default function FormResponses() {
  const { id } = useParams<{ id: string }>()
  const [formDef, setFormDef] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchResponses = async (showRefresh = false) => {
    if (!id) return
    if (showRefresh) setRefreshing(true)

    try {
      const [formRes, subsRes] = await Promise.all([
        supabase.from('forms').select('*').eq('id', id).single(),
        supabase
          .from('form_submissions')
          .select('*')
          .eq('form_id', id)
          .order('created_at', { ascending: false }),
      ])

      if (formRes.error) throw formRes.error
      if (subsRes.error) throw subsRes.error

      setFormDef(formRes.data)
      setSubmissions(subsRes.data || [])

      if (showRefresh) {
        toast({ title: 'Dados atualizados com sucesso' })
      }
    } catch (err) {
      console.error('Error fetching responses:', err)
      toast({
        title: 'Erro ao carregar',
        description: 'Falha ao buscar dados do formulário.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchResponses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!formDef) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-4">Formulário não encontrado.</h2>
        <Button asChild>
          <Link to="/admin/forms">Voltar</Link>
        </Button>
      </div>
    )
  }

  const isLegacy = !formDef.schema

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/forms">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{formDef.title}</h1>
            <p className="text-sm text-muted-foreground">Gestão de Respostas</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => fetchResponses(true)}
          disabled={refreshing}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>

      {isLegacy ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-lg text-center space-y-3">
          <h3 className="font-semibold text-lg">Formulário Legado</h3>
          <p>
            Este formulário não utiliza o novo esquema dinâmico (Schema JSON) e não suporta gráficos
            automáticos.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/admin">Ir para Submissões Antigas</Link>
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="summary">Resumo Gráfico</TabsTrigger>
            <TabsTrigger value="individual">Respostas Individuais</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="animate-fade-in">
            <FormSummaryTab formDef={formDef} submissions={submissions} />
          </TabsContent>

          <TabsContent value="individual" className="animate-fade-in">
            <FormIndividualTab formDef={formDef} submissions={submissions} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
