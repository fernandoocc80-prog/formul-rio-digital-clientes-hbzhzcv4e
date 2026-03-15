import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ClipboardList, ExternalLink, Loader2, BarChart2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FormRecord {
  id: string
  title: string
  description: string | null
  created_at: string
}

export default function FormsList() {
  const [forms, setForms] = useState<FormRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [formToDelete, setFormToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const { data, error } = await supabase
          .from('forms')
          .select('id, title, description, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error
        setForms(data || [])
      } catch (err) {
        console.error('Error fetching forms:', err)
        toast({
          title: 'Erro ao carregar',
          description: 'Não foi possível carregar a lista de formulários.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchForms()
  }, [toast])

  const handleDelete = async () => {
    if (!formToDelete) return
    setIsDeleting(true)
    try {
      const { error } = await supabase.from('forms').delete().eq('id', formToDelete)
      if (error) throw error

      setForms(forms.filter((f) => f.id !== formToDelete))
      toast({
        title: 'Formulário removido',
        description: 'O formulário foi removido com sucesso.',
      })
    } catch (err) {
      console.error('Error deleting form:', err)
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o formulário.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setFormToDelete(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Formulários Dinâmicos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os formulários criados e analise as respostas submetidas.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Meus Formulários</CardTitle>
          <CardDescription>
            Acesse o dashboard de dados de cada formulário para visualizar gráficos e detalhes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">Nenhum formulário dinâmico encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Título</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="whitespace-nowrap">Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {form.description || '-'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(form.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="ghost" size="sm" asChild title="Abrir formulário">
                          <a href={`/form/${form.id}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/forms/${form.id}/responses`}>
                            <BarChart2 className="h-4 w-4 mr-2" />
                            Respostas
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setFormToDelete(form.id)}
                          title="Remover formulário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!formToDelete}
        onOpenChange={(open) => !open && !isDeleting && setFormToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Formulário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este formulário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
