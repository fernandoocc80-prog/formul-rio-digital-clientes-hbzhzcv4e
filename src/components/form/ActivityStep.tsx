import { ActivityData } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  data: ActivityData
  onChange: (data: ActivityData) => void
}

export function ActivityStep({ data, onChange }: Props) {
  const handleChange = (field: keyof ActivityData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-bold">Atividades e Endereço</h2>
        <p className="text-muted-foreground">Defina os códigos CNAE e o local do negócio.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mainCnae">CNAE Principal</Label>
            <Input
              id="mainCnae"
              value={data.mainCnae || ''}
              onChange={(e) => handleChange('mainCnae', e.target.value)}
              placeholder="Ex: 6204-0/00 - Consultoria em ti"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secCnae">CNAEs Secundários (separados por vírgula)</Label>
            <Textarea
              id="secCnae"
              value={data.secondaryCnaes || ''}
              onChange={(e) => handleChange('secondaryCnaes', e.target.value)}
              placeholder="Ex: 6201-5/01, 6202-3/00"
              className="resize-none"
            />
          </div>

          <div className="pt-4 border-t mt-4">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço Comercial da Empresa</Label>
              <Input
                id="address"
                value={data.businessAddress || ''}
                onChange={(e) => handleChange('businessAddress', e.target.value)}
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
