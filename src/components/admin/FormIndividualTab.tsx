import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Eye } from 'lucide-react'

interface FormIndividualTabProps {
  formDef: any
  submissions: any[]
}

export function FormIndividualTab({ formDef, submissions }: FormIndividualTabProps) {
  const [search, setSearch] = useState('')
  const [selectedSub, setSelectedSub] = useState<any | null>(null)

  const questions = useMemo(() => {
    return formDef.schema?.sections?.flatMap((s: any) => s.questions) || []
  }, [formDef])

  const filtered = submissions.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    if (s.id.toLowerCase().includes(q)) return true

    // Search within data values
    const dataString = JSON.stringify(s.data).toLowerCase()
    return dataString.includes(q)
  })

  return (
    <Card>
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-semibold">Lista de Respostas ({filtered.length})</h3>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou conteúdo..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Data da Submissão</TableHead>
              <TableHead>ID de Registro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    {new Date(sub.created_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {sub.id}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedSub(sub)}>
                      <Eye className="h-4 w-4 mr-2" /> Visualizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalhes da Resposta</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-3 rounded-md">
                <div>
                  <span className="text-muted-foreground block text-xs">ID da Submissão</span>
                  <span className="font-mono">{selectedSub?.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Data</span>
                  <span>
                    {selectedSub && new Date(selectedSub.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                {questions.map((q: any) => {
                  const answer = selectedSub?.data?.[q.id]
                  const displayAnswer =
                    answer !== undefined && answer !== null && answer !== '' ? (
                      String(answer)
                    ) : (
                      <span className="italic text-muted-foreground">Não respondido</span>
                    )

                  return (
                    <div key={q.id} className="border-b pb-4 last:border-0">
                      <h4 className="font-medium text-sm text-slate-700 mb-1">{q.label}</h4>
                      <p className="text-sm whitespace-pre-wrap">{displayAnswer}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
