import { CompanyData } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Props {
  data: CompanyData
  onChange: (data: CompanyData) => void
}

export function CompanyStep({ data, onChange }: Props) {
  const handleChange = (field: keyof CompanyData, value: string | number) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <h2 className="text-2xl font-bold">Detalhes da Empresa</h2>
        <p className="text-muted-foreground">Defina o tipo societário, nome fantasia e contatos.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tipo de Empresa</Label>
            <RadioGroup
              value={data.type || 'ltda'}
              onValueChange={(val) => handleChange('type', val)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mei" id="mei" />
                <Label htmlFor="mei" className="cursor-pointer">
                  MEI
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ltda" id="ltda" />
                <Label htmlFor="ltda" className="cursor-pointer">
                  LTDA
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="slu" id="slu" />
                <Label htmlFor="slu" className="cursor-pointer">
                  SLU
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tradeName">Nome Fantasia *</Label>
              <Input
                id="tradeName"
                value={data.tradeName || ''}
                onChange={(e) => handleChange('tradeName', e.target.value)}
                placeholder="Como a empresa será conhecida"
                className={data.tradeName ? 'border-success ring-success/20' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capital">Capital Social Inicial (R$)</Label>
              <Input
                id="capital"
                type="number"
                value={data.capitalSocial || ''}
                onChange={(e) => handleChange('capitalSocial', Number(e.target.value))}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Corporativo *</Label>
              <Input
                id="email"
                type="email"
                value={data.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contato@empresa.com.br"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={data.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                value={data.zipCode || ''}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="00000-000"
              />
            </div>
          </div>

          {(data.type === 'ltda' || data.type === 'slu') && (
            <div className="pt-6 border-t space-y-4">
              <Label className="text-base font-semibold">Opções de Razão Social (LTDA / SLU)</Label>
              <p className="text-sm text-muted-foreground mt-0">
                Sugerimos 3 opções, pois o nome escolhido pode já estar em uso.
              </p>
              <div className="space-y-2 mt-4">
                <Label htmlFor="sug1">Opção 1 (Prioridade) *</Label>
                <Input
                  id="sug1"
                  value={data.suggestedName1 || ''}
                  onChange={(e) => handleChange('suggestedName1', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sug2">Opção 2</Label>
                <Input
                  id="sug2"
                  value={data.suggestedName2 || ''}
                  onChange={(e) => handleChange('suggestedName2', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sug3">Opção 3</Label>
                <Input
                  id="sug3"
                  value={data.suggestedName3 || ''}
                  onChange={(e) => handleChange('suggestedName3', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
