import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink, Loader2, AlertCircle } from 'lucide-react'

interface DocumentPreviewDialogProps {
  url: string
  name: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentPreviewDialog({
  url,
  name,
  open,
  onOpenChange,
}: DocumentPreviewDialogProps) {
  const [hasError, setHasError] = useState(false)

  const testString = `${name} ${url}`.toLowerCase()
  const isImage = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(testString)
  const isPdf = testString.includes('.pdf')

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setHasError(false)
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between bg-background shrink-0 z-10">
          <div className="flex flex-col gap-1 overflow-hidden pr-4">
            <DialogTitle className="text-base truncate" title={name}>
              {name || 'Documento'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Visualização do documento em anexo
            </DialogDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 h-8 hidden sm:flex">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir em nova aba
            </a>
          </Button>
        </DialogHeader>

        <div className="flex-1 bg-slate-100/80 flex items-center justify-center p-4 relative min-h-0 overflow-hidden">
          {!url ? (
            <div className="flex flex-col items-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center relative">
              <img
                src={url}
                alt={name}
                className={`max-w-full max-h-full object-contain rounded-md shadow-sm transition-opacity duration-300 ${hasError ? 'opacity-0' : 'opacity-100'}`}
                onError={() => setHasError(true)}
              />
              {hasError && (
                <div className="absolute inset-0 z-10 bg-slate-100/80 flex items-center justify-center p-4">
                  <FallbackView
                    url={url}
                    message="Não foi possível carregar a imagem. O navegador pode ter bloqueado o recurso."
                  />
                </div>
              )}
            </div>
          ) : isPdf ? (
            <div className="w-full h-full relative">
              <object
                data={`${url}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-full rounded-md shadow-sm border-0 bg-white"
                onError={() => setHasError(true)}
              >
                <FallbackView
                  url={url}
                  message="O navegador bloqueou a visualização do PDF ou não possui um visualizador nativo integrado."
                />
              </object>
              {hasError && (
                <div className="absolute inset-0 z-10 bg-slate-100/80 flex items-center justify-center p-4">
                  <FallbackView
                    url={url}
                    message="A visualização foi interrompida ou bloqueada (ERR_BLOCKED_BY_CLIENT)."
                  />
                </div>
              )}
            </div>
          ) : (
            <FallbackView
              url={url}
              message="Este tipo de arquivo não suporta visualização em linha."
            />
          )}

          {url && (
            <div className="absolute bottom-4 right-4 sm:hidden z-20">
              <Button asChild size="sm" className="shadow-lg">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Documento
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FallbackView({ url, message }: { url: string; message: string }) {
  return (
    <div className="text-center space-y-4 p-6 sm:p-8 bg-white rounded-xl shadow-sm border max-w-md mx-auto flex flex-col items-center w-full">
      <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-lg text-slate-900">Visualização Indisponível</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      <div className="pt-4 w-full">
        <Button asChild className="w-full">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir em nova aba de forma segura
          </a>
        </Button>
      </div>
    </div>
  )
}
