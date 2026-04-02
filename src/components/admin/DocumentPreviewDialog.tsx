import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface DocumentPreviewDialogProps {
  pathOrUrl?: string | null
  name: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentPreviewDialog({
  pathOrUrl,
  name,
  open,
  onOpenChange,
}: DocumentPreviewDialogProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  const testString = `${name} ${pathOrUrl || ''}`.toLowerCase()
  const isImage = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(testString)
  const isPdf = testString.includes('.pdf')

  useEffect(() => {
    if (!open || !pathOrUrl) {
      return
    }

    let isMounted = true
    let currentBlobUrl: string | null = null

    const fetchBlob = async () => {
      setLoading(true)
      setError(null)
      try {
        let blob: Blob | null = null

        const publicMarker = '/storage/v1/object/public/'
        const authMarker = '/storage/v1/object/authenticated/'

        if (pathOrUrl.includes(publicMarker) || pathOrUrl.includes(authMarker)) {
          const marker = pathOrUrl.includes(publicMarker) ? publicMarker : authMarker
          const parts = pathOrUrl.split(marker)[1]
          if (parts) {
            const bucket = parts.split('/')[0]
            let fullPath = parts.substring(bucket.length + 1)
            if (fullPath.includes('?')) fullPath = fullPath.split('?')[0]
            const filePath = decodeURIComponent(fullPath)

            const { data, error: dlError } = await supabase.storage.from(bucket).download(filePath)
            if (dlError) throw dlError
            if (data) blob = data
          }
        } else if (pathOrUrl.startsWith('http')) {
          const res = await fetch(pathOrUrl)
          if (!res.ok) throw new Error('Falha ao baixar o arquivo externo.')
          blob = await res.blob()
        } else {
          let fullPath = pathOrUrl
          if (fullPath.includes('?')) fullPath = fullPath.split('?')[0]
          try {
            fullPath = decodeURIComponent(fullPath)
          } catch (e) {}
          const { data, error: dlError } = await supabase.storage
            .from('documents')
            .download(fullPath)
          if (dlError) throw dlError
          if (data) blob = data
        }

        if (blob && isMounted) {
          const type = isPdf ? 'application/pdf' : isImage ? blob.type || 'image/jpeg' : blob.type
          const typedBlob = new Blob([blob], { type })
          currentBlobUrl = URL.createObjectURL(typedBlob)
          setBlobUrl(currentBlobUrl)
        }
      } catch (err: any) {
        console.error('Error fetching document blob:', err)
        if (isMounted) {
          setError(err.message || 'Não foi possível carregar o documento de forma segura.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchBlob()

    return () => {
      isMounted = false
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl)
      }
    }
  }, [open, pathOrUrl, isPdf, isImage])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setScale(1)
      setRotation(0)
      setBlobUrl(null)
      setError(null)
    }
    onOpenChange(isOpen)
  }

  const handleDownload = async () => {
    if (blobUrl) {
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = name || 'documento'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else if (pathOrUrl) {
      if (pathOrUrl.startsWith('http')) {
        const a = document.createElement('a')
        a.href = pathOrUrl
        a.download = name || 'documento'
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        try {
          let fullPath = pathOrUrl
          if (fullPath.includes('?')) fullPath = fullPath.split('?')[0]
          try {
            fullPath = decodeURIComponent(fullPath)
          } catch (e) {}
          const { data, error } = await supabase.storage.from('documents').download(fullPath)
          if (error) throw error
          if (data) {
            const url = URL.createObjectURL(data)
            const a = document.createElement('a')
            a.href = url
            a.download = name || 'documento'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            setTimeout(() => URL.revokeObjectURL(url), 1000)
          }
        } catch (e) {
          console.error('Download error:', e)
        }
      }
    }
  }

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4))
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25))
  const rotate = () => setRotation((r) => (r + 90) % 360)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
        <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between bg-background shrink-0 z-10">
          <div className="flex flex-col gap-1 overflow-hidden pr-4">
            <DialogTitle className="text-base truncate" title={name}>
              {name || 'Documento'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Visualização nativa do documento
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isImage && blobUrl && !error && (
              <div className="hidden sm:flex items-center gap-1 mr-2 border-r pr-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={zoomOut}
                  title="Menos Zoom"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs w-10 text-center font-medium">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={zoomIn}
                  title="Mais Zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-1"
                  onClick={rotate}
                  title="Rotacionar"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleDownload} className="shrink-0 h-8">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Baixar</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-slate-100/80 flex items-center justify-center p-4 relative min-h-0 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center text-muted-foreground animate-in fade-in duration-300">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
              <p className="text-sm font-medium">Carregando visualização segura...</p>
            </div>
          ) : error ? (
            <FallbackView url={pathOrUrl} message={error} onDownload={handleDownload} />
          ) : isImage && blobUrl ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              <div className="relative flex items-center justify-center min-w-full min-h-full p-4">
                <img
                  src={blobUrl}
                  alt={name}
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-in-out',
                  }}
                  className="max-w-[90%] max-h-[90%] shadow-sm rounded-sm origin-center object-contain"
                  onError={() => setError('Não foi possível exibir a imagem gerada.')}
                />
              </div>
              <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/95 backdrop-blur border shadow-lg rounded-full px-3 py-2 z-20">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={zoomOut}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={zoomIn}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={rotate}
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : isPdf && blobUrl ? (
            <div className="w-full h-full relative">
              <object
                data={`${blobUrl}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-full rounded-md shadow-sm border-0 bg-white"
                onError={() => setError('O navegador não conseguiu renderizar o PDF localmente.')}
              >
                <FallbackView
                  url={pathOrUrl}
                  message="O navegador bloqueou a visualização do PDF ou não possui um visualizador nativo integrado para o arquivo gerado."
                  onDownload={handleDownload}
                />
              </object>
            </div>
          ) : blobUrl ? (
            <FallbackView
              url={pathOrUrl}
              message="Este tipo de arquivo não suporta visualização em linha segura."
              onDownload={handleDownload}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FallbackView({
  url,
  message,
  onDownload,
}: {
  url?: string | null
  message: string
  onDownload: () => void
}) {
  return (
    <div className="text-center space-y-4 p-6 sm:p-8 bg-white rounded-xl shadow-sm border max-w-md mx-auto flex flex-col items-center w-full animate-in fade-in zoom-in-95 duration-300">
      <div className="h-14 w-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="font-semibold text-xl text-slate-900">Visualização Indisponível</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      <div className="pt-4 w-full flex flex-col gap-3">
        <Button onClick={onDownload} className="w-full h-11" size="lg">
          <Download className="h-5 w-5 mr-2" />
          Baixar Arquivo Seguramente
        </Button>
        {url && url.startsWith('http') && (
          <Button asChild variant="outline" className="w-full h-11" size="lg">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-5 w-5 mr-2" />
              Tentar abrir link original
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
