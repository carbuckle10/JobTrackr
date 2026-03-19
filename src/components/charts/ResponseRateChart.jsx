import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ResponseRateChart({ applications }) {
  const { data, hasEnoughData } = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const weeks = []
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const submitted = applications.filter(app => {
        if (!app.date_applied) return false
        const d = new Date(app.date_applied)
        return d >= weekStart && d <= weekEnd
      })

      const responded = submitted.filter(a => a.date_responded).length
      const rate = submitted.length > 0 ? Math.round((responded / submitted.length) * 100) : null

      weeks.push({ week: label, rate, submitted: submitted.length })
    }

    const weeksWithData = weeks.filter(w => w.submitted > 0)
    return { data: weeks, hasEnoughData: weeksWithData.length >= 2 }
  }, [applications])

  if (!hasEnoughData) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Need applications across at least 2 weeks to show response rate trends
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          formatter={(value) => value !== null ? [`${value}%`, 'Response Rate'] : ['No data', 'Response Rate']}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
