import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
      <div style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ color: 'var(--text)', fontWeight: 600 }}>{payload[0].value} shows</div>
      <div style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: '0.2rem' }}>Click to view</div>
    </div>
  )
}

export default function ShowsPerYear({ data }) {
  const navigate = useNavigate()

  return (
    <div className="card">
      <div className="card-title">Shows Per Year</div>
      <div className="chart-wrap" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="count" radius={[3, 3, 0, 0]} onClick={entry => navigate(`/year/${entry.year}`)} style={{ cursor: 'pointer' }}>
              {data.map(entry => (
                <Cell key={entry.year} fill="var(--accent)" fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
