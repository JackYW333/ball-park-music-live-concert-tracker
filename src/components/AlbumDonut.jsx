import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Link, useNavigate } from 'react-router-dom'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.8rem',
      color: 'var(--text)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.name}</div>
      <div style={{ color: 'var(--text-muted)' }}>{d.plays} plays · {d.pct}%</div>
    </div>
  )
}

export default function AlbumDonut({ data, showLink = true }) {
  const navigate = useNavigate()
  const filtered = data.filter(a => a.plays > 0)

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Plays by Release</span>
        {showLink && <Link to="/releases" style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--accent)' }}>See all</Link>}
      </div>
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <div className="album-donut-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filtered}
                cx="50%"
                cy="50%"
                innerRadius="61%"
                outerRadius="92%"
                paddingAngle={2}
                dataKey="plays"
                onClick={d => navigate(`/album/${d.id}`)}
                style={{ cursor: 'pointer' }}
              >
                {filtered.map(entry => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0 }}>
          {filtered.map(a => (
            <li key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: a.color, flexShrink: 0 }} />
              <Link
                to={`/album/${a.id}`}
                style={{ color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >{a.name}</Link>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{a.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
