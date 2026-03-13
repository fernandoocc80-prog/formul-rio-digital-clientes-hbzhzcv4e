import { useMemo } from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useAppStore } from '@/store/AppContext'

const COLORS = {
  approved: 'hsl(var(--success, 142 71% 45%))',
  under_review: 'hsl(var(--warning, 38 92% 50%))',
  pending: 'hsl(var(--muted-foreground))',
  draft: 'hsl(var(--border))',
}

const LABELS = {
  approved: 'Aprovado',
  under_review: 'Em análise',
  pending: 'Pendente',
  draft: 'Rascunho',
}

export function StatusChart() {
  const { submissions } = useAppStore()

  const data = useMemo(() => {
    const counts = submissions.reduce(
      (acc, sub) => {
        acc[sub.status] = (acc[sub.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(counts).map(([status, count]) => ({
      name: LABELS[status as keyof typeof LABELS] || status,
      value: count,
      fill: COLORS[status as keyof typeof COLORS] || '#000',
    }))
  }, [submissions])

  const chartConfig = {
    value: { label: 'Processos' },
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
