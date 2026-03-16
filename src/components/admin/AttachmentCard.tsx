import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useSignedUrl } from '@/hooks/use-signed-url'
import { Eye, Download, FileText, Image as ImageIcon, File, Loader2 } from 'lucide-react'
import { DocumentPreviewDialog } from './DocumentPreviewDialog'

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
    if (!url) return
    setIsDownloading(true)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = attachment.name || 'documento'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    } catch (e) {
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o arquivo. Ele pode estar corrompido ou inacessível.',
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
          ) : loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          ) : url ? (
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
          ) : (
            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded">
              Erro
            </span>
          )}
        </div>
      </div>

      {url && (
        <DocumentPreviewDialog
          url={url}
          name={attachment.name || attachment.label}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  )
}
