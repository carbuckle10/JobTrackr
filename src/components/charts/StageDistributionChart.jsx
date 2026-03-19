import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const STAGE_COLORS = {
  'Applied': '#9ca3af',
  'Phone Screen': '#60a5fa',
  'Interview': '#a78bfa',
  'Final Round': '#fb923c',
  'Offer': '#34d399'
}

const STAGE_ORDER = ['Applied', 'Phone Screen', 'Interview', 'Final Round', 'Offer']

export default function StageDistributionChart({ applications }) {
  const data = useMemo(() => {
    return STAGE_ORDER.map(stage => ({
      stage,
      count: applications.filter(a => a.interview_stage === stage).length
    })).filter(d => d.count > 0)
  }, [applications])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No stage data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="stage"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
          cursor={{ fill: '#f9fafb' }}
          formatter={(value) => [value, 'Applications']}
        />
        <Bar dataKey="count" radius={[0, 3, 3, 0]}>
          {data.map((entry) => (
            <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] || '#9ca3af'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
