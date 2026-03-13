import { CompanyData } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

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
        <p className="text-muted-foreground">Sugira nomes e defina o capital inicial.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sug1">Opção de Nome 1 (Prioridade)</Label>
            <Input
              id="sug1"
              value={data.suggestedName1 || ''}
              onChange={(e) => handleChange('suggestedName1', e.target.value)}
              placeholder="Ex: EmpresaFlow Tecnologia Ltda"
              className={data.suggestedName1 ? 'border-success ring-success/20' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sug2">Opção de Nome 2</Label>
            <Input
              id="sug2"
              value={data.suggestedName2 || ''}
              onChange={(e) => handleChange('suggestedName2', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sug3">Opção de Nome 3</Label>
            <Input
              id="sug3"
              value={data.suggestedName3 || ''}
              onChange={(e) => handleChange('suggestedName3', e.target.value)}
            />
          </div>

          <div className="pt-4 border-t mt-4">
            <div className="space-y-2">
              <Label htmlFor="capital">Capital Social (R$)</Label>
              <Input
                id="capital"
                type="number"
                value={data.capitalSocial || ''}
                onChange={(e) => handleChange('capitalSocial', Number(e.target.value))}
                placeholder="10000"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
