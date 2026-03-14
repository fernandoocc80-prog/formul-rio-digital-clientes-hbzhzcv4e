import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, MessageCircle, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ShareFormDialogProps {
  id?: string
  children: React.ReactNode
}

export function ShareFormDialog({ id = 'new', children }: ShareFormDialogProps) {
  // Use absolute form URL to prevent routing/redirect issues and ensure it points directly to the form
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://formulario-digital-clientes-38ac0.goskip.app'
  const formUrl = `${baseUrl}/form/${id}`

  // Replaced deprecated/failing chart.googleapis.com with api.qrserver.com
  // Ensures QR Code resolves properly without 404 errors
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    formUrl,
  )}`
  const { toast } = useToast()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formUrl).then(() => {
      toast({
        title: 'Link copiado!',
        description: 'O link do formulário foi copiado para a área de transferência.',
      })
    })
  }

  const handleCopyMessage = () => {
    const message = `Olá! Para darmos andamento na abertura da sua empresa, por favor preencha o formulário no link a seguir: ${formUrl}\n\nObrigado!`
    navigator.clipboard.writeText(message).then(() => {
      toast({
        title: 'Mensagem copiada!',
        description: 'A mensagem de boas-vindas foi copiada com sucesso.',
      })
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md flex flex-col items-center">
        <DialogHeader className="w-full text-center sm:text-center">
          <DialogTitle>Compartilhar Formulário</DialogTitle>
          <DialogDescription>
            Use o QR Code ou envie a mensagem pronta para o seu cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 p-6 rounded-lg border w-full flex flex-col items-center mt-2">
          <div className="bg-white p-2 rounded-xl shadow-sm border mb-4">
            <img
              src={qrCodeUrl}
              alt="QR Code do Formulário"
              className="w-48 h-48 mix-blend-multiply"
            />
          </div>
          <Button variant="outline" size="sm" asChild className="w-full text-muted-foreground">
            <a href={qrCodeUrl} target="_blank" rel="noreferrer" download="qrcode-form.png">
              <Download className="w-4 h-4 mr-2" />
              Abrir QR Code em Nova Guia
            </a>
          </Button>
        </div>

        <div className="w-full space-y-3 mt-2">
          <Input value={formUrl} readOnly className="text-center bg-muted/50 font-mono text-sm" />
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={handleCopyLink} variant="secondary" className="w-full">
              <Copy className="w-4 h-4 mr-2" /> Copiar Link
            </Button>
            <Button onClick={handleCopyMessage} className="w-full bg-primary text-white">
              <MessageCircle className="w-4 h-4 mr-2" /> Copiar Mensagem de Boas-vindas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
