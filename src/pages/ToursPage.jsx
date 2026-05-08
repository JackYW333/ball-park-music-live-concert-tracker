import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import { computeTourStats, formatDate } from '../utils/stats.js'

export default function ToursPage({ data }) {
  const { loading, error, setlists } = data

  const tours = useMemo(() => {
    if (!setlists.length) return []
    return computeTourStats(setlists)
  }, [setlists])

  if (loading) return <div className="loading">Loading…</div>
  if (error) return <div className="loading">Error: {error}</div>

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Overview', to: '/' }, { label: 'Tours' }]} />
      <div className="page-heading">
        <h1>Tours</h1>
        <p className="sub">{tours.length} tour{tours.length !== 1 ? 's' : ''} · {setlists.length} total shows</p>
      </div>

      <div className="card">
        <ul className="tour-list">
          {tours.map(t => (
            <li key={t.name}>
              <div>
                <Link to={`/tour/${encodeURIComponent(t.name)}`}>{t.name}</Link>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
                  {formatDate(t.from)} — {formatDate(t.to)}
                </div>
              </div>
              <span className="tour-list__meta">{t.count} show{t.count !== 1 ? 's' : ''}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
