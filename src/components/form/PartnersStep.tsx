import { Partner } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  partners: Partner[]
  onChange: (partners: Partner[]) => void
}

export function PartnersStep({ partners, onChange }: Props) {
  const addPartner = () => {
    const newPartner: Partner = {
      id: Math.random().toString(),
      name: '',
      cpf: '',
      rg: '',
      address: '',
      sharePercentage: 0,
    }
    onChange([...partners, newPartner])
  }

  const updatePartner = (id: string, field: keyof Partner, value: string | number) => {
    onChange(partners.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const removePartner = (id: string) => {
    onChange(partners.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quadro Societário</h2>
          <p className="text-muted-foreground">Adicione os dados de todos os sócios.</p>
        </div>
        <Button variant="outline" onClick={addPartner}>
          <Plus className="h-4 w-4 mr-2" /> Sócio
        </Button>
      </div>

      <div className="space-y-4">
        {partners.map((p, index) => (
          <Card key={p.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
              onClick={() => removePartner(p.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>Nome Completo Sócio {index + 1}</Label>
                <Input
                  value={p.name}
                  onChange={(e) => updatePartner(p.id, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={p.cpf}
                  onChange={(e) => updatePartner(p.id, 'cpf', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label>RG</Label>
                <Input value={p.rg} onChange={(e) => updatePartner(p.id, 'rg', e.target.value)} />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>Endereço Residencial</Label>
                <Input
                  value={p.address}
                  onChange={(e) => updatePartner(p.id, 'address', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Participação (%)</Label>
                <Input
                  type="number"
                  value={p.sharePercentage || ''}
                  onChange={(e) => updatePartner(p.id, 'sharePercentage', Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        {partners.length === 0 && (
          <div className="text-center p-8 border border-dashed rounded-lg bg-slate-50">
            <p className="text-muted-foreground mb-4">Nenhum sócio adicionado.</p>
            <Button onClick={addPartner}>Adicionar Primeiro Sócio</Button>
          </div>
        )}
      </div>
    </div>
  )
}
