import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useAppStore } from '@/store/AppContext'

export function TrendChart() {
  const { submissions } = useAppStore()

  const data = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      return {
        date: d,
        label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d),
        count: 0,
      }
    })

    submissions.forEach((sub) => {
      const subDate = new Date(sub.createdAt)
      subDate.setHours(0, 0, 0, 0)

      const dayData = days.find((d) => d.date.getTime() === subDate.getTime())
      if (dayData) {
        dayData.count += 1
      }
    })

    return days
  }, [submissions])

  const chartConfig = {
    count: { label: 'Novos Processos', color: 'hsl(var(--primary))' },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            dy={10}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
