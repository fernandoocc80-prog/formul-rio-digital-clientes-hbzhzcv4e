import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Activity } from 'lucide-react'

interface FormSummaryTabProps {
  formDef: any
  submissions: any[]
}

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#9333ea', '#0891b2', '#0d9488']

export function FormSummaryTab({ formDef, submissions }: FormSummaryTabProps) {
  const allQuestions = useMemo(() => {
    return formDef.schema?.sections?.flatMap((s: any) => s.questions) || []
  }, [formDef])

  const choiceQuestions = allQuestions.filter(
    (q: any) => q.type === 'choice' || q.type === 'select',
  )

  const getChartData = (questionId: string) => {
    const counts: Record<string, number> = {}
    submissions.forEach((sub) => {
      const val = sub.data?.[questionId]
      if (val !== undefined && val !== null && val !== '') {
        const key = String(val)
        counts[key] = (counts[key] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <Activity className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium text-foreground">Nenhuma resposta recebida ainda</p>
          <p className="mt-1">Compartilhe o formulário para começar a coletar dados.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
      </div>

      {choiceQuestions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>O formulário não possui perguntas de múltipla escolha para gerar gráficos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {choiceQuestions.map((q: any) => {
            const data = getChartData(q.id)
            if (data.length === 0) return null

            const chartConfig = {
              value: { label: 'Respostas', color: 'hsl(var(--primary))' },
            }

            return (
              <Card key={q.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-base">{q.label}</CardTitle>
                  <CardDescription>Resumo de seleções</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {data.length <= 4 ? (
                    <div className="h-[250px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {data.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [value, 'Respostas']}
                            contentStyle={{
                              borderRadius: '8px',
                              border: 'none',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          tickFormatter={(v) => (v.length > 15 ? v.substring(0, 15) + '...' : v)}
                        />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                        <ChartTooltip
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
