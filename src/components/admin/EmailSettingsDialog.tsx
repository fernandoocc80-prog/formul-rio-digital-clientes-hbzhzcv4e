import { useState } from 'react'
import { Settings, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/store/AppContext'

export function EmailSettingsDialog() {
  const { emailTemplate, updateEmailTemplate } = useAppStore()
  const [template, setTemplate] = useState(emailTemplate)
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const handleSave = () => {
    updateEmailTemplate(template)
    toast({
      title: 'Configurações salvas',
      description: 'O template de e-mail de confirmação foi atualizado com sucesso.',
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto">
          <Settings className="h-4 w-4 mr-2" />
          Configurações de E-mail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Configurações de E-mail</DialogTitle>
          <DialogDescription>
            Personalize a mensagem de confirmação enviada aos clientes logo após o preenchimento do
            formulário.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-medium mb-1 text-foreground">Variáveis disponíveis:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">
                  {'{nome}'}
                </code>{' '}
                - Nome do cliente
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded font-mono text-xs">
                  {'{protocolo}'}
                </code>{' '}
                - Número do protocolo gerado
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <Textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="min-h-[200px] font-sans text-sm"
              placeholder="Digite a mensagem de boas-vindas/confirmação..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
