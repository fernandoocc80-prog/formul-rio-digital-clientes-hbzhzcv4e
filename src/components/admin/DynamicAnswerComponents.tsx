import { useState } from 'react'
import { Eye, ExternalLink } from 'lucide-react'
import { useSignedUrl } from '@/hooks/use-signed-url'
import { Button } from '@/components/ui/button'
import { DocumentPreviewDialog } from './DocumentPreviewDialog'
import { cn } from '@/lib/utils'

const isImageUrl = (url: string) => /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(url)
const isPdfUrl = (url: string) => url.toLowerCase().includes('.pdf')

export const SecureAttachmentLink = ({ value }: { value: string }) => {
  const { url, loading } = useSignedUrl(value)
  const [previewOpen, setPreviewOpen] = useState(false)

  if (loading && !url) {
    return <div className="animate-pulse h-10 w-32 bg-slate-200 rounded mt-2"></div>
  }

  const isAvailable = value || url

  if (!isAvailable) {
    return <span className="text-sm text-destructive mt-1 block">Anexo indisponível</span>
  }

  let name = 'Documento Anexo'
  try {
    const urlObj = new URL(value)
    const parts = urlObj.pathname.split('/')
    name = decodeURIComponent(parts[parts.length - 1])
  } catch (e) {
    try {
      if (url) {
        const parts = url.split('?')[0].split('/')
        name = decodeURIComponent(parts[parts.length - 1])
      }
    } catch (err) {
      name = 'Documento Anexo'
    }
  }

  if (isImageUrl(value) || (url && isImageUrl(url))) {
    return (
      <>
        <button
          onClick={() => setPreviewOpen(true)}
          className="block mt-2 text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          type="button"
          title="Clique para visualizar em tela cheia"
        >
          <div className="relative inline-block">
            {url ? (
              <img
                src={url}
                alt="Anexo"
                className="max-w-xs max-h-48 rounded border border-border shadow-sm object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-48 h-32 bg-slate-100 flex items-center justify-center rounded border shadow-sm">
                <span className="text-xs text-muted-foreground">Imagem</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-background/90 text-foreground p-2 rounded-full shadow-sm">
                <Eye className="w-5 h-5" />
              </div>
            </div>
          </div>
        </button>
        <DocumentPreviewDialog
          pathOrUrl={value}
          name={name}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      </>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button
          onClick={() => setPreviewOpen(true)}
          type="button"
          className="text-primary hover:underline break-all inline-flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-md border border-primary/20 hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Eye className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">
            Visualizar {isPdfUrl(value) || (url && isPdfUrl(url)) ? 'PDF' : 'Documento'}
          </span>
        </button>
        {url && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-[38px] text-muted-foreground hover:text-foreground"
          >
            <a href={url} target="_blank" rel="noopener noreferrer" title="Abrir em nova aba">
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span className="sr-only sm:not-sr-only sm:ml-2">Abrir</span>
            </a>
          </Button>
        )}
      </div>
      <DocumentPreviewDialog
        pathOrUrl={value}
        name={name}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  )
}

export const DynamicAnswerValue = ({ value }: { value: any }) => {
  if (!value) return <p className="text-muted-foreground text-sm">-</p>

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {value.map((v, i) => (
          <DynamicAnswerValue key={i} value={v} />
        ))}
      </div>
    )
  }

  if (typeof value === 'string' && (value.startsWith('http') || value.includes('/storage/'))) {
    return <SecureAttachmentLink value={value} />
  }

  return <p className="bg-slate-50 p-3 rounded text-sm mt-1">{String(value)}</p>
}

export const SecureSignature = ({
  src,
  className,
  containerClassName,
}: {
  src: string
  className?: string
  containerClassName?: string
}) => {
  const { url, loading } = useSignedUrl(src)

  if (loading) {
    return (
      <div
        className={cn(
          'animate-pulse bg-slate-200 mx-auto rounded',
          containerClassName || 'h-24 w-64',
        )}
      ></div>
    )
  }

  if (!url) {
    return (
      <div
        className={cn(
          'mx-auto flex items-center justify-center text-xs text-muted-foreground bg-slate-50 rounded border border-dashed text-center p-2',
          containerClassName || 'h-24 w-full max-w-sm',
        )}
      >
        Indisponível
      </div>
    )
  }

  return (
    <img
      src={url}
      alt="Assinatura"
      className={cn('object-contain mx-auto mix-blend-multiply', className || 'h-24')}
    />
  )
}
