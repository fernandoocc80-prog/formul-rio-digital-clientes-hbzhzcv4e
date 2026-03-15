import { DocumentItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, CheckCircle2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  documents: DocumentItem[]
  onChange: (docs: DocumentItem[]) => void
}

export function DocumentsStep({ documents, onChange }: Props) {
  const { toast } = useToast()

  const handleUpload = (id: string, file: File) => {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png']
    const isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
    const isValidExt = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!isValidType && !isValidExt) {
      toast({
        title: 'Formato inválido',
        description: 'Formato de arquivo inválido. Por favor, envie arquivos em PDF, JPG ou PNG.',
        variant: 'destructive',
      })
      return
    }

    onChange(
      documents.map((d) =>
        d.id === id ? { ...d, fileName: file.name, uploadedAt: new Date().toISOString(), file } : d,
      ),
    )
  }

  const removeDoc = (id: string) => {
    onChange(
      documents.map((d) => {
        if (d.id === id) {
          const { fileName, uploadedAt, file, ...rest } = d
          return rest
        }
        return d
      }),
    )
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-bold">Checklist de Documentos</h2>
        <p className="text-muted-foreground">
          Faça o upload dos documentos necessários (PDF, JPG, PNG).
        </p>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {doc.fileName ? (
                  <CheckCircle2 className="text-green-600 h-6 w-6 shrink-0" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground shrink-0" />
                )}
                <div>
                  <p className="font-medium">{doc.label}</p>
                  {doc.fileName ? (
                    <p className="text-xs text-muted-foreground mt-0.5">Arquivo: {doc.fileName}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">Nenhum arquivo anexado</p>
                  )}
                </div>
              </div>
              <div>
                {doc.fileName ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDoc(doc.id)}
                    className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Remover
                  </Button>
                ) : (
                  <div className="relative w-full sm:w-auto">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUpload(doc.id, e.target.files[0])
                        e.target.value = ''
                      }}
                    />
                    <Button variant="outline" size="sm" className="w-full">
                      <Upload className="h-4 w-4 mr-2" /> Anexar Arquivo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
