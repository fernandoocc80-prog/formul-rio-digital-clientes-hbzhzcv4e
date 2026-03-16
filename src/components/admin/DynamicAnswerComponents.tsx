import { Paperclip } from 'lucide-react'
import { useSignedUrl } from '@/hooks/use-signed-url'

const isImageUrl = (url: string) => /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(url)

export const SecureAttachmentLink = ({ value }: { value: string }) => {
  const { url, loading } = useSignedUrl(value)

  if (loading) {
    return <div className="animate-pulse h-10 w-32 bg-slate-200 rounded mt-2"></div>
  }

  if (isImageUrl(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-2">
        <img
          src={url}
          alt="Anexo"
          className="max-w-xs max-h-48 rounded border border-border shadow-sm object-cover hover:opacity-90 transition-opacity"
        />
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline break-all inline-flex items-center gap-2 mt-1 bg-primary/5 px-3 py-2 rounded-md border border-primary/20 hover:bg-primary/10 transition-colors"
    >
      <Paperclip className="w-4 h-4 shrink-0" />
      <span className="text-sm font-medium">Visualizar Documento</span>
    </a>
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

export const SecureSignature = ({ src }: { src: string }) => {
  const { url, loading } = useSignedUrl(src)

  if (loading) {
    return <div className="animate-pulse h-24 w-64 bg-slate-200 mx-auto rounded"></div>
  }

  return (
    <img src={url} alt="Assinatura" className="h-24 object-contain mx-auto mix-blend-multiply" />
  )
}
