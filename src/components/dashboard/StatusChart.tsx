import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { useAppStore } from '@/store/AppContext'

export function StatusChart() {
  const { submissions } = useAppStore()

  const statusCounts = submissions.reduce(
    (acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const data = [
    { name: 'Rascunho', value: statusCounts['draft'] || 0, color: 'hsl(var(--chart-4))' },
    { name: 'Enviado', value: statusCounts['submitted'] || 0, color: 'hsl(var(--chart-3))' },
    { name: 'Processando', value: statusCounts['processing'] || 0, color: 'hsl(var(--chart-1))' },
    { name: 'Concluído', value: statusCounts['completed'] || 0, color: 'hsl(var(--chart-2))' },
  ].filter((d) => d.value > 0)

  const config = {
    value: { label: 'Quantidade' },
  }

  return (
    <ChartContainer config={config} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
