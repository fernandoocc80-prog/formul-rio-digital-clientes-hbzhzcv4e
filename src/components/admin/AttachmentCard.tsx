import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useSignedUrl } from '@/hooks/use-signed-url'
import { Eye, Download, FileText, Image as ImageIcon, File, Loader2 } from 'lucide-react'
import { DocumentPreviewDialog } from './DocumentPreviewDialog'
import { supabase } from '@/lib/supabase/client'

export interface Attachment {
  id: string
  name: string
  label: string
  pathOrUrl: string | null
}

export function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const { url, loading } = useSignedUrl(attachment.pathOrUrl)
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const isImage = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(attachment.name)
  const isPdf = attachment.name.toLowerCase().endsWith('.pdf')
  const Icon = isImage ? ImageIcon : isPdf ? FileText : File
  const isPending = !attachment.pathOrUrl

  const handleDownloadClick = async () => {
    if (!attachment.pathOrUrl) return
    setIsDownloading(true)
    try {
      let downloadUrl = url
      const pathOrUrl = attachment.pathOrUrl

      if (!downloadUrl) {
        let bucket = 'documents'
        let filePath = pathOrUrl

        const publicMarker = '/storage/v1/object/public/'
        const authMarker = '/storage/v1/object/authenticated/'
        const signMarker = '/storage/v1/object/sign/'

        if (pathOrUrl.includes(publicMarker)) {
          downloadUrl = pathOrUrl
        } else if (pathOrUrl.includes(authMarker) || pathOrUrl.includes(signMarker)) {
          const marker = pathOrUrl.includes(authMarker) ? authMarker : signMarker
          const parts = pathOrUrl.split(marker)[1]
          if (parts) {
            bucket = parts.split('/')[0]
            let fullPath = parts.substring(bucket.length + 1)
            if (fullPath.includes('?')) fullPath = fullPath.split('?')[0]
            filePath = fullPath
          }
        } else if (pathOrUrl.startsWith('http')) {
          downloadUrl = pathOrUrl
        } else {
          if (filePath.includes('?')) filePath = filePath.split('?')[0]
        }

        if (!downloadUrl) {
          let decodedPath = filePath
          try {
            decodedPath = decodeURIComponent(filePath)
          } catch (e) {
            // ignore
          }

          let { data } = await supabase.storage.from(bucket).createSignedUrl(decodedPath, 3600)

          if (!data && decodedPath !== filePath) {
            const fallback = await supabase.storage.from(bucket).createSignedUrl(filePath, 3600)
            if (fallback.data) {
              data = fallback.data
            }
          }

          if (data?.signedUrl) {
            downloadUrl = data.signedUrl
          }
        }
      }

      if (downloadUrl) {
        try {
          const res = await fetch(downloadUrl)
          if (!res.ok) throw new Error('Fetch failed')
          const blob = await res.blob()
          const objectUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = objectUrl
          a.download = attachment.name || 'documento'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
        } catch (error) {
          console.warn('Fetch failed due to CORS or network, falling back to direct link.', error)
          const a = document.createElement('a')
          a.href = downloadUrl
          a.download = attachment.name || 'documento'
          a.target = '_blank'
          a.rel = 'noopener noreferrer'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } else {
        throw new Error('Não foi possível obter a URL do arquivo')
      }
    } catch (e) {
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o arquivo de forma segura.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50 hover:bg-slate-100 transition-colors">
        <div className="flex items-center gap-3 overflow-hidden">
          {isPending ? (
            <div className="h-10 w-10 border-2 border-dashed border-muted-foreground/30 rounded-md shrink-0 flex items-center justify-center">
              <File className="h-4 w-4 text-muted-foreground/50" />
            </div>
          ) : (
            <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-md shrink-0">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate text-foreground" title={attachment.label}>
              {attachment.label}
            </p>
            <p className="text-xs text-muted-foreground truncate" title={attachment.name}>
              {attachment.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-4">
          {isPending ? (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              Pendente
            </span>
          ) : loading && !url ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10"
                onClick={() => setPreviewOpen(true)}
                title="Visualizar documento"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10"
                onClick={handleDownloadClick}
                disabled={isDownloading}
                title="Baixar documento"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <DocumentPreviewDialog
        pathOrUrl={attachment.pathOrUrl}
        name={attachment.name || attachment.label}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  )
}
