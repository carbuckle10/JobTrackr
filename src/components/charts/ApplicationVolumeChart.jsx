import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ApplicationVolumeChart({ applications }) {
  const data = useMemo(() => {
    const weeks = []
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const count = applications.filter(app => {
        if (!app.date_applied) return false
        const d = new Date(app.date_applied)
        return d >= weekStart && d <= weekEnd
      }).length

      weeks.push({ week: label, count })
    }

    return weeks
  }, [applications])

  const hasData = data.some(d => d.count > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Add applications with dates to see volume over time
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          cursor={{ fill: '#f9fafb' }}
          formatter={(value) => [value, 'Applications']}
        />
        <Bar dataKey="count" fill="#374151" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
